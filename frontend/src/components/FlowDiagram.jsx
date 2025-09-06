import React, { useEffect, useState } from 'react'
import ReactFlow, { Background, Controls, Position } from 'reactflow'
import 'reactflow/dist/style.css'
import useFlowStore from '../state/useFlowStore'

const CustomNode = ({ data, id }) => {
  const flow = useFlowStore(s => s.flow)
  const status = flow[id] || 'idle'
  
  const getNodeStyle = () => {
    switch (status) {
      case 'processing':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse border-blue-300'
      case 'success':
        return 'bg-gradient-to-r from-green-400 to-green-600 border-green-300'
      case 'allowed':
        return 'bg-gradient-to-r from-green-400 to-green-600 border-green-300'
      case 'error':
      case 'denied':
        return 'bg-gradient-to-r from-red-400 to-red-600 border-red-300'
      default:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-300'
    }
  }

  const getIcon = () => {
    switch (id) {
      case 'agent': return '🤖'
      case 'middleware': return '🛡️'
      case 'opa': return '⚖️'
      case 'db': return '🗄️'
      default: return '⚡'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'processing': return 'Processing...'
      case 'success': return 'Success'
      case 'allowed': return 'Allowed'
      case 'error': return 'Error'
      case 'denied': return 'Denied'
      default: return 'Idle'
    }
  }

  return (
    <div className={`px-4 py-3 rounded-xl border-2 text-white font-medium shadow-lg transition-all duration-300 ${getNodeStyle()}`}>
      <div className="flex items-center space-x-2">
        <span className="text-xl">{getIcon()}</span>
        <div>
          <div className="font-semibold">{data.label}</div>
          <div className="text-xs opacity-90">{getStatusText()}</div>
        </div>
      </div>
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

export default function FlowDiagram() {
  const flow = useFlowStore(s => s.flow)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    // Trigger re-render when flow changes to update animations
    setAnimationKey(prev => prev + 1)
  }, [flow])

  const getEdgeStyle = (sourceId, targetId) => {
    const sourceStatus = flow[sourceId]
    const targetStatus = flow[targetId]
    
    if (sourceStatus === 'success' || sourceStatus === 'allowed') {
      return { 
        strokeWidth: 3, 
        stroke: '#10b981', // green
        animated: targetStatus === 'processing'
      }
    } else if (sourceStatus === 'error' || sourceStatus === 'denied') {
      return { 
        strokeWidth: 3, 
        stroke: '#ef4444', // red
        animated: false
      }
    } else if (sourceStatus === 'processing') {
      return { 
        strokeWidth: 3, 
        stroke: '#3b82f6', // blue
        animated: true
      }
    }
    
    return { 
      strokeWidth: 2, 
      stroke: '#9ca3af', // gray
      animated: false
    }
  }

  const nodes = [
    { 
      id: 'user', 
      type: 'custom',
      data: { label: 'User' }, 
      position: { x: 0, y: 100 },
      sourcePosition: Position.Right,
    },
    { 
      id: 'agent', 
      type: 'custom',
      data: { label: 'Agent' }, 
      position: { x: 200, y: 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    { 
      id: 'middleware', 
      type: 'custom',
      data: { label: 'Middleware' }, 
      position: { x: 400, y: 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    { 
      id: 'opa', 
      type: 'custom',
      data: { label: 'OPA Policy' }, 
      position: { x: 600, y: 50 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Left,
    },
    { 
      id: 'db', 
      type: 'custom',
      data: { label: 'Database' }, 
      position: { x: 600, y: 150 },
      targetPosition: Position.Left,
    }
  ]

  const edges = [
    { 
      id: 'e1-2', 
      source: 'user', 
      target: 'agent', 
      style: getEdgeStyle('user', 'agent'),
      animated: getEdgeStyle('user', 'agent').animated,
      label: 'JWT + Query'
    },
    { 
      id: 'e2-3', 
      source: 'agent', 
      target: 'middleware', 
      style: getEdgeStyle('agent', 'middleware'),
      animated: getEdgeStyle('agent', 'middleware').animated,
      label: 'Verify & Route'
    },
    { 
      id: 'e3-4', 
      source: 'middleware', 
      target: 'opa', 
      style: getEdgeStyle('middleware', 'opa'),
      animated: getEdgeStyle('middleware', 'opa').animated,
      label: 'Authorize'
    },
    { 
      id: 'e4-5', 
      source: 'opa', 
      target: 'db', 
      style: getEdgeStyle('opa', 'db'),
      animated: getEdgeStyle('opa', 'db').animated,
      label: 'Execute'
    }
  ]

  return (
    <div className="backdrop-blur bg-white/20 rounded-2xl shadow-xl border border-white/30 overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🔄</span>
          Zero Trust Flow Visualization
        </h2>
      </div>
      <div className="h-64 relative">
        <ReactFlow 
          key={animationKey}
          nodes={nodes} 
          edges={edges} 
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls className="bg-white/80 backdrop-blur" />
        </ReactFlow>
      </div>
    </div>
  )
}
