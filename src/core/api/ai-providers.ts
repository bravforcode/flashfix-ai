import { z } from 'zod'
import { logger } from '@/core/logging/logger'
import { Provider } from '@/core/state/store.types'
import { generateLocalAIResponse } from './local-ai'

export interface AITextContentBlock {
  type: 'text'
  text: string
}

export interface AIImageContentBlock {
  type: 'image'
  source: {
    type: 'base64'
    media_type: string
    data: string
  }
}

export type AIUserContent = string | Array<AITextContentBlock | AIImageContentBlock>

export interface AIRequest {
  systemPrompt: string
  userContent: AIUserContent
  maxTokens?: number
}

interface ProxyResponse {
  data?: unknown
  error?: string
}

export interface AIProvider {
  name: string
  call<T>(request: AIRequest, schema: z.ZodSchema<T>): Promise<T>
}

export class AIConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AIConfigurationError'
  }
}

export class ProxyAIProvider implements AIProvider {
  readonly name: string

  constructor(
    private readonly provider: Provider,
    private readonly apiKey?: string
  ) {
    this.name = provider
  }

  async call<T>(request: AIRequest, schema: z.ZodSchema<T>): Promise<T> {
    logger.debug(`Calling AI proxy for provider: ${this.provider}`)

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: this.provider,
        apiKey: this.apiKey,
        request,
      }),
    })

    const payload: ProxyResponse | null = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(payload?.error || `AI proxy failed with status ${response.status}`)
    }

    return schema.parse(payload?.data)
  }
}

export class LocalAIProvider implements AIProvider {
  readonly name = 'local'

  async call<T>(request: AIRequest, schema: z.ZodSchema<T>): Promise<T> {
    logger.debug('Using local AI provider', {
      systemPrompt: request.systemPrompt.slice(0, 80),
    })

    return schema.parse(generateLocalAIResponse(request))
  }
}
