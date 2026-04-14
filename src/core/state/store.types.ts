import { Language } from '@/shared/i18n/translations'

export type Page = 'home' | 'file_upload' | 'file_processing' | 'file_summary' | 'exam_mc' | 'exam_result' | 'topic_select' | 'quiz' | 'solution' | 'teach_back' | 'flashcards' | 'mastery' | 'bookmarks'
export type Theme = 'light' | 'dark'
export type Provider = 'local' | 'ollama' | 'anthropic' | 'openai' | 'gemini'

export interface ExamQuestion {
  q: string
  options: string[]
  correct: number
  explain: string
}

export interface ExamResult {
  score: number
  total: number
  wrong: number[]
}

export interface FileSummaryData {
  title: string
  subject: string
  summary: string
  topics: string[]
  questions: ExamQuestion[]
}

export interface Topic {
  id: string
  th: string
  jp: string
  lv: 'easy' | 'medium' | 'hard'
  icon?: string
  color?: string
}

export interface QuizQuestion {
  question: string
  answer: string
  wrongExample?: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint?: string
}

export interface SolutionStep {
  num: number
  title: string
  math?: string
  explain: string
}

export interface QuizSolution {
  isCorrect: boolean
  errorType?: string
  errorTypeThai?: string
  studentAnswer?: string
  studentMistake?: string
  steps: SolutionStep[]
  keyRule?: string
  commonTrap?: string
  severity?: 'minor' | 'major' | 'fundamental'
}

export interface TeachBackEvaluation {
  score: number
  passed: boolean
  feedback: string
  conceptGap: string | null
  encouragement: string
}

export interface Flashcard {
  front: string
  back: string
  rule?: string
  hint?: string
  example?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  color?: 'accent' | 'blue' | 'purple' | 'teal' | 'gold'
}

export interface MiniQuizItem {
  question: string
  answer: string
}

export interface LearningHistoryData {
  title?: string
  fileName?: string
  subject?: string
  topic?: string
  question?: string
  score?: number
  total?: number
  [key: string]: unknown
}

export interface LearningHistoryEntry {
  type: string
  data: LearningHistoryData
  ts: number
}

export interface BookmarkItem {
  id: string
  [key: string]: unknown
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  ts: number
}

export interface UISlice {
  page: Page
  theme: Theme
  lang: Language
  loading: boolean
  pdpaAccepted: boolean
  onboardingSeen: boolean
  isApiSettingsOpen: boolean
  isHistoryOpen: boolean
  setPage: (page: Page) => void
  setLang: (lang: Language) => void
  toggleTheme: () => void
  initTheme: () => void
  setLoading: (loading: boolean) => void
  acceptPdpa: () => void
  setOnboardingSeen: (seen: boolean) => void
  openApiSettings: () => void
  closeApiSettings: () => void
  openHistory: () => void
  closeHistory: () => void
}

export interface ConfigSlice {
  provider: Provider
  apiKey: string
  setApiConfig: (provider: Provider, apiKey: string) => void
}

export interface FileSlice {
  fileName: string
  fileText: string
  fileB64: string | null
  fileMime: string | null
  fileSummary: FileSummaryData | null
  setFileData: (name: string, text: string, b64: string | null, mime: string | null) => void
  setFileSummary: (summary: FileSummaryData) => void
}

export interface ExamSlice {
  examQ: ExamQuestion[]
  examA: Record<number, number>
  examIdx: number
  examResult: ExamResult | null
  wrongIdx: number
  wrongExplains: Record<number, unknown>
  topic: Topic | null
  quiz: QuizQuestion | null
  answer: string
  solution: QuizSolution | null
  showAnswer: boolean
  activeTab: string
  teachBack: string
  tbResult: TeachBackEvaluation | null

  setExamData: (questions: ExamQuestion[]) => void
  setExamAnswer: (idx: number, answerIdx: number) => void
  setExamIdx: (idx: number) => void
  setExamResult: (result: ExamResult) => void
  setWrongIdx: (idx: number) => void
  setWrongExplains: (explains: Record<number, unknown>) => void
  setTopic: (topic: Topic) => void
  setQuiz: (quiz: QuizQuestion) => void
  setAnswer: (answer: string) => void
  setSolution: (solution: QuizSolution) => void
  setShowAnswer: (show: boolean) => void
  setActiveTab: (tab: string) => void
  setTeachBack: (text: string) => void
  setTbResult: (result: TeachBackEvaluation | null) => void
}

export interface LearningSlice {
  flashcards: Flashcard[]
  cardIdx: number
  flipped: boolean
  cardsDone: Record<number, boolean>
  remMiniQuiz: MiniQuizItem[]
  quizReveal: Record<number, boolean>
  mastery: Record<string, number>
  history: LearningHistoryEntry[]
  streak: number
  lastActive: string | null
  bookmarks: BookmarkItem[]
  notes: Record<string, string>

  setFlashcards: (cards: Flashcard[]) => void
  setCardIdx: (idx: number) => void
  setFlipped: (flipped: boolean) => void
  setCardDone: (idx: number, done: boolean) => void
  setRemMiniQuiz: (quiz: MiniQuizItem[]) => void
  setQuizReveal: (idx: number, reveal: boolean) => void
  updateMastery: (topic: string, score: number) => void
  addHistory: (type: string, data: LearningHistoryData) => void
  clearHistory: () => void
  updateStreak: () => void
  addBookmark: (item: BookmarkItem) => void
  removeBookmark: (id: string) => void
  saveNote: (id: string, text: string) => void
}

export interface ChatSlice {
  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void
  clearChat: () => void
}

export type AppState = UISlice & ConfigSlice & FileSlice & ExamSlice & LearningSlice & ChatSlice
