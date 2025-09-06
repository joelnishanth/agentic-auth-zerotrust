import { Link } from 'react-router-dom'
import useFlowStore from '../state/useFlowStore'

export default function HomePage() {
  const { token, profile } = useFlowStore()
  const userRole = profile?.role || profile?.realm_access?.roles?.[0] || 'guest'
  const userName = profile?.preferred_username || profile?.name || 'User'

  // Debug log to check if component is rendering
  console.log('HomePage rendering...', { token, profile, userRole, userName })

  const features = [
    {
      icon: '🔐',
      title: 'Zero Trust Authentication',
      description: 'JWT-based authentication with Keycloak integration and role-based access control',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Queries',
      description: 'Natural language to SQL conversion using local LLM integration',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '⚖️',
      title: 'Policy Engine',
      description: 'Real-time authorization decisions using Open Policy Agent (OPA)',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🗄️',
      title: 'Multi-Database Access',
      description: 'Secure access to US, EU, and Sandbox databases with proper isolation',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '🔍',
      title: 'Live Monitoring',
      description: 'Real-time flow visualization and comprehensive audit trails',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '🛡️',
      title: 'Security First',
      description: 'Every request is validated, authorized, and logged for complete security',
      color: 'from-teal-500 to-blue-500'
    }
  ]

  const personas = [
    {
      role: 'therapist',
      name: 'Therapist',
      icon: '👩‍⚕️',
      description: 'Access assigned patients and manage treatment notes',
      permissions: ['View assigned patients', 'Add patient notes', 'US/EU database access'],
      testAccount: 'sarah_therapist',
      color: 'bg-green-500'
    },
    {
      role: 'admin',
      name: 'Administrator',
      icon: '👨‍💼',
      description: 'Full administrative access to manage all resources',
      permissions: ['Manage all patients', 'Cross-region access', 'System administration'],
      testAccount: 'alice_admin_us',
      color: 'bg-red-500'
    },
    {
      role: 'analyst',
      name: 'Data Analyst',
      icon: '📊',
      description: 'Analyze de-identified data for research purposes',
      permissions: ['Sandbox database access', 'Trend analysis', 'Research queries'],
      testAccount: 'maya_analyst',
      color: 'bg-blue-500'
    },
    {
      role: 'support',
      name: 'Support Staff',
      icon: '🆘',
      description: 'Limited access for customer support operations',
      permissions: ['View patient status', 'Basic information access', 'Support dashboard'],
      testAccount: 'leo_support',
      color: 'bg-yellow-500'
    },
    {
      role: 'superuser',
      name: 'Super User',
      icon: '🚀',
      description: 'Unrestricted access across all systems and databases',
      permissions: ['Full system access', 'All databases', 'Administrative privileges'],
      testAccount: 'superdev',
      color: 'bg-purple-500'
    }
  ]

  const quickActions = [
    {
      title: 'Interactive Demo',
      description: 'Try the full zero trust workflow with real authentication',
      icon: '🎮',
      link: '/demo',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Architecture Overview',
      description: 'Learn about the system components and data flow',
      icon: '🏗️',
      link: '/architecture',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'API Documentation',
      description: 'Explore the REST API endpoints and authentication',
      icon: '📚',
      link: '/docs',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Security Policies',
      description: 'View the OPA Rego policies and authorization rules',
      icon: '🔒',
      link: '/policies',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-8xl mb-8">🛡️</div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Zero Trust Architecture Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Experience real-time JWT-based access control with policy enforcement, 
            natural language queries, and live authorization flow visualization.
          </p>
          
          {token ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/30 rounded-full backdrop-blur">
                  <span className="text-green-500">●</span>
                  <span className="font-medium">Logged in as {userName}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize text-white ${
                    userRole === 'admin' ? 'bg-red-500' :
                    userRole === 'therapist' ? 'bg-green-500' :
                    userRole === 'analyst' ? 'bg-blue-500' :
                    userRole === 'support' ? 'bg-yellow-500' :
                    userRole === 'superuser' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}>
                    {userRole}
                  </span>
                </div>
              </div>
              <Link
                to="/demo"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <span className="mr-2">🚀</span>
                Continue to Demo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                to="/demo"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg mr-4"
              >
                <span className="mr-2">🔐</span>
                Start Demo
              </Link>
              <Link
                to="/architecture"
                className="inline-flex items-center px-8 py-4 bg-white/30 backdrop-blur text-gray-700 font-semibold rounded-xl hover:bg-white/50 transform hover:scale-105 transition-all duration-200 border border-white/30"
              >
                <span className="mr-2">🏗️</span>
                Learn More
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Key Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore the comprehensive security features that make this zero trust architecture robust and scalable.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personas Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Test Personas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Try different user roles to see how zero trust policies enforce access control based on identity and context.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona, index) => (
            <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 ${persona.color} rounded-xl flex items-center justify-center text-xl text-white`}>
                  {persona.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{persona.name}</h3>
                  <code className="text-sm text-gray-500">{persona.testAccount}</code>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{persona.description}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Permissions:</h4>
                <ul className="space-y-1">
                  {persona.permissions.map((permission, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-6 backdrop-blur bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Test Credentials</h3>
              <p className="text-blue-700 mb-2">All test accounts use the password: <code className="bg-blue-500/20 px-2 py-1 rounded">password</code></p>
              <p className="text-blue-600 text-sm">Try logging in with different personas to see how access controls change based on your role and permissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Explore the System</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dive deeper into different aspects of the zero trust architecture.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group p-8 backdrop-blur bg-white/20 rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{action.title}</h3>
              <p className="text-gray-600">{action.description}</p>
              <div className="mt-4 flex items-center text-blue-600 font-medium">
                <span>Explore</span>
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-16 backdrop-blur bg-white/10 rounded-3xl border border-white/20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Understanding the zero trust request flow from authentication to data access.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Authentication', desc: 'User logs in via Keycloak and receives JWT token', icon: '🔐' },
            { step: '2', title: 'Request Processing', desc: 'Agent validates JWT and processes natural language queries', icon: '🤖' },
            { step: '3', title: 'Policy Evaluation', desc: 'OPA evaluates request against Rego authorization policies', icon: '⚖️' },
            { step: '4', title: 'Data Access', desc: 'Middleware routes approved requests to appropriate database', icon: '🗄️' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {item.step}
              </div>
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}