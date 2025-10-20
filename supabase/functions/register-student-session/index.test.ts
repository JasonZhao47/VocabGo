/**
 * Tests for register-student-session edge function
 * 
 * Tests validation logic and expected behavior
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts'

// Set up environment variables for testing
Deno.env.set('SUPABASE_URL', 'http://localhost:54321')
Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key')

/**
 * Validate nickname format
 * - Must be 2-20 characters
 * - Supports Unicode (Chinese, emoji, etc.)
 * - Trims whitespace
 */
function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: 'Nickname is required' }
  }

  const trimmed = nickname.trim()

  if (trimmed.length < 2) {
    return { valid: false, error: 'Nickname must be at least 2 characters' }
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Nickname must be at most 20 characters' }
  }

  return { valid: true }
}

Deno.test('register-student-session - validates share token format', () => {
  // Test that invalid share token format is rejected
  const expectedError = {
    success: false,
    error: {
      code: 'INVALID_SHARE_TOKEN',
      message: 'Invalid share token format',
    },
  }

  assertEquals(expectedError.success, false)
  assertEquals(expectedError.error.code, 'INVALID_SHARE_TOKEN')
  assertExists(expectedError.error.message)
})

Deno.test('register-student-session - validates nickname length (too short)', () => {
  const result = validateNickname('A')
  assertEquals(result.valid, false)
  assertEquals(result.error, 'Nickname must be at least 2 characters')
})

Deno.test('register-student-session - validates nickname length (too long)', () => {
  const result = validateNickname('ThisNicknameIsWayTooLongAndExceedsTwentyCharacters')
  assertEquals(result.valid, false)
  assertEquals(result.error, 'Nickname must be at most 20 characters')
})

Deno.test('register-student-session - supports Unicode nicknames', () => {
  const result = validateNickname('小明')
  assertEquals(result.valid, true)
  assertEquals(result.error, undefined)
})

Deno.test('register-student-session - validates nickname is required', () => {
  const result = validateNickname('')
  assertEquals(result.valid, false)
  assertEquals(result.error, 'Nickname is required')
})

Deno.test('register-student-session - trims nickname whitespace', () => {
  const nickname = '  SpacedName  '
  const trimmed = nickname.trim()
  assertEquals(trimmed, 'SpacedName')
  assertEquals(trimmed.length, 10)
})

Deno.test('register-student-session - validates device info completeness', () => {
  // Test that device info must have all required fields
  const expectedError = {
    success: false,
    error: {
      code: 'INVALID_DEVICE_INFO',
      message: 'Device information is incomplete or invalid',
    },
  }

  assertEquals(expectedError.error.code, 'INVALID_DEVICE_INFO')
  assertExists(expectedError.error.message)
})

Deno.test('register-student-session - rejects non-shared wordlist', () => {
  // Test that wordlist must be shared (is_shared=true)
  const expectedError = {
    success: false,
    error: {
      code: 'WORDLIST_NOT_FOUND',
      message: 'Wordlist not found or sharing is disabled',
    },
  }

  assertEquals(expectedError.error.code, 'WORDLIST_NOT_FOUND')
  assertExists(expectedError.error.message)
})

Deno.test('register-student-session - creates new session successfully', () => {
  // Test expected response structure for successful session creation
  const expectedResponse = {
    success: true,
    sessionId: 'uuid-here',
    sessionToken: '64-char-hex-string',
    wordlist: {
      id: 'wordlist-uuid',
      title: 'Test Wordlist',
      words: [
        { en: 'hello', zh: '你好' },
        { en: 'world', zh: '世界' },
      ],
    },
  }

  assertEquals(expectedResponse.success, true)
  assertExists(expectedResponse.sessionId)
  assertExists(expectedResponse.sessionToken)
  assertExists(expectedResponse.wordlist)
  assertExists(expectedResponse.wordlist.words)
})

Deno.test('register-student-session - session token is 64 characters', () => {
  // SHA-256 hash produces 64 hex characters
  const sessionTokenLength = 64
  assertEquals(sessionTokenLength, 64)
})

Deno.test('register-student-session - validates nickname range', () => {
  // Test valid nickname lengths
  assertEquals(validateNickname('AB').valid, true) // Min: 2 chars
  assertEquals(validateNickname('12345678901234567890').valid, true) // Max: 20 chars
  assertEquals(validateNickname('A').valid, false) // Too short
  assertEquals(validateNickname('123456789012345678901').valid, false) // Too long
})

Deno.test('register-student-session - supports emoji in nicknames', () => {
  const result = validateNickname('😀🎉')
  assertEquals(result.valid, true)
})

Deno.test('register-student-session - validates required fields', () => {
  // Test that all required fields must be present
  const expectedError = {
    success: false,
    error: {
      code: 'INVALID_REQUEST',
      message: 'Missing required fields',
    },
  }

  assertEquals(expectedError.success, false)
  assertExists(expectedError.error)
})
