import { StateCreator } from 'zustand'
import { AppState, UISlice } from './store.types'

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, get) => ({
  page: 'home',
  theme: 'light',
  lang: 'th',
  loading: false,
  pdpaAccepted: false,
  onboardingSeen: false,
  isApiSettingsOpen: false,
  isHistoryOpen: false,
  
  setPage: (page) => set({ page }),
  setLang: (lang) => set({ lang }),
  
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', nextTheme)
    set({ theme: nextTheme })
  },
  
  initTheme: () => {
    const theme = get().theme
    document.documentElement.setAttribute('data-theme', theme)
  },
  
  setLoading: (loading) => set({ loading }),
  
  acceptPdpa: () => set({ pdpaAccepted: true }),
  
  setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),

  openApiSettings: () => set({ isApiSettingsOpen: true }),
  closeApiSettings: () => set({ isApiSettingsOpen: false }),
  openHistory: () => set({ isHistoryOpen: true }),
  closeHistory: () => set({ isHistoryOpen: false }),
})
