import { useEffect } from 'react'

export default function ArchitecturePage() {
  useEffect(() => {
    // Load Mermaid.js
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js'
    script.onload = () => {
      window.mermaid.initialize({ 
        startOnLoad: true,
        theme: 'base',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#2563eb',
          lineColor: '#6b7280',
          secondaryColor: '#f3f4f6',
          tertiaryColor: '#e5e7eb'
        }
      })
      window.mermaid.contentLoaded()
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])
  const architectureDiagram = `
    graph TB
        %% User Layer
        User[User]
        
        %% Presentation Layer
        subgraph "Presentation Layer"
            Frontend[React Frontend<br/>:3000]
            Keycloak[Keycloak Auth<br/>:8080]
        end
        
        %% Application Layer
        subgraph "Application Layer"
            Agent[Agent<br/>:8000]
            Middleware[Middleware<br/>:8001]
            MCP[MCP Server<br/>:5001]
        end
        
        %% External Services
        subgraph "External Services"
            Ollama[Ollama AI<br/>:11434]
            OPA[OPA<br/>:8181]
        end
        
        %% Data Layer
        subgraph "Data Layer"
            US_DB[(US DB<br/>:5433)]
            EU_DB[(EU DB<br/>:5434)]
            SBX_DB[(Sandbox<br/>:5435)]
        end
        
        %% Support Services
        subgraph "Support"
            Logger[Logger<br/>:9000]
            DataGen[Data Gen]
        end
        
        %% Clean Flow - Minimize Crossings
        User --> Frontend
        Frontend --> Keycloak
        Frontend --> Agent
        Agent --> Middleware
        
        %% Middleware connections
        Middleware --> Ollama
        Middleware --> OPA
        Middleware --> US_DB
        Middleware --> EU_DB
        Middleware --> SBX_DB
        
        %% Alternative path
        MCP --> Middleware
        
        %% Support connections
        Middleware --> Logger
        DataGen --> US_DB
        DataGen --> EU_DB
        DataGen --> SBX_DB
        
        %% Styling
        classDef presentation fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
        classDef application fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
        classDef external fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
        classDef data fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#fff
        classDef support fill:#6b7280,stroke:#4b5563,stroke-width:2px,color:#fff
        
        class Frontend,Keycloak presentation
        class Agent,Middleware,MCP application
        class Ollama,OPA external
        class US_DB,EU_DB,SBX_DB data
        class Logger,DataGen support
  `

  const securityFlow = `
    sequenceDiagram
        participant U as User
        participant F as Frontend
        participant A as Agent
        participant M as Middleware
        participant AI as Ollama
        participant O as OPA
        participant DB as Database
        
        U->>F: Login & Query
        F->>A: Request + JWT
        A->>M: Forward Request
        M->>AI: Text to SQL
        M->>O: Check Authorization
        
        alt Authorized
            M->>DB: Execute Query
            DB->>M: Results
            M->>A: Success
            A->>F: Display Data
        else Denied
            M->>A: Access Denied
            A->>F: Show Error
        end
  `

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">System Architecture</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive zero trust architecture with AI-powered text-to-SQL, microservices, 
          policy enforcement, and multi-database access control.
        </p>
      </section>

      {/* Architecture Diagram */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">System Architecture Overview</h2>
        <div className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30 overflow-x-auto">
          <div className="mermaid" style={{ minHeight: '600px' }}>
            {architectureDiagram}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <div className="p-3 bg-blue-100 rounded-lg">
            <div className="font-semibold text-blue-800">Presentation</div>
            <div className="text-blue-600">UI & Auth</div>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <div className="font-semibold text-green-800">Application</div>
            <div className="text-green-600">Core Services</div>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <div className="font-semibold text-purple-800">External</div>
            <div className="text-purple-600">AI & Policy</div>
          </div>
          <div className="p-3 bg-cyan-100 rounded-lg">
            <div className="font-semibold text-cyan-800">Data</div>
            <div className="text-cyan-600">Databases</div>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <div className="font-semibold text-gray-800">Support</div>
            <div className="text-gray-600">Logging & Tools</div>
          </div>
        </div>
      </section>

      {/* Security Flow Sequence */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Zero Trust Security Flow</h2>
        <div className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30 overflow-x-auto">
          <div className="mermaid" style={{ minHeight: '500px' }}>
            {securityFlow}
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Zero Trust Flow</h3>
          <div className="text-blue-700 text-sm">
            Every request flows through authentication, authorization, and audit logging before accessing data.
          </div>
        </div>
      </section>

      {/* Component Details */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Component Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Frontend (React)',
              port: ':3000',
              description: 'Interactive demo interface with role-based scenarios',
              features: ['Natural language query interface', 'Real-time flow visualization', 'Role-based demo scenarios', 'JWT token management']
            },
            {
              name: 'Agent Service',
              port: ':8000',
              description: 'FastAPI service for request processing and routing',
              features: ['JWT token validation', 'Request forwarding', 'Error handling', 'API gateway functionality']
            },
            {
              name: 'Middleware Service',
              port: ':8001',
              description: 'Core business logic with AI integration',
              features: ['Ollama AI text-to-SQL', 'OPA policy consultation', 'Database routing', 'Query execution']
            },
            {
              name: 'MCP Server',
              port: ':5001',
              description: 'Model Context Protocol for AI assistants',
              features: ['Structured AI tool interface', 'Database query tools', 'Authorization checking', 'User information tools']
            },
            {
              name: 'Keycloak Auth',
              port: ':8080',
              description: 'Identity and access management',
              features: ['User authentication', 'JWT token issuance', 'Role management', 'Session handling']
            },
            {
              name: 'Open Policy Agent',
              port: ':8181',
              description: 'Policy engine for authorization decisions',
              features: ['Rego policy evaluation', 'Real-time decisions', 'Context-aware rules', 'Audit logging']
            },
            {
              name: 'PostgreSQL Cluster',
              port: ':5433-5435',
              description: 'Multi-region database isolation',
              features: ['US production database', 'EU production database', 'Sandbox research database', 'AI-generated realistic data']
            },
            {
              name: 'Ollama AI Engine',
              port: ':11434',
              description: 'Local AI for text-to-SQL conversion',
              features: ['Natural language processing', 'SQL generation', 'Database schema awareness', 'Secure local processing']
            },
            {
              name: 'Logger Service',
              port: ':9000',
              description: 'Audit trail and compliance logging',
              features: ['Decision logging', 'Access tracking', 'Security events', 'Compliance reports']
            }
          ].map((component, index) => (
            <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{component.name}</h3>
                <span className="text-sm bg-gray-500/20 px-2 py-1 rounded">{component.port}</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm">{component.description}</p>
              <ul className="space-y-1">
                {component.features.map((feature, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'React', category: 'Frontend', color: 'bg-blue-500' },
            { name: 'FastAPI', category: 'Backend', color: 'bg-green-500' },
            { name: 'Keycloak', category: 'Auth', color: 'bg-red-500' },
            { name: 'PostgreSQL', category: 'Database', color: 'bg-blue-600' },
            { name: 'OPA', category: 'Policy', color: 'bg-purple-500' },
            { name: 'Ollama', category: 'AI Engine', color: 'bg-indigo-500' },
            { name: 'Docker', category: 'Container', color: 'bg-cyan-500' },
            { name: 'Mermaid.js', category: 'Diagrams', color: 'bg-pink-500' }
          ].map((tech, index) => (
            <div key={index} className="text-center p-4 backdrop-blur bg-white/20 rounded-xl border border-white/30">
              <div className={`w-12 h-12 ${tech.color} rounded-xl flex items-center justify-center text-white text-xl mx-auto mb-3`}>
                {tech.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-800">{tech.name}</h3>
              <p className="text-sm text-gray-600">{tech.category}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Zero Trust Principles */}
      <section className="py-16 backdrop-blur bg-white/10 rounded-3xl border border-white/20">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Zero Trust Implementation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              principle: 'Never Trust, Always Verify',
              description: 'Every request is authenticated and authorized, regardless of source',
              examples: ['JWT validation on every request', 'Multi-layer authorization checks', 'Continuous verification']
            },
            {
              principle: 'Least Privilege Access',
              description: 'Users get minimum permissions needed for their role',
              examples: ['Role-based database access', 'Resource-level permissions', 'Context-aware policies']
            },
            {
              principle: 'Assume Breach',
              description: 'System designed to limit damage if compromised',
              examples: ['Database isolation', 'Audit logging', 'Policy enforcement at every layer']
            },
            {
              principle: 'Verify Explicitly',
              description: 'All available data points used for authorization',
              examples: ['User role verification', 'Resource access patterns', 'Request context analysis']
            }
          ].map((item, index) => (
            <div key={index} className="p-6 bg-white/30 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{item.principle}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <ul className="space-y-2">
                {item.examples.map((example, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}