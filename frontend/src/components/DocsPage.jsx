import { useState } from 'react'

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('endpoints')

  const endpoints = [
    {
      method: 'POST',
      path: '/query',
      service: 'Agent (Port 8000)',
      description: 'Execute a query with JWT authentication',
      headers: {
        'Authorization': 'Bearer <jwt_token>',
        'Content-Type': 'application/json'
      },
      body: {
        action: 'read',
        resource: 'patients',
        db: 'us_db',
        sql: 'SELECT * FROM patients',
        natural_language: 'Show me all patients'
      },
      response: {
        rows: [
          { id: 'p001', name: 'John Doe', region: 'us' }
        ],
        trace: {
          agent: 'success',
          middleware: 'success', 
          opa: 'allowed',
          db: 'success'
        }
      }
    },
    {
      method: 'POST',
      path: '/query',
      service: 'Middleware (Port 8001)',
      description: 'Internal middleware endpoint for policy enforcement',
      headers: {
        'Authorization': 'Bearer <jwt_token>',
        'Content-Type': 'application/json'
      },
      body: {
        action: 'read',
        resource: 'patients',
        db: 'us_db',
        sql: 'SELECT * FROM patients',
        patient_id: 'p001'
      },
      response: {
        rows: [
          { id: 'p001', name: 'John Doe', region: 'us' }
        ]
      }
    },
    {
      method: 'POST',
      path: '/v1/data/authz/allow',
      service: 'OPA (Port 8181)',
      description: 'Policy evaluation endpoint',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        input: {
          user: { role: 'therapist', assigned_patients: ['p001'] },
          action: 'read',
          resource: 'patients',
          db: 'us_db',
          patient_id: 'p001'
        }
      },
      response: {
        result: true
      }
    },
    {
      method: 'POST',
      path: '/log',
      service: 'Logger (Port 9000)',
      description: 'Audit logging endpoint',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        decision: 'allow',
        payload: {
          user: { role: 'therapist' },
          action: 'read',
          resource: 'patients'
        }
      },
      response: {
        status: 'ok'
      }
    }
  ]

  const authFlow = [
    {
      step: 1,
      title: 'Login to Keycloak',
      description: 'Redirect user to Keycloak login page',
      code: `// Frontend - Keycloak initialization
const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'zerotrust',
  clientId: 'demo-ui'
})

// Trigger login
await keycloak.init({ onLoad: 'login-required' })`
    },
    {
      step: 2,
      title: 'Receive JWT Token',
      description: 'Keycloak returns JWT token with user claims',
      code: `// JWT Token Structure
{
  "sub": "user-id",
  "preferred_username": "sarah_therapist",
  "role": "therapist",
  "assigned_patients": ["p001", "p004"],
  "region": "us",
  "exp": 1640995200,
  "iat": 1640991600
}`
    },
    {
      step: 3,
      title: 'Include Token in Requests',
      description: 'Send JWT token in Authorization header',
      code: `// API Request with JWT
const response = await fetch('/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'read',
    resource: 'patients',
    db: 'us_db'
  })
})`
    }
  ]

  const policies = [
    {
      name: 'Role-based Access',
      description: 'Define what actions each role can perform',
      code: `# Rego Policy - Role Permissions
allowed_roles = {
  "therapist": {
    "patients": ["read"], 
    "notes": ["read", "write"]
  },
  "admin": {
    "patients": ["read", "write"], 
    "notes": ["read", "write"]
  },
  "analyst": {
    "patients": ["read"]
  }
}`
    },
    {
      name: 'Database Access Control',
      description: 'Control which databases each role can access',
      code: `# Rego Policy - Database Access
allowed_dbs = {
  "therapist": ["us_db", "eu_db"],
  "admin": ["us_db", "eu_db", "sandbox_db"],
  "analyst": ["sandbox_db"],
  "support": ["us_db", "eu_db"]
}`
    },
    {
      name: 'Patient Assignment Check',
      description: 'Ensure therapists can only access assigned patients',
      code: `# Rego Policy - Patient Access
patient_permitted {
  not input.patient_id
}

patient_permitted {
  some i
  input.user.assigned_patients[i] == input.patient_id
}`
    }
  ]

  const examples = [
    {
      title: 'Successful Query',
      description: 'Therapist accessing assigned patient',
      request: {
        user: 'sarah_therapist (role: therapist)',
        action: 'Read patient p001',
        expected: 'Allow - patient is assigned to therapist'
      },
      code: `POST /query
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

{
  "action": "read",
  "resource": "patients", 
  "db": "us_db",
  "sql": "SELECT * FROM patients WHERE id = 'p001'"
}

Response: 200 OK
{
  "rows": [{"id": "p001", "name": "John Doe"}]
}`
    },
    {
      title: 'Access Denied',
      description: 'Therapist trying to access unassigned patient',
      request: {
        user: 'sarah_therapist (role: therapist)',
        action: 'Read patient p002',
        expected: 'Deny - patient not assigned to therapist'
      },
      code: `POST /query
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

{
  "action": "read",
  "resource": "patients",
  "db": "us_db", 
  "patient_id": "p002"
}

Response: 403 Forbidden
{
  "detail": "Access denied"
}`
    },
    {
      title: 'Natural Language Query',
      description: 'Using AI to convert text to SQL',
      request: {
        user: 'alice_admin_us (role: admin)',
        action: 'Natural language query',
        expected: 'Allow - admin has full access'
      },
      code: `POST /query
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

{
  "natural_language": "Show me all patients in the US database",
  "action": "read",
  "resource": "patients",
  "db": "us_db"
}

Response: 200 OK
{
  "rows": [...],
  "generated_sql": "SELECT * FROM patients WHERE region = 'us'"
}`
    }
  ]

  const tabs = [
    { id: 'endpoints', label: 'API Endpoints', icon: '🔌' },
    { id: 'auth', label: 'Authentication', icon: '🔐' },
    { id: 'policies', label: 'Policies', icon: '⚖️' },
    { id: 'examples', label: 'Examples', icon: '💡' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center py-12">
        <div className="text-6xl mb-6">📚</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">API Documentation</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Complete reference for integrating with the zero trust architecture APIs, 
          authentication flows, and policy configurations.
        </p>
      </section>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 p-1 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white/40 text-gray-800 shadow-sm'
                : 'text-gray-600 hover:bg-white/20'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* API Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">API Endpoints</h2>
          {endpoints.map((endpoint, index) => (
            <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  endpoint.method === 'POST' ? 'bg-green-500 text-white' :
                  endpoint.method === 'GET' ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-lg font-mono text-gray-800">{endpoint.path}</code>
                <span className="text-sm text-gray-500">{endpoint.service}</span>
              </div>
              <p className="text-gray-600 mb-4">{endpoint.description}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Request</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Headers:</span>
                      <pre className="mt-1 p-3 bg-gray-800 text-green-400 rounded-lg text-sm overflow-x-auto">
{JSON.stringify(endpoint.headers, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Body:</span>
                      <pre className="mt-1 p-3 bg-gray-800 text-green-400 rounded-lg text-sm overflow-x-auto">
{JSON.stringify(endpoint.body, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Response</h4>
                  <pre className="p-3 bg-gray-800 text-blue-400 rounded-lg text-sm overflow-x-auto">
{JSON.stringify(endpoint.response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Authentication Tab */}
      {activeTab === 'auth' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Authentication Flow</h2>
          {authFlow.map((step, index) => (
            <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <pre className="p-4 bg-gray-800 text-green-400 rounded-lg text-sm overflow-x-auto">
{step.code}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">OPA Policies</h2>
          {policies.map((policy, index) => (
            <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{policy.name}</h3>
              <p className="text-gray-600 mb-4">{policy.description}</p>
              <pre className="p-4 bg-gray-800 text-orange-400 rounded-lg text-sm overflow-x-auto">
{policy.code}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Usage Examples</h2>
          {examples.map((example, index) => (
            <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{example.title}</h3>
              <p className="text-gray-600 mb-4">{example.description}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">User:</span>
                  <p className="text-blue-700 text-sm">{example.request.user}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-800">Action:</span>
                  <p className="text-purple-700 text-sm">{example.request.action}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Expected:</span>
                  <p className="text-green-700 text-sm">{example.request.expected}</p>
                </div>
              </div>
              
              <pre className="p-4 bg-gray-800 text-cyan-400 rounded-lg text-sm overflow-x-auto">
{example.code}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}