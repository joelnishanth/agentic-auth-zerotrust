# Offlyn.ai Zero Trust Demo with AI Text-to-SQL

This repository hosts the Offlyn.ai agentic zero‑trust demo scenario. It spins up a
containerized environment that showcases fine‑grained access controls across
multiple regional databases with **AI-powered natural language to SQL conversion**.

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
