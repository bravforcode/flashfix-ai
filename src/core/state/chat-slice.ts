import { StateCreator } from 'zustand'
import { AppState, ChatSlice } from './store.types'

export const createChatSlice: StateCreator<AppState, [], [], ChatSlice> = (set) => ({
  chatMessages: [],
  addChatMessage: (msg) => set((state: AppState) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),
})
