#!/bin/bash

echo "Testing Patient Portal Access..."
echo "================================="

# Test OPA policies directly first
echo ""
echo "1. Testing OPA Policies Directly:"
echo "---------------------------------"

echo "Admin + us_db:"
curl -s -X POST http://localhost:8181/v1/data/authz/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": {"role": "admin"}, "resource": "patients", "db": "us_db", "action": "read"}}' | jq .

echo "Admin + eu_db:"
curl -s -X POST http://localhost:8181/v1/data/authz/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": {"role": "admin"}, "resource": "patients", "db": "eu_db", "action": "read"}}' | jq .

echo "Therapist + us_db:"
curl -s -X POST http://localhost:8181/v1/data/authz/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": {"role": "therapist"}, "resource": "patients", "db": "us_db", "action": "read"}}' | jq .

echo "Analyst + us_db (should be false):"
curl -s -X POST http://localhost:8181/v1/data/authz/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": {"role": "analyst"}, "resource": "patients", "db": "us_db", "action": "read"}}' | jq .

echo "Analyst + sandbox_db:"
curl -s -X POST http://localhost:8181/v1/data/authz/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": {"role": "analyst"}, "resource": "patients", "db": "sandbox_db", "action": "read"}}' | jq .

echo ""
echo "2. Testing Service Health:"
echo "-------------------------"

echo "Middleware health:"
curl -s http://localhost:8001/health | jq .

echo "Agent health:"
curl -s http://localhost:8000/health | jq .

echo ""
echo "3. Testing Keycloak Token (alice_admin_us):"
echo "-------------------------------------------"

# Get token for alice_admin_us
TOKEN=$(curl -s -X POST http://localhost:8080/realms/zerotrust/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=demo-ui" \
  -d "username=alice_admin_us" \
  -d "password=password" | jq -r .access_token)

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo "Token obtained successfully"
  
  echo ""
  echo "4. Testing Middleware with Real Token:"
  echo "-------------------------------------"
  
  echo "Admin accessing us_db:"
  curl -s -X POST http://localhost:8001/query \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"natural_language": "Show me all patients", "db": "us_db", "resource": "patients", "action": "read"}' | jq .
  
  echo ""
  echo "Admin accessing eu_db:"
  curl -s -X POST http://localhost:8001/query \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"natural_language": "Show me all patients", "db": "eu_db", "resource": "patients", "action": "read"}' | jq .
  
else
  echo "Failed to get token for alice_admin_us"
fi

echo ""
echo "Test completed!"