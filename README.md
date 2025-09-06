# Offlyn.ai Zero Trust Demo

This repository hosts the Offlyn.ai agentic zero‑trust demo scenario. It spins up a
containerized environment that showcases fine‑grained access controls across
multiple regional databases. The stack includes:

* **Keycloak** for authentication and JWT issuance
* **FastAPI agent** that forwards user queries
* **Middleware** service that verifies tokens, consults OPA, and queries Postgres databases
* **Open Policy Agent (OPA)** with Rego policies
* **Three Postgres databases** (US, EU, Sandbox) initialized with sample data
* **React frontend** to log in and issue sample queries
* **Logger** service to audit allow/deny decisions

To start the stack:

```bash
docker-compose up --build
```

The compose file maps ports for each service so they can be accessed from the host.
