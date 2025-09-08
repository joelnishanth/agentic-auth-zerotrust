# Zero Trust Architecture - Deployment Guide

## Quick Start

### 🚀 One-Command Deployment
```bash
./deploy.sh
```

This will automatically:
- Clean up any existing deployment
- Build all container images
- Start services in the correct order
- Perform health checks
- Show deployment status with progress bars

### 📊 Monitor Deployment Progress

The deployment script provides:
- **Progress bars** for each deployment phase
- **Real-time health checks** for all services
- **Color-coded status indicators**
- **Service availability confirmation**

## Deployment Commands

### Deploy the Stack
```bash
./deploy.sh deploy
```
- Builds and starts all services
- Populates databases with AI-generated data
- Performs comprehensive health checks
- Shows access URLs and test accounts

### Check Status
```bash
./deploy.sh status
```
- Shows container status
- Performs health checks on all services
- Displays service availability

### View Logs
```bash
./deploy.sh logs                    # List available services
./deploy.sh logs frontend           # View frontend logs
./deploy.sh logs data-generator     # View data generation logs
```

### Clean Up
```bash
./deploy.sh cleanup
```
- Stops all containers
- Removes containers and networks
- Cleans up deployment artifacts

## What Gets Deployed

### 🛡️ Security Layer
- **Keycloak** (Authentication) - Port 8080
- **OPA** (Policy Engine) - Port 8181

### 🔧 Application Layer
- **Agent** (API Gateway) - Port 8000
- **Middleware** (Business Logic) - Port 8001
- **MCP Server** (Model Context Protocol) - Port 5001
- **Frontend** (React UI) - Port 3000

### 🗄️ Data Layer
- **US Database** (PostgreSQL) - Port 5433
- **EU Database** (PostgreSQL) - Port 5434
- **Sandbox Database** (PostgreSQL) - Port 5435

### 🤖 AI Integration
- **Data Generator** (Ollama-powered)
- **Text-to-SQL** (Natural language processing)

## Access Information

### 🌐 Web Interfaces
- **Main Application**: http://localhost:3000
- **Keycloak Admin**: http://localhost:8080/admin
- **OPA Playground**: http://localhost:8181

### 👥 Test Accounts
All accounts use password: `password`

| Role | Username | Access Level |
|------|----------|-------------|
| Therapist | `sarah_therapist` | Assigned patients only |
| Admin | `alice_admin_us` | Full US database access |
| Analyst | `maya_analyst` | Research data only |
| Support | `leo_support` | Customer support data |
| Superuser | `superdev` | Unrestricted access |

## Deployment Features

### 🎯 Progress Visualization
- **Step-by-step progress bars**
- **Real-time status updates**
- **Color-coded success/failure indicators**
- **Service health monitoring**

### 🔍 Health Checks
- **Automatic service availability testing**
- **Database connectivity verification**
- **API endpoint validation**
- **Container status monitoring**

### 📝 Comprehensive Logging
- **Individual service logs**
- **Deployment progress tracking**
- **Error reporting and diagnostics**
- **Build process monitoring**

## Troubleshooting

### Common Issues

#### Services Not Starting
```bash
./deploy.sh status          # Check service status
./deploy.sh logs [service]  # View specific service logs
```

#### Database Connection Issues
```bash
./deploy.sh logs data-generator  # Check data population
docker-compose ps               # Verify database containers
```

#### Ollama AI Not Available
The system gracefully falls back to static data generation if Ollama is not running.

#### Port Conflicts
Ensure ports 3000, 8000, 8001, 8080, 8181, 5433-5435, 5001, 9000 are available.

### Manual Commands

If you prefer manual control:
```bash
# Build only
docker-compose build

# Start specific services
docker-compose up -d postgres_us postgres_eu postgres_sbx
docker-compose up -d opa auth-service
docker-compose up -d middleware agent mcp-server
docker-compose up -d frontend

# View all logs
docker-compose logs -f
```

## Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│    Agent    │───▶│ Middleware  │
│   (React)   │    │ (Gateway)   │    │ (Business)  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Keycloak   │    │     OPA     │
                   │   (Auth)    │    │ (Policies)  │
                   └─────────────┘    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │ Databases   │
                                    │ (US/EU/SBX) │
                                    └─────────────┘
```

## Next Steps

After successful deployment:

1. **Visit** http://localhost:3000
2. **Login** with any test account
3. **Try scenarios** - each role has different permissions
4. **Explore demos** - Main demo, MCP demo, Patient portal
5. **View architecture** - Interactive diagrams and documentation

The deployment script ensures everything is properly configured and ready for demonstration!