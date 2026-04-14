import { z } from 'zod'
import { useStore } from '@/core/state/useStore'
import { logger } from '@/core/logging/logger'
import { Topic } from '@/core/state/store.types'
import { CircuitBreaker } from './circuit-breaker'
import { AIRequest, AIProvider, AIConfigurationError, AIUserContent, LocalAIProvider, ProxyAIProvider } from './ai-providers'
import { SYSTEM_PROMPTS } from './prompts'

// Re-export schemas (Requirement 12.2)
export const ExamResponseSchema = z.object({
  title: z.string(),
  subject: z.string(),
  summary: z.string(),
  topics: z.array(z.string()),
  questions: z.array(z.object({
    q: z.string(),
    options: z.array(z.string()).length(4),
    correct: z.number().min(0).max(3),
    explain: z.string()
  }))
})

export const QuizResponseSchema = z.object({
  question: z.string(),
  answer: z.string(),
  wrongExample: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  hint: z.string().optional()
})

export const SolutionResponseSchema = z.object({
  isCorrect: z.boolean(),
  errorType: z.string().optional(),
  errorTypeThai: z.string().optional(),
  studentAnswer: z.string().optional(),
  studentMistake: z.string().optional(),
  steps: z.array(z.object({
    num: z.number(),
    title: z.string(),
    math: z.string().optional(),
    explain: z.string()
  })),
  keyRule: z.string().optional(),
  commonTrap: z.string().optional(),
  severity: z.enum(['minor', 'major', 'fundamental']).optional()
})

export const TeachBackEvaluationSchema = z.object({
  score: z.number().min(1).max(10),
  passed: z.boolean(),
  feedback: z.string(),
  conceptGap: z.string().nullable(),
  encouragement: z.string()
})

export const FlashcardSetSchema = z.object({
  flashcards: z.array(z.object({
    front: z.string(),
    back: z.string(),
    rule: z.string().optional(),
    hint: z.string().optional(),
    example: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    color: z.enum(['accent', 'blue', 'purple', 'teal', 'gold']).optional()
  })),
  miniQuiz: z.array(z.object({
    question: z.string(),
    answer: z.string()
  }))
})

// AIService Orchestrator with Circuit Breaker
class AIServiceOrchestrator {
  private static instance: AIServiceOrchestrator
  private breaker: CircuitBreaker

  private constructor() {
    this.breaker = new CircuitBreaker(3, 30000) // 3 failures, 30s timeout
  }

  public static getInstance(): AIServiceOrchestrator {
    if (!AIServiceOrchestrator.instance) {
      AIServiceOrchestrator.instance = new AIServiceOrchestrator()
    }
    return AIServiceOrchestrator.instance
  }

  private getProvider(): AIProvider {
    const { provider, apiKey } = useStore.getState()

    if (provider === 'local') {
      return new LocalAIProvider()
    }

    if (provider !== 'anthropic' && provider !== 'ollama' && !apiKey.trim()) {
      throw new AIConfigurationError('กรุณาใส่ API key ของผู้ให้บริการที่เลือกใน Settings ก่อนใช้งาน')
    }

    return new ProxyAIProvider(provider, apiKey.trim() || undefined)
  }

