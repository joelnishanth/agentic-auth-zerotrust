# Zero Trust MCP Server

This MCP (Model Context Protocol) server provides secure access to your zero-trust database system through a standardized protocol that AI assistants and other tools can use.

## Features

### 🔐 **Secure Database Queries**
- Execute natural language or SQL queries with full zero-trust authorization
- All queries go through the same middleware and OPA policy enforcement
- JWT token validation and role-based access control

### 🛡️ **Authorization Checking**
- Test user permissions before executing queries
- Check access to specific resources, databases, and actions
- Patient-level access control support

### 👤 **User Information**
- Extract and display user details from JWT tokens
- Show roles, permissions, and token validity
- Decode Keycloak authentication data

### 📊 **Database Discovery**
- List available databases and their access requirements
- Show which roles can access which resources
- Display database descriptions and capabilities

## Available Tools

### `query_database`
Execute secure database queries with natural language processing.

**Parameters:**
- `token` (required): JWT authentication token
- `query` (required): Natural language query or SQL statement
- `database` (required): Target database (`us_db`, `eu_db`, `sandbox_db`)
- `resource` (optional): Resource type (`patients`, `notes`)
- `action` (optional): Action type (`read`, `write`)

**Example:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "query": "How many patients do we have?",
  "database": "us_db",
  "resource": "patients"
}
```

### `check_authorization`
Check if a user is authorized for a specific action without executing a query.

**Parameters:**
- `token` (required): JWT authentication token
- `resource` (required): Resource to check (`patients`, `notes`)
- `database` (required): Database to check (`us_db`, `eu_db`, `sandbox_db`)
- `action` (required): Action to check (`read`, `write`)
- `patient_id` (optional): Specific patient ID for patient-level access

### `get_user_info`
Extract user information from JWT token.

**Parameters:**
- `token` (required): JWT authentication token

### `list_databases`
List available databases and their access requirements.

**Parameters:** None

## Setup

### 1. Install Dependencies
```bash
cd mcp-server
pip install -r requirements.txt
```

### 2. Run Standalone
```bash
python app.py
```

### 3. Run with Docker Compose
```bash
# From project root
docker-compose up mcp-server
```

### 4. Configure in Kiro IDE
The MCP server is automatically configured in `.kiro/settings/mcp.json`. Restart Kiro IDE to load the new server.

## Usage Examples

### Natural Language Queries
```
"Show me all patients in the US database"
"How many notes are there?"
"List patient names only"
"Count records in sandbox database"
```

### Authorization Flow
1. **Authentication**: Provide valid JWT token from Keycloak
2. **Authorization**: OPA policies check user permissions
3. **Query Processing**: Natural language converted to SQL
4. **Execution**: Query runs against authorized database
5. **Response**: Results returned with generated SQL

### Error Handling
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User lacks permission for requested action
- **400 Bad Request**: Invalid database or malformed request
- **500 Internal Error**: Database connection or query execution issues

## Security Features

- ✅ **Zero Trust Architecture**: Every request validated through OPA
- ✅ **JWT Token Validation**: Keycloak integration for authentication
- ✅ **Role-Based Access Control**: Fine-grained permissions by role
- ✅ **Database Isolation**: Separate access controls per database
- ✅ **Query Sanitization**: Natural language processing with safe SQL generation
- ✅ **Audit Logging**: All requests logged through the logger service

## Integration

This MCP server integrates seamlessly with:
- **Kiro IDE**: Direct integration through MCP configuration
- **AI Assistants**: Claude, GPT, and other MCP-compatible tools
- **Custom Applications**: Any MCP client can connect
- **Development Tools**: IDEs and editors with MCP support

## Testing

Run the test script to verify functionality:
```bash
python test_mcp.py
```

Note: You'll need a valid JWT token from your Keycloak instance for full testing.