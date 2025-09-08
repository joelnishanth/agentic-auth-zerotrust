#!/bin/bash

echo "🧪 Testing All User Scenarios Across All Pages"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to get token for a user
get_token() {
    local username=$1
    local password=${2:-"password"}
    
    curl -s -X POST http://localhost:8080/realms/zerotrust/protocol/openid-connect/token \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=password" \
        -d "client_id=demo-ui" \
        -d "username=$username" \
        -d "password=$password" | jq -r .access_token
}

# Function to test middleware endpoint
test_middleware() {
    local token=$1
    local query=$2
    local db=$3
    local expected_result=$4
    
    echo -n "    Testing: $query (db: $db) - "
    
    response=$(curl -s -X POST http://localhost:8001/query \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "{\"natural_language\": \"$query\", \"db\": \"$db\", \"resource\": \"patients\", \"action\": \"read\"}")
    
    if echo "$response" | jq -e '.rows' > /dev/null 2>&1; then
        row_count=$(echo "$response" | jq '.rows | length')
        if [ "$expected_result" = "ALLOWED" ]; then
            echo -e "${GREEN}✅ PASS${NC} (${row_count} rows returned)"
        else
            echo -e "${RED}❌ FAIL${NC} (Expected denial but got ${row_count} rows)"
        fi
    elif echo "$response" | jq -e '.detail' > /dev/null 2>&1; then
        error=$(echo "$response" | jq -r '.detail')
        if [ "$expected_result" = "DENIED" ]; then
            echo -e "${GREEN}✅ PASS${NC} (Correctly denied: $error)"
        else
            echo -e "${RED}❌ FAIL${NC} (Expected success but got: $error)"
        fi
    else
        echo -e "${YELLOW}⚠️  UNKNOWN${NC} (Unexpected response format)"
        echo "    Response: $response"
    fi
}

# Function to test MCP endpoint
test_mcp() {
    local token=$1
    local query=$2
    local db=$3
    local expected_result=$4
    
    echo -n "    Testing MCP: $query (db: $db) - "
    
    response=$(curl -s -X POST http://localhost:5001/mcp-call \
        -H "Content-Type: application/json" \
        -d "{\"tool\": \"query_database\", \"parameters\": {\"token\": \"$token\", \"query\": \"$query\", \"database\": \"$db\", \"resource\": \"patients\", \"action\": \"read\"}}")
    
    if echo "$response" | grep -q "rows"; then
        if [ "$expected_result" = "ALLOWED" ]; then
            echo -e "${GREEN}✅ PASS${NC} (Data returned)"
        else
            echo -e "${RED}❌ FAIL${NC} (Expected denial but got data)"
        fi
    elif echo "$response" | grep -q -i "denied\|error\|forbidden"; then
        if [ "$expected_result" = "DENIED" ]; then
            echo -e "${GREEN}✅ PASS${NC} (Correctly denied)"
        else
            echo -e "${RED}❌ FAIL${NC} (Expected success but got denial)"
        fi
    else
        echo -e "${YELLOW}⚠️  UNKNOWN${NC} (Unexpected response)"
        echo "    Response: $response"
    fi
}

echo ""
echo "🔍 Testing Service Health"
echo "------------------------"

# Test service health
services=("middleware:8001" "agent:8000" "mcp-server:5001")
for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s http://localhost:$port/health > /dev/null; then
        echo -e "  ${GREEN}✅${NC} $name service is healthy"
    else
        echo -e "  ${RED}❌${NC} $name service is not responding"
    fi
done

echo ""
echo "👥 Testing User Authentication"
echo "-----------------------------"

# Test user authentication
users=("alice_admin_us" "sarah_therapist" "maya_analyst" "leo_support" "superdev")

# Get tokens for all users
alice_token=""
sarah_token=""
maya_token=""
leo_token=""
super_token=""

for user in "${users[@]}"; do
    echo -n "  Getting token for $user: "
    token=$(get_token $user)
    
    if [ "$token" != "null" ] && [ "$token" != "" ]; then
        case $user in
            "alice_admin_us") alice_token=$token ;;
            "sarah_therapist") sarah_token=$token ;;
            "maya_analyst") maya_token=$token ;;
            "leo_support") leo_token=$token ;;
            "superdev") super_token=$token ;;
        esac
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
done

echo ""
echo "🏥 Testing Patient Portal Scenarios"
echo "==================================="

# Admin scenarios
if [ -n "$alice_token" ]; then
    echo -e "${BLUE}Testing Admin (alice_admin_us):${NC}"
    test_middleware "$alice_token" "Show me all patients in the US database" "us_db" "ALLOWED"
    test_middleware "$alice_token" "Show me total patient count and session statistics" "us_db" "ALLOWED"
    test_middleware "$alice_token" "Show me patients in the EU database" "eu_db" "ALLOWED"
else
    echo -e "${RED}❌ Skipping Admin tests - no token${NC}"
fi

# Therapist scenarios
if [ -n "$sarah_token" ]; then
    echo -e "${BLUE}Testing Therapist (sarah_therapist):${NC}"
    test_middleware "$sarah_token" "Show me patients assigned to sarah_therapist" "us_db" "ALLOWED"
    test_middleware "$sarah_token" "Show me therapy notes for therapist sarah_therapist" "us_db" "ALLOWED"
    test_middleware "$sarah_token" "Show me all patients in the system" "sandbox_db" "DENIED"
