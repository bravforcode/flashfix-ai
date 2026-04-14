import type { IncomingMessage, ServerResponse } from 'node:http'

import { handleAIRequest } from './ai-handler.mjs'

export const MAX_DEV_PROXY_BYTES = 1_000_000

type HTTPError = Error & { status?: number }

const createHTTPError = (status: number, message: string): HTTPError => {
  const error = new Error(message) as HTTPError
  error.status = status
  return error
}

const sendJson = (
  res: Pick<ServerResponse, 'statusCode' | 'setHeader' | 'end' | 'writableEnded'>,
  status: number,
  body: unknown
) => {
  if (res.writableEnded) {
    return
  }

  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export const readDevProxyRequestBody = (
  req: Pick<IncomingMessage, 'on' | 'off'>,
  maxBytes = MAX_DEV_PROXY_BYTES
): Promise<string> =>
  new Promise((resolve, reject) => {
    let rawBody = ''
    let exceededLimit = false

    const cleanup = () => {
      req.off('data', handleData)
      req.off('end', handleEnd)
      req.off('error', handleError)
    }

    const handleData = (chunk: Buffer | string) => {
      if (exceededLimit) {
        return
      }

      rawBody += typeof chunk === 'string' ? chunk : chunk.toString()

      if (Buffer.byteLength(rawBody, 'utf8') > maxBytes) {
        exceededLimit = true
        rawBody = rawBody.slice(0, maxBytes)
      }
    }

    const handleEnd = () => {
      cleanup()

      if (exceededLimit) {
        reject(createHTTPError(413, 'Request payload is too large'))
        return
      }

      resolve(rawBody)
    }

    const handleError = () => {
      cleanup()
      reject(createHTTPError(400, 'Failed to read request body'))
    }

    req.on('data', handleData)
    req.on('end', handleEnd)
    req.on('error', handleError)
  })

export const parseDevProxyPayload = (rawBody: string) => {
  if (!rawBody.trim()) {
    return {}
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    throw createHTTPError(400, 'Invalid JSON body')
  }
}

export const handleDevAIProxyBody = async (
  rawBody: string,
  env: NodeJS.ProcessEnv,
  aiHandler: typeof handleAIRequest = handleAIRequest
) => {
  const payload = parseDevProxyPayload(rawBody)
  return aiHandler(payload, env)
}

export const handleDevAIProxy = async (
  req: Pick<IncomingMessage, 'method' | 'on' | 'off'>,
  res: Pick<ServerResponse, 'statusCode' | 'setHeader' | 'end' | 'writableEnded'>,
  env: NodeJS.ProcessEnv,
  aiHandler: typeof handleAIRequest = handleAIRequest
) => {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const rawBody = await readDevProxyRequestBody(req)
    const result = await handleDevAIProxyBody(rawBody, env, aiHandler)
    sendJson(res, result.status, result.body)
  } catch (error) {
    const httpError = error as HTTPError
    sendJson(res, httpError.status || 500, {
      error: httpError.message || 'AI service is temporarily unavailable',
    })
  }
}
