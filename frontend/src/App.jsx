import LoginPanel from './components/LoginPanel'
import TokenInfoPanel from './components/TokenInfoPanel'
import ActionPanel from './components/ActionPanel'
import FlowDiagram from './components/FlowDiagram'
import TracePanel from './components/TracePanel'
import useFlowStore from './state/useFlowStore'

export default function App() {
  const token = useFlowStore(s => s.token)

  return (
    <div className="min-h-screen p-6 space-y-4 bg-gradient-to-br from-slate-100 to-slate-200">
      <h1 className="text-3xl font-bold text-center">Offlyn.ai — Zero Trust Demo</h1>
      <LoginPanel />
      {token && (
        <>
          <TokenInfoPanel />
          <ActionPanel />
          <FlowDiagram />
          <TracePanel />
        </>
      )}
      <footer className="text-center text-sm mt-8">
        <a href="https://offlyn.ai" className="text-blue-500">
          https://offlyn.ai
        </a>
      </footer>
    </div>
  )
}
