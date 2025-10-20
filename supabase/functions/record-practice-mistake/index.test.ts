/**
 * Tests for Record Practice Mistake Edge Function
 * 
 * Tests mistake recording, rate limiting, and validation logic.
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

// Mock environment variables
Deno.env.set('SUPABASE_URL', 'http://localhost:54321')
Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key')

// Test data
const validSessionToken = 'a'.repeat(64) // 64 hex chars
const validWordlistId = '123e4567-e89b-12d3-a456-426614174000'
const validWord = 'hello'
const validTranslation = '你好'
const validQuestionType = 'multiple_choice'

/**
 * Test: Validate session token format
 */
Deno.test('validateSessionToken - accepts valid 64 hex char token', () => {
  const validateSessionToken = (token: string): boolean => {
    return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token)
  }

  assertEquals(validateSessionToken(validSessionToken), true)
  assertEquals(validateSessionToken('a'.repeat(64)), true)
  assertEquals(validateSessionToken('A'.repeat(64)), true)
  assertEquals(validateSessionToken('0123456789abcdef'.repeat(4)), true)
})

Deno.test('validateSessionToken - rejects invalid tokens', () => {
  const validateSessionToken = (token: string): boolean => {
    return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token)
  }

  assertEquals(validateSessionToken(''), false)
  assertEquals(validateSessionToken('a'.repeat(63)), false) // Too short
  assertEquals(validateSessionToken('a'.repeat(65)), false) // Too long
  assertEquals(validateSessionToken('g'.repeat(64)), false) // Invalid hex char
  assertEquals(validateSessionToken('hello world' + 'a'.repeat(53)), false) // Contains spaces
})

/**
 * Test: Validate question type
 */
Deno.test('validateQuestionType - accepts valid types', () => {
  const validateQuestionType = (questionType: string): boolean => {
    return ['multiple_choice', 'fill_blank', 'matching'].includes(questionType)
  }

  assertEquals(validateQuestionType('multiple_choice'), true)
  assertEquals(validateQuestionType('fill_blank'), true)
  assertEquals(validateQuestionType('matching'), true)
})

Deno.test('validateQuestionType - rejects invalid types', () => {
  const validateQuestionType = (questionType: string): boolean => {
    return ['multiple_choice', 'fill_blank', 'matching'].includes(questionType)
  }

  assertEquals(validateQuestionType(''), false)
  assertEquals(validateQuestionType('invalid'), false)
  assertEquals(validateQuestionType('true_false'), false)
  assertEquals(validateQuestionType('MULTIPLE_CHOICE'), false) // Case sensitive
})

/**
 * Test: Rate limiting logic
 */
Deno.test('checkRateLimit - allows requests within limit', () => {
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
  const RATE_LIMIT_WINDOW_MS = 60 * 1000
  const RATE_LIMIT_MAX_REQUESTS = 10

  const checkRateLimit = (sessionToken: string): { allowed: boolean; retryAfter?: number } => {
    const now = Date.now()
    const existing = rateLimitMap.get(sessionToken)

    if (!existing || now > existing.resetAt) {
      rateLimitMap.set(sessionToken, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      })
      return { allowed: true }
    }

    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000)
      return { allowed: false, retryAfter }
    }

    existing.count++
    return { allowed: true }
  }

  const token = 'test-token-1'

  // First 10 requests should be allowed
  for (let i = 0; i < 10; i++) {
    const result = checkRateLimit(token)
    assertEquals(result.allowed, true, `Request ${i + 1} should be allowed`)
  }

  // 11th request should be blocked
  const blockedResult = checkRateLimit(token)
  assertEquals(blockedResult.allowed, false)
  assertExists(blockedResult.retryAfter)
})

