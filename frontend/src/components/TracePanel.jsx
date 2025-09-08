import { useState } from 'react'
import useFlowStore from '../state/useFlowStore'

export default function TracePanel() {
  const { profile, trace, result } = useFlowStore()
  const [activeTab, setActiveTab] = useState('result')

  if (!trace && !result) {
    return (
      <div className="backdrop-blur bg-white/20 rounded-2xl shadow-xl border border-white/30 p-8 text-center">
        <div className="text-gray-500">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="text-lg">No trace data yet</p>
          <p className="text-sm">Execute an action to see the authorization flow</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'result', label: '📊 Result', icon: '📊' },
    { id: 'claims', label: '🎫 JWT Claims', icon: '🎫' },
    { id: 'trace', label: '🔍 Trace', icon: '🔍' },
  ]

  const formatResult = () => {
    if (!result) return 'No result'
    
    if (result.error) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <span className="text-2xl">🚫</span>
            <span className="font-bold text-lg">Access Denied</span>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-red-500 text-xl mt-1">⚠</span>
              <div>
                <h3 className="text-red-800 font-semibold mb-2">Authorization Failed</h3>
                <p className="text-red-700 mb-2">{result.error}</p>
                {result.status && (
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600 text-sm">HTTP Status:</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">
                      {result.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <details className="bg-gray-50 border border-gray-200 rounded-lg">
            <summary className="px-4 py-2 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 rounded-t-lg">
              🔍 Raw Error Response
            </summary>
            <div className="px-4 py-2 border-t border-gray-200">
              <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )
    }

    if (result.rows) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-600">
            <span className="text-2xl">✅</span>
            <span className="font-bold text-lg">Query Successful</span>
          </div>
          
          {/* Query Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-800 font-semibold">Query Summary</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {result.rows.length} records
              </span>
            </div>
            {result.sql && (
              <div className="mt-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="text-blue-700 font-medium text-sm">AI-Generated SQL</span>
                </div>
                <code className="text-blue-800 text-sm bg-blue-100 px-3 py-2 rounded block font-mono">
                  {result.sql}
                </code>
              </div>
            )}
          </div>
          
          {/* Data Results */}
          {result.rows.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold mb-3">Data Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-green-300">
                      {Object.keys(result.rows[0]).map(key => (
                        <th key={key} className="text-left py-2 px-3 font-semibold text-green-800 bg-green-100">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className={`border-b border-green-200 ${i % 2 === 0 ? 'bg-white' : 'bg-green-50/50'}`}>
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="py-2 px-3 text-green-700">
                            {value !== null ? String(value) : <span className="text-gray-400 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.rows.length > 10 && (
                  <div className="mt-3 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      ... and {result.rows.length - 10} more records
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <details className="bg-gray-50 border border-gray-200 rounded-lg">
            <summary className="px-4 py-2 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 rounded-t-lg">
              📋 Raw JSON Response
            </summary>
            <div className="px-4 py-2 border-t border-gray-200">
              <pre className="text-xs text-gray-600 overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-blue-600">
          <span className="text-2xl">📄</span>
          <span className="font-bold text-lg">System Response</span>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-3">Response Data</h3>
          <pre className="text-blue-700 text-sm overflow-auto bg-blue-100 p-3 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  const formatClaims = () => {
    if (!profile) return 'No JWT claims available'
    
    const importantClaims = {
      'Username': profile.preferred_username || profile.sub,
      'Role': profile.role || profile.realm_access?.roles?.[0] || 'Unknown',
      'Region': profile.region || 'Not specified',
      'Assigned Patients': profile.assigned_patients || 'None',
      'Issued At': profile.iat ? new Date(profile.iat * 1000).toLocaleString() : 'Unknown',
      'Expires At': profile.exp ? new Date(profile.exp * 1000).toLocaleString() : 'Unknown'
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(importantClaims).map(([key, value]) => (
            <div key={key} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-blue-800 font-medium text-sm">{key}</div>
              <div className="text-blue-700 text-sm mt-1">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </div>
            </div>
          ))}
        </div>
        <details className="mt-4">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
            View Full JWT Payload
          </summary>
          <pre className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-auto max-h-40">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  const formatTrace = () => {
    if (!trace) return 'No trace information available'
    
    const steps = [
      { name: 'Agent', status: trace.agent, description: 'JWT verification and request processing' },
      { name: 'Middleware', status: trace.middleware, description: 'Policy enforcement and routing' },
      { name: 'OPA', status: trace.opa, description: 'Authorization decision' },
      { name: 'Database', status: trace.db, description: 'Query execution' }
    ]

    return (
      <div className="space-y-3">
        {steps.map((step, index) => {
          const getStepStyle = () => {
            switch (step.status) {
              case 'success':
              case 'allowed':
                return 'bg-green-50 border-green-200 text-green-700'
              case 'error':
              case 'denied':
                return 'bg-red-50 border-red-200 text-red-700'
              case 'processing':
                return 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse'
              default:
                return 'bg-gray-50 border-gray-200 text-gray-700'
            }
          }

          const getStepIcon = () => {
            switch (step.status) {
              case 'success':
              case 'allowed':
                return '✅'
              case 'error':
              case 'denied':
                return '❌'
              case 'processing':
                return '⏳'
              default:
                return '⚪'
            }
          }

          return (
            <div key={step.name} className={`border rounded-lg p-3 ${getStepStyle()}`}>
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getStepIcon()}</span>
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-sm opacity-80">{step.description}</div>
                </div>
                <div className="text-sm font-medium capitalize">
                  {step.status || 'idle'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="backdrop-blur bg-white/20 rounded-2xl shadow-xl border border-white/30">
      <div className="border-b border-white/20">
        <div className="flex space-x-1 p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
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
      </div>
      
      <div className="p-6">
        {activeTab === 'result' && formatResult()}
        {activeTab === 'claims' && formatClaims()}
        {activeTab === 'trace' && formatTrace()}
      </div>
    </div>
  )
}
