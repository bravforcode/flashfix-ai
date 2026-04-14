import { StateCreator } from 'zustand'
import { AppState, BookmarkItem, LearningSlice } from './store.types'

export const createLearningSlice: StateCreator<AppState, [], [], LearningSlice> = (set, get) => ({
  flashcards: [],
  cardIdx: 0,
  flipped: false,
  cardsDone: {},
  remMiniQuiz: [],
  quizReveal: {},
  mastery: {},
  history: [],
  streak: 0,
  lastActive: null,
  bookmarks: [],
  notes: {},

  setFlashcards: (cards) => set({ flashcards: cards, cardIdx: 0, flipped: false, cardsDone: {}, remMiniQuiz: [], quizReveal: {} }),
  setCardIdx: (idx) => set({ cardIdx: idx, flipped: false }),
  setFlipped: (flipped) => set({ flipped }),
  setCardDone: (idx, done) => set((state: AppState) => ({ cardsDone: { ...state.cardsDone, [idx]: done } })),
  setRemMiniQuiz: (quiz) => set({ remMiniQuiz: quiz }),
  setQuizReveal: (idx, reveal) => set((state: AppState) => ({ quizReveal: { ...state.quizReveal, [idx]: reveal } })),
  updateMastery: (topic, score) => set((state: AppState) => ({ mastery: { ...state.mastery, [topic]: score } })),
  
  addHistory: (type, data) => {
    const nextHist = [{ type, data, ts: Date.now() }, ...get().history].slice(0, 50)
    get().updateStreak()
    set({ history: nextHist })
  },
  
  clearHistory: () => set({ history: [] }),
  
  updateStreak: () => {
    const { streak, lastActive } = get()
    const today = new Date().toISOString().split('T')[0]
    
    if (lastActive === today) return

    if (!lastActive) {
      set({ streak: 1, lastActive: today })
      return
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActive === yesterdayStr) {
      set({ streak: streak + 1, lastActive: today })
    } else {
      set({ streak: 1, lastActive: today })
    }
  },

  addBookmark: (item) => set((state: AppState) => ({ bookmarks: [item, ...state.bookmarks] })),
  removeBookmark: (id) => set((state: AppState) => ({ bookmarks: state.bookmarks.filter((bookmark: BookmarkItem) => bookmark.id !== id) })),
  saveNote: (id, text) => set((state: AppState) => ({ notes: { ...state.notes, [id]: text } })),
})
