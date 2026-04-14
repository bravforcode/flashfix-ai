import { describe, expect, it } from 'vitest'

import { handleAIRequest, resolveApiKey } from './ai-handler.mjs'

describe('resolveApiKey', () => {
  it('prefers session keys over environment variables', () => {
    expect(resolveApiKey('openai', ' session-key ', { OPENAI_API_KEY: 'server-key' })).toBe('session-key')
  })

  it('does not fall back to public VITE environment variables', () => {
    expect(resolveApiKey('anthropic', undefined, { VITE_ANTHROPIC_API_KEY: 'public-key' })).toBe('')
    expect(resolveApiKey('openai', undefined, { VITE_OPENAI_API_KEY: 'public-key' })).toBe('')
    expect(resolveApiKey('gemini', undefined, { VITE_GEMINI_API_KEY: 'public-key' })).toBe('')
  })
})

describe('handleAIRequest', () => {
  it('rejects built-in anthropic mode when only a public VITE key is configured', async () => {
    const result = await handleAIRequest(
      {
        provider: 'anthropic',
        request: {
          systemPrompt: 'ตอบ json',
          userContent: 'hello',
        },
      },
      {
        VITE_ANTHROPIC_API_KEY: 'public-key',
      }
    )

    expect(result.status).toBe(503)
    expect(result.body).toEqual({
      error: 'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY บน server สำหรับโหมด built-in',
    })
  })
})
