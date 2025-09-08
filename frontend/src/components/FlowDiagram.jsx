import React, { useEffect, useState } from 'react'
import ReactFlow, { Background, Controls, Position, MarkerType } from 'reactflow'
import 'reactflow/dist/style.css'
import useFlowStore from '../state/useFlowStore'

const CustomNode = ({ data, id }) => {
  const flow = useFlowStore(s => s.flow)
  const status = flow[id] || 'idle'
  
  const getNodeStyle = () => {
    switch (status) {
      case 'processing':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse border-blue-300 shadow-blue-200'
      case 'success':
        return 'bg-gradient-to-r from-green-400 to-green-600 border-green-300 shadow-green-200'
      case 'allowed':
        return 'bg-gradient-to-r from-green-400 to-green-600 border-green-300 shadow-green-200'
      case 'error':
      case 'denied':
        return 'bg-gradient-to-r from-red-500 to-red-700 border-red-400 shadow-red-300 animate-pulse'
      default:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 border-gray-400 shadow-gray-200'
    }
  }

  const getIcon = () => {
    switch (id) {
      case 'user': return '👤'
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

  const getStatusIcon = () => {
    switch (status) {
      case 'processing': return '⏳'
      case 'success':
      case 'allowed': return '✅'
      case 'error':
      case 'denied': return '❌'
      default: return '⚪'
    }
  }

  return (
    <div className={`px-4 py-3 rounded-xl border-2 text-white font-medium shadow-lg transition-all duration-500 transform hover:scale-105 ${getNodeStyle()}`}>
      <div className="flex items-center space-x-2">
        <span className="text-xl">{getIcon()}</span>
        <div className="flex-1">
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs opacity-90 flex items-center space-x-1">
            <span>{getStatusIcon()}</span>
            <span>{getStatusText()}</span>
          </div>
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
    
    // Enhanced arrow styling with better visibility
    const baseStyle = {
      strokeWidth: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 25,
        height: 25,
      }
    }
    
    if (sourceStatus === 'success' || sourceStatus === 'allowed') {
      return { 
        ...baseStyle,
        stroke: '#059669', // darker green for better visibility
        markerEnd: {
          ...baseStyle.markerEnd,
          color: '#059669'
        },
        animated: targetStatus === 'processing'
      }
    } else if (sourceStatus === 'error' || sourceStatus === 'denied') {
      return { 
        ...baseStyle,
        stroke: '#dc2626', // darker red for better visibility
        markerEnd: {
          ...baseStyle.markerEnd,
          color: '#dc2626'
        },
        animated: false,
        style: { strokeDasharray: '8,8' } // dashed line for errors
      }
    } else if (sourceStatus === 'processing') {
      return { 
        ...baseStyle,
        stroke: '#2563eb', // darker blue for better visibility
        markerEnd: {
          ...baseStyle.markerEnd,
          color: '#2563eb'
        },
        animated: true
      }
    }
    
    return { 
      ...baseStyle,
      strokeWidth: 3,
      stroke: '#6b7280', // darker gray for better visibility
      markerEnd: {
        ...baseStyle.markerEnd,
        color: '#6b7280'
      },
      animated: false
    }
  }

  const findFailurePoint = () => {
    // Find the first component that failed to highlight only that one
    const components = ['user', 'agent', 'middleware', 'opa', 'db']
    for (const component of components) {
      if (flow[component] === 'error' || flow[component] === 'denied') {
        return component
      }
    }
    return null
  }

  const failurePoint = findFailurePoint()

  const nodes = [
    { 
      id: 'user', 
      type: 'custom',
      data: { label: 'User' }, 
      position: { x: 50, y: 100 },
      sourcePosition: Position.Right,
    },
    { 
      id: 'agent', 
      type: 'custom',
      data: { label: 'Agent' }, 
      position: { x: 220, y: 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    { 
      id: 'middleware', 
      type: 'custom',
      data: { label: 'Middleware' }, 
      position: { x: 390, y: 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    { 
      id: 'opa', 
      type: 'custom',
      data: { label: 'OPA Policy' }, 
      position: { x: 560, y: 40 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Left,
    },
    { 
      id: 'db', 
      type: 'custom',
      data: { label: 'Database' }, 
      position: { x: 560, y: 160 },
      targetPosition: Position.Left,
    }
  ]

  const edges = [
    { 
      id: 'e1-2', 
      source: 'user', 
      target: 'agent', 
      ...getEdgeStyle('user', 'agent'),
      label: '🔐 JWT + Query',
      labelStyle: { fontSize: '12px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 }
    },
    { 
      id: 'e2-3', 
      source: 'agent', 
      target: 'middleware', 
      ...getEdgeStyle('agent', 'middleware'),
      label: '🔍 Verify & Route',
      labelStyle: { fontSize: '12px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 }
    },
    { 
      id: 'e3-4', 
      source: 'middleware', 
      target: 'opa', 
      ...getEdgeStyle('middleware', 'opa'),
      label: '⚖️ Authorize',
      labelStyle: { fontSize: '12px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 }
    },
    { 
      id: 'e4-5', 
      source: 'opa', 
      target: 'db', 
      ...getEdgeStyle('opa', 'db'),
      label: '📊 Execute Query',
      labelStyle: { fontSize: '12px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 }
    }
  ]

  return (
    <div className="backdrop-blur bg-white/20 rounded-2xl shadow-xl border border-white/30 overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🔄</span>
          Zero Trust Flow Visualization
        </h2>
        {failurePoint && (
          <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
            <span className="animate-pulse">🚨</span>
            <span>Failure detected at: <strong className="capitalize">{failurePoint}</strong></span>
          </div>
        )}
      </div>
      <div className="h-80 relative">
        <ReactFlow 
          key={animationKey}
          nodes={nodes} 
          edges={edges} 
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls className="bg-white/80 backdrop-blur" />
        </ReactFlow>
      </div>
    </div>
  )
}
