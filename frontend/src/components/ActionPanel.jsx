import { useState } from 'react'
import axios from 'axios'
import useFlowStore from '../state/useFlowStore'

const getPersonaScenarios = (role, username) => {
  const baseScenarios = {
    therapist: [
      { 
        label: 'My Assigned Patients', 
        query: `Show me patients assigned to ${username.replace('_', '_')}`, 
        db: 'us_db',
        description: 'View patients specifically assigned to you',
        expectation: 'ALLOWED'
      },
      { 
        label: 'My Session Notes', 
        query: `Show me therapy notes for therapist ${username.replace('_', '_')}`, 
        db: 'us_db',
        description: 'Access your therapy session documentation',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Patient Status Overview', 
        query: 'Show me all active patients in the US database', 
        db: 'us_db',
        description: 'View current patient status (therapists have read access)',
        expectation: 'ALLOWED'
      },
      { 
        label: 'EU Region Access', 
        query: 'Show me patients in the EU database', 
        db: 'eu_db',
        description: 'Access EU patient data (therapists have cross-region access)',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Try Research Data', 
        query: 'Show me research data and analytics', 
        db: 'sandbox_db',
        description: 'Attempt to access research database (should be denied)',
        expectation: 'DENIED',
        isTest: true
      }
    ],
    admin: [
      { 
        label: 'US Patient Database', 
        query: 'Show me all patients in the US database', 
        db: 'us_db',
        description: 'Full administrative access to US patient data',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Patient Count & Statistics', 
        query: 'Show me total patient count and session statistics', 
        db: 'us_db',
        description: 'Administrative overview and system metrics',
        expectation: 'ALLOWED'
      },
      { 
        label: 'EU Database Access', 
        query: 'Show me patients in the EU database', 
        db: 'eu_db',
        description: 'Cross-region administrative access to EU data',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Research Database', 
        query: 'Show me complete system overview with all patient data', 
        db: 'sandbox_db',
        description: 'Admin access to research and analytics database',
        expectation: 'ALLOWED'
      },
      { 
        label: 'System-Wide Analytics', 
        query: 'How many patients across all databases and regions?', 
        db: 'us_db',
        description: 'Cross-database administrative reporting',
        expectation: 'ALLOWED'
      }
    ],
    analyst: [
      { 
        label: 'Research Data Overview', 
        query: 'Show me research data and treatment outcomes', 
        db: 'sandbox_db',
        description: 'Access anonymized research dataset',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Treatment Outcome Statistics', 
        query: 'Show me treatment outcome statistics and trends', 
        db: 'sandbox_db',
        description: 'Statistical analysis of treatment effectiveness',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Research Metrics', 
        query: 'Show me all research performance metrics', 
        db: 'sandbox_db',
        description: 'Comprehensive research analytics dashboard',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Diagnosis Patterns', 
        query: 'Show me patient distribution by diagnosis category', 
        db: 'sandbox_db',
        description: 'Analyze diagnosis patterns in research data',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Try Production Data', 
        query: 'Show me patient names and contact information', 
        db: 'us_db',
        description: 'Attempt to access identifiable patient data (should be denied)',
        expectation: 'DENIED',
        isTest: true
      },
      { 
        label: 'Try US Database', 
        query: 'Show me treatment outcome statistics and trends', 
        db: 'us_db',
        description: 'Attempt to access US production database (should be denied)',
        expectation: 'DENIED',
        isTest: true
      }
    ],
    support: [
      { 
        label: 'Patient Contact Information', 
        query: 'Show me patient contact information for support cases', 
        db: 'us_db',
        description: 'Access patient contact details for customer support',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Active Support Cases', 
        query: 'Show me patients with active support cases', 
        db: 'us_db',
        description: 'View current support case workload',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Patient Medical Records', 
        query: 'Show me patient diagnoses and treatment plans', 
        db: 'us_db',
        description: 'Access medical information for support purposes',
        expectation: 'ALLOWED'
      },
      { 
        label: 'EU Region Support', 
        query: 'Show me patient contact information in EU region', 
        db: 'eu_db',
        description: 'Support customers in EU region',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Try Research Data', 
        query: 'Show me research data and analytics', 
        db: 'sandbox_db',
        description: 'Attempt to access research database (should be denied)',
        expectation: 'DENIED',
        isTest: true
      }
    ],
    superuser: [
      { 
        label: 'US Database Full Access', 
        query: 'Show me all patients and records in US database', 
        db: 'us_db',
        description: 'Unrestricted superuser access to US production data',
        expectation: 'ALLOWED'
      },
      { 
        label: 'EU Database Full Access', 
        query: 'Show me patients from EU database', 
        db: 'eu_db',
        description: 'Unrestricted superuser access to EU production data',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Research Database Access', 
        query: 'Show me complete system overview with all patient data', 
        db: 'sandbox_db',
        description: 'Full superuser access to research and analytics data',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Cross-System Analytics', 
        query: 'How many total patients across all regions and databases?', 
        db: 'us_db',
        description: 'System-wide superuser analytics and reporting',
        expectation: 'ALLOWED'
      },
      { 
        label: 'Advanced System Query', 
        query: 'Show me comprehensive system health and patient statistics', 
        db: 'us_db',
        description: 'Advanced superuser system monitoring',
        expectation: 'ALLOWED'
      }
    ]
  }
  
  return baseScenarios[role] || []
}

