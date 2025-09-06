import { create } from 'zustand'

const useFlowStore = create(set => ({
  token: null,
  profile: null,
  trace: null,
  result: null,
  flow: { agent: 'idle', middleware: 'idle', opa: 'idle', db: 'idle' },
  setToken: token => set({ token }),
  setProfile: profile => set({ profile }),
  setTrace: trace => set({ trace, flow: trace || {} }),
  setResult: result => set({ result }),
  reset: () => set({ trace: null, result: null, flow: { agent:'idle', middleware:'idle', opa:'idle', db:'idle' } })
}))

export default useFlowStore
