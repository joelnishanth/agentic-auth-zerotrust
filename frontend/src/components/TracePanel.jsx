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
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-red-600">
            <span className="text-xl">❌</span>
            <span className="font-semibold">Access Denied</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 font-medium">Error: {result.error}</p>
            {result.status && (
              <p className="text-red-600 text-sm mt-1">Status Code: {result.status}</p>
            )}
          </div>
        </div>
      )
    }

    if (result.rows) {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-green-600">
            <span className="text-xl">✅</span>
            <span className="font-semibold">Query Successful</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 font-medium">
              Found {result.rows.length} record(s)
            </p>
            {result.rows.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-200">
                      {Object.keys(result.rows[0]).map(key => (
                        <th key={key} className="text-left py-1 px-2 font-medium text-green-800">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-green-100">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="py-1 px-2 text-green-700">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.rows.length > 5 && (
                  <p className="text-green-600 text-xs mt-2">
                    ... and {result.rows.length - 5} more records
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <pre className="text-blue-700 text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
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