  /**
   * Core AI Call with Caching and Circuit Breaker
   */
  public async callAI<T>(
    systemPrompt: string, 
    userContent: AIUserContent,
    schema: z.ZodSchema<T>,
    maxTokens = 2000
  ): Promise<T> {
    const { setLoading } = useStore.getState()
    setLoading(true)

    const request: AIRequest = { systemPrompt, userContent, maxTokens }

    try {
      const { dbService } = await import('@/core/services/supabase')

      // 1. Check AI Cache (Requirement 11)
      const promptHash = await this.hashPrompt(systemPrompt + JSON.stringify(userContent))
      const cached = await dbService.getAICache(promptHash)
      
      if (cached) {
        logger.info('Cache Hit!', { promptHash })
        return schema.parse(cached.response)
      }

      // 2. Call AI with Circuit Breaker
      const provider = this.getProvider()
      let result: T

      try {
        result = await this.breaker.execute(() => provider.call(request, schema))
      } catch (error) {
        if (provider.name === 'local' || error instanceof AIConfigurationError) {
          throw error
        }

        logger.warn('Primary AI provider failed. Falling back to local mode.', {
          provider: provider.name,
          error: error instanceof Error ? error.message : String(error),
        })

        result = await new LocalAIProvider().call(request, schema)
      }

      // 3. Store in Cache (Background)
      dbService.setAICache({
        key: promptHash,
        prompt_hash: promptHash,
        response: result,
        ttl: 3600 * 24 * 7 // 1 week
      }).catch((error: unknown) => logger.warn('Failed to save to AI cache', error))

      return result
    } catch (error: unknown) {
      logger.error('AIService Call Error', {
        message: error instanceof Error ? error.message : 'Unknown AI error',
        stack: error instanceof Error ? error.stack : undefined,
        state: this.breaker.getState()
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  private async hashPrompt(text: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Analyze uploaded file content
   */
  async analyzeFile(): Promise<z.infer<typeof ExamResponseSchema>> {
    const { fileB64, fileMime, fileText, fileName } = useStore.getState()
    const system = SYSTEM_PROMPTS.ANALYZE_FILE

    if (fileB64 && fileMime?.startsWith('image/')) {
      const content: AIUserContent = [
        { type: 'image', source: { type: 'base64', media_type: fileMime, data: fileB64 } },
        { type: 'text', text: `Analyze this image-based study material from "${fileName}" and generate a comprehensive learning set.` }
      ]
      return this.callAI(system, content, ExamResponseSchema)
    }

    if (!fileText.trim()) {
      throw new Error('ไฟล์นี้ยังไม่มีข้อความให้นำไปวิเคราะห์ กรุณาอัปโหลด PDF/PPTX ที่มีข้อความ หรือใช้รูปภาพแทน')
    }
    
    return this.callAI(system, `Analyze this text content from "${fileName}" and generate a comprehensive learning set:\n\n${fileText}`, ExamResponseSchema)
  }

  /**
   * Generate a full exam from content
   */
  async generateExam(content: string): Promise<z.infer<typeof ExamResponseSchema>> {
    const system = SYSTEM_PROMPTS.GENERATE_EXAM
    return this.callAI(system, content, ExamResponseSchema)
  }

  /**
   * Generate a single diagnostic quiz question
   */
  async generateQuiz(topic: Topic): Promise<z.infer<typeof QuizResponseSchema>> {
    const system = SYSTEM_PROMPTS.GENERATE_QUIZ(topic.th, topic.jp, topic.lv)
    return this.callAI(system, `หัวข้อ: ${topic.th} (${topic.jp})`, QuizResponseSchema)
  }

  /**
   * Evaluate a student's answer to a quiz
   */
  async solveQuiz(): Promise<z.infer<typeof SolutionResponseSchema>> {
    const { quiz, answer, topic } = useStore.getState()
    const system = SYSTEM_PROMPTS.SOLVE_QUIZ
    const content = `หัวข้อ: ${topic?.th}\nโจทย์: ${quiz?.question}\nเฉลย: ${quiz?.answer}\nคำตอบนักเรียน: ${answer}`
    return this.callAI(system, content, SolutionResponseSchema)
  }

  /**
   * Evaluate a student's teach-back explanation
   */
  async evaluateTeachBack(text: string): Promise<z.infer<typeof TeachBackEvaluationSchema>> {
    const { topic } = useStore.getState()
    const system = SYSTEM_PROMPTS.EVALUATE_TEACHBACK(topic?.th || 'General')
    return this.callAI(system, text, TeachBackEvaluationSchema)
  }

  /**
   * Generate flashcards from content
   */
  async generateFlashcards(content: string): Promise<z.infer<typeof FlashcardSetSchema>> {
    const system = SYSTEM_PROMPTS.GENERATE_FLASHCARDS
    return this.callAI(system, content, FlashcardSetSchema)
  }
}

export const AIService = AIServiceOrchestrator.getInstance()
