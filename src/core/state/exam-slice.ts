import { StateCreator } from 'zustand'
import { AppState, ExamSlice } from './store.types'

export const createExamSlice: StateCreator<AppState, [], [], ExamSlice> = (set) => ({
  examQ: [],
  examA: {},
  examIdx: 0,
  examResult: null,
  wrongIdx: 0,
  wrongExplains: {},
  topic: null,
  quiz: null,
  answer: '',
  solution: null,
  showAnswer: false,
  activeTab: 'solution',
  teachBack: '',
  tbResult: null,

  setExamData: (questions) => set({ examQ: questions, examA: {}, examIdx: 0, examResult: null }),
  setExamAnswer: (idx, answerIdx) => set((state: AppState) => ({ examA: { ...state.examA, [idx]: answerIdx } })),
  setExamIdx: (idx) => set({ examIdx: idx }),
  setExamResult: (result) => set({ examResult: result }),
  setWrongIdx: (idx) => set({ wrongIdx: idx }),
  setWrongExplains: (explains) => set({ wrongExplains: explains }),
  setTopic: (topic) => set({ topic }),
  setQuiz: (quiz) => set({ quiz, answer: '', solution: null, showAnswer: false, activeTab: 'solution' }),
  setAnswer: (answer) => set({ answer }),
  setSolution: (solution) => set({ solution }),
  setShowAnswer: (show) => set({ showAnswer: show }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTeachBack: (text) => set({ teachBack: text }),
  setTbResult: (result) => set({ tbResult: result }),
})
