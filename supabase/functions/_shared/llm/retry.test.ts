/**
 * Unit tests for LLM retry logic
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { withRetry, DEFAULT_RETRY_CONFIG } from './retry.ts'
import { LLMError, LLMErrorCode } from './types.ts'

Deno.test('withRetry - succeeds on first attempt', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    return 'success'
  }

  const result = await withRetry(fn)
  
  assertEquals(result, 'success')
  assertEquals(callCount, 1)
})

Deno.test('withRetry - retries on retryable error and succeeds', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    if (callCount < 3) {
      throw new LLMError(LLMErrorCode.TIMEOUT, 'Timeout', true)
    }
    return 'success after retries'
  }

  const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 })
  
  assertEquals(result, 'success after retries')
  assertEquals(callCount, 3)
})

Deno.test('withRetry - exhausts retries and throws last error', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    throw new LLMError(LLMErrorCode.TIMEOUT, 'Persistent timeout', true)
  }

  await assertRejects(
    async () => await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 }),
    LLMError,
    'Persistent timeout'
  )
  
  // Should try initial + 2 retries = 3 total attempts
  assertEquals(callCount, 3)
})

Deno.test('withRetry - does not retry non-retryable errors', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    throw new LLMError(LLMErrorCode.TOKEN_LIMIT_EXCEEDED, 'Token limit', false)
  }

  await assertRejects(
    async () => await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 }),
    LLMError,
    'Token limit'
  )
  
  // Should only try once since error is not retryable
  assertEquals(callCount, 1)
})

Deno.test('withRetry - does not retry non-LLMError errors', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    throw new Error('Regular error')
  }

  await assertRejects(
    async () => await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 }),
    Error,
    'Regular error'
  )
  
  // Should only try once
  assertEquals(callCount, 1)
})

Deno.test('withRetry - retries RATE_LIMIT errors', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    if (callCount === 1) {
      throw new LLMError(LLMErrorCode.RATE_LIMIT, 'Rate limited', true)
    }
    return 'success'
  }

  const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 })
  
  assertEquals(result, 'success')
  assertEquals(callCount, 2)
})

Deno.test('withRetry - retries NETWORK_ERROR errors', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    if (callCount === 1) {
      throw new LLMError(LLMErrorCode.NETWORK_ERROR, 'Network failed', true)
    }
    return 'success'
  }

  const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 })
  
  assertEquals(result, 'success')
  assertEquals(callCount, 2)
})

Deno.test('withRetry - retries API_ERROR when marked retryable', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    if (callCount === 1) {
      throw new LLMError(LLMErrorCode.API_ERROR, 'Server error', true)
    }
    return 'success'
  }

  const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 })
  
  assertEquals(result, 'success')
  assertEquals(callCount, 2)
})

Deno.test('withRetry - does not retry API_ERROR when not retryable', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    throw new LLMError(LLMErrorCode.API_ERROR, 'Client error', false)
  }

  await assertRejects(
    async () => await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 }),
    LLMError,
    'Client error'
  )
  
  assertEquals(callCount, 1)
})

Deno.test('withRetry - applies exponential backoff', async () => {
  let callCount = 0
  const delays: number[] = []
  let lastTime = Date.now()
  
  const fn = async () => {
    const now = Date.now()
    if (callCount > 0) {
      delays.push(now - lastTime)
    }
    lastTime = now
    callCount++
    
    if (callCount < 4) {
      throw new LLMError(LLMErrorCode.TIMEOUT, 'Timeout', true)
    }
    return 'success'
  }

  await withRetry(fn, {
    maxRetries: 3,
    baseDelayMs: 100,
    backoffMultiplier: 2,
    maxDelayMs: 10000,
  })
  
  assertEquals(callCount, 4)
  assertEquals(delays.length, 3)
  
  // First delay should be ~100ms
  assertEquals(delays[0] >= 100, true)
  assertEquals(delays[0] < 150, true)
  
  // Second delay should be ~200ms (100 * 2^1)
  assertEquals(delays[1] >= 200, true)
  assertEquals(delays[1] < 250, true)
  
  // Third delay should be ~400ms (100 * 2^2)
  assertEquals(delays[2] >= 400, true)
  assertEquals(delays[2] < 450, true)
})

Deno.test('withRetry - respects maxDelayMs cap', async () => {
  let callCount = 0
  const delays: number[] = []
  let lastTime = Date.now()
  
  const fn = async () => {
    const now = Date.now()
    if (callCount > 0) {
      delays.push(now - lastTime)
    }
    lastTime = now
    callCount++
    
    if (callCount < 4) {
      throw new LLMError(LLMErrorCode.TIMEOUT, 'Timeout', true)
    }
    return 'success'
  }

  await withRetry(fn, {
    maxRetries: 3,
    baseDelayMs: 1000,
    backoffMultiplier: 10,
    maxDelayMs: 500, // Cap at 500ms
  })
  
  // All delays should be capped at 500ms
  for (const delay of delays) {
    assertEquals(delay >= 500, true)
    assertEquals(delay < 550, true) // Allow small overhead
  }
})

Deno.test('withRetry - uses default config when not provided', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    if (callCount === 1) {
      throw new LLMError(LLMErrorCode.TIMEOUT, 'Timeout', true)
    }
    return 'success'
  }

  const result = await withRetry(fn)
  
  assertEquals(result, 'success')
  assertEquals(callCount, 2)
})

Deno.test('withRetry - merges partial config with defaults', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    throw new LLMError(LLMErrorCode.TIMEOUT, 'Timeout', true)
  }

  await assertRejects(
    async () => await withRetry(fn, { maxRetries: 1 }), // Only override maxRetries
    LLMError
  )
  
  // Should try initial + 1 retry = 2 attempts
  assertEquals(callCount, 2)
})

Deno.test('withRetry - handles mixed error types', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    
    if (callCount === 1) {
      // First: retryable error
      throw new LLMError(LLMErrorCode.TIMEOUT, 'Timeout', true)
    } else if (callCount === 2) {
      // Second: another retryable error
      throw new LLMError(LLMErrorCode.NETWORK_ERROR, 'Network', true)
    }
    
    return 'success'
  }

  const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 })
  
  assertEquals(result, 'success')
  assertEquals(callCount, 3)
})

Deno.test('withRetry - stops retrying when non-retryable error occurs', async () => {
  let callCount = 0
  
  const fn = async () => {
    callCount++
    
    if (callCount === 1) {
      // First: retryable error
      throw new LLMError(LLMErrorCode.TIMEOUT, 'Timeout', true)
    } else if (callCount === 2) {
      // Second: non-retryable error
      throw new LLMError(LLMErrorCode.TOKEN_LIMIT_EXCEEDED, 'Token limit', false)
    }
    
    return 'success'
  }

  await assertRejects(
    async () => await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 }),
    LLMError,
    'Token limit'
  )
  
  // Should stop after second attempt (non-retryable error)
  assertEquals(callCount, 2)
})
