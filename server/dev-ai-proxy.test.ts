import { EventEmitter } from 'node:events'

import { describe, expect, it, vi } from 'vitest'

import { handleDevAIProxy } from './dev-ai-proxy'

class MockRequest extends EventEmitter {
  method = 'POST'
}

class MockResponse {
  statusCode = 200
  writableEnded = false
  headers: Record<string, string> = {}
  body = ''

  setHeader(name: string, value: string) {
    this.headers[name] = value
  }

  end(payload: string) {
    this.writableEnded = true
    this.body = payload
  }
}

describe('handleDevAIProxy', () => {
  it('returns 400 instead of crashing on malformed JSON', async () => {
    const req = new MockRequest()
    const res = new MockResponse()
    const handler = vi.fn()

    const proxyPromise = handleDevAIProxy(req, res, {}, handler as never)

    req.emit('data', '{invalid')
    req.emit('end')

    await proxyPromise

    expect(handler).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({ error: 'Invalid JSON body' })
  })

  it('returns 413 for oversized request bodies', async () => {
    const req = new MockRequest()
    const res = new MockResponse()
    const handler = vi.fn()

    const proxyPromise = handleDevAIProxy(req, res, {}, handler as never)

    req.emit('data', 'a'.repeat(1_000_001))
    req.emit('end')

    await proxyPromise

    expect(handler).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(413)
    expect(JSON.parse(res.body)).toEqual({ error: 'Request payload is too large' })
  })

  it('passes valid payloads through to the AI handler', async () => {
    const req = new MockRequest()
    const res = new MockResponse()
    const handler = vi.fn().mockResolvedValue({
      status: 200,
      body: { ok: true },
    })

    const proxyPromise = handleDevAIProxy(req, res, {}, handler as never)

    req.emit('data', JSON.stringify({ provider: 'local', request: { systemPrompt: 'x', userContent: 'y' } }))
    req.emit('end')

    await proxyPromise

    expect(handler).toHaveBeenCalledWith(
      { provider: 'local', request: { systemPrompt: 'x', userContent: 'y' } },
      {}
    )
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ ok: true })
  })
})
