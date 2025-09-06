import LoginPanel from './LoginPanel'
import ActionPanel from './ActionPanel'
import FlowDiagram from './FlowDiagram'
import TracePanel from './TracePanel'
import useFlowStore from '../state/useFlowStore'

export default function DemoPage() {
  const { token } = useFlowStore()

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center py-12">
        <div className="text-6xl mb-6">🎮</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Interactive Demo</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the complete zero trust workflow with real authentication, 
          policy enforcement, and live visualization of authorization decisions.
        </p>
      </section>

      {/* Login Section */}
      <LoginPanel />
      
      {token ? (
        <>
          {/* Action Panel */}
          <ActionPanel />
          
          {/* Flow Visualization and Results */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <FlowDiagram />
            <TracePanel />
          </div>

          {/* Demo Instructions */}
          <section className="py-12 backdrop-blur bg-white/10 rounded-3xl border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Use the Demo</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow these steps to explore the zero trust architecture in action.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Try Role Actions',
                  description: 'Click the persona-specific action buttons to see what your role can access',
                  icon: '🎯'
                },
                {
                  step: '2', 
                  title: 'Natural Language',
                  description: 'Use the text input to ask questions in plain English and watch AI convert them to SQL',
                  icon: '🧠'
                },
                {
                  step: '3',
                  title: 'Watch the Flow',
                  description: 'Observe the live visualization as requests flow through the security layers',
                  icon: '👀'
                },
                {
                  step: '4',
                  title: 'Check Results',
                  description: 'Review the trace panel to see JWT claims, policy decisions, and query results',
                  icon: '📊'
                }
              ].map((instruction, index) => (
                <div key={index} className="text-center p-6 bg-white/20 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {instruction.step}
                  </div>
                  <div className="text-3xl mb-3">{instruction.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{instruction.title}</h3>
                  <p className="text-gray-600 text-sm">{instruction.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Test Scenarios */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Suggested Test Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Test Authorized Access',
                  description: 'Try actions that your role should be allowed to perform',
                  examples: [
                    'Therapist: "View my assigned patients"',
                    'Admin: "Show all patients in US database"',
                    'Analyst: "Count records in sandbox database"'
                  ],
                  color: 'from-green-500 to-emerald-500',
                  icon: '✅'
                },
                {
                  title: 'Test Access Denials',
                  description: 'Try the red "unauthorized" buttons to see policy enforcement',
                  examples: [
                    'Therapist trying to access admin functions',
                    'Analyst trying to access production data',
                    'Support trying to write patient data'
                  ],
                  color: 'from-red-500 to-pink-500',
                  icon: '❌'
                },
                {
                  title: 'Natural Language Queries',
                  description: 'Ask questions in plain English and watch AI convert to SQL',
                  examples: [
                    '"How many patients do we have?"',
                    '"Show me notes from last week"',
                    '"List all therapists in the system"'
                  ],
                  color: 'from-blue-500 to-cyan-500',
                  icon: '🤖'
                },
                {
                  title: 'Cross-Database Access',
                  description: 'Test access to different regional databases',
                  examples: [
                    'Admin accessing EU database from US role',
                    'Therapist trying sandbox database',
                    'Analyst working with de-identified data'
                  ],
                  color: 'from-purple-500 to-indigo-500',
                  icon: '🌍'
                }
              ].map((scenario, index) => (
                <div key={index} className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${scenario.color} flex items-center justify-center text-2xl text-white mb-4`}>
                    {scenario.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{scenario.title}</h3>
                  <p className="text-gray-600 mb-4">{scenario.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Examples:</h4>
                    <ul className="space-y-1">
                      {scenario.examples.map((example, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2 mt-0.5">•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-6 text-gray-400">🔐</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Authentication Required
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Please log in with one of the test accounts to start exploring the zero trust demo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { role: 'therapist', account: 'sarah_therapist', desc: 'Access assigned patients' },
              { role: 'admin', account: 'alice_admin_us', desc: 'Full administrative access' },
              { role: 'analyst', account: 'maya_analyst', desc: 'Sandbox data analysis' },
              { role: 'support', account: 'leo_support', desc: 'Customer support access' },
              { role: 'superuser', account: 'superdev', desc: 'Unrestricted access' }
            ].map((persona, i) => (
              <div key={i} className="p-4 backdrop-blur bg-white/20 rounded-xl border border-white/30">
                <h3 className="font-semibold text-gray-800 capitalize">{persona.role}</h3>
                <code className="text-sm text-blue-600">{persona.account}</code>
                <p className="text-sm text-gray-600 mt-1">{persona.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-6">
            All accounts use password: <code className="bg-gray-500/20 px-2 py-1 rounded">password</code>
          </p>
        </div>
      )}
    </div>
  )
}