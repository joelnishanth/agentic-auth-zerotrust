import { useState } from 'react'
import axios from 'axios'
import useFlowStore from '../state/useFlowStore'

const getPersonaActions = (role) => {
  const baseActions = {
    therapist: [
      { label: '👁️ View Assigned Patients', action: 'read', resource: 'patients', db: 'us_db', sql: 'SELECT * FROM patients WHERE id IN (SELECT unnest(assigned_patients) FROM users WHERE username = current_user)', icon: '👁️' },
      { label: '➕ Add Note to Patient', action: 'write', resource: 'notes', db: 'us_db', context: { patient_id: 'p001' }, sql: 'INSERT INTO notes (patient_id, note) VALUES (?, ?)', icon: '➕' },
      { label: '📋 View Patient Notes', action: 'read', resource: 'notes', db: 'us_db', sql: 'SELECT * FROM notes WHERE patient_id IN (SELECT unnest(assigned_patients) FROM users WHERE username = current_user)', icon: '📋' }
    ],
    admin: [
      { label: '🔐 Access Admin Dashboard', action: 'read', resource: 'patients', db: 'us_db', sql: 'SELECT * FROM patients', icon: '🔐' },
      { label: '👥 Manage All Patients', action: 'write', resource: 'patients', db: 'us_db', sql: 'SELECT * FROM patients', icon: '👥' },
      { label: '📊 View System Stats', action: 'read', resource: 'notes', db: 'us_db', sql: 'SELECT COUNT(*) as total_notes FROM notes', icon: '📊' },
      { label: '🌍 Cross-Region Access', action: 'read', resource: 'patients', db: 'eu_db', sql: 'SELECT * FROM patients', icon: '🌍' }
    ],
    analyst: [
      { label: '🧪 View Sandbox Records', action: 'read', resource: 'patients', db: 'sandbox_db', sql: 'SELECT * FROM patients', icon: '🧪' },
      { label: '📈 Analyze Trends', action: 'read', resource: 'notes', db: 'sandbox_db', sql: 'SELECT COUNT(*) as note_count, patient_id FROM notes GROUP BY patient_id', icon: '📈' },
      { label: '🔍 Research Query', action: 'read', resource: 'patients', db: 'sandbox_db', sql: 'SELECT region, COUNT(*) FROM patients GROUP BY region', icon: '🔍' }
    ],
    support: [
      { label: '🆘 View Patient Status', action: 'read', resource: 'patients', db: 'us_db', sql: 'SELECT id, name FROM patients', icon: '🆘' },
      { label: '📞 Support Dashboard', action: 'read', resource: 'patients', db: 'eu_db', sql: 'SELECT id, name FROM patients', icon: '📞' }
    ],
    superuser: [
      { label: '🚀 Full US Access', action: 'read', resource: 'patients', db: 'us_db', sql: 'SELECT * FROM patients', icon: '🚀' },
      { label: '🌍 Full EU Access', action: 'read', resource: 'patients', db: 'eu_db', sql: 'SELECT * FROM patients', icon: '🌍' },
      { label: '🧪 Full Sandbox Access', action: 'read', resource: 'patients', db: 'sandbox_db', sql: 'SELECT * FROM patients', icon: '🧪' },
      { label: '⚡ Cross-DB Query', action: 'write', resource: 'patients', db: 'us_db', sql: 'SELECT * FROM patients LIMIT 5', icon: '⚡' }
    ]
  }
  
  // Add some "unauthorized" test actions for all roles
  const unauthorizedActions = [
    { label: '❌ Try Unauthorized DB', action: 'read', resource: 'patients', db: 'unauthorized_db', sql: 'SELECT * FROM patients', icon: '❌', isTest: true },
    { label: '🚫 Try Admin Action', action: 'write', resource: 'patients', db: 'us_db', sql: 'DELETE FROM patients WHERE id = ?', icon: '🚫', isTest: true }
  ]
  
  return [...(baseActions[role] || []), ...unauthorizedActions]
}

export default function ActionPanel() {
  const { token, profile, setTrace, setResult, reset } = useFlowStore()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const userRole = profile?.role || profile?.realm_access?.roles?.[0] || 'unknown'
  const actions = getPersonaActions(userRole)

  const runAction = async (action) => {
    if (!token) return
    setLoading(true)
    reset()
    
    try {
      // Simulate flow states for better UX
      setTrace({ agent: 'processing', middleware: 'idle', opa: 'idle', db: 'idle' })
      
      const payload = {
        action: action.action,
        resource: action.resource,
        db: action.db,
        sql: action.sql,
        patient_id: action.context?.patient_id
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
      console.error('Action failed:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Request failed'
      setTrace({ agent: 'error', middleware: 'error', opa: 'denied', db: 'error' })
      setResult({ error: errorMsg, status: err.response?.status })
    } finally {
      setLoading(false)
    }
  }

  const askNaturalLanguage = async () => {
    if (!token || !question.trim()) return
    setLoading(true)
    reset()
    
    try {
      setTrace({ agent: 'processing', middleware: 'idle', opa: 'idle', db: 'idle' })
      
      const payload = {
        natural_language: question,
        action: 'read',
        resource: 'patients', // default resource
        db: 'us_db' // default db
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
      askNaturalLanguage()
    }
  }

  return (
    <div className="p-6 backdrop-blur bg-white/20 rounded-2xl shadow-xl border border-white/30 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Actions for <span className="text-blue-600 capitalize">{userRole}</span>
        </h2>
        {loading && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>
      
      {/* Persona-specific action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            disabled={loading}
            className={`p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              action.isTest 
                ? 'bg-red-500/20 border border-red-300 text-red-700 hover:bg-red-500/30' 
                : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-300 text-gray-700 hover:from-blue-500/30 hover:to-purple-500/30'
            }`}
            onClick={() => runAction(action)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{action.icon}</span>
              <div>
                <div className="font-medium">{action.label}</div>
                <div className="text-xs opacity-70">{action.db} • {action.resource}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Natural language input */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-700">🧠 Ask in Natural Language</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 'Show me all patients in the US database' or 'How many notes are there?'"
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
            onClick={askNaturalLanguage}
          >
            <span className="text-xl">🚀</span>
            <span className="ml-2">Ask</span>
          </button>
        </div>
        <div className="text-xs text-gray-500">
          💡 Try: "Show my patients", "Count all notes", "List users in EU database"
        </div>
      </div>
    </div>
  )
}
