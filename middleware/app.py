from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, requests, psycopg2, jwt

OPA_URL = os.getenv("OPA_URL", "http://opa:8181/v1/data/authz/allow")
LOGGER_URL = os.getenv("LOGGER_URL", "http://logger:9000/log")
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


def log(decision: str, payload: dict):
    try:
        requests.post(LOGGER_URL, json={"decision": decision, "payload": payload})
    except Exception:
        pass


@app.post("/query")
async def handle_query(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split(" ")[-1]
    user = decode_token(token)
    body = await request.json()
    input_data = {
        "method": "POST",
        "user": user,
        "resource": body.get("resource"),
        "db": body.get("db"),
        "action": body.get("action"),
        "patient_id": body.get("patient_id"),
    }
    
    # Debug logging
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
    sql = body.get("sql", "SELECT 1")
    cur.execute(sql)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    log("allow", input_data)
    return {"rows": rows}
