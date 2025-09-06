import useFlowStore from '../state/useFlowStore'

export default function ResultPanel() {
  const { result } = useFlowStore()

  return (
    <div className="p-6 mt-4 backdrop-blur bg-white/30 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-2">Result</h2>
      {result ? (
        <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(result, null, 2)}</pre>
      ) : (
        <p className="text-sm">No result.</p>
      )}
    </div>
  )
}
