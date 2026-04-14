import { StateCreator } from 'zustand'
import { AppState, ConfigSlice } from './store.types'

export const createConfigSlice: StateCreator<AppState, [], [], ConfigSlice> = (set) => ({
  provider: 'local',
  apiKey: '',
  setApiConfig: (provider, apiKey) => set({ provider, apiKey }),
})
