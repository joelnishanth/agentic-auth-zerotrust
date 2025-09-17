# Zero Trust Architecture Demo with AI Text-to-SQL

A comprehensive demonstration of modern zero-trust security principles combined with AI-powered natural language to SQL conversion. Created by the team at [Offlyn.ai](https://www.offlyn.ai), the environment highlights how *offline-first AI systems* can deliver intelligent experiences without sacrificing data control or trust.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab.svg)](https://python.org/)

## Table of Contents
- [Offlyn.ai Mission](#offlynai-mission)
- [What Problem Does This Solve?](#what-problem-does-this-solve)
- [Fundamental Understanding of the Repository](#fundamental-understanding-of-the-repository)
- [How the Demo Creates a Mock JWT Experience](#how-the-demo-creates-a-mock-jwt-experience)
- [Core Features](#core-features)
- [Architecture Overview](#architecture-overview)
- [Service Ports](#service-ports)
- [Setup](#setup)
- [Using the Demo](#using-the-demo)
- [AI Text-to-SQL Examples](#ai-text-to-sql-examples)
- [Development Workflow](#development-workflow)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Offlyn.ai Mission
[Offlyn.ai](https://www.offlyn.ai) is focused on helping organizations operate advanced AI capabilities even when cloud connectivity is limited or unavailable.

> Offlyn.ai’s mission is to empower teams with privacy-first, offline-capable AI systems that deliver reliable insights anywhere work happens.

## What Problem Does This Solve?
Organizations increasingly need to expose sensitive data through intelligent interfaces while preserving strict security guarantees and business continuity—even when connectivity is intermittent. This demo illustrates how to combine zero-trust patterns with AI-assisted data access so that:

- Access decisions are evaluated on every request rather than relying on network trust zones.
- User intent expressed in natural language can be safely translated into SQL.
- Policy enforcement and auditability remain transparent even when AI is part of the stack.
- AI workloads stay close to the data, enabling continuity for frontline teams operating in low-connectivity environments.

## Fundamental Understanding of the Repository
The repository is organized around modular services that collaborate to provide a secure, observable experience:

- **Frontend** delivers an interactive demo that captures user intent and visualizes authorization decisions for users exploring *offline-ready* workflows.
- **Agent Gateway** (FastAPI) coordinates user requests, relays tokens, and orchestrates downstream services.
- **Middleware** performs AI text-to-SQL conversion, validates JWTs, and consults Open Policy Agent (OPA) policies before running queries, keeping decision logic local to support disconnected modes.
- **Keycloak** issues identity tokens with configurable roles and claims to simulate enterprise identity providers.
- **PostgreSQL Databases** (US, EU, Sandbox) contain region-specific datasets used to demonstrate fine-grained access control.
- **Logger Service** records audit events for traceability.
- **Model Context Protocol (MCP) Server** exposes structured capabilities for automated assistants.
- **Scripts and Infrastructure** folders provide repeatable deployment, testing, and data generation workflows.

## How the Demo Creates a Mock JWT Experience
The environment is intentionally configured to help teams understand JSON Web Token (JWT) flows without integrating with production identity systems:

1. **Identity Issuance:** Keycloak issues JWTs after the demo user authenticates. Each token embeds roles and regional claims to model enterprise access tiers.
2. **Middleware Verification:** The middleware validates the token signature, checks token freshness, and extracts claims for downstream authorization.
3. **Policy Enforcement:** OPA evaluates Rego policies that combine token claims, request context, and target resources to approve or deny SQL execution.
4. **Audit Visibility:** Successful and rejected requests are logged to the audit service so learners can trace how JWT content impacts authorization decisions.

This flow provides a safe sandbox for experimenting with JWT-based trust chains and policy evaluation while demonstrating how tokens can be issued and verified locally for *offline-first AI* scenarios.

## Core Features

| Feature | Description | Key Components |
|---------|-------------|----------------|
| AI Text-to-SQL | Converts natural language requests into SQL queries using local language models that can run without external calls. | Middleware, Ollama (Llama 3.2) |
| Zero-Trust Enforcement | Evaluates authorization on every request with token verification and policy checks. | Middleware, OPA, Keycloak |
| Multi-Region Isolation | Demonstrates data residency controls by routing queries to regional databases. | Postgres US/EU/Sandbox instances |
| Real-Time Observability | Visualizes authorization paths, policy results, and query execution outcomes. | Frontend, Logger Service |
| Offline-Ready Personas | Provides predefined user roles to illustrate differentiated access patterns in constrained connectivity settings. | Keycloak, Demo Accounts |

## Architecture Overview
The platform integrates identity, policy, AI, and visualization services to deliver end-to-end zero-trust decisioning.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│    Agent    │───▶│ Middleware  │
│   (React)   │    │ (Gateway)   │    │ (Business)  │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                  ┌─────────────┐    ┌─────────────┐
                  │  Keycloak   │    │     OPA     │
                  │    (Auth)   │    │ (Policies)  │
                  └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                  ┌─────────────┐    ┌─────────────┐
                  │   Logger    │    │ Databases   │
                  │  (Audit)    │    │ (US/EU/SBX) │
                  └─────────────┘    └─────────────┘
```

## Service Ports

- **Frontend:** http://localhost:3000
- **Agent:** http://localhost:8000
- **Middleware:** http://localhost:8001
- **Keycloak:** http://localhost:8080
- **OPA:** http://localhost:8181
- **MCP Server:** http://localhost:5001
- **Ollama:** http://localhost:11434

## Setup

### Prerequisites
Ensure the following tools are installed before starting the environment:

| Requirement | Purpose |
|-------------|---------|
| Docker & Docker Compose | Orchestrate the local services that mimic production zero-trust infrastructure. |
| Git | Clone and manage the repository. |
| Ollama | Provide an *offline-capable* language model for text-to-SQL translation. |

### Step-by-Step Installation

1. **Clone the repository.**
   ```bash
   git clone https://github.com/your-username/agentic-auth-zerotrust.git
   cd agentic-auth-zerotrust
   ```
2. **Install and prepare Ollama.** Use the helper script for a guided setup.
   ```bash
   ./scripts/setup-ollama.sh
   ```
   Alternatively install manually, start the service, and pull the model:
   ```bash
   brew install ollama          # macOS
   ollama serve
   ollama pull llama3.2:3b
   ```
3. **Deploy the stack.**
   ```bash
   ./scripts/deploy.sh
   ```
   To review or customize the deployment, you can also run:
   ```bash
   docker-compose up --build
   ```
4. **Open the demo.** Navigate to http://localhost:3000/demo in your browser to explore the mocked zero-trust environment.

### Optional: Focused Development Setup

Start only the infrastructure dependencies, then run application services or the frontend locally:
```bash
# Infrastructure
docker-compose up -d postgres_us postgres_eu postgres_sbx opa auth-service

# Application services
docker-compose up -d middleware agent mcp-server logger

# Frontend development server
cd frontend
npm install
npm run dev
```

## Using the Demo

1. **Sign in with demo accounts** (password for all accounts: `password`).
   | Role | Username | Access Level |
   |------|----------|--------------|
   | Therapist | `sarah_therapist` | Assigned patients only |
   | Admin | `alice_admin_us` | Full US database access |
   | Analyst | `maya_analyst` | Sandbox data analysis |
   | Support | `leo_support` | Customer support data |
   | Superuser | `superdev` | Unrestricted access |

2. **Submit natural language queries.** Examples include:
   - "Show me all patients"
   - "How many patients by diagnosis?"
   - "What is the average outcome score?"
   - "List patients with their therapists"

3. **Observe the authorization journey.** Follow how the system converts text to SQL, evaluates policies, executes queries, and records audit events—all while keeping the critical logic within the controlled, offline-friendly environment.

## AI Text-to-SQL Examples

All conversions are powered by the locally hosted Ollama model so teams can explore secure, *offline-capable* analytics flows.

### Production Databases (US/EU)
- "Show all patients" → `SELECT * FROM patients LIMIT 20`
- "How many active patients?" → `SELECT COUNT(*) FROM patients WHERE status = 'active'`
- "List patients with therapists" → `SELECT p.name, t.name FROM patients p JOIN therapists t...`

### Research Database (Sandbox)
- "Show average outcome score" → `SELECT AVG(outcome_score) FROM patients`
- "How many patients by diagnosis?" → `SELECT diagnosis_category, COUNT(*) FROM patients GROUP BY...`
- "What is the success rate?" → `SELECT metric_name, metric_value FROM research_metrics WHERE...`

## Development Workflow

### Running Automated Tests
```bash
./scripts/test-all-scenarios.sh
./scripts/test-keycloak.sh
./scripts/test-patient-portal.sh
```

### Repository Structure
```
├── agent/                 # API Gateway service
├── data-generator/        # AI-powered data generation
├── frontend/              # React frontend application
├── keycloak/              # Keycloak configuration
├── logger/                # Audit logging service
├── mcp-server/            # Model Context Protocol server
├── middleware/            # Business logic and AI integration
├── policies/              # OPA Rego policies
├── scripts/               # Shell scripts for deployment and testing
├── db/                    # Database initialization scripts
└── .github/               # GitHub templates and workflows
```

## Documentation

- **[Deployment Guide](DEPLOYMENT.md)** — Detailed deployment instructions
- **[Contributing Guide](CONTRIBUTING.md)** — How to contribute to the project
- **[Security Policy](SECURITY.md)** — Security reporting and best practices
- **[Code of Conduct](CODE_OF_CONDUCT.md)** — Community guidelines

## Contributing

We welcome contributions. Please review the [Contributing Guide](CONTRIBUTING.md) for development standards, coding conventions, and submission steps.

## License

This project is licensed under the MIT License. Refer to the [LICENSE](LICENSE) file for complete terms.

## Support

- **Issues:** [GitHub Issues](https://github.com/your-username/agentic-auth-zerotrust/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/agentic-auth-zerotrust/discussions)
- **Website:** [www.offlyn.ai](https://www.offlyn.ai)
- **Email:** hi@offlyn.ai
