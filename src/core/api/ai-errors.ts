import { useStore } from '@/core/state/useStore'
import { AIConfigurationError } from './ai-providers'

export const getReadableAIError = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (error instanceof AIConfigurationError) {
    useStore.getState().openApiSettings()
    return error.message
  }

  if (error instanceof Error && error.message) {
    const normalized = error.message.toLowerCase()

    if (normalized.includes('settings')) {
      useStore.getState().openApiSettings()
    }

    if (normalized.includes('invalid x-api-key') || normalized.includes('api key')) {
      return 'API key ของ provider ที่เลือกไม่ถูกต้อง หรือ key ฝั่ง server สำหรับ built-in หมดอายุแล้ว กรุณาตรวจสอบใน Settings'
    }

    if (normalized.includes('timed out')) {
      return 'AI ใช้เวลาตอบนานเกินไป กรุณาลองใหม่อีกครั้ง'
    }

    if (normalized.includes('failed to fetch')) {
      return 'ไม่สามารถเชื่อมต่อกับ AI service ได้ กรุณาตรวจสอบเครือข่ายหรือ config ของ server'
    }

    if (normalized.includes('ollama')) {
      useStore.getState().openApiSettings()
      return error.message
    }

    return error.message
  }

  return fallbackMessage
}
