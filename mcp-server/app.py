#!/usr/bin/env python3
"""
Zero Trust MCP Server - Middleware Proxy
Provides secure database access through MCP protocol by proxying requests to middleware
This server acts as a structured interface layer over the existing middleware
Requires valid JWT authentication for all operations
"""

import asyncio
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional
import httpx
import jwt
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    CallToolRequest,
    CallToolResult,
    ListToolsRequest,
    ListToolsResult,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zerotrust-mcp")

# Configuration - Middleware proxy
MIDDLEWARE_URL = os.getenv("MIDDLEWARE_URL", "http://localhost:8001/query")

# FastAPI app for HTTP demo endpoint
app = FastAPI(title="Zero Trust MCP Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class ZeroTrustMCPServer:
    def __init__(self):
        self.server = Server("zerotrust-mcp")
        self.http_client = httpx.AsyncClient(timeout=30.0)
        
    def decode_token(self, token: str):
        """Decode JWT token without verification (for user info display only)"""
        return jwt.decode(token, options={"verify_signature": False})
    
    def validate_authentication(self, token: str) -> bool:
        """Validate that a JWT token is present and properly formatted"""
        if not token:
            return False
        try:
            # Basic token format validation
            self.decode_token(token)
            return True
        except:
            return False
    
    async def call_middleware(self, token: str, payload: dict) -> dict:
        """Call middleware with JWT token and payload"""
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = await self.http_client.post(MIDDLEWARE_URL, json=payload, headers=headers)
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            elif response.status_code == 401:
                return {"success": False, "error": "Authentication failed", "status": 401}
            elif response.status_code == 403:
                return {"success": False, "error": "Access denied", "status": 403}
            elif response.status_code == 400:
                return {"success": False, "error": "Bad request", "status": 400}
            else:
                return {"success": False, "error": f"Middleware error: {response.status_code}", "status": response.status_code}
                
        except Exception as e:
            logger.error(f"Middleware call failed: {e}")
            return {"success": False, "error": f"Connection error: {str(e)}", "status": 500}
    

        
    async def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.list_tools()
        async def handle_list_tools() -> ListToolsResult:
            """List available tools"""
            return ListToolsResult(
                tools=[
                    Tool(
                        name="query_database",
                        description="Execute a secure database query with zero-trust authorization",
                        inputSchema={
                            "type": "object",
                            "properties": {
                                "token": {
                                    "type": "string",
                                    "description": "JWT authentication token"
                                },
                                "query": {
                                    "type": "string", 
                                    "description": "Natural language query or SQL statement"
                                },
                                "database": {
                                    "type": "string",
                                    "enum": ["us_db", "eu_db", "sandbox_db"],
                                    "description": "Target database"
                                },
                                "resource": {
                                    "type": "string",
                                    "enum": ["patients", "notes"],
                                    "default": "patients",
                                    "description": "Resource type to query"
                                },
                                "action": {
                                    "type": "string",
                                    "enum": ["read", "write"],
                                    "default": "read", 
                                    "description": "Action type"
                                }
                            },
                            "required": ["token", "query", "database"]
                        }
                    ),
                    Tool(
                        name="check_authorization",
                        description="Check if a user is authorized for a specific action",
                        inputSchema={
                            "type": "object",
                            "properties": {
                                "token": {
                                    "type": "string",
                                    "description": "JWT authentication token"
                                },
                                "resource": {
                                    "type": "string",
                                    "enum": ["patients", "notes"],
                                    "description": "Resource to check access for"
                                },
                                "database": {
                                    "type": "string", 
                                    "enum": ["us_db", "eu_db", "sandbox_db"],
                                    "description": "Database to check access for"
                                },
                                "action": {
                                    "type": "string",
                                    "enum": ["read", "write"],
                                    "description": "Action to check authorization for"
                                },
                                "patient_id": {
                                    "type": "string",
                                    "description": "Optional patient ID for patient-specific access"
                                }
                            },
                            "required": ["token", "resource", "database", "action"]
                        }
                    ),
                    Tool(
                        name="get_user_info",
                        description="Get user information from JWT token",
                        inputSchema={
                            "type": "object",
                            "properties": {
                                "token": {
                                    "type": "string",
                                    "description": "JWT authentication token"
                                }
                            },
                            "required": ["token"]
                        }
                    ),
                    Tool(
                        name="list_databases",
                        description="List available databases and their access requirements",
                        inputSchema={
                            "type": "object",
                            "properties": {},
                            "required": []
                        }
                    )
                ]
            )

        @self.server.call_tool()
        async def handle_call_tool(request: CallToolRequest) -> CallToolResult:
            """Handle tool calls"""
            try:
                if request.name == "query_database":
                    return await self._query_database(request.arguments)
                elif request.name == "check_authorization":
                    return await self._check_authorization(request.arguments)
                elif request.name == "get_user_info":
                    return await self._get_user_info(request.arguments)
                elif request.name == "list_databases":
                    return await self._list_databases(request.arguments)
                else:
                    raise ValueError(f"Unknown tool: {request.name}")
                    
            except Exception as e:
                logger.error(f"Tool call failed: {e}")
                return CallToolResult(
                    content=[TextContent(type="text", text=f"Error: {str(e)}")],
                    isError=True
                )

    async def _query_database(self, args: Dict[str, Any]) -> CallToolResult:
        """Execute a secure database query via middleware proxy"""
        token = args.get("token")
        query = args.get("query")
        database = args.get("database")
        resource = args.get("resource", "patients")
        action = args.get("action", "read")
        patient_id = args.get("patient_id")
        
        if not all([token, query, database]):
            raise ValueError("Missing required parameters: token, query, database")
        
        # Authentication required - no anonymous access
        if not self.validate_authentication(token):
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text="AUTHENTICATION REQUIRED\n\n"
                             "The MCP server requires valid JWT authentication.\n"
                             "No database queries can be executed without proper authentication.\n\n"
                             "This enforces zero-trust security principles:\n"
                             "- Never trust, always verify\n"
                             "- No anonymous access to sensitive data\n"
                             "- All requests must be authenticated and authorized"
                    )
                ],
                isError=True
            )
        
        # Valid databases
        valid_dbs = ["us_db", "eu_db", "sandbox_db"]
        if database not in valid_dbs:
            raise ValueError(f"Unknown database: {database}. Valid options: {', '.join(valid_dbs)}")
        
        try:
            # Decode JWT token for user info (display purposes only)
            user_data = self.decode_token(token)
            username = user_data.get("preferred_username", "unknown")
            
            # Prepare middleware payload
            payload = {
                "resource": resource,
                "db": database,
                "action": action
            }
            
            # Add patient_id if provided for patient-specific queries
            if patient_id:
                payload["patient_id"] = patient_id
            
            # Check if it's a natural language query or direct SQL
            if query.strip().upper().startswith(('SELECT', 'INSERT', 'UPDATE', 'DELETE')):
                payload["sql"] = query
            else:
                payload["natural_language"] = query
            
            logger.info(f"Proxying query for {username} to middleware: {payload}")
            
            # Call middleware with JWT token
            result = await self.call_middleware(token, payload)
            
            if result["success"]:
                # Successful response from middleware
                data = result["data"]
                rows = data.get("rows", [])
                sql = data.get("sql", "")
                
                result_text = f"✅ Query executed successfully!\n\n"
                result_text += f"User: {username}\n"
                result_text += f"Database: {database}\n"
                result_text += f"Generated SQL: {sql}\n"
                result_text += f"Results: {len(rows)} rows returned\n\n"
                
                if rows:
                    # Format rows for better display
                    result_text += f"Data:\n{json.dumps(rows, indent=2, default=str)}"
                else:
                    result_text += "No data returned."
                
                return CallToolResult(
                    content=[TextContent(type="text", text=result_text)]
                )
            else:
                # Error response from middleware
                error_msg = result["error"]
                status = result.get("status", 500)
                
                if status == 401:
                    error_text = f"🚫 Authentication Failed\n\nUser: {username}\n\nThe JWT token is invalid or expired."
                elif status == 403:
                    error_text = f"🚫 Access Denied\n\n"
                    error_text += f"User: {username}\n"
                    error_text += f"Action: {action} on {resource} in {database}\n"
                    error_text += f"Reason: Insufficient permissions based on zero-trust policy\n\n"
                    error_text += f"Your role may not have permission to access '{resource}' in '{database}' "
                    error_text += f"or perform '{action}' operations."
                elif status == 400:
                    error_text = f"💥 Bad Request\n\nUser: {username}\n\nError: {error_msg}"
                else:
                    error_text = f"💥 Server Error\n\nUser: {username}\n\nError: {error_msg}"
                
                return CallToolResult(
                    content=[TextContent(type="text", text=error_text)],
                    isError=True
                )
            
        except jwt.InvalidTokenError as e:
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text=f"🚫 Authentication Failed\n\nInvalid JWT token format: {str(e)}"
                    )
                ],
                isError=True
            )
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text=f"💥 MCP Server Error: {str(e)}"
                    )
                ],
                isError=True
            )

    async def _check_authorization(self, args: Dict[str, Any]) -> CallToolResult:
        """Check authorization by making a test call to middleware"""
        token = args.get("token")
        resource = args.get("resource")
        database = args.get("database")
        action = args.get("action")
        patient_id = args.get("patient_id")
        
        if not all([token, resource, database, action]):
            raise ValueError("Missing required parameters: token, resource, database, action")
        
        # Authentication required
        if not self.validate_authentication(token):
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text="AUTHENTICATION REQUIRED\n\n"
                             "Authorization checks require valid JWT authentication.\n"
                             "Please provide a valid token to check permissions."
                    )
                ],
                isError=True
            )
        
        try:
            # Decode JWT token for user info
            user_data = self.decode_token(token)
            username = user_data.get("preferred_username", "unknown")
            roles = user_data.get("realm_access", {}).get("roles", [])
            role = roles[0] if roles else "unknown"
            
            # Make a test call to middleware with a simple query to check authorization
            payload = {
                "resource": resource,
                "db": database,
                "action": action,
                "patient_id": patient_id,
                "sql": "SELECT 1"  # Simple test query
            }
            
            result = await self.call_middleware(token, payload)
            
            if result["success"]:
                return CallToolResult(
                    content=[
                        TextContent(
                            type="text",
                            text=f"✅ Authorization GRANTED\n\n"
                                 f"User: {username} (Role: {role})\n"
                                 f"Action: {action}\n"
                                 f"Resource: {resource}\n"
                                 f"Database: {database}"
                                 + (f"\nPatient ID: {patient_id}" if patient_id else "") +
                                 f"\n\n🔐 Zero-trust policy validation: PASSED"
                        )
                    ]
                )
            else:
                status = result.get("status", 500)
                error_msg = result["error"]
                
                if status == 401:
                    reason = "Invalid or expired JWT token"
                elif status == 403:
                    reason = "Insufficient permissions for this operation"
                else:
                    reason = f"System error: {error_msg}"
                
                return CallToolResult(
                    content=[
                        TextContent(
                            type="text",
                            text=f"❌ Authorization DENIED\n\n"
                                 f"User: {username} (Role: {role})\n"
                                 f"Action: {action}\n"
                                 f"Resource: {resource}\n"
                                 f"Database: {database}"
                                 + (f"\nPatient ID: {patient_id}" if patient_id else "") +
                                 f"\n\n🔐 Zero-trust policy validation: FAILED\n"
                                 f"Reason: {reason}"
                        )
                    ]
                )
                
        except jwt.InvalidTokenError as e:
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text=f"🚫 Authentication Failed\n\nInvalid JWT token: {str(e)}"
                    )
                ],
                isError=True
            )
        except Exception as e:
            logger.error(f"Authorization check failed: {e}")
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text=f"💥 Authorization check error: {str(e)}"
                    )
                ],
                isError=True
            )

    async def _get_user_info(self, args: Dict[str, Any]) -> CallToolResult:
        """Extract user information from JWT token"""
        token = args.get("token")
        if not token:
            raise ValueError("Missing required parameter: token")
        
        # Authentication required
        if not self.validate_authentication(token):
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text="AUTHENTICATION REQUIRED\n\n"
                             "User information requires valid JWT authentication.\n"
                             "Please provide a valid token to view user details."
                    )
                ],
                isError=True
            )
        
        # Decode JWT without verification (same as middleware does)
        import jwt
        try:
            user_data = jwt.decode(token, options={"verify_signature": False})
            
            # Extract key information
            username = user_data.get("preferred_username", "Unknown")
            roles = user_data.get("realm_access", {}).get("roles", [])
            role = roles[0] if roles else "No role"
            issued_at = user_data.get("iat")
            expires_at = user_data.get("exp")
            
            import datetime
            issued_time = datetime.datetime.fromtimestamp(issued_at).isoformat() if issued_at else "Unknown"
            expires_time = datetime.datetime.fromtimestamp(expires_at).isoformat() if expires_at else "Unknown"
            
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text=f"User Information:\n\n"
                             f"Username: {username}\n"
                             f"Role: {role}\n"
                             f"All Roles: {', '.join(roles)}\n"
                             f"Token Issued: {issued_time}\n"
                             f"Token Expires: {expires_time}\n\n"
                             f"Full JWT Claims:\n{json.dumps(user_data, indent=2)}"
                    )
                ]
            )
            
        except jwt.InvalidTokenError as e:
            raise Exception(f"Invalid JWT token: {str(e)}")

    async def _list_databases(self, args: Dict[str, Any]) -> CallToolResult:
        """List available databases and access requirements"""
        db_info = {
            "us_db": {
                "name": "US Database",
                "description": "Production database for US region",
                "allowed_roles": ["admin", "therapist", "support", "superuser"],
                "resources": ["patients", "notes"]
            },
            "eu_db": {
                "name": "EU Database", 
                "description": "Production database for EU region",
                "allowed_roles": ["admin", "therapist", "support", "superuser"],
                "resources": ["patients", "notes"]
            },
            "sandbox_db": {
                "name": "Sandbox Database",
                "description": "Development/testing database with anonymized data",
                "allowed_roles": ["admin", "analyst", "superuser"],
                "resources": ["patients", "notes"]
            }
        }
        
        info_text = "Available Databases (via Middleware):\n\n"
        info_text += "🔒 Security: All database access is routed through the middleware layer\n"
        info_text += "🔐 Authentication: JWT tokens are validated by the middleware\n"
        info_text += "🛡️ Authorization: Zero-trust policies enforced by OPA\n\n"
        
        for db_id, info in db_info.items():
            info_text += f"🗄️ {info['name']} ({db_id})\n"
            info_text += f"   Description: {info['description']}\n"
            info_text += f"   Allowed Roles: {', '.join(info['allowed_roles'])}\n"
            info_text += f"   Resources: {', '.join(info['resources'])}\n\n"
        
        return CallToolResult(
            content=[TextContent(type="text", text=info_text)]
        )

    async def run(self):
        """Run the MCP server"""
        await self.setup_handlers()
        
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="zerotrust-mcp",
                    server_version="1.0.0",
                    capabilities=self.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={},
                    ),
                ),
            )

