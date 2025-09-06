import useFlowStore from '../state/useFlowStore'

export default function TraceViewer() {
  const { profile, trace, result } = useFlowStore()

  return (
    <div className="p-6 mt-4 backdrop-blur bg-white/30 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-2">Trace Viewer</h2>
      {trace ? (
        <pre className="text-sm overflow-auto max-h-60">
          {JSON.stringify({ jwt: profile, trace, result }, null, 2)}
        </pre>
      ) : (
        <p className="text-sm">No actions yet.</p>
      )}
    </div>
  )
}
