import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from './useStore'

describe('useStore Streak Logic', () => {
  beforeEach(() => {
    // Reset store state manually if needed, but Zustand persist might interfere
    // For unit testing logic, we can just use the store as is or mock it
    useStore.setState({ streak: 0, lastActive: null, history: [] })
  })

  it('should start with 0 streak', () => {
    const state = useStore.getState()
    expect(state.streak).toBe(0)
    expect(state.lastActive).toBeNull()
  })

  it('should increment streak to 1 on first activity', () => {
    const { updateStreak } = useStore.getState()
    updateStreak()
    
    const state = useStore.getState()
    const today = new Date().toISOString().split('T')[0]
    expect(state.streak).toBe(1)
    expect(state.lastActive).toBe(today)
  })

  it('should not increment streak twice on the same day', () => {
    const { updateStreak } = useStore.getState()
    updateStreak()
    updateStreak()
    
    const state = useStore.getState()
    expect(state.streak).toBe(1)
  })

  it('should increment streak on consecutive days', () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Manually set lastActive to yesterday
    useStore.setState({ streak: 1, lastActive: yesterdayStr })
    
    const { updateStreak } = useStore.getState()
    updateStreak()
    
    const state = useStore.getState()
    expect(state.streak).toBe(2)
    expect(state.lastActive).toBe(today)
  })

  it('should reset streak if a day is missed', () => {
    const today = new Date().toISOString().split('T')[0]
    const dayBeforeYesterday = new Date()
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
    const dbyStr = dayBeforeYesterday.toISOString().split('T')[0]

    // Manually set lastActive to 2 days ago
    useStore.setState({ streak: 5, lastActive: dbyStr })
    
    const { updateStreak } = useStore.getState()
    updateStreak()
    
    const state = useStore.getState()
    expect(state.streak).toBe(1)
    expect(state.lastActive).toBe(today)
  })
})

describe('useStore History & Bookmarks', () => {
  beforeEach(() => {
    useStore.setState({ history: [], bookmarks: [], notes: {} })
  })

  it('should add history items', () => {
    const { addHistory } = useStore.getState()
    addHistory('quiz', { topic: 'Math' })
    
    const state = useStore.getState()
    expect(state.history.length).toBe(1)
    expect(state.history[0].type).toBe('quiz')
    expect(state.streak).toBe(1) // Should also update streak
  })

  it('should manage bookmarks and notes', () => {
    const { addBookmark, saveNote } = useStore.getState()
    const item = { id: '1', title: 'Test', content: 'Content' }
    
    addBookmark(item)
    saveNote('1', 'My important note')
    
    const state = useStore.getState()
    expect(state.bookmarks.length).toBe(1)
    expect(state.notes['1']).toBe('My important note')
  })
})
