const SUPPORTED_PROVIDERS = new Set(['ollama', 'anthropic', 'openai', 'gemini'])
const MAX_REQUEST_BYTES = 1_000_000
const REQUEST_TIMEOUT_MS = 45_000

export async function handleAIRequest(payload, env = process.env) {
  try {
    validatePayload(payload)

    const provider = payload.provider || 'anthropic'
    const request = {
      systemPrompt: payload.request.systemPrompt,
      userContent: payload.request.userContent,
      maxTokens: normalizeMaxTokens(payload.request.maxTokens),
    }
    const apiKey = resolveApiKey(provider, payload.apiKey, env)

    if (provider !== 'ollama' && !apiKey) {
      if (provider === 'anthropic') {
        throw createHttpError(503, 'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY บน server สำหรับโหมด built-in')
      }

      throw createHttpError(400, 'กรุณาใส่ API key ของผู้ให้บริการที่เลือกก่อนใช้งาน')
    }

    let rawContent = ''

    switch (provider) {
      case 'ollama':
        rawContent = await callOllama(request, env)
        break
      case 'openai':
        rawContent = await callOpenAI(apiKey, request)
        break
      case 'gemini':
        rawContent = await callGemini(apiKey, request)
        break
      case 'anthropic':
      default:
        rawContent = await callAnthropic(apiKey, request)
        break
    }

    return {
      status: 200,
      body: {
        data: JSON.parse(extractJSON(rawContent)),
      },
    }
  } catch (error) {
    return {
      status: error?.status || 500,
      body: {
        error: error?.message || 'AI service is temporarily unavailable',
      },
    }
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw createHttpError(400, 'Invalid request body')
  }

  const serialized = JSON.stringify(payload)
  if (serialized.length > MAX_REQUEST_BYTES) {
    throw createHttpError(413, 'Request payload is too large')
  }

  if (!SUPPORTED_PROVIDERS.has(payload.provider || 'anthropic')) {
    throw createHttpError(400, 'Unsupported AI provider')
  }

  if (!payload.request || typeof payload.request !== 'object') {
    throw createHttpError(400, 'Missing AI request payload')
  }

  if (typeof payload.request.systemPrompt !== 'string' || !payload.request.systemPrompt.trim()) {
    throw createHttpError(400, 'Missing system prompt')
  }

  const userContent = payload.request.userContent
  const isValidContent = typeof userContent === 'string' || Array.isArray(userContent)
  if (!isValidContent) {
    throw createHttpError(400, 'Invalid user content')
  }
}

function normalizeMaxTokens(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 2000
  }

  return Math.max(256, Math.min(4000, Math.round(value)))
}

export function resolveApiKey(provider, sessionApiKey, env) {
  if (typeof sessionApiKey === 'string' && sessionApiKey.trim()) {
    return sessionApiKey.trim()
  }

  switch (provider) {
    case 'ollama':
      return ''
    case 'openai':
      return env.OPENAI_API_KEY || ''
    case 'gemini':
      return env.GEMINI_API_KEY || ''
    case 'anthropic':
    default:
      return env.ANTHROPIC_API_KEY || ''
  }
}

async function callOllama(request, env) {
  const baseUrl = (env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '')
  const model = resolveOllamaModel(request, env)

  let response

  try {
    response = await fetchWithTimeout(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        messages: buildOllamaMessages(request),
        options: {
          temperature: 0.2,
        },
      }),
    })
  } catch (error) {
    if (error?.status) {
      throw error
    }

    throw createHttpError(
      503,
      `ยังไม่พบ Ollama ที่ ${baseUrl} กรุณาติดตั้ง/เปิด Ollama แล้ว pull โมเดล ${model} ก่อนใช้งาน`
    )
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw createHttpError(response.status, formatUpstreamError('ollama', response.status, data?.error))
  }

  const rawContent = data?.message?.content
  if (!rawContent) {
    throw createHttpError(502, 'Ollama returned an empty response')
  }

  return rawContent
}

async function callAnthropic(apiKey, request) {
  const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: request.maxTokens,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.userContent }],
      stream: false,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw createHttpError(response.status, formatUpstreamError('anthropic', response.status, data?.error?.message))
  }

  const textBlock = Array.isArray(data?.content)
    ? data.content.find((item) => item?.type === 'text')
    : null

  if (!textBlock?.text) {
    throw createHttpError(502, 'Anthropic returned an empty response')
  }

  return textBlock.text
}

