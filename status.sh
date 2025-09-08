#!/bin/bash

# Quick status check script
# Shows a simple overview of the deployment status

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🛡️  Zero Trust Architecture - Quick Status${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# Check if docker-compose is running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ No services are currently running${NC}"
    echo -e "${YELLOW}💡 Run './deploy.sh' to start the deployment${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Services are running!${NC}\n"

# Quick service check
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | head -1
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | tail -n +2 | while read line; do
    if echo "$line" | grep -q "Up"; then
        echo -e "${GREEN}✅${NC} $line"
    else
        echo -e "${RED}❌${NC} $line"
    fi
done

echo

# Quick health check
echo -e "${BLUE}🌐 Quick Health Check:${NC}"

# Frontend
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend${NC} - http://localhost:3000"
else
    echo -e "${RED}❌ Frontend${NC} - http://localhost:3000"
fi

# Keycloak
if curl -s -f http://localhost:8080/realms/zerotrust > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Keycloak${NC} - http://localhost:8080"
else
    echo -e "${RED}❌ Keycloak${NC} - http://localhost:8080"
fi

echo
echo -e "${YELLOW}💡 For detailed status: ./deploy.sh status${NC}"
echo -e "${YELLOW}💡 To view logs: ./deploy.sh logs [service-name]${NC}"