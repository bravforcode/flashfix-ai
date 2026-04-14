/**
 * XSS Protection utilities
 * Provides safe sanitization and encoding for user input
 */

import DOMPurify from 'dompurify'

// Configure DOMPurify
DOMPurify.setConfig({
  ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'code', 'br', 'p', 'span', 'div'],
  ALLOWED_ATTR: ['class'],
  KEEP_CONTENT: true,
})

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html)
}

/**
 * Escape HTML entities
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validate and sanitize URL
 */
export const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return url
  } catch {
    return null
  }
}

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate API key format
 */
export const isValidApiKey = (key: string, provider: string): boolean => {
  const patterns: Record<string, RegExp> = {
    local: /^$/,
    ollama: /^$/,
    anthropic: /^sk-ant-[a-zA-Z0-9\-_]{20,}$/,
    openai: /^sk-[a-zA-Z0-9\-_]{20,}$/,
    gemini: /^[a-zA-Z0-9\-_]{20,}$/,
  }
  const pattern = patterns[provider]
  return pattern ? pattern.test(key) : key.length > 10
}

/**
 * Sanitize file name
 */
export const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\\.+/, '')
    .substring(0, 255)
}