export default function ActionPanel() {
  const { token, profile, setTrace, setResult, reset } = useFlowStore()
  const [question, setQuestion] = useState('')
  const [selectedDb, setSelectedDb] = useState('us_db')
  const [loading, setLoading] = useState(false)

  const userRole = profile?.role || profile?.realm_access?.roles?.[0] || 'unknown'
  const username = profile?.preferred_username || 'unknown_user'
  const scenarios = getPersonaScenarios(userRole, username)

  const runScenario = async (scenario) => {
    if (!token) return
    
    // Set the query and database in the form
    setQuestion(scenario.query)
    setSelectedDb(scenario.db)
    
    // Auto-execute the query
    setLoading(true)
    reset()
    
    try {
      setTrace({ agent: 'processing', middleware: 'idle', opa: 'idle', db: 'idle' })
      
      const payload = {
        natural_language: scenario.query,
        action: 'read',
        resource: 'patients',
        db: scenario.db
      }

      const res = await axios.post('http://localhost:8000/query', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setTrace({ agent: 'success', middleware: 'success', opa: 'allowed', db: 'success' })
      setResult(res.data)
    } catch (err) {
      console.error('Scenario failed:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Request failed'
      setTrace({ agent: 'error', middleware: 'error', opa: 'denied', db: 'error' })
      setResult({ error: errorMsg, status: err.response?.status })
    } finally {
      setLoading(false)
    }
  }

  const askNaturalLanguage = async (selectedDb = 'us_db') => {
    if (!token || !question.trim()) return
    setLoading(true)
    reset()
    
    try {
      setTrace({ agent: 'processing', middleware: 'idle', opa: 'idle', db: 'idle' })
      
      const payload = {
        natural_language: question,
        action: 'read',
        resource: 'patients', // default resource
        db: selectedDb
      }

      const res = await axios.post('http://localhost:8000/query', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setTrace({ agent: 'success', middleware: 'success', opa: 'allowed', db: 'success' })
      setResult(res.data)
      setQuestion('')
    } catch (err) {
      console.error('Natural language query failed:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Query failed'
      setTrace({ agent: 'error', middleware: 'error', opa: 'denied', db: 'error' })
      setResult({ error: errorMsg, status: err.response?.status })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askNaturalLanguage(selectedDb)
    }
  }

  const getQuickQuestions = (db, role) => {
    const questions = {
      us_db: {
        therapist: [
          `Show patients assigned to ${username}`,
          "How many active patients are there?",
          "Show recent patient updates",
          "List patients by status"
        ],
        admin: [
          "Show all patients",
          "How many patients are there?",
          "Show patient count by therapist",
          "List recent patient registrations",
          "Show system usage statistics"
        ],
        analyst: [
          "Show patient demographics", // Will be denied - good for testing
          "How many patients by region?", // Will be denied
          "Show treatment outcomes" // Will be denied
        ],
        support: [
          "Show patient contact information",
          "How many active support cases?",
          "List patients needing support",
          "Show patient status updates"
        ],
        superuser: [
          "Show all patients and records",
          "How many patients total?",
          "Show comprehensive system overview",
          "List all therapist assignments",
          "Show database health metrics"
        ]
      },
      eu_db: {
        therapist: [
          "Show EU patients",
          "How many EU patients are active?",
          "List EU patient assignments"
        ],
        admin: [
          "Show all EU patients",
          "How many EU patients total?",
          "Show EU therapist assignments",
          "List EU system metrics"
        ],
        analyst: [
          "Show EU patient data", // Will be denied
          "How many EU patients?", // Will be denied
        ],
        support: [
          "Show EU patient contacts",
          "How many EU support cases?",
          "List EU patients needing help"
        ],
        superuser: [
          "Show complete EU database",
          "How many EU patients total?",
          "Show EU system overview",
          "List all EU data"
        ]
      },
      sandbox_db: {
        therapist: [
          "Show research data", // Will be denied - good for testing
          "How many research patients?" // Will be denied
        ],
        admin: [
          "Show research overview",
          "How many research subjects?",
          "Show research metrics",
          "List research outcomes"
        ],
        analyst: [
          "Show research data and outcomes",
          "How many patients by diagnosis?",
          "Show average outcome scores",
          "What's the treatment success rate?",
          "Show research performance metrics"
        ],
        support: [
          "Show research data", // Will be denied - good for testing
          "How many research subjects?" // Will be denied
        ],
        superuser: [
          "Show complete research database",
          "How many research subjects total?",
          "Show all research metrics",
          "List comprehensive research data",
          "Show research system overview"
        ]
      }
    }
    
    return questions[db]?.[role] || questions[db]?.superuser || []
  }

  const quickQuestions = getQuickQuestions(selectedDb, userRole)

  return (
    <div className="p-6 backdrop-blur bg-white/20 rounded-2xl shadow-xl border border-white/30 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Actions for <span className="text-blue-600 capitalize">{userRole}</span>
            <span className="text-sm text-gray-500 ml-2">({username})</span>
          </h2>
          {loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>
        
        {/* Role-specific access summary */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700">
            <strong>Your Access Level:</strong> {
              userRole === 'superuser' ? 'Full system access to all databases and regions' :
              userRole === 'admin' ? 'Administrative access to US, EU, and research databases' :
              userRole === 'therapist' ? 'Patient access in US and EU regions (no research data)' :
              userRole === 'analyst' ? 'Research data access only (no production patient data)' :
              userRole === 'support' ? 'Patient contact and support data in US and EU regions' :
              'Limited access based on role permissions'
            }
          </div>
        </div>
      </div>
      
      {/* Persona-specific scenario buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario, index) => (
          <button
            key={index}
            disabled={loading}
            className={`p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              scenario.expectation === 'DENIED' 
                ? 'bg-red-50/80 border-2 border-red-200 hover:bg-red-100/80' 
                : scenario.expectation === 'CONDITIONAL'
                ? 'bg-yellow-50/80 border-2 border-yellow-200 hover:bg-yellow-100/80'
                : 'bg-green-50/80 border-2 border-green-200 hover:bg-green-100/80'
            }`}
            onClick={() => runScenario(scenario)}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                scenario.expectation === 'DENIED' 
                  ? 'bg-red-500 text-white' 
                  : scenario.expectation === 'CONDITIONAL'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-green-500 text-white'
              }`}>
                {scenario.expectation === 'DENIED' ? '✗' : scenario.expectation === 'CONDITIONAL' ? '?' : '✓'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 mb-1">{scenario.label}</div>
                <div className="text-sm text-gray-600 mb-2">{scenario.description}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    scenario.expectation === 'DENIED' 
                      ? 'bg-red-100 text-red-700' 
                      : scenario.expectation === 'CONDITIONAL'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {scenario.expectation}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {scenario.db}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 italic truncate">
                  "{scenario.query}"
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Natural language input */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">🧠 Text-to-SQL Natural Language Interface</h3>
        
        {/* Database Selection */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-600">Target Database:</label>
          <select
            value={selectedDb}
            onChange={(e) => setSelectedDb(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="us_db">🇺🇸 US Database (Production)</option>
            <option value="eu_db">🇪🇺 EU Database (Production)</option>
            <option value="sandbox_db">🧪 Sandbox Database (Research)</option>
          </select>
        </div>

        {/* Query Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask questions about ${selectedDb === 'sandbox_db' ? 'research data' : 'patient data'} as ${userRole}...`}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/50 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
              disabled={loading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Press Enter to send
            </div>
          </div>
          <button
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            onClick={() => askNaturalLanguage(selectedDb)}
          >
            <span className="text-xl">🚀</span>
            <span className="ml-2">Ask</span>
          </button>
        </div>

        {/* Quick Question Suggestions */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">💡 Quick Questions for {selectedDb}:</div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions[selectedDb]?.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                disabled={loading}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* AI Processing Info */}
        <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="text-sm font-medium text-purple-700">Ollama AI Text-to-SQL Engine</span>
          </div>
          <div className="text-xs text-purple-600 space-y-1">
            <div>• <strong>Real AI</strong>: Uses local Ollama (llama3.2:3b) for SQL generation</div>
            <div>• <strong>Context-Aware</strong>: Understands database schemas and relationships</div>
            <div>• <strong>Secure</strong>: Runs locally, no data sent to external APIs</div>
            <div>• <strong>Fallback</strong>: Pattern-matching backup if Ollama unavailable</div>
          </div>
        </div>
      </div>
    </div>
  )
}
