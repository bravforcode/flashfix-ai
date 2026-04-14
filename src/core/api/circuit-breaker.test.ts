import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CircuitBreaker, CircuitState } from './circuit-breaker'

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker

  beforeEach(() => {
    breaker = new CircuitBreaker(2, 100) // 2 failures, 100ms timeout
  })

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe(CircuitState.CLOSED)
  })

  it('should execute successfully', async () => {
    const action = vi.fn().mockResolvedValue('success')
    const result = await breaker.execute(action)
    expect(result).toBe('success')
    expect(breaker.getState()).toBe(CircuitState.CLOSED)
  })

  it('should open after threshold failures', async () => {
    const action = vi.fn().mockRejectedValue(new Error('fail'))
    
    await expect(breaker.execute(action)).rejects.toThrow('fail')
    await expect(breaker.execute(action)).rejects.toThrow('fail')
    
    expect(breaker.getState()).toBe(CircuitState.OPEN)
    await expect(breaker.execute(action)).rejects.toThrow('Circuit Breaker is OPEN')
  })

  it('should transition to HALF_OPEN after timeout', async () => {
    const action = vi.fn().mockRejectedValue(new Error('fail'))
    
    await expect(breaker.execute(action)).rejects.toThrow('fail')
    await expect(breaker.execute(action)).rejects.toThrow('fail')
    
    expect(breaker.getState()).toBe(CircuitState.OPEN)
    
    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const successAction = vi.fn().mockResolvedValue('recovered')
    const result = await breaker.execute(successAction)
    
    expect(result).toBe('recovered')
    expect(breaker.getState()).toBe(CircuitState.CLOSED)
  })
})
