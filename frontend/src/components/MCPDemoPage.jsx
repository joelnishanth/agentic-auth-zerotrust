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
      generateNarrative(response, 'MCP tool execution')
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
        <span className="ml-3 text-gray-600">Executing MCP tool...</span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">MCP</div>
        <p>Select a tool and execute to see the response</p>
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
              {responseType === 'connection-error' ? 'Connection Error' : 'Execution Error'}
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
              <div className="text-blue-500 text-xl mr-3 mt-1">📖</div>
              <div className="flex-1">
                <h3 className="text-blue-800 font-semibold mb-3">Summary</h3>
                {generatingNarrative ? (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm">Generating human-readable summary...</span>
                  </div>
                ) : narrative ? (
                  <MarkdownRenderer 
                    content={narrative} 
                    className="text-blue-900"
                  />
                ) : (
                  <div className="text-blue-700 text-sm italic">
                    Basic data summary available below
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical details section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800">Technical Details</h4>
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
                    <div className="max-h-64 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {Object.keys(parsed.data[0]).map((key) => (
                              <th key={key} className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.data.map((row, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
    }
  }

  // Plain text response
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <div className="text-gray-500 text-xl mr-3">📄</div>
        <h3 className="text-gray-800 font-semibold">Text Response</h3>
      </div>
      <div className="text-sm text-gray-700 bg-white p-3 rounded border font-mono whitespace-pre-wrap">
        {response}
      </div>
    </div>
  )
}

// Helper function to get sample queries based on user role
const getSampleQueries = (role, username) => {
  const queries = {
    therapist: [
      {
        query: `Show me patients assigned to ${username}`,
        description: 'View your assigned patients',
        expectation: 'ALLOWED',
        db: 'us_db'
      },
      {
        query: `How many therapy notes do I have for my patients?`,
        description: 'Count your session documentation',
        expectation: 'ALLOWED',
        db: 'us_db'
      },
      {
        query: 'Show me all patients in the system',
        description: 'Try to access all patient data (should be denied)',
        expectation: 'DENIED',
        db: 'us_db'
      }
    ],
    admin: [
      {
        query: 'Show me all patients in the US database',
        description: 'Full administrative access to US data',
        expectation: 'ALLOWED',
        db: 'us_db'
      },
      {
        query: 'How many total therapy sessions are recorded?',
        description: 'System-wide statistics',
        expectation: 'ALLOWED',
        db: 'us_db'
      },
      {
        query: 'Show me research data in sandbox',
        description: 'Try to access research database (may be restricted)',
        expectation: 'CONDITIONAL',
        db: 'sandbox_db'
      }
    ],
    analyst: [
      {
        query: 'What is the average treatment outcome score?',
        description: 'Research analytics on treatment effectiveness',
        expectation: 'ALLOWED',
        db: 'sandbox_db'
      },
      {
        query: 'Show me research metrics and statistics',
        description: 'Access de-identified research data',
        expectation: 'ALLOWED',
        db: 'sandbox_db'
      },
      {
        query: 'Show me patient names and contact information',
        description: 'Try to access identifiable patient data (should be denied)',
        expectation: 'DENIED',
        db: 'us_db'
      }
    ],
    support: [
      {
        query: 'Show me patient contact information for support',
        description: 'Access customer support data',
        expectation: 'ALLOWED',
        db: 'us_db'
      },
      {
        query: 'How many active patients need support?',
        description: 'Support workload metrics',
        expectation: 'ALLOWED',
        db: 'us_db'
      },
      {
        query: 'Show me therapy session notes and diagnoses',
        description: 'Try to access medical records (should be denied)',
        expectation: 'DENIED',
        db: 'us_db'
      }
    ],
    superuser: [
      {
        query: 'Show me all patients across US database',
        description: 'Unrestricted access to US production data',
        expectation: 'ALLOWED',
        db: 'us_db'
      },
      {
        query: 'Show me all patients in EU database',
        description: 'Cross-region administrative access',
        expectation: 'ALLOWED',
        db: 'eu_db'
      },
      {
        query: 'Show me complete research database overview',
        description: 'Full access to research and analytics',
        expectation: 'ALLOWED',
        db: 'sandbox_db'
      }
    ]
  }
  
  return queries[role] || queries.support
}

