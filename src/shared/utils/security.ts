import DOMPurify from 'dompurify'

const SAFE_URI_PATTERN = /^(?:(?:https?):|mailto:|tel:|\/|#)/i

export const SecurityUtils = {
  /**
   * Sanitizes a string to prevent XSS attacks.
   * Useful when rendering content from AI or external sources.
   */
  sanitize(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'span'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      FORBID_ATTR: ['style'],
      ALLOWED_URI_REGEXP: SAFE_URI_PATTERN,
    })
  },

  /**
   * Escapes a string for safe usage in HTML content.
   */
  escapeHTML(str: string): string {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  },

  /**
   * Validates if a string is a valid URL.
   */
  isValidURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}
