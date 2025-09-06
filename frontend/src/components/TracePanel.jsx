import useFlowStore from '../state/useFlowStore'

export default function TracePanel() {
  const { profile, trace, result } = useFlowStore()
  if (!trace && !result) return null
  return (
    <div className="p-6 mt-4 backdrop-blur bg-white/30 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-2">Trace Panel</h2>
      <pre className="text-sm overflow-auto max-h-60">{JSON.stringify({ claims: profile, trace, result }, null, 2)}</pre>
    </div>
  )
}
