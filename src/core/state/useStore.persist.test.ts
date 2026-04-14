import { describe, expect, it } from 'vitest'
import { migratePersistedState, partializePersistedState, useStore } from './useStore'

describe('useStore persistence helpers', () => {
  it('passes through non-object persisted values unchanged', () => {
    expect(migratePersistedState(null as unknown)).toBeNull()
    expect(migratePersistedState('legacy-state' as unknown)).toBe('legacy-state')
  })

  it('defaults to the local provider when provider metadata is missing', () => {
    const migrated = migratePersistedState({
      theme: 'light',
      lang: 'th',
    })

    expect(migrated.provider).toBe('local')
  })

  it('downgrades legacy anthropic-without-key state to the local provider', () => {
    const migrated = migratePersistedState({
      provider: 'anthropic',
      apiKey: '   ',
      theme: 'dark',
    })

    expect(migrated.provider).toBe('local')
  })

  it('preserves valid configured providers', () => {
    const migrated = migratePersistedState({
      provider: 'openai',
      apiKey: 'sk-live',
    })

    expect(migrated.provider).toBe('openai')
  })

  it('persists only safe long-lived fields and excludes transient secrets or file payloads', () => {
    useStore.setState({
      provider: 'gemini',
      apiKey: 'super-secret',
      fileName: 'chapter-1.pdf',
      fileText: 'private notes',
      fileB64: 'abc123',
      fileMime: 'application/pdf',
      mastery: { algebra: 88 },
      bookmarks: [{ id: 'bookmark-1', title: 'Saved' }],
      notes: { 'bookmark-1': 'review this' },
      history: [{ type: 'quiz', data: { topic: 'algebra' }, ts: 1 }],
      streak: 5,
      lastActive: '2026-04-13',
      pdpaAccepted: true,
      onboardingSeen: true,
      theme: 'dark',
      lang: 'th',
    })

    const persisted = partializePersistedState(useStore.getState())

    expect(persisted).toMatchObject({
      provider: 'gemini',
      mastery: { algebra: 88 },
      bookmarks: [{ id: 'bookmark-1', title: 'Saved' }],
      notes: { 'bookmark-1': 'review this' },
      streak: 5,
      lastActive: '2026-04-13',
      pdpaAccepted: true,
      onboardingSeen: true,
      theme: 'dark',
      lang: 'th',
    })
    expect(persisted).not.toHaveProperty('apiKey')
    expect(persisted).not.toHaveProperty('fileName')
    expect(persisted).not.toHaveProperty('fileText')
    expect(persisted).not.toHaveProperty('fileB64')
  })
})