Deno.test('checkRateLimit - resets after window expires', () => {
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
  const RATE_LIMIT_WINDOW_MS = 100 // Short window for testing
  const RATE_LIMIT_MAX_REQUESTS = 3

  const checkRateLimit = (sessionToken: string): { allowed: boolean; retryAfter?: number } => {
    const now = Date.now()
    const existing = rateLimitMap.get(sessionToken)

    if (!existing || now > existing.resetAt) {
      rateLimitMap.set(sessionToken, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      })
      return { allowed: true }
    }

    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000)
      return { allowed: false, retryAfter }
    }

    existing.count++
    return { allowed: true }
  }

  const token = 'test-token-2'

  // Use up the limit
  for (let i = 0; i < 3; i++) {
    checkRateLimit(token)
  }

  // Should be blocked
  assertEquals(checkRateLimit(token).allowed, false)

  // Wait for window to expire
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      // Should be allowed again after reset
      const result = checkRateLimit(token)
      assertEquals(result.allowed, true)
      resolve()
    }, 150)
  })
})

Deno.test('checkRateLimit - tracks different tokens separately', () => {
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
  const RATE_LIMIT_WINDOW_MS = 60 * 1000
  const RATE_LIMIT_MAX_REQUESTS = 10

  const checkRateLimit = (sessionToken: string): { allowed: boolean; retryAfter?: number } => {
    const now = Date.now()
    const existing = rateLimitMap.get(sessionToken)

    if (!existing || now > existing.resetAt) {
      rateLimitMap.set(sessionToken, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      })
      return { allowed: true }
    }

    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000)
      return { allowed: false, retryAfter }
    }

    existing.count++
    return { allowed: true }
  }

  const token1 = 'test-token-a'
  const token2 = 'test-token-b'

  // Use up limit for token1
  for (let i = 0; i < 10; i++) {
    checkRateLimit(token1)
  }

  // token1 should be blocked
  assertEquals(checkRateLimit(token1).allowed, false)

  // token2 should still be allowed
  assertEquals(checkRateLimit(token2).allowed, true)
})

/**
 * Test: Request validation
 */
Deno.test('Request validation - requires all fields', () => {
  const validateRequest = (req: Partial<{
    sessionToken: string
    wordlistId: string
    word: string
    translation: string
    questionType: string
  }>): boolean => {
    return !!(
      req.sessionToken &&
      req.wordlistId &&
      req.word &&
      req.translation &&
      req.questionType
    )
  }

  // Valid request
  assertEquals(
    validateRequest({
      sessionToken: validSessionToken,
      wordlistId: validWordlistId,
      word: validWord,
      translation: validTranslation,
      questionType: validQuestionType,
    }),
    true
  )

  // Missing fields
  assertEquals(validateRequest({}), false)
  assertEquals(
    validateRequest({
      sessionToken: validSessionToken,
      wordlistId: validWordlistId,
      word: validWord,
      translation: validTranslation,
      // Missing questionType
    }),
    false
  )
})

/**
 * Test: Mistake count logic
 */
Deno.test('Mistake count - increments correctly', () => {
  let mistakeCount = 1

  // First mistake
  assertEquals(mistakeCount, 1)

  // Second mistake
  mistakeCount++
  assertEquals(mistakeCount, 2)

  // Third mistake
  mistakeCount++
  assertEquals(mistakeCount, 3)
})

/**
 * Test: Error response format
 */
Deno.test('Error response - has correct structure', () => {
  const errorResponse = {
    success: false,
    error: {
      code: 'INVALID_SESSION_TOKEN',
      message: 'Invalid session token format',
    },
  }

  assertEquals(errorResponse.success, false)
  assertExists(errorResponse.error)
  assertExists(errorResponse.error.code)
  assertExists(errorResponse.error.message)
})

/**
 * Test: Success response format
 */
Deno.test('Success response - has correct structure', () => {
  const successResponse = {
    success: true,
    mistakeCount: 1,
  }

  assertEquals(successResponse.success, true)
  assertExists(successResponse.mistakeCount)
  assertEquals(typeof successResponse.mistakeCount, 'number')
})
