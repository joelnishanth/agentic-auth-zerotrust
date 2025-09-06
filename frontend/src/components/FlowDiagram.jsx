import React from 'react'
import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'
import useFlowStore from '../state/useFlowStore'

const edgeStyle = { strokeWidth: 2 }

export default function FlowDiagram() {
  const flow = useFlowStore(s => s.flow)

  const getColor = id => {
    const status = flow[id]
    if (!status || status === 'idle') return '#facc15' // yellow
    if (String(status).toLowerCase().includes('deny')) return '#f87171' // red
    return '#4ade80' // green
  }

  const nodes = [
    { id: 'agent', data: { label: 'Agent' }, position: { x: 0, y: 0 }, style: { background: getColor('agent') } },
    { id: 'middleware', data: { label: 'Middleware' }, position: { x: 150, y: 0 }, style: { background: getColor('middleware') } },
    { id: 'opa', data: { label: 'OPA' }, position: { x: 300, y: 0 }, style: { background: getColor('opa') } },
    { id: 'db', data: { label: 'DB' }, position: { x: 450, y: 0 }, style: { background: getColor('db') } }
  ]

  const edges = [
    { id: 'e1-2', source: 'agent', target: 'middleware', animated: true, style: edgeStyle },
    { id: 'e2-3', source: 'middleware', target: 'opa', animated: true, style: edgeStyle },
    { id: 'e3-4', source: 'opa', target: 'db', animated: true, style: edgeStyle }
  ]

  return (
    <div className="h-48 mt-4 bg-white/30 rounded-2xl shadow">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
