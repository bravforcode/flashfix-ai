import { describe, expect, it } from 'vitest'

import { SecurityUtils } from './security'

describe('SecurityUtils', () => {
  it('removes inline styles from sanitized HTML', () => {
    const sanitized = SecurityUtils.sanitize('<p style="color:red">safe</p>')

    expect(sanitized).toBe('<p>safe</p>')
  })

  it('drops javascript URLs from links', () => {
    const sanitized = SecurityUtils.sanitize('<a href="javascript:alert(1)" target="_blank">click</a>')

    expect(sanitized).toBe('<a>click</a>')
  })

  it('preserves safe relative links', () => {
    const sanitized = SecurityUtils.sanitize('<a href="/topics/derivative">go</a>')

    expect(sanitized).toBe('<a href="/topics/derivative">go</a>')
  })
})
