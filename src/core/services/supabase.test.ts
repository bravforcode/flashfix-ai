import { describe, expect, it } from 'vitest'
import { dbService, supabase } from './supabase'

describe('dbService without Supabase configuration', () => {
  it('gracefully returns no-op values when supabase is unavailable', async () => {
    expect(supabase).toBeNull()

    await expect(dbService.getAICache('missing')).resolves.toBeNull()
    await expect(dbService.setAICache({ key: 'x', prompt_hash: 'x' })).resolves.toBeNull()
    await expect(dbService.addHistory({ type: 'quiz', data: {} })).resolves.toBeNull()
    await expect(dbService.getHistory()).resolves.toEqual([])
    await expect(dbService.updateMastery({ topic_id: 'algebra', score: 80 })).resolves.toBeNull()
    await expect(dbService.getMastery('algebra')).resolves.toBeNull()
  })
})
