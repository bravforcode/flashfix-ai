const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

export const isSupportedStudyImageMime = (mime: string | null | undefined) =>
  typeof mime === 'string' && SUPPORTED_IMAGE_MIME_TYPES.has(mime.toLowerCase())

const resolveSupportedImageMime = (file: File) => {
  if (isSupportedStudyImageMime(file.type)) {
    return file.type.toLowerCase()
  }

  const normalizedName = file.name.toLowerCase()

  if (normalizedName.endsWith('.png')) {
    return 'image/png'
  }

  if (normalizedName.endsWith('.jpg') || normalizedName.endsWith('.jpeg')) {
    return 'image/jpeg'
  }

  if (normalizedName.endsWith('.webp')) {
    return 'image/webp'
  }

  return null
}

export interface ExtractedFilePayload {
  text: string
  b64: string | null
  mime: string | null
}

export const isSupportedStudyFile = (file: File) => {
  return Boolean(resolveSupportedImageMime(file))
    || file.type === 'application/pdf'
    || file.type === PPTX_MIME
    || file.name.toLowerCase().endsWith('.pptx')
}

export const extractFilePayload = async (file: File, imageDataUrl?: string): Promise<ExtractedFilePayload> => {
  const imageMime = resolveSupportedImageMime(file)

  if (imageMime) {
    return {
      text: '',
      b64: imageDataUrl ? dataUrlToB64(imageDataUrl) : await fileToB64(file),
      mime: imageMime,
    }
  }

  if (file.type === 'application/pdf') {
    return {
      text: await extractPdfText(file),
      b64: null,
      mime: file.type,
    }
  }

  if (file.type === PPTX_MIME || file.name.toLowerCase().endsWith('.pptx')) {
    return {
      text: await extractPptxText(file),
      b64: null,
      mime: PPTX_MIME,
    }
  }

  throw new Error('รองรับเฉพาะ PDF, PPTX, PNG, JPG และ WebP')
}

const fileToB64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const dataUrlToB64 = (dataUrl: string) => dataUrl.split(',')[1] || ''

const extractPdfText = async (file: File) => {
  const [{ GlobalWorkerOptions, getDocument }, pdfWorkerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  GlobalWorkerOptions.workerSrc = pdfWorkerModule.default

  const pdf = await getDocument({ data: await file.arrayBuffer() }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const lines = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .map((item: string) => item.trim())
      .filter(Boolean)

    if (lines.length > 0) {
      pages.push(`Page ${pageNumber}\n${lines.join(' ')}`)
    }
  }

  const text = pages.join('\n\n').trim()

  if (!text) {
    throw new Error('PDF นี้ไม่มีข้อความที่สกัดได้ อาจเป็นไฟล์สแกนภาพล้วน กรุณาอัปโหลดภาพหรือ PDF ที่มีข้อความ')
  }

  return text
}

const extractPptxText = async (file: File) => {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((left, right) => extractSlideNumber(left) - extractSlideNumber(right))

  const parser = new DOMParser()
  const slides = await Promise.all(
    slidePaths.map(async (slidePath, index) => {
      const xml = await zip.file(slidePath)?.async('text')
      if (!xml) return ''

      const doc = parser.parseFromString(xml, 'application/xml')
      const texts = Array.from(doc.getElementsByTagName('*'))
        .filter((node) => node.localName === 't')
        .map((node) => node.textContent?.trim() || '')
        .filter(Boolean)

      if (texts.length === 0) {
        return ''
      }

      return `Slide ${index + 1}\n${texts.join(' ')}`
    })
  )

  const text = slides.filter(Boolean).join('\n\n').trim()

  if (!text) {
    throw new Error('PPTX นี้ไม่มีข้อความที่สกัดได้ กรุณาตรวจสอบว่าไฟล์มีข้อความในสไลด์จริง')
  }

  return text
}

const extractSlideNumber = (path: string) => {
  const match = path.match(/slide(\d+)\.xml$/i)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}
