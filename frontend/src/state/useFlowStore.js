import { create } from 'zustand'

const useFlowStore = create((set, get) => ({
  token: null,
  profile: null,
  trace: null,
  result: null,
  flow: { user: 'idle', agent: 'idle', middleware: 'idle', opa: 'idle', db: 'idle' },
  
  setToken: token => set({ token }),
  setProfile: profile => set({ profile }),
  setTrace: trace => set({ trace, flow: trace || {} }),
  setResult: result => set({ result }),
  
  // Enhanced flow management with proper failure tracking
  updateFlow: (component, status) => {
    const currentFlow = get().flow
    set({ 
      flow: { 
        ...currentFlow, 
        [component]: status 
      } 
    })
  },
  
  // Start a new flow sequence
  startFlow: () => {
    set({ 
      flow: { user: 'success', agent: 'processing', middleware: 'idle', opa: 'idle', db: 'idle' },
      result: null 
    })
  },
  
  // Progress through the flow
  progressFlow: (currentComponent, nextComponent, success = true) => {
    const currentFlow = get().flow
    const newFlow = { ...currentFlow }
    
    // Update current component status
    newFlow[currentComponent] = success ? 'success' : 'error'
    
    // Update next component if provided and current was successful
    if (nextComponent && success) {
      newFlow[nextComponent] = 'processing'
    }
    
    set({ flow: newFlow })
  },
  
  // Handle flow failure - only the failing component turns red
  failFlow: (failingComponent, error) => {
    const currentFlow = get().flow
    const newFlow = { ...currentFlow }
    
    // Set the failing component to error state
    newFlow[failingComponent] = 'error'
    
    // Set all subsequent components to idle (they never got reached)
    const components = ['user', 'agent', 'middleware', 'opa', 'db']
    const failIndex = components.indexOf(failingComponent)
    
    for (let i = failIndex + 1; i < components.length; i++) {
      newFlow[components[i]] = 'idle'
    }
    
    set({ 
      flow: newFlow,
      result: { error: error || 'Access denied', status: 403 }
    })
  },
  
  // Complete the flow successfully
  completeFlow: (result) => {
    set({ 
      flow: { user: 'success', agent: 'success', middleware: 'success', opa: 'success', db: 'success' },
      result: result 
    })
  },
  
  reset: () => set({ 
    token: null,
    profile: null,
    trace: null, 
    result: null, 
    flow: { user: 'idle', agent: 'idle', middleware: 'idle', opa: 'idle', db: 'idle' } 
  }),
  
  // Reset only the flow state, not authentication
  resetFlow: () => set({ 
    trace: null, 
    result: null, 
    flow: { user: 'idle', agent: 'idle', middleware: 'idle', opa: 'idle', db: 'idle' } 
  })
}))

export default useFlowStore
