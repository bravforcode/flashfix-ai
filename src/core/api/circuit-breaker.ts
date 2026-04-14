import { logger } from '@/core/logging/logger'

export enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureThreshold: number = 3
  private failureCount: number = 0
  private resetTimeout: number = 30000 // 30 seconds
  private lastFailureTime: number = 0

  constructor(threshold?: number, timeout?: number) {
    if (threshold) this.failureThreshold = threshold
    if (timeout) this.resetTimeout = timeout
  }

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN
        logger.info('Circuit Breaker entering HALF_OPEN state')
      } else {
        throw new Error('Circuit Breaker is OPEN. Service is currently unavailable.')
      }
    }

    try {
      const result = await action()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error)
      throw error
    }
  }

  private onSuccess() {
    this.failureCount = 0
    if (this.state !== CircuitState.CLOSED) {
      this.state = CircuitState.CLOSED
      logger.info('Circuit Breaker entering CLOSED state (Success)')
    }
  }

  private onFailure(error: unknown) {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN
      logger.error('Circuit Breaker entering OPEN state', {
        failureCount: this.failureCount,
        error: error instanceof Error ? error.message : error
      })
    }
  }

  public getState(): CircuitState {
    return this.state
  }
}
