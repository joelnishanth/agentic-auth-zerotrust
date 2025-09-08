from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, requests, psycopg2, jwt, re, json

OPA_URL = os.getenv("OPA_URL", "http://opa:8181/v1/data/authz/allow")
LOGGER_URL = os.getenv("LOGGER_URL", "http://logger:9000/log")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434/api/generate")
DBS = {
    "us_db": os.getenv("US_DB_DSN"),
    "eu_db": os.getenv("EU_DB_DSN"),
    "sandbox_db": os.getenv("SBX_DB_DSN"),
}

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


def decode_token(token: str):
    return jwt.decode(token, options={"verify_signature": False})

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    return {"status": "healthy", "service": "middleware"}

def log(decision: str, payload: dict):
    try:
        requests.post(LOGGER_URL, json={"decision": decision, "payload": payload})
    except Exception:
        pass


def get_database_schema(db: str) -> str:
    """Get database schema information for AI context"""
    if db == "sandbox_db":
        return """
Database: sandbox_db (Research/Analytics Database)
Tables:
- patients: id(text), age_group, gender, region, diagnosis_category, treatment_duration_days, outcome_score, created_at
- research_metrics: id(integer), metric_name, metric_value, patient_count, date_calculated (NO patient_id - cannot join with patients)
- notes: id, patient_id(text), session_number, note_category, sentiment_score, word_count, created_at

Relationships:
- notes.patient_id -> patients.id (text to text)
- research_metrics is standalone (no foreign keys)

Example queries:
- SELECT * FROM patients WHERE diagnosis_category = 'anxiety'
- SELECT metric_name, metric_value FROM research_metrics
- SELECT COUNT(*) FROM patients GROUP BY diagnosis_category
- SELECT p.*, n.* FROM patients p JOIN notes n ON p.id = n.patient_id
- DO NOT JOIN patients with research_metrics (no relationship)
"""
    else:  # us_db, eu_db
        return f"""
Database: {db} (Production Healthcare Database)
Tables:
- patients: id, name, region, assigned_therapist, status, created_at, updated_at
- therapists: id, name, specialization, region, active
- notes: id, patient_id, therapist_id, note, note_type, created_at, updated_at

Example queries:
- SELECT * FROM patients WHERE assigned_therapist = 'sarah_therapist'
- SELECT COUNT(*) FROM patients WHERE status = 'active'
- SELECT p.name, t.name as therapist FROM patients p JOIN therapists t ON p.assigned_therapist = t.id
"""

def natural_language_to_sql_ollama(nl_query: str, resource: str, db: str) -> str:
    """Convert natural language to SQL using Ollama AI"""
    try:
        schema = get_database_schema(db)
        
        prompt = f"""You are a SQL expert. Convert the following natural language query to a valid PostgreSQL SQL statement.

{schema}

CRITICAL RULES:
1. Return ONLY the SQL query, no explanations or markdown
2. Use simple PostgreSQL syntax - avoid window functions and complex aggregations
3. Limit results to 20 rows maximum with LIMIT 20
4. For counts, use simple COUNT(*) queries
5. NEVER join patients with research_metrics (no relationship exists)
6. Keep queries simple and safe - prefer single table queries
7. For "system overview" or "all data", just SELECT * FROM patients
8. Avoid nested queries and complex aggregations
9. If unsure about joins, use single table queries only

Natural language query: "{nl_query}"

SQL:"""

        payload = {
            "model": "llama3.2:3b",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
                "max_tokens": 200
            }
        }
        
        print(f"DEBUG - Calling Ollama with prompt: {prompt[:200]}...")
        
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            sql = result.get("response", "").strip()
            
            # Clean up the response - remove any markdown or extra text
            if "```sql" in sql:
                sql = sql.split("```sql")[1].split("```")[0].strip()
            elif "```" in sql:
                sql = sql.split("```")[1].split("```")[0].strip()
            
            # Remove any explanatory text, keep only the SQL
            lines = sql.split('\n')
            sql_lines = []
            for line in lines:
                line = line.strip()
                if line and not line.startswith('--') and not line.lower().startswith('note:'):
                    sql_lines.append(line)
            
            sql = ' '.join(sql_lines)
            
            # Clean up multiple statements - take only the first valid SELECT statement
            if ';' in sql:
                statements = [s.strip() for s in sql.split(';') if s.strip()]
                # Find the first SELECT statement
                for stmt in statements:
                    if stmt.upper().startswith('SELECT'):
                        sql = stmt
                        break
                else:
                    # If no SELECT found, use the first statement
                    sql = statements[0] if statements else sql
            
            # Ensure single statement without trailing semicolon for execution
            sql = sql.rstrip(';')
            
            print(f"DEBUG - Ollama generated SQL: {sql}")
            return sql
            
        else:
            print(f"DEBUG - Ollama request failed: {response.status_code}")
            return natural_language_to_sql_fallback(nl_query, resource, db)
            
    except Exception as e:
        print(f"DEBUG - Ollama error: {e}")
        return natural_language_to_sql_fallback(nl_query, resource, db)