else
    echo -e "${RED}❌ Skipping Therapist tests - no token${NC}"
fi

# Analyst scenarios
if [ -n "$maya_token" ]; then
    echo -e "${BLUE}Testing Analyst (maya_analyst):${NC}"
    test_middleware "$maya_token" "Show me research data and treatment outcomes" "sandbox_db" "ALLOWED"
    test_middleware "$maya_token" "Show me treatment outcome statistics and trends" "us_db" "DENIED"
    test_middleware "$maya_token" "Show me patient names and contact information" "us_db" "DENIED"
else
    echo -e "${RED}❌ Skipping Analyst tests - no token${NC}"
fi

# Support scenarios
if [ -n "$leo_token" ]; then
    echo -e "${BLUE}Testing Support (leo_support):${NC}"
    test_middleware "$leo_token" "Show me patient contact information for support cases" "us_db" "ALLOWED"
    test_middleware "$leo_token" "Show me patients with active support cases" "us_db" "ALLOWED"
    test_middleware "$leo_token" "Show me patient diagnoses and treatment plans" "us_db" "ALLOWED"
else
    echo -e "${RED}❌ Skipping Support tests - no token${NC}"
fi

# Superuser scenarios
if [ -n "$super_token" ]; then
    echo -e "${BLUE}Testing Superuser (superdev):${NC}"
    test_middleware "$super_token" "Show me all patients and records in US database" "us_db" "ALLOWED"
    test_middleware "$super_token" "Show me patients from EU database" "eu_db" "ALLOWED"
    test_middleware "$super_token" "Show me complete system overview with all patient data" "sandbox_db" "ALLOWED"
else
    echo -e "${RED}❌ Skipping Superuser tests - no token${NC}"
fi

echo ""
echo "🔧 Testing MCP Demo Scenarios"
echo "============================="

# Test MCP scenarios for each user
if [ -n "$alice_token" ]; then
    echo -e "${BLUE}Testing MCP for alice_admin_us:${NC}"
    test_mcp "$alice_token" "Show me all US patients" "us_db" "ALLOWED"
    test_mcp "$alice_token" "Show me EU patients" "eu_db" "ALLOWED"
fi

if [ -n "$sarah_token" ]; then
    echo -e "${BLUE}Testing MCP for sarah_therapist:${NC}"
    test_mcp "$sarah_token" "Show me my assigned patients" "us_db" "ALLOWED"
    test_mcp "$sarah_token" "Show me research data" "sandbox_db" "DENIED"
fi

if [ -n "$maya_token" ]; then
    echo -e "${BLUE}Testing MCP for maya_analyst:${NC}"
    test_mcp "$maya_token" "Show me research data" "sandbox_db" "ALLOWED"
    test_mcp "$maya_token" "Show me patient data" "us_db" "DENIED"
fi

if [ -n "$leo_token" ]; then
    echo -e "${BLUE}Testing MCP for leo_support:${NC}"
    test_mcp "$leo_token" "Show me support cases" "us_db" "ALLOWED"
    test_mcp "$leo_token" "Show me research data" "sandbox_db" "DENIED"
fi

if [ -n "$super_token" ]; then
    echo -e "${BLUE}Testing MCP for superdev:${NC}"
    test_mcp "$super_token" "Show me all data" "us_db" "ALLOWED"
    test_mcp "$super_token" "Show me EU data" "eu_db" "ALLOWED"
    test_mcp "$super_token" "Show me sandbox data" "sandbox_db" "ALLOWED"
fi

echo ""
echo "📊 Testing Main Demo Page Scenarios"
echo "==================================="

# Test main demo scenarios (these go through the agent service)
for token_var in alice_token sarah_token maya_token leo_token super_token; do
    token_value=$(eval echo \$$token_var)
    user_name=$(echo $token_var | sed 's/_token//')
    
    if [ -n "$token_value" ]; then
        echo -e "${BLUE}Testing Main Demo for $user_name:${NC}"
        
        # Test agent endpoint
        response=$(curl -s -X POST http://localhost:8000/query \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token_value" \
            -d '{"natural_language": "Show me patient data", "db": "us_db", "resource": "patients", "action": "read"}')
        
        if echo "$response" | jq -e '.rows' > /dev/null 2>&1; then
            row_count=$(echo "$response" | jq '.rows | length')
            echo -e "    Agent query: ${GREEN}✅ PASS${NC} (${row_count} rows returned)"
        elif echo "$response" | jq -e '.detail' > /dev/null 2>&1; then
            error=$(echo "$response" | jq -r '.detail')
            echo -e "    Agent query: ${YELLOW}⚠️  DENIED${NC} ($error)"
        else
            echo -e "    Agent query: ${RED}❌ ERROR${NC} (Unexpected response)"
        fi
    fi
done

echo ""
echo "📋 Summary"
echo "=========="
echo "✅ All scenarios tested across three pages:"
echo "   • Patient Portal (middleware endpoint)"
echo "   • MCP Demo (MCP server endpoint)" 
echo "   • Main Demo (agent endpoint)"
echo ""
echo "🔍 Check the results above for any failures that need fixing."
echo "🚀 Ready for user testing!"