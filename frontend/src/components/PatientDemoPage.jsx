import { useState, useEffect } from 'react'
import useFlowStore from '../state/useFlowStore'
import { generateNarrative } from '../utils/narrativeGenerator'
import MarkdownRenderer from './MarkdownRenderer'
import FlowDiagram from './FlowDiagram'

// Helper function to format JSON responses
const formatResponse = (response) => {
  try {
    const parsed = JSON.parse(response)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return response
  }
}

// Helper function to detect response type
const getResponseType = (response) => {
  if (response.startsWith('Error:')) return 'error'
  if (response.startsWith('Connection Error:')) return 'connection-error'
  try {
    JSON.parse(response)
    return 'json'
  } catch {
    return 'text'
  }
}

// Component for rendering different response types with narrative generation
const ResponseDisplay = ({ response, loading }) => {
  const [narrative, setNarrative] = useState('')
  const [showRaw, setShowRaw] = useState(false)
  const [generatingNarrative, setGeneratingNarrative] = useState(false)

  // Generate narrative when response changes
  useEffect(() => {
    if (response && getResponseType(response) === 'json') {
      setGeneratingNarrative(true)
      setNarrative('')
      generateNarrative(response, 'patient data access')
        .then(setNarrative)
        .catch(() => setNarrative(''))
        .finally(() => setGeneratingNarrative(false))
    } else {
      setNarrative('')
    }
  }, [response])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Retrieving your health data...</span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">🏥</div>
        <p>Select a scenario to see your patient data access</p>
      </div>
    )
  }

  const responseType = getResponseType(response)
  
  if (responseType === 'error' || responseType === 'connection-error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-red-500 text-xl mr-3 mt-1">⚠</div>
          <div>
            <h3 className="text-red-800 font-semibold mb-2">
              {responseType === 'connection-error' ? 'Connection Error' : 'Access Error'}
            </h3>
            <p className="text-red-700 font-mono text-sm">{response}</p>
          </div>
        </div>
      </div>
    )
  }

  if (responseType === 'json') {
    try {
      const parsed = JSON.parse(response)
      
      return (
        <div className="space-y-4">
          {/* Human-readable narrative */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-500 text-xl mr-3 mt-1">🏥</div>
              <div className="flex-1">
                <h3 className="text-blue-800 font-semibold mb-3">Your Health Data Summary</h3>
                {generatingNarrative ? (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm">Generating personalized summary...</span>
                  </div>
                ) : narrative ? (
                  <MarkdownRenderer 
                    content={narrative} 
                    className="text-blue-900"
                  />
                ) : (
                  <div className="text-blue-700 text-sm italic">
                    Your health data details are available below
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical details section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800">Detailed Records</h4>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showRaw ? 'Hide Raw Data' : 'Show Raw Data'}
              </button>
            </div>
            
            {showRaw && (
              <div className="px-4 py-3 border-b border-gray-200">
                <pre className="text-xs text-gray-600 overflow-auto bg-white p-3 rounded border max-h-64">
                  {formatResponse(response)}
                </pre>
              </div>
            )}

            {/* Special handling for database query results */}
            {parsed.data && Array.isArray(parsed.data) && (
              <div className="px-4 py-3">
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Records found:</span> {parsed.data.length}
                  {parsed.query && <span className="ml-4 italic">Query: "{parsed.query}"</span>}
                </div>
                
                {parsed.data.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                      <h4 className="font-semibold text-blue-800">Your Personal Health Data</h4>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-50 sticky top-0">
                          <tr>
                            {Object.keys(parsed.data[0]).map((key) => (
                              <th key={key} className="px-4 py-2 text-left font-medium text-blue-700 border-b">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.data.map((row, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 border-b border-gray-100">
                                  {value !== null ? String(value) : <span className="text-gray-400 italic">null</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Special handling for authorization responses */}
            {parsed.authorized !== undefined && (
              <div className="px-4 py-3">
                <div className={`p-3 rounded border ${
                  parsed.authorized 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="font-medium mb-1">
                    {parsed.authorized ? 'Access Granted' : 'Access Denied'}
                  </div>
                  {parsed.resource && <div className="text-sm">Resource: {parsed.resource}</div>}
                  {parsed.action && <div className="text-sm">Action: {parsed.action}</div>}
                  {parsed.database && <div className="text-sm">Database: {parsed.database}</div>}
                  {parsed.reason && <div className="text-sm mt-2 italic">Reason: {parsed.reason}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    } catch (error) {
      // Fallback to text display if JSON parsing fails
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="text-gray-500 text-xl mr-3">📄</div>
            <h3 className="text-gray-800 font-semibold">Response</h3>
          </div>
          <div className="text-sm text-gray-700 bg-white p-3 rounded border font-mono whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )
    }
  }

  // Plain text response
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <div className="text-gray-500 text-xl mr-3">📄</div>
        <h3 className="text-gray-800 font-semibold">System Message</h3>
      </div>
      <div className="text-sm text-gray-700 bg-white p-3 rounded border font-mono whitespace-pre-wrap">
        {response}
      </div>
    </div>
  )
}

export default function PatientDemoPage() {
  const { token, profile } = useFlowStore()
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const userRole = profile?.role || profile?.realm_access?.roles?.[0] || 'unknown'
  const username = profile?.preferred_username || 'unknown_user'

  // Role-based scenarios for patient data access
  const scenarios = {
    therapist: [
      {
        title: 'My Assigned Patients',
        description: 'View patients assigned to your care',
        query: `Show me patients assigned to ${username}`,
        db: 'us_db',
        expectation: 'ALLOWED',
        icon: '👥'
      },
      {
        title: 'My Session Notes',
        description: 'Access your therapy session documentation',
        query: `Show me therapy notes for therapist ${username}`,
        db: 'us_db',
        expectation: 'ALLOWED',
        icon: '📝'
      },
      {
        title: 'All Patient Records',
        description: 'Attempt to access all patient data (should be denied)',
        query: 'Show me all patients in the system',
        db: 'us_db',
        expectation: 'DENIED',
        icon: '🚫'
      }
    ],
    admin: [
      {
        title: 'All US Patients',
        description: 'Administrative access to US patient database',
        query: 'Show me all patients in the US database',
        db: 'us_db',
        expectation: 'ALLOWED',
        icon: '🏥'
      },
      {
        title: 'System Statistics',
        description: 'View system-wide patient and session metrics',
        query: 'Show me total patient count and session statistics',
        db: 'us_db',
        expectation: 'ALLOWED',
        icon: '📊'
      },
      {
        title: 'Cross-Region Access',
        description: 'Try to access EU patient data (may be restricted)',
        query: 'Show me patients in the EU database',
        db: 'eu_db',
        expectation: 'CONDITIONAL',
        icon: '🌍'
      }
    ],
    analyst: [
      {
        title: 'Research Data',
        description: 'Access de-identified research datasets',
        query: 'Show me research data and treatment outcomes',
        db: 'sandbox_db',
        expectation: 'ALLOWED',
        icon: '🔬'
      },
      {
        title: 'Analytics Metrics',
        description: 'View aggregated treatment effectiveness data',
        query: 'Show me treatment outcome statistics and trends',
        db: 'us_db',
        expectation: 'ALLOWED',
        icon: '📈'
      },
      {
        title: 'Identifiable Data',
        description: 'Attempt to access patient identifiable information (should be denied)',
        query: 'Show me patient names and contact information',
        db: 'us_db',
        expectation: 'DENIED',
        icon: '🚫'
      }
    ],
    support: [
      {
        title: 'Support Contacts',
        description: 'Access patient contact information for support',
        query: 'Show me patient contact information for support cases',
        db: 'us_db',
        expectation: 'ALLOWED',
        icon: '📞'
      },
      {
        title: 'Active Cases',
        description: 'View patients requiring support assistance',
        query: 'Show me patients with active support cases',
        db: 'us_db',
        expectation: 'ALLOWED',
        icon: '🎧'
      },
      {
        title: 'Medical Records',
        description: 'Attempt to access medical records (should be denied)',
        query: 'Show me patient diagnoses and treatment plans',
        db: 'us_db',
        expectation: 'DENIED',
        icon: '🚫'
      }
    ],
    superuser: [
      {
        title: 'Full US Access',
        description: 'Unrestricted access to US patient database',
        query: 'Show me all patients and records in US database',
        db: 'us_db',
        expectation: 'ALLOWED',
        icon: '🔓'
      },
      {
        title: 'Cross-Region Data',
        description: 'Access patient data across all regions',
        query: 'Show me patients from EU database',
        db: 'eu_db',
        expectation: 'ALLOWED',
        icon: '🌐'
      },
      {
        title: 'Complete System View',
        description: 'Full administrative access to all data',
        query: 'Show me complete system overview with all patient data',
        db: 'sandbox_db',
        expectation: 'ALLOWED',
        icon: '👑'
      }
    ]
  }

  const userScenarios = scenarios[userRole] || scenarios.support

  const executeScenario = async (scenario) => {
    if (!token) {
      setResponse('Error: No authentication token available')
      return
    }

    const { startFlow, progressFlow, failFlow, completeFlow } = useFlowStore.getState()
    
    setLoading(true)
    setResponse('')
    
    // Start the flow visualization
    startFlow()

    try {
      // Simulate agent processing
      await new Promise(resolve => setTimeout(resolve, 500))
      progressFlow('agent', 'middleware')
      
      const payload = {
        natural_language: scenario.query,
        db: scenario.db || 'us_db',
        resource: 'patients',
        action: 'read'
      }

      // Simulate middleware processing
      await new Promise(resolve => setTimeout(resolve, 500))
      progressFlow('middleware', 'opa')
      
      // Simulate OPA processing
      await new Promise(resolve => setTimeout(resolve, 300))

      const response = await fetch('http://localhost:8001/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        // OPA allowed, now database processing
        progressFlow('opa', 'db')
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const result = await response.json()
        completeFlow(result)
        setResponse(JSON.stringify(result))
      } else {
        // Determine where the failure occurred based on status code
        if (response.status === 401) {
          failFlow('agent', 'Authentication failed')
        } else if (response.status === 403) {
          failFlow('opa', 'Access denied by policy')
        } else if (response.status >= 500) {
          failFlow('db', 'Database error')
        } else {
          failFlow('middleware', 'Request processing failed')
        }
        
        const error = await response.text()
        setResponse(`Error: ${error}`)
      }
    } catch (error) {
      failFlow('agent', `Connection Error: ${error.message}`)
      setResponse(`Connection Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-8">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Patient Portal</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Secure access to your personal health information with zero-trust authentication.
          </p>
        </section>

        <div className="text-center py-16">
          <div className="text-6xl mb-6 text-gray-400">🔒</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Authentication Required
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Your health data is protected by zero-trust security. Please log in to access your personal information.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-800 mb-2">Privacy Protection</h3>
            <p className="text-blue-700 text-sm">
              All patient data access is logged, monitored, and subject to strict authorization policies. 
              Only authorized personnel can access relevant health information.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Patient Portal</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Secure access to health data with role-based permissions and comprehensive audit logging.
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
          <span className="text-blue-800 font-medium">Logged in as: </span>
          <span className="text-blue-600 capitalize">{userRole}</span>
          <span className="text-blue-600 ml-2">({username})</span>
        </div>
      </section>

      {/* Role-Specific Scenarios */}
      <section className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Data Access Scenarios for <span className="capitalize text-blue-600">{userRole}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userScenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => executeScenario(scenario)}
              disabled={loading}
              className={`p-4 rounded-xl text-left transition-all duration-200 disabled:opacity-50 ${
                scenario.expectation === 'DENIED' 
                  ? 'bg-red-50/80 border-2 border-red-200 hover:bg-red-100/80' 
                  : scenario.expectation === 'CONDITIONAL'
                  ? 'bg-yellow-50/80 border-2 border-yellow-200 hover:bg-yellow-100/80'
                  : 'bg-green-50/80 border-2 border-green-200 hover:bg-green-100/80'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{scenario.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 mb-1">{scenario.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{scenario.description}</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      scenario.expectation === 'DENIED' 
                        ? 'bg-red-100 text-red-700' 
                        : scenario.expectation === 'CONDITIONAL'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {scenario.expectation}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    "{scenario.query}"
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Flow Visualization and Response Display */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <FlowDiagram />
        <section className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Health Data</h2>
          <ResponseDisplay response={response} loading={loading} />
        </section>
      </div>

      {/* Privacy & Security Info */}
      <section className="py-12 backdrop-blur bg-white/10 rounded-3xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Privacy & Security</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white/30 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Zero Trust Security</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                Every data access requires authentication
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                Role-based access control (RBAC)
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                Real-time authorization decisions
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                Comprehensive audit logging
              </li>
            </ul>
          </div>
          
          <div className="p-6 bg-white/30 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Protection</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                HIPAA compliant data handling
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                Encrypted data transmission
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                Minimal data exposure principle
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                Regular security assessments
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}