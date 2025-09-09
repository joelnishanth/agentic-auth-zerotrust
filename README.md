# Zero Trust Architecture Demo with AI Text-to-SQL

A comprehensive demonstration of modern zero-trust security principles combined with AI-powered natural language to SQL conversion. This project showcases fine-grained access controls, role-based authorization, and real-time policy enforcement across multiple regional databases.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab.svg)](https://python.org/)

## 🎯 What This Demo Shows

This project demonstrates how to build a **production-ready zero-trust architecture** with:

- **AI-Powered Queries**: Convert natural language to SQL using local LLMs
- **Fine-Grained Authorization**: Role-based access control with OPA policies
- **Multi-Region Data**: Separate databases with different access rules
- **Real-Time Monitoring**: Live visualization of authorization decisions
- **Audit Logging**: Complete audit trail of all operations

## 🚀 Features

* **🤖 AI Text-to-SQL**: Natural language queries converted to SQL using local Ollama
* **🔐 Zero Trust Architecture**: Fine-grained access controls with JWT + OPA policies
* **🌍 Multi-Region Databases**: US, EU, and Sandbox databases with different access rules
* **📊 Real-time Visualization**: Live flow diagrams showing authorization decisions
* **🎭 Role-Based Access**: Different personas (therapist, admin, analyst, etc.)

## 🏗️ Architecture

* **Keycloak** for authentication and JWT issuance
* **FastAPI agent** that forwards user queries
* **Middleware** service with AI text-to-SQL, token verification, and OPA consultation
* **Open Policy Agent (OPA)** with Rego policies for authorization
* **Three Postgres databases** (US, EU, Sandbox) with sample healthcare data
* **React frontend** with interactive demo interface
* **MCP Server** for structured AI assistant access
* **Logger** service for audit trails
* **Ollama** for local AI text-to-SQL conversion

## 🛠️ Quick Start

### 1. Setup Ollama (Required for AI Text-to-SQL)

```bash
# Run the setup script
./setup-ollama.sh
```

Or manually:
```bash
# Install Ollama (macOS)
brew install ollama

# Start Ollama service
ollama serve

# Pull the required model
ollama pull llama3.2:3b
```

### 2. Start the Demo

```bash
docker-compose up --build
```

### 3. Access the Demo

Open your browser to: **http://localhost:3000/demo**

## 🎮 How to Use

1. **Login** with test accounts (password: `password`):
   - `sarah_therapist` - Access assigned patients
   - `alice_admin_us` - Full administrative access
   - `maya_analyst` - Sandbox data analysis
   - `leo_support` - Customer support access
   - `superdev` - Unrestricted access

2. **Try Natural Language Queries**:
   - "Show me all patients"
   - "How many patients by diagnosis?"
   - "What's the average outcome score?"
   - "List patients with their therapists"

3. **Watch the AI Convert to SQL** in real-time
4. **Observe Authorization Flow** through the live visualization

## 🤖 AI Text-to-SQL Examples

### Production Databases (US/EU)
- "Show all patients" → `SELECT * FROM patients LIMIT 20`
- "How many active patients?" → `SELECT COUNT(*) FROM patients WHERE status = 'active'`
- "List patients with therapists" → `SELECT p.name, t.name FROM patients p JOIN therapists t...`

### Research Database (Sandbox)
- "Show average outcome score" → `SELECT AVG(outcome_score) FROM patients`
- "How many patients by diagnosis?" → `SELECT diagnosis_category, COUNT(*) FROM patients GROUP BY...`
- "What's the success rate?" → `SELECT metric_name, metric_value FROM research_metrics WHERE...`

## 🔧 Service Ports

- **Frontend**: http://localhost:3000
- **Agent**: http://localhost:8000
- **Middleware**: http://localhost:8001
- **Keycloak**: http://localhost:8080
- **OPA**: http://localhost:8181
- **MCP Server**: http://localhost:5001
- **Ollama**: http://localhost:11434

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (latest version)
- **Ollama** (for AI text-to-SQL functionality)
- **Git** (for cloning the repository)

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/your-username/agentic-auth-zerotrust.git
cd agentic-auth-zerotrust

# Set up Ollama (required for AI features)
./scripts/setup-ollama.sh

# Deploy the entire stack
./scripts/deploy.sh
```

### Manual Setup

If you prefer manual control:

```bash
# 1. Install Ollama
brew install ollama  # macOS
# or visit https://ollama.ai for other platforms

# 2. Start Ollama and pull the model
ollama serve
ollama pull llama3.2:3b

# 3. Start the application
docker-compose up --build

# 4. Access the demo
open http://localhost:3000
```

## 🎮 Demo Walkthrough

### 1. **Login with Test Accounts**
All accounts use password: `password`

| Role | Username | Access Level |
|------|----------|--------------|
| Therapist | `sarah_therapist` | Assigned patients only |
| Admin | `alice_admin_us` | Full US database access |
| Analyst | `maya_analyst` | Sandbox data analysis |
| Support | `leo_support` | Customer support data |
| Superuser | `superdev` | Unrestricted access |

### 2. **Try Natural Language Queries**
- "Show me all patients"
- "How many patients by diagnosis?"
- "What's the average outcome score?"
- "List patients with their therapists"

### 3. **Observe the Zero-Trust Flow**
- Watch real-time authorization decisions
- See how different roles get different access
- Monitor the complete audit trail

## 🏗️ Architecture Deep Dive

### System Components

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

### Security Features

- **JWT Authentication**: Keycloak-managed tokens
- **Role-Based Access Control**: Fine-grained permissions
- **Policy Enforcement**: OPA Rego policies
- **Audit Logging**: Complete operation tracking
- **Database Isolation**: Regional data separation
- **Input Validation**: SQL injection prevention

## 🤖 AI Integration

### Text-to-SQL Conversion

The system uses **Ollama** with **Llama 3.2** to convert natural language queries to SQL:

```python
# Example: "Show me all active patients"
# Converts to: SELECT * FROM patients WHERE status = 'active'
```

### Supported Query Types

- **Data Retrieval**: "Show me all patients"
- **Aggregations**: "How many patients by diagnosis?"
- **Joins**: "List patients with their therapists"
- **Filtering**: "Show active patients only"
- **Analytics**: "What's the average outcome score?"

## 🔧 Development

### Local Development

```bash
# Start infrastructure
docker-compose up -d postgres_us postgres_eu postgres_sbx opa auth-service

# Start application services
docker-compose up -d middleware agent mcp-server logger

# Start frontend in development mode
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Run all tests
./scripts/test-all-scenarios.sh

# Test specific components
./scripts/test-keycloak.sh
./scripts/test-patient-portal.sh
```

### Project Structure

```
├── agent/                 # API Gateway service
├── data-generator/        # AI-powered data generation
├── frontend/             # React frontend application
├── keycloak/             # Keycloak configuration
├── logger/               # Audit logging service
├── mcp-server/           # Model Context Protocol server
├── middleware/           # Business logic and AI integration
├── policies/             # OPA Rego policies
├── scripts/              # Shell scripts for deployment and testing
├── db/                   # Database initialization scripts
└── .github/              # GitHub templates and workflows
```

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Detailed deployment instructions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Security Policy](SECURITY.md)** - Security reporting and best practices
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (if applicable)
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ollama** for local LLM capabilities
- **Keycloak** for authentication
- **Open Policy Agent** for authorization
- **React** and **FastAPI** for the application stack
- **Docker** for containerization

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/agentic-auth-zerotrust/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/agentic-auth-zerotrust/discussions)
- **Email**: contact@offlyn.ai

---

**Made with ❤️ by the Offlyn.ai team**
