#!/usr/bin/env python3
"""
Test script for the Zero Trust MCP Server
"""

import asyncio
import json
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def test_mcp_server():
    """Test the MCP server functionality"""
    
    # Example JWT token (you'll need to get a real one from Keycloak)
    # This is just for demonstration - replace with actual token
    test_token = "your_jwt_token_here"
    
    server_params = StdioServerParameters(
        command="python",
        args=["app.py"],
        env=None,
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # List available tools
            print("=== Available Tools ===")
            tools = await session.list_tools()
            for tool in tools.tools:
                print(f"- {tool.name}: {tool.description}")
            print()
            
            # Test list databases
            print("=== Database Information ===")
            result = await session.call_tool("list_databases", {})
            print(result.content[0].text)
            
            # Test user info (requires valid token)
            if test_token != "your_jwt_token_here":
                print("=== User Information ===")
                result = await session.call_tool("get_user_info", {
                    "token": test_token
                })
                print(result.content[0].text)
                
                # Test authorization check
                print("=== Authorization Check ===")
                result = await session.call_tool("check_authorization", {
                    "token": test_token,
                    "resource": "patients",
                    "database": "us_db", 
                    "action": "read"
                })
                print(result.content[0].text)
                
                # Test database query
                print("=== Database Query ===")
                result = await session.call_tool("query_database", {
                    "token": test_token,
                    "query": "How many patients do we have?",
                    "database": "us_db",
                    "resource": "patients"
                })
                print(result.content[0].text)
            else:
                print("⚠️  To test user info and queries, replace 'test_token' with a real JWT from Keycloak")

if __name__ == "__main__":
    asyncio.run(test_mcp_server())