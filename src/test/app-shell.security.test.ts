import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

describe('app shell security headers', () => {
  const indexHtml = readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8')

  it('defines a Content Security Policy in the app shell', () => {
    expect(indexHtml).toContain('Content-Security-Policy')
    expect(indexHtml).toContain("default-src 'self'")
    expect(indexHtml).toContain("object-src 'none'")
    expect(indexHtml).toContain("base-uri 'self'")
  })

  it('defines a referrer policy in the app shell', () => {
    expect(indexHtml).toContain('name="referrer"')
    expect(indexHtml).toContain('strict-origin-when-cross-origin')
  })
})
