import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createUISlice } from './ui-slice'
import { createConfigSlice } from './config-slice'
import { createFileSlice } from './file-slice'
import { createExamSlice } from './exam-slice'
import { createLearningSlice } from './learning-slice'
import { createChatSlice } from './chat-slice'
import { AppState } from './store.types'

export const migratePersistedState = (persistedState: unknown): AppState => {
  if (!persistedState || typeof persistedState !== 'object') {
    return persistedState as unknown as AppState
  }

  const nextState = { ...(persistedState as Record<string, unknown>) }
  const provider = typeof nextState.provider === 'string' ? nextState.provider : ''
  const apiKey = typeof nextState.apiKey === 'string' ? nextState.apiKey : ''

  if (provider === 'anthropic' && !apiKey.trim()) {
    nextState.provider = 'local'
  }

  if (!provider) {
    nextState.provider = 'local'
  }

  return nextState as unknown as AppState
}

export const partializePersistedState = (state: AppState) => ({
  theme: state.theme,
  lang: state.lang,
  provider: state.provider,
  pdpaAccepted: state.pdpaAccepted,
  onboardingSeen: state.onboardingSeen,
  mastery: state.mastery,
  history: state.history,
  streak: state.streak,
  lastActive: state.lastActive,
  bookmarks: state.bookmarks,
  notes: state.notes,
})

export const useStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createUISlice(...a),
      ...createConfigSlice(...a),
      ...createFileSlice(...a),
      ...createExamSlice(...a),
      ...createLearningSlice(...a),
      ...createChatSlice(...a),
    }),
    {
      name: 'flashfix-storage',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: migratePersistedState,
      partialize: partializePersistedState,
    }
  )
)

export type { AppState }