async function callOpenAI(apiKey, request) {
  const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: mapOpenAIContent(request.userContent) },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw createHttpError(response.status, formatUpstreamError('openai', response.status, data?.error?.message))
  }

  const rawContent = data?.choices?.[0]?.message?.content
  if (!rawContent) {
    throw createHttpError(502, 'OpenAI returned an empty response')
  }

  return rawContent
}

async function callGemini(apiKey, request) {
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: mapGeminiContent(request),
      }),
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw createHttpError(response.status, formatUpstreamError('gemini', response.status, data?.error?.message))
  }

  const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawContent) {
    throw createHttpError(502, 'Gemini returned an empty response')
  }

  return rawContent
}

function mapOpenAIContent(userContent) {
  if (!Array.isArray(userContent)) {
    return userContent
  }

  return userContent.map((item) => {
    if (item?.type === 'text') {
      return {
        type: 'text',
        text: item.text,
      }
    }

    if (item?.type === 'image') {
      return {
        type: 'image_url',
        image_url: {
          url: `data:${item.source.media_type};base64,${item.source.data}`,
        },
      }
    }

    return {
      type: 'text',
      text: JSON.stringify(item),
    }
  })
}

function mapGeminiContent(request) {
  if (!Array.isArray(request.userContent)) {
    return [
      {
        role: 'user',
        parts: [{ text: `${request.systemPrompt}\n\n${request.userContent}` }],
      },
    ]
  }

  return [
    {
      role: 'user',
      parts: request.userContent.map((item) => {
        if (item?.type === 'text') {
          return { text: item.text }
        }

        if (item?.type === 'image') {
          return {
            inline_data: {
              mime_type: item.source.media_type,
              data: item.source.data,
            },
          }
        }

        return { text: JSON.stringify(item) }
      }),
    },
  ]
}

function resolveOllamaModel(request, env) {
  const hasImageInput = Array.isArray(request.userContent)
    && request.userContent.some((item) => item?.type === 'image')

  if (hasImageInput) {
    return env.OLLAMA_VISION_MODEL || env.OLLAMA_MODEL || 'llava:7b'
  }

  return env.OLLAMA_MODEL || 'qwen2.5:7b-instruct'
}

function buildOllamaMessages(request) {
  const messages = [
    {
      role: 'system',
      content: request.systemPrompt,
    },
  ]

  if (!Array.isArray(request.userContent)) {
    messages.push({
      role: 'user',
      content: request.userContent,
    })
    return messages
  }

  const textParts = []
  const images = []

  for (const item of request.userContent) {
    if (item?.type === 'text' && item.text) {
      textParts.push(item.text)
    }

    if (item?.type === 'image' && item.source?.data) {
      images.push(item.source.data)
    }
  }

  messages.push({
    role: 'user',
    content: textParts.join('\n\n') || 'Respond with valid JSON only.',
    ...(images.length > 0 ? { images } : {}),
  })

  return messages
}

function extractJSON(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')

  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1)
  }

  throw createHttpError(502, 'AI returned malformed JSON')
}

function createHttpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function formatUpstreamError(provider, status, message) {
  if (status === 401 || status === 403) {
    if (provider === 'ollama') {
      return 'Ollama ยังไม่พร้อมใช้งานบนเครื่องนี้ กรุณาตรวจสอบ service และ model ที่ตั้งไว้'
    }

    if (provider === 'anthropic') {
      return 'Anthropic built-in key บน server ไม่ถูกต้องหรือหมดอายุ กรุณาอัปเดต ANTHROPIC_API_KEY หรือสลับ provider ใน Settings'
    }

    return 'API key ของ provider ที่เลือกไม่ถูกต้องหรือหมดอายุ กรุณาตรวจสอบใน Settings'
  }

  if (status === 429) {
    return 'AI provider ตอบกลับว่ามีการใช้งานเกินโควตา ลองใหม่อีกครั้งภายหลัง'
  }

  if (provider === 'ollama' && status === 404) {
    return 'Ollama ยังไม่มีโมเดลที่ตั้งไว้ กรุณา pull โมเดลก่อนใช้งาน'
  }

  if (message && typeof message === 'string') {
    return message
  }

  return 'AI provider request failed'
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw createHttpError(504, 'AI request timed out')
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}
