import { beforeEach, describe, expect, it } from 'vitest'
import { useStore } from './useStore'

describe('useStore UI and page actions', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    useStore.setState({
      page: 'home',
      theme: 'light',
      lang: 'th',
      loading: false,
      pdpaAccepted: false,
      onboardingSeen: false,
      isApiSettingsOpen: false,
      isHistoryOpen: false,
    })
  })

  it('updates UI state and theme attributes', () => {
    const state = useStore.getState()

    state.setPage('topic_select')
    state.setLang('en')
    state.setLoading(true)
    state.acceptPdpa()
    state.setOnboardingSeen(true)
    state.openApiSettings()
    state.openHistory()
    state.toggleTheme()
    state.initTheme()

    const next = useStore.getState()
    expect(next.page).toBe('topic_select')
    expect(next.lang).toBe('en')
    expect(next.loading).toBe(true)
    expect(next.pdpaAccepted).toBe(true)
    expect(next.onboardingSeen).toBe(true)
    expect(next.isApiSettingsOpen).toBe(true)
    expect(next.isHistoryOpen).toBe(true)
    expect(next.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    next.closeApiSettings()
    next.closeHistory()

    expect(useStore.getState().isApiSettingsOpen).toBe(false)
    expect(useStore.getState().isHistoryOpen).toBe(false)
  })
})

describe('useStore file, exam, and chat actions', () => {
  beforeEach(() => {
    useStore.setState({
      fileName: '',
      fileText: '',
      fileB64: null,
      fileMime: null,
      fileSummary: null,
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
      chatMessages: [],
    })
  })

  it('stores file data and exam workflow state', () => {
    const state = useStore.getState()

    state.setFileData('lesson.pdf', 'content', null, 'application/pdf')
    state.setFileSummary({
      title: 'Lesson 1',
      subject: 'Math',
      summary: 'Summary',
      topics: ['Algebra'],
      questions: [
        { q: '1+1?', options: ['1', '2', '3', '4'], correct: 1, explain: '2' },
      ],
    })

    state.setExamData([
      { q: '1+1?', options: ['1', '2', '3', '4'], correct: 1, explain: '2' },
    ])
    state.setExamAnswer(0, 1)
    state.setExamIdx(1)
    state.setExamResult({ score: 1, total: 1, wrong: [] })
    state.setWrongIdx(2)
    state.setWrongExplains({ 2: { explain: 'review' } })
    state.setTopic({ id: 'algebra', th: 'พีชคณิต', jp: '代数', lv: 'easy' })
    state.setQuiz({
      question: '2x + 5 = 17',
      answer: 'x = 6',
      wrongExample: 'x = 11',
      difficulty: 'easy',
      hint: 'ย้ายข้างก่อน',
    })
    state.setAnswer('x = 6')
    state.setSolution({
      isCorrect: true,
      steps: [{ num: 1, title: 'step', explain: 'done' }],
      keyRule: 'balance both sides',
    })
    state.setShowAnswer(true)
    state.setActiveTab('compare')
    state.setTeachBack('explain it simply')
    state.setTbResult({
      score: 8,
      passed: true,
      feedback: 'good',
      conceptGap: null,
      encouragement: 'keep going',
    })
    state.addChatMessage({ role: 'user', content: 'hello', ts: 1 })
    state.addChatMessage({ role: 'assistant', content: 'hi', ts: 2 })

    const next = useStore.getState()
    expect(next.fileName).toBe('lesson.pdf')
    expect(next.fileSummary?.title).toBe('Lesson 1')
    expect(next.examA[0]).toBe(1)
    expect(next.examIdx).toBe(1)
    expect(next.examResult?.score).toBe(1)
    expect(next.wrongIdx).toBe(2)
    expect(next.topic?.id).toBe('algebra')
    expect(next.quiz?.question).toContain('2x')
    expect(next.answer).toBe('x = 6')
    expect(next.solution?.isCorrect).toBe(true)
    expect(next.showAnswer).toBe(true)
    expect(next.activeTab).toBe('compare')
    expect(next.teachBack).toBe('explain it simply')
    expect(next.tbResult?.score).toBe(8)
    expect(next.chatMessages).toHaveLength(2)

    next.clearChat()
    expect(useStore.getState().chatMessages).toHaveLength(0)
  })
})

describe('useStore learning actions', () => {
  beforeEach(() => {
    useStore.setState({
      flashcards: [],
      cardIdx: 0,
      flipped: false,
      cardsDone: {},
      remMiniQuiz: [],
      quizReveal: {},
      bookmarks: [],
      notes: {},
      history: [],
      streak: 0,
      lastActive: null,
      mastery: {
        derivative: 22,
        integral: 15,
        limit: 48,
        trigonometry: 62,
        algebra: 78,
        probability: 35,
        geometry: 55,
        statistics: 42,
      },
    })
  })

  it('updates flashcards, mastery, bookmarks, and history helpers', () => {
    const state = useStore.getState()

    state.setFlashcards([
      { front: 'front', back: 'back', color: 'accent', difficulty: 'easy' },
    ])
    state.setCardIdx(0)
    state.setFlipped(true)
    state.setCardDone(0, true)
    state.setRemMiniQuiz([{ question: 'q', answer: 'a' }])
    state.setQuizReveal(0, true)
    state.updateMastery('algebra', 90)
    state.addBookmark({ id: 'bookmark-1', title: 'Saved card' })
    state.saveNote('bookmark-1', 'important')
    state.addHistory('quiz', { topic: 'algebra' })

    let next = useStore.getState()
    expect(next.flashcards).toHaveLength(1)
    expect(next.flipped).toBe(true)
    expect(next.cardsDone[0]).toBe(true)
    expect(next.remMiniQuiz).toHaveLength(1)
    expect(next.quizReveal[0]).toBe(true)
    expect(next.mastery.algebra).toBe(90)
    expect(next.bookmarks).toHaveLength(1)
    expect(next.notes['bookmark-1']).toBe('important')
    expect(next.history).toHaveLength(1)
    expect(next.streak).toBe(1)

    next.removeBookmark('bookmark-1')
    next.clearHistory()
    next = useStore.getState()

    expect(next.bookmarks).toHaveLength(0)
    expect(next.history).toHaveLength(0)
  })
})
