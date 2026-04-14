/**
 * Form validation utilities
 * Provides comprehensive input validation for the application
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate file size (max 50MB for math documents)
 */
export const validateFileSize = (size: number, maxMB: number = 50): ValidationResult => {
  const maxBytes = maxMB * 1024 * 1024
  if (size > maxBytes) {
    return { valid: false, error: `File must be smaller than ${maxMB}MB` }
  }
  return { valid: true }
}

/**
 * Validate file type
 */
export const validateFileType = (mimeType: string): ValidationResult => {
  const allowed = [
    'application/pdf',
    'text/plain',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/webp',
  ]
  
  if (!allowed.includes(mimeType)) {
    return { valid: false, error: 'File type not supported. Use PDF, TXT, PPT, images, etc.' }
  }
  return { valid: true }
}

/**
 * Validate math question content
 */
export const validateMathQuestion = (content: string): ValidationResult => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Question cannot be empty' }
  }
  
  if (content.length < 5) {
    return { valid: false, error: 'Question too short' }
  }
  
  if (content.length > 2000) {
    return { valid: false, error: 'Question too long (max 2000 characters)' }
  }
  
  return { valid: true }
}

/**
 * Validate learning answer / teach-back response
 */
export const validateAnswer = (answer: string): ValidationResult => {
  if (!answer || answer.trim().length === 0) {
    return { valid: false, error: 'Answer cannot be empty' }
  }
  
  if (answer.length < 10) {
    return { valid: false, error: 'Answer too short (min 10 characters for meaningful feedback)' }
  }
  
  if (answer.length > 5000) {
    return { valid: false, error: 'Answer too long (max 5000 characters)' }
  }
  
  return { valid: true }
}

/**
 * Validate topic selection
 */
export const validateTopic = (topic: string): ValidationResult => {
  const valid_topics = [
    'derivative',
    'integral',
    'limit',
    'trigonometry',
    'algebra',
    'probability',
    'geometry',
    'statistics',
  ]
  
  if (!topic || !valid_topics.includes(topic)) {
    return { valid: false, error: 'Invalid topic selected' }
  }
  
  return { valid: true }
}

/**
 * Validate text input length
 */
export const validateTextLength = (text: string, min: number = 3, max: number = 1000): ValidationResult => {
  if (!text || text.trim().length < min) {
    return { valid: false, error: `Text must be at least ${min} characters` }
  }
  
  if (text.length > max) {
    return { valid: false, error: `Text cannot exceed ${max} characters` }
  }
  
  return { valid: true }
}

/**
 * Sanitize and validate numeric input
 */
export const validateNumber = (value: unknown, min: number = 0, max: number = 100): ValidationResult => {
  const num = Number(value)
  
  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' }
  }
  
  if (num < min || num > max) {
    return { valid: false, error: `Value must be between ${min} and ${max}` }
  }
  
  return { valid: true }
}

/**
 * Batch validation
 */
export const validateBatch = (
  validations: Array<() => ValidationResult>
): ValidationResult => {
  for (const validate of validations) {
    const result = validate()
    if (!result.valid) {
      return result
    }
  }
  return { valid: true }
}
