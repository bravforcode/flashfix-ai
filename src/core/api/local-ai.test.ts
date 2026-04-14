import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { AIService } from './ai'
import { useStore } from '@/core/state/useStore'
import type { Topic } from '@/core/state/store.types'
import { AIConfigurationError } from './ai-providers'

const algebraTopic: Topic = {
  id: 'algebra',
  th: 'พีชคณิต',
  jp: '代数',
  lv: 'easy',
}

const derivativeTopic: Topic = {
  id: 'derivative',
  th: 'อนุพันธ์',
  jp: '微分',
  lv: 'easy',
}

describe('AIService local mode', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useStore.setState({
      provider: 'local',
      apiKey: '',
      topic: null,
      quiz: null,
      answer: '',
      fileName: '',
      fileText: '',
      fileB64: null,
      fileMime: null,
      loading: false,
    })
  })

  it('generates a schema-compliant quiz without any external provider', async () => {
    const quiz = await AIService.generateQuiz(algebraTopic)

    expect(quiz.question).toContain('2x+5=17')
    expect(quiz.answer).toContain('6')
    expect(quiz.difficulty).toBe('easy')
  })

  it('falls back to local mode when a remote provider fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('failed to fetch')))
    useStore.setState({ provider: 'ollama' })

    const quiz = await AIService.generateQuiz(derivativeTopic)

    expect(quiz.question).toContain('3x^2+2x-5')
    expect(quiz.answer).toContain('6x+2')
  })

  it('still works when the built-in anthropic path has no browser key and the proxy is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('proxy offline')))
    useStore.setState({ provider: 'anthropic', apiKey: '' })

    const quiz = await AIService.generateQuiz(algebraTopic)

    expect(quiz.question).toContain('2x+5=17')
    expect(quiz.answer).toContain('6')
  })

  it('throws a configuration error for external providers that require a key', async () => {
    useStore.setState({ provider: 'openai', apiKey: '' })

    await expect(AIService.generateQuiz(algebraTopic)).rejects.toBeInstanceOf(AIConfigurationError)
  })

  it('produces local solution and teach-back evaluation payloads', async () => {
    useStore.setState({
      provider: 'local',
      topic: derivativeTopic,
      quiz: {
        question: 'จงหาอนุพันธ์ของ $f(x)=3x^2+2x-5$',
        answer: "$f'(x)=6x+2$",
        wrongExample: 'ตอบเป็น $6x$',
        difficulty: 'easy',
        hint: 'ใช้กฎยกกำลัง',
      },
      answer: '6x',
    })

    const solution = await AIService.solveQuiz()
    const teachBack = await AIService.evaluateTeachBack('โจทย์นี้ต้องใช้กฎยกกำลัง ดิฟทีละพจน์ และจำไว้ว่าค่าคงที่มีอนุพันธ์เป็นศูนย์')

    expect(solution.isCorrect).toBe(false)
    expect(solution.steps.length).toBeGreaterThan(0)
    expect(teachBack.score).toBeGreaterThanOrEqual(1)
    expect(teachBack.score).toBeLessThanOrEqual(10)
  })

  it('builds local file analysis and flashcards', async () => {
    useStore.setState({
      provider: 'local',
      fileName: 'limits-notes.pdf',
      fileText: 'บทเรียนเรื่องลิมิต การแยกตัวประกอบ และรูปไม่กำหนด 0/0',
      fileB64: null,
      fileMime: null,
    })

    const fileSummary = await AIService.analyzeFile()
    const flashcards = await AIService.generateFlashcards('หัวข้อ: ลิมิต')

    expect(fileSummary.questions).toHaveLength(5)
    expect(fileSummary.topics.length).toBeGreaterThan(0)
    expect(flashcards.flashcards.length).toBeGreaterThanOrEqual(4)
    expect(flashcards.miniQuiz.length).toBeGreaterThanOrEqual(3)
  })

  it('supports image-only file analysis in local mode', async () => {
    useStore.setState({
      provider: 'local',
      fileName: 'geometry-board.png',
      fileText: '',
      fileB64: 'ZmFrZS1pbWFnZQ==',
      fileMime: 'image/png',
    })

    const fileSummary = await AIService.analyzeFile()

    expect(fileSummary.title).toBe('geometry-board.png')
    expect(fileSummary.questions).toHaveLength(5)
  })

  it('fails fast when a non-image upload has no extractable text', async () => {
    useStore.setState({
      provider: 'local',
      fileName: 'empty.pdf',
      fileText: '   ',
      fileB64: null,
      fileMime: 'application/pdf',
    })

    await expect(AIService.analyzeFile()).rejects.toThrow('ไฟล์นี้ยังไม่มีข้อความ')
  })

  it('generates assistant replies in local mode without calling an external model', async () => {
    useStore.setState({ provider: 'local' })

    const response = await AIService.callAI(
      'FlashFix AI Assistant',
      'ช่วยอธิบายลิมิตพร้อมตัวอย่าง',
      z.object({ response: z.string() }),
    )

    expect(response.response).toContain('ลิมิต')
    expect(response.response).toContain('Actionable takeaway')
  })
})
