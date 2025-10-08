/**
 * LLM Retry Logic
 * Implements exponential backoff retry strategy
 */

import { getLLMConfig } from './config.ts'
import { LLMError, LLMErrorCode } from './types.ts'

const config = getLLMConfig()

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableErrors: LLMErrorCode[]
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: config.maxRetries,
  baseDelayMs: config.baseDelayMs,
  maxDelayMs: config.maxDelayMs,
  backoffMultiplier: config.backoffMultiplier,
  retryableErrors: [
    LLMErrorCode.TIMEOUT,
    LLMErrorCode.RATE_LIMIT,
    LLMErrorCode.NETWORK_ERROR,
    LLMErrorCode.API_ERROR, // Only if marked as retryable
  ],
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt)
  return Math.min(delay, config.maxDelayMs)
}

/**
 * Check if error is retryable
 */
function isRetryable(error: unknown, config: RetryConfig): boolean {
  if (!(error instanceof LLMError)) {
    return false
  }

  // Check if error code is in retryable list
  if (!config.retryableErrors.includes(error.code)) {
    return false
  }

  // Check error's own retryable flag
  return error.retryable
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  let lastError: unknown

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if this is the last attempt
      if (attempt === config.maxRetries) {
        break
      }

      // Check if error is retryable
      if (!isRetryable(error, config)) {
        throw error
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, config)
      
      console.log(
        `Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`,
        error instanceof LLMError ? { code: error.code, message: error.message } : error
      )

      await sleep(delay)
    }
  }

  // All retries exhausted
  throw lastError
}