export default function MCPDemoPage() {
  const { token, profile } = useFlowStore()
  const [mcpResponse, setMcpResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTool, setSelectedTool] = useState('query_database')

  const userRole = profile?.role || profile?.realm_access?.roles?.[0] || 'unknown'
  const username = profile?.preferred_username || 'unknown_user'
  const sampleQueries = getSampleQueries(userRole, username)

  const mcpTools = [
    {
      name: 'query_database',
      label: 'Query Database',
      description: 'Execute natural language database queries',
      params: {
        query: 'Show me all patients',
        database: 'us_db',
        resource: 'patients',
        action: 'read'
      }
    },
    {
      name: 'check_authorization',
      label: 'Check Authorization',
      description: 'Verify user permissions for specific actions',
      params: {
        resource: 'patients',
        database: 'us_db',
        action: 'read'
      }
    },
    {
      name: 'get_user_info',
      label: 'Get User Info',
      description: 'Extract information from JWT token',
      params: {}
    },
    {
      name: 'list_databases',
      label: 'List Databases',
      description: 'Show available databases and access requirements',
      params: {}
    }
  ]

  const callMCPTool = async (toolName, params) => {
    if (!token) {
      const { failFlow } = useFlowStore.getState()
      failFlow('agent', 'No authentication token available')
      setMcpResponse('Error: No authentication token available')
      return
    }

    setLoading(true)
    setMcpResponse('')

    try {
      // Simulate MCP tool call to our MCP server
      const mcpPayload = {
        tool: toolName,
        parameters: {
          token: token,
          ...params
        }
      }

      // For demo purposes, we'll call our MCP server endpoint
      // In a real MCP setup, this would go through the MCP protocol
      const response = await fetch('http://localhost:5001/mcp-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mcpPayload)
      })

      if (response.ok) {
        const result = await response.text()
        setMcpResponse(result)
      } else {
        const { failFlow } = useFlowStore.getState()
        const error = await response.text()
        
        // Determine failure point based on response
        if (response.status === 401) {
          failFlow('agent', 'Authentication failed')
        } else if (response.status === 403) {
          failFlow('opa', 'Access denied by policy')
        } else if (response.status >= 500) {
          failFlow('db', 'MCP server error')
        } else {
          failFlow('middleware', 'MCP request processing failed')
        }
        
        setMcpResponse(`Error: ${error}`)
      }
    } catch (error) {
      const { failFlow } = useFlowStore.getState()
      failFlow('agent', `Connection Error: ${error.message}`)
      setMcpResponse(`Connection Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const executeQuery = async (queryObj) => {
    const { startFlow, progressFlow, failFlow, completeFlow } = useFlowStore.getState()
    
    // Start the flow visualization
    startFlow()
    
    try {
      // Simulate agent processing
      await new Promise(resolve => setTimeout(resolve, 500))
      progressFlow('agent', 'middleware')
      
      // Simulate middleware processing
      await new Promise(resolve => setTimeout(resolve, 500))
      progressFlow('middleware', 'opa')
      
      // Simulate OPA processing
      await new Promise(resolve => setTimeout(resolve, 300))
      progressFlow('opa', 'db')
      
      const params = {
        query: queryObj.query,
        database: queryObj.db,
        resource: 'patients',
        action: 'read'
      }
      
      await callMCPTool('query_database', params)
      
      // If we get here, the call was successful
      completeFlow({ success: true, tool: 'query_database' })
    } catch (error) {
      failFlow('db', `MCP Tool Error: ${error.message}`)
    }
  }

  if (!token) {
    return (
      <div className="space-y-8">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">MCP Demo</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the Model Context Protocol integration with zero-trust authentication.
          </p>
        </section>

        <div className="text-center py-16">
          <div className="text-6xl mb-6 text-gray-400">AUTH</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Authentication Required
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            The MCP server requires valid authentication. Please log in to access MCP tools.
          </p>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
            <h3 className="font-semibold text-red-800 mb-2">Zero Trust Security</h3>
            <p className="text-red-700 text-sm">
              MCP tools are protected by the same zero-trust policies as the main application. 
              No queries can be executed without proper authentication and authorization.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">MCP Demo</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Model Context Protocol integration with AI-powered database access and zero-trust security.
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
          <span className="text-blue-800 font-medium">Logged in as: </span>
          <span className="text-blue-600 capitalize">{userRole}</span>
        </div>
      </section>

      {/* MCP Tools Interface */}
      <section className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">MCP Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {mcpTools.map((tool, index) => (
            <button
              key={index}
              onClick={() => setSelectedTool(tool.name)}
              className={`p-4 rounded-xl text-left transition-all duration-200 ${
                selectedTool === tool.name
                  ? 'bg-blue-500/30 border-2 border-blue-400'
                  : 'bg-white/20 border border-white/30 hover:bg-white/30'
              }`}
            >
              <h3 className="font-semibold text-gray-800 mb-2">{tool.label}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              const tool = mcpTools.find(t => t.name === selectedTool)
              callMCPTool(selectedTool, tool.params)
            }}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Executing...' : `Execute ${mcpTools.find(t => t.name === selectedTool)?.label}`}
          </button>
        </div>
      </section>

      {/* Role-Specific Query Suggestions */}
      <section className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          MCP Scenarios for <span className="capitalize text-blue-600">{userRole}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleQueries.map((queryObj, index) => (
            <button
              key={index}
              onClick={() => executeQuery(queryObj)}
              disabled={loading}
              className={`p-4 rounded-xl text-left transition-all duration-200 disabled:opacity-50 ${
                queryObj.expectation === 'DENIED' 
                  ? 'bg-red-50/80 border-2 border-red-200 hover:bg-red-100/80' 
                  : queryObj.expectation === 'CONDITIONAL'
                  ? 'bg-yellow-50/80 border-2 border-yellow-200 hover:bg-yellow-100/80'
                  : 'bg-green-50/80 border-2 border-green-200 hover:bg-green-100/80'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  queryObj.expectation === 'DENIED' 
                    ? 'bg-red-500 text-white' 
                    : queryObj.expectation === 'CONDITIONAL'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-green-500 text-white'
                }`}>
                  {queryObj.expectation === 'DENIED' ? '✗' : queryObj.expectation === 'CONDITIONAL' ? '?' : '✓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 mb-1">Scenario {index + 1}</div>
                  <div className="text-sm text-gray-600 mb-2">{queryObj.description}</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      queryObj.expectation === 'DENIED' 
                        ? 'bg-red-100 text-red-700' 
                        : queryObj.expectation === 'CONDITIONAL'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {queryObj.expectation}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {queryObj.db}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    "{queryObj.query}"
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Flow Visualization and MCP Response Display */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <FlowDiagram />
        <section className="p-6 backdrop-blur bg-white/20 rounded-2xl border border-white/30">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">MCP Response</h2>
          <ResponseDisplay response={mcpResponse} loading={loading} />
        </section>
      </div>

      {/* MCP Architecture Info */}
      <section className="py-12 backdrop-blur bg-white/10 rounded-3xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">MCP Integration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white/30 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Model Context Protocol</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                Structured interface for AI assistants
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                Tool-based interaction model
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                Secure parameter passing
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                Rich response formatting
              </li>
            </ul>
          </div>
          
          <div className="p-6 bg-white/30 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Zero Trust Integration</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                JWT token required for all tools
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                Same authorization policies as main app
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                Role-based access control
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                Comprehensive audit logging
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}