def natural_language_to_sql_fallback(nl_query: str, resource: str, db: str) -> str:
    """Fallback pattern-based text-to-SQL when Ollama is unavailable"""
    nl_lower = nl_query.lower().strip()
    
    # Basic fallback patterns
    if 'count' in nl_lower or 'how many' in nl_lower:
        return f"SELECT COUNT(*) as count FROM {resource}"
    elif any(word in nl_lower for word in ['show', 'list', 'get', 'view']):
        return f"SELECT * FROM {resource} LIMIT 10"
    else:
        return f"SELECT * FROM {resource} LIMIT 10"


@app.post("/query")
async def handle_query(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split(" ")[-1]
    user = decode_token(token)
    body = await request.json()
    
    # Extract role from JWT token for OPA
    user_role = "unknown"
    if "role" in user:
        user_role = user["role"]
    elif "realm_access" in user and "roles" in user["realm_access"]:
        # Keycloak realm roles - filter out default roles
        roles = user["realm_access"]["roles"]
        custom_roles = [r for r in roles if r not in ["default-roles-zerotrust", "offline_access", "uma_authorization"]]
        user_role = custom_roles[0] if custom_roles else "unknown"
    elif "resource_access" in user:
        # Keycloak client roles
        for client, access in user["resource_access"].items():
            if "roles" in access:
                roles = access["roles"]
                custom_roles = [r for r in roles if r not in ["default-roles-zerotrust", "offline_access", "uma_authorization"]]
                if custom_roles:
                    user_role = custom_roles[0]
                    break
    
    # Add extracted role to user object for OPA
    user_for_opa = user.copy()
    user_for_opa["role"] = user_role
    
    input_data = {
        "method": "POST",
        "user": user_for_opa,
        "resource": body.get("resource"),
        "db": body.get("db"),
        "action": body.get("action"),
        "patient_id": body.get("patient_id"),
    }
    
    # Debug logging
    print(f"DEBUG - Extracted role: {user_role}")
    print(f"DEBUG - User data: {user}")
    print(f"DEBUG - Input data to OPA: {input_data}")
    
    opa_resp = requests.post(OPA_URL, json={"input": input_data})
    opa_result = opa_resp.json()
    allowed = opa_result.get("result", False)
    
    print(f"DEBUG - OPA response: {opa_result}")
    print(f"DEBUG - Access allowed: {allowed}")
    if not allowed:
        log("deny", input_data)
        raise HTTPException(status_code=403, detail="Access denied")
    dsn = DBS.get(body.get("db"))
    if not dsn:
        raise HTTPException(status_code=400, detail="Unknown DB")
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Check if natural language query is provided
    if body.get("natural_language"):
        sql = natural_language_to_sql_ollama(
            body.get("natural_language"), 
            body.get("resource", "patients"),
            body.get("db")
        )
        print(f"DEBUG - Converted '{body.get('natural_language')}' to SQL: {sql}")
    else:
        sql = body.get("sql", "SELECT 1")
    
    # Execute SQL query with error handling
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        
        # Convert to list of lists for JSON serialization
        result_rows = [list(row) for row in rows]
        
        cur.close()
        conn.close()
        log("allow", input_data)
        return {
            "rows": result_rows,
            "columns": columns,
            "sql": sql
        }
    except Exception as sql_error:
        print(f"DEBUG - SQL execution error: {sql_error}")
        print(f"DEBUG - Problematic SQL: {sql}")
        
        # Close the failed connection and create a new one for fallback
        cur.close()
        conn.close()
        
        # Create new connection for fallback query
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Try a simpler fallback query
        resource = body.get('resource', 'patients')
        if body.get('db') == 'sandbox_db':
            # For sandbox_db, use a safe query that works with the schema
            fallback_sql = f"SELECT * FROM {resource} LIMIT 15"
        else:
            fallback_sql = f"SELECT * FROM {resource} LIMIT 10"
        try:
            cur.execute(fallback_sql)
            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]
            result_rows = [list(row) for row in rows]
            
            cur.close()
            conn.close()
            log("allow", input_data)
            return {
                "rows": result_rows,
                "columns": columns,
                "sql": fallback_sql,
                "note": "Simplified query due to complexity"
            }
        except Exception as fallback_error:
            print(f"DEBUG - Fallback query also failed: {fallback_error}")
            cur.close()
            conn.close()
            raise HTTPException(status_code=500, detail=f"Database query failed: {str(sql_error)}")
