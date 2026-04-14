import { StateCreator } from 'zustand'
import { AppState, FileSlice } from './store.types'

export const createFileSlice: StateCreator<AppState, [], [], FileSlice> = (set) => ({
  fileName: '',
  fileText: '',
  fileB64: null,
  fileMime: null,
  fileSummary: null,
  
  setFileData: (name, text, b64, mime) => set({ 
    fileName: name, 
    fileText: text, 
    fileB64: b64, 
    fileMime: mime 
  }),
  
  setFileSummary: (summary) => set({ fileSummary: summary }),
})
