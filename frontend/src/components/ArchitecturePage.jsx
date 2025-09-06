export default function ArchitecturePage() {
  const components = [
    {
      name: 'Keycloak Authentication',
      port: '8080',
      description: 'Identity and access management with JWT token issuance',
      tech: 'Keycloak 21.0.1',
      responsibilities: [
        'User authentication and authorization',
        'JWT token generation and validation',
        'Role-based access control (RBAC)',
        'Session management'
      ],
      color: 'from-red-500 to-pink-500'
    },
    {
      name: 'Agent Service',
      port: '8000',
      description: 'FastAPI service for request processing and NLP-to-SQL conversion',
      tech: 'FastAPI + Python',
      responsibilities: [
        'JWT token verification',
        'Natural language processing',
        'SQL query generation',
        'Request forwarding to middleware'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Middleware Service',
      port: '8001',
      description: 'Policy enforcement and database routing layer',
      tech: 'FastAPI + Python',
      responsibilities: [
        'Secondary JWT validation',
        'OPA policy consultation',
        'Database connection management',
        'Query execution and response handling'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Open Policy Agent',
      port: '8181',
      description: 'Policy engine for real-time authorization decisions',
      tech: 'OPA 0.57.0 + Rego',
      responsibilities: [
        'Policy evaluation using Rego rules',
        'Role-based access decisions',
        'Resource-level authorization',
        'Context-aware policy enforcement'
      ],
      color: 'from-purple-500 to-indigo-500'
    },
    {
      name: 'PostgreSQL Databases',
      port: '5433-5435',
      description: 'Multi-region database cluster with data isolation',
      tech: 'PostgreSQL 15',
      responsibilities: [
        'US database (port 5433)',
        'EU database (port 5434)', 
        'Sandbox database (port 5435)',
        'Data persistence and querying'
      ],
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Logger Service',
      port: '9000',
      description: 'Audit trail and decision logging service',
      tech: 'FastAPI + Python',
      responsibilities: [
        'Access decision logging',
        'Audit trail maintenance',
        'Security event tracking',
        'Compliance reporting'
      ],
      color: 'from-teal-500 to-blue-500'
    }
  ]

  const dataFlow = [
    {
      step: 1,
      title: 'User Authentication',
      description: 'User logs into Keycloak and receives a JWT token containing role and permissions',
      components: ['Frontend', 'Keycloak'],
      color: 'bg-red-500'
    },
    {
      step: 2,
      title: 'Request Initiation',
      description: 'User submits a query (natural language or structured) with JWT token',
      components: ['Frontend', 'Agent'],
      color: 'bg-blue-500'
    },
    {
      step: 3,
      title: 'Token Validation',
      description: 'Agent validates JWT token and processes the request',
      components: ['Agent'],
      color: 'bg-cyan-500'
    },
    {
      step: 4,
      title: 'Policy Consultation',
      description: 'Middleware consults OPA with user context and requested action',
      components: ['Middleware', 'OPA'],
      color: 'bg-green-500'
    },
    {
      step: 5,
      title: 'Authorization Decision',
      description: 'OPA evaluates Rego policies and returns allow/deny decision',
      components: ['OPA'],
      color: 'bg-purple-500'
    },
    {
      step: 6,
      title: 'Database Access',
      description: 'If authorized, middleware executes query on appropriate database',
      components: ['Middleware', 'Database'],
      color: 'bg-orange-500'
    },
    {
      step: 7,
      title: 'Audit Logging',
      description: 'All decisions and actions are logged for audit and compliance',
      components: ['Logger'],
      color: 'bg-teal-500'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="text-center py-12">
        <div className="text-6xl mb-6">🏗️</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">System Architecture</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore the comprehensive zero trust architecture with microservices, 
          policy enforcement, and multi-database access control.
        </p>
      </section>

      {/* Architecture Diagram */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Component Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((component, index) => (
            <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div className={`w-full h-2 rounded-full bg-gradient-to-r ${component.color} mb-4`}></div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{component.name}</h3>
                <span className="text-sm bg-gray-500/20 px-2 py-1 rounded">:{component.port}</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm">{component.description}</p>
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Technology</span>
                <p className="text-sm font-medium text-gray-700">{component.tech}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Key Responsibilities</span>
                <ul className="space-y-1">
                  {component.responsibilities.map((resp, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Flow */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Request Flow</h2>
        <div className="space-y-6">
          {dataFlow.map((flow, index) => (
            <div key={index} className="flex items-start space-x-6 p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
              <div className={`w-12 h-12 ${flow.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {flow.step}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{flow.title}</h3>
                <p className="text-gray-600 mb-3">{flow.description}</p>
                <div className="flex flex-wrap gap-2">
                  {flow.components.map((comp, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-500/20 text-gray-700 rounded-full text-sm">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 backdrop-blur bg-white/10 rounded-3xl border border-white/20">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Zero Trust Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              principle: 'Never Trust, Always Verify',
              description: 'Every request is authenticated and authorized, regardless of source',
              icon: '🔍',
              examples: ['JWT validation on every request', 'Multi-layer authorization checks', 'Continuous verification']
            },
            {
              principle: 'Least Privilege Access',
              description: 'Users get minimum permissions needed for their role',
              icon: '🔒',
              examples: ['Role-based database access', 'Resource-level permissions', 'Context-aware policies']
            },
            {
              principle: 'Assume Breach',
              description: 'System designed to limit damage if compromised',
              icon: '🛡️',
              examples: ['Database isolation', 'Audit logging', 'Policy enforcement at every layer']
            },
            {
              principle: 'Verify Explicitly',
              description: 'All available data points used for authorization',
              icon: '📊',
              examples: ['User role verification', 'Resource access patterns', 'Request context analysis']
            }
          ].map((item, index) => (
            <div key={index} className="p-6 bg-white/30 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="text-xl font-semibold text-gray-800">{item.principle}</h3>
              </div>
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

      {/* Technical Stack */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'React', category: 'Frontend', icon: '⚛️', color: 'bg-blue-500' },
            { name: 'FastAPI', category: 'Backend', icon: '🚀', color: 'bg-green-500' },
            { name: 'Keycloak', category: 'Auth', icon: '🔐', color: 'bg-red-500' },
            { name: 'PostgreSQL', category: 'Database', icon: '🐘', color: 'bg-blue-600' },
            { name: 'OPA', category: 'Policy', icon: '⚖️', color: 'bg-purple-500' },
            { name: 'Docker', category: 'Container', icon: '🐳', color: 'bg-cyan-500' },
            { name: 'Rego', category: 'Policy Lang', icon: '📜', color: 'bg-orange-500' },
            { name: 'JWT', category: 'Security', icon: '🎫', color: 'bg-indigo-500' }
          ].map((tech, index) => (
            <div key={index} className="text-center p-4 backdrop-blur bg-white/20 rounded-xl border border-white/30">
              <div className={`w-12 h-12 ${tech.color} rounded-xl flex items-center justify-center text-white text-xl mx-auto mb-3`}>
                {tech.icon}
              </div>
              <h3 className="font-semibold text-gray-800">{tech.name}</h3>
              <p className="text-sm text-gray-600">{tech.category}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}