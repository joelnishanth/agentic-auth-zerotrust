import axios from 'axios'
import useFlowStore from '../state/useFlowStore'

const actions = [
  { label: 'View Assigned Patients', action: 'view_patients', db: 'us_db' },
  { label: 'Add Note to Patient', action: 'add_note', db: 'us_db', context: { patient_id: 'p001' } },
  { label: 'View De-Identified Records', action: 'view_deid', db: 'sandbox_db' },
  { label: 'View Admin Dashboard', action: 'admin_dashboard', db: 'us_db' },
  { label: 'Try Unauthorized Action', action: 'unauthorized', db: 'us_db' }
]

export default function ActionPanel() {
  const { token, setTrace, setResult, reset } = useFlowStore()

  const runAction = async a => {
    if (!token) return
    reset()
    try {
      const res = await axios.post('/api/agent/action', {
        jwt: token,
        action: a.action,
        db: a.db,
        context: a.context || {}
      })
      setTrace(res.data.trace)
      setResult(res.data)
    } catch (err) {
      setResult({ error: 'request failed' })
    }
  }

  return (
    <div className="p-6 mt-4 backdrop-blur bg-white/30 rounded-2xl shadow flex flex-wrap gap-4">
      {actions.map(a => (
        <button
          key={a.label}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          onClick={() => runAction(a)}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}
