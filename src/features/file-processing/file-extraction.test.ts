import { describe, expect, it } from 'vitest'

import { extractFilePayload, isSupportedStudyFile, isSupportedStudyImageMime } from './file-extraction'

describe('file extraction guards', () => {
  it('accepts only raster study images that the UI promises to support', () => {
    expect(isSupportedStudyImageMime('image/png')).toBe(true)
    expect(isSupportedStudyImageMime('image/jpeg')).toBe(true)
    expect(isSupportedStudyImageMime('image/webp')).toBe(true)
    expect(isSupportedStudyImageMime('image/svg+xml')).toBe(false)
    expect(isSupportedStudyImageMime('image/gif')).toBe(false)
  })

  it('rejects SVG uploads even though they are image/*', () => {
    const svgFile = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'diagram.svg', {
      type: 'image/svg+xml',
    })

    expect(isSupportedStudyFile(svgFile)).toBe(false)
  })

  it('throws a user-facing unsupported file error for SVG uploads', async () => {
    const svgFile = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'diagram.svg', {
      type: 'image/svg+xml',
    })

    await expect(extractFilePayload(svgFile)).rejects.toThrow('รองรับเฉพาะ PDF, PPTX, PNG, JPG และ WebP')
  })
})