# Global MCP server instance
mcp_server_instance = ZeroTrustMCPServer()

@app.post("/mcp-call")
async def mcp_call_endpoint(request: Request):
    """HTTP endpoint for MCP tool calls (for demo purposes)"""
    try:
        body = await request.json()
        tool_name = body.get("tool")
        parameters = body.get("parameters", {})
        
        if not tool_name:
            raise HTTPException(status_code=400, detail="Missing tool name")
        
        # Create a mock CallToolRequest
        mock_request = type('MockRequest', (), {
            'name': tool_name,
            'arguments': parameters
        })()
        
        # Call the appropriate tool method
        if tool_name == "query_database":
            result = await mcp_server_instance._query_database(parameters)
        elif tool_name == "check_authorization":
            result = await mcp_server_instance._check_authorization(parameters)
        elif tool_name == "get_user_info":
            result = await mcp_server_instance._get_user_info(parameters)
        elif tool_name == "list_databases":
            result = await mcp_server_instance._list_databases(parameters)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown tool: {tool_name}")
        
        # Extract text content from result
        if result.content and len(result.content) > 0:
            return result.content[0].text
        else:
            return "No content returned"
            
    except Exception as e:
        logger.error(f"MCP call failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "zerotrust-mcp"}

async def run_mcp_server():
    """Run the MCP server in stdio mode"""
    await mcp_server_instance.run()

async def main():
    """Main entry point - runs both HTTP server and MCP server"""
    import uvicorn
    
    # Start HTTP server for demo
    config = uvicorn.Config(app, host="0.0.0.0", port=5001, log_level="info")
    server = uvicorn.Server(config)
    
    # Run HTTP server
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())