import useFlowStore from '../state/useFlowStore'

export default function TokenInfoPanel() {
  const { token, profile } = useFlowStore()
  if (!token) return null
  return (
    <div className="p-6 mt-4 backdrop-blur bg-white/30 rounded-2xl shadow">
      <h2 className="text-xl font-semibold">Token Claims</h2>
      <pre className="mt-2 text-sm overflow-auto max-h-60">{JSON.stringify(profile, null, 2)}</pre>
    </div>
  )
}
