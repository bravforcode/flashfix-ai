import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { LocalAIProvider, ProxyAIProvider } from './ai-providers'

const QuizSchema = z.object({
  question: z.string(),
  answer: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  hint: z.string().optional(),
  wrongExample: z.string().optional(),
})

describe('ProxyAIProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('posts requests to the same-origin AI proxy and parses the response payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: {
          question: '2x+5=17',
          answer: 'x=6',
          difficulty: 'easy',
        },
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const provider = new ProxyAIProvider('openai', 'sk-test')
    const result = await provider.call(
      {
        systemPrompt: 'Diagnostic Quiz',
        userContent: 'หัวข้อ: พีชคณิต',
        maxTokens: 1200,
      },
      QuizSchema,
    )

    expect(result.answer).toBe('x=6')
    expect(fetchMock).toHaveBeenCalledWith('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        apiKey: 'sk-test',
        request: {
          systemPrompt: 'Diagnostic Quiz',
          userContent: 'หัวข้อ: พีชคณิต',
          maxTokens: 1200,
        },
      }),
    })
  })

  it('surfaces proxy payload errors when the proxy responds with a failure status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: vi.fn().mockResolvedValue({ error: 'Rate limit exceeded' }),
    }))

    const provider = new ProxyAIProvider('gemini')

    await expect(provider.call(
      {
        systemPrompt: 'Diagnostic Quiz',
        userContent: 'หัวข้อ: ความน่าจะเป็น',
      },
      QuizSchema,
    )).rejects.toThrow('Rate limit exceeded')
  })

  it('falls back to an HTTP status message when the proxy response body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new Error('invalid json')),
    }))

    const provider = new ProxyAIProvider('ollama')

    await expect(provider.call(
      {
        systemPrompt: 'Diagnostic Quiz',
        userContent: 'หัวข้อ: อนุพันธ์',
      },
      QuizSchema,
    )).rejects.toThrow('AI proxy failed with status 503')
  })
})

describe('LocalAIProvider', () => {
  it('uses the deterministic local generator and validates the schema', async () => {
    const provider = new LocalAIProvider()
    const result = await provider.call(
      {
        systemPrompt: 'FlashFix AI Assistant',
        userContent: 'ช่วยอธิบายลิมิตพร้อมตัวอย่าง',
      },
      z.object({ response: z.string() }),
    )

    expect(result.response).toContain('ลิมิต')
    expect(result.response).toContain('Actionable takeaway')
  })
})
