/**
 * Unit tests for share token generation and validation
 */

import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import {
  generateShareToken,
  validateShareToken,
  assertValidShareToken,
} from './shareToken.ts'

Deno.test('generateShareToken - generates 48 character token', () => {
  const token = generateShareToken()
  assertEquals(token.length, 48)
})

Deno.test('generateShareToken - generates hexadecimal characters only', () => {
  const token = generateShareToken()
  const hexPattern = /^[0-9a-f]{48}$/
  assertEquals(hexPattern.test(token), true)
})

Deno.test('generateShareToken - generates unique tokens', () => {
  const tokens = new Set<string>()
  const iterations = 1000
  
  for (let i = 0; i < iterations; i++) {
    tokens.add(generateShareToken())
  }
  
  // All tokens should be unique
  assertEquals(tokens.size, iterations)
})

Deno.test('generateShareToken - tokens have sufficient entropy', () => {
  const token = generateShareToken()
  
  // Check that not all characters are the same (basic entropy check)
  const uniqueChars = new Set(token.split(''))
  assertEquals(uniqueChars.size > 10, true, 'Token should have diverse characters')
})

Deno.test('validateShareToken - accepts valid 48-char hex token', () => {
  const validToken = 'a1b2c3d4e5f6789012345678901234567890abcdef123456'
  assertEquals(validateShareToken(validToken), true)
})

Deno.test('validateShareToken - accepts generated tokens', () => {
  const token = generateShareToken()
  assertEquals(validateShareToken(token), true)
})

Deno.test('validateShareToken - rejects empty string', () => {
  assertEquals(validateShareToken(''), false)
})

Deno.test('validateShareToken - rejects null', () => {
  assertEquals(validateShareToken(null as any), false)
})

Deno.test('validateShareToken - rejects undefined', () => {
  assertEquals(validateShareToken(undefined as any), false)
})

Deno.test('validateShareToken - rejects non-string types', () => {
  assertEquals(validateShareToken(123 as any), false)
  assertEquals(validateShareToken({} as any), false)
  assertEquals(validateShareToken([] as any), false)
})

Deno.test('validateShareToken - rejects token too short', () => {
  const shortToken = 'a1b2c3d4e5f6789012345678901234567890abcdef12345'
  assertEquals(shortToken.length, 47)
  assertEquals(validateShareToken(shortToken), false)
})

Deno.test('validateShareToken - rejects token too long', () => {
  const longToken = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567'
  assertEquals(longToken.length, 49)
  assertEquals(validateShareToken(longToken), false)
})

Deno.test('validateShareToken - rejects non-hexadecimal characters', () => {
  const invalidToken = 'g1b2c3d4e5f6789012345678901234567890abcdef123456'
  assertEquals(validateShareToken(invalidToken), false)
})

Deno.test('validateShareToken - rejects uppercase hex characters', () => {
  const uppercaseToken = 'A1B2C3D4E5F6789012345678901234567890ABCDEF123456'
  assertEquals(validateShareToken(uppercaseToken), false)
})

Deno.test('validateShareToken - rejects tokens with spaces', () => {
  const tokenWithSpace = 'a1b2c3d4e5f6789012345678901234567890abcdef12345 '
  assertEquals(validateShareToken(tokenWithSpace), false)
})

Deno.test('validateShareToken - rejects tokens with special characters', () => {
  const tokenWithSpecial = 'a1b2c3d4e5f6789012345678901234567890abcdef12345-'
  assertEquals(validateShareToken(tokenWithSpecial), false)
})

Deno.test('assertValidShareToken - does not throw for valid token', () => {
  const validToken = generateShareToken()
  assertValidShareToken(validToken)
  // Should not throw
})

Deno.test('assertValidShareToken - throws for invalid token', () => {
  assertThrows(
    () => assertValidShareToken('invalid'),
    Error,
    'Invalid share token format'
  )
})

Deno.test('assertValidShareToken - throws for empty token', () => {
  assertThrows(
    () => assertValidShareToken(''),
    Error,
    'Invalid share token format'
  )
})

Deno.test('assertValidShareToken - throws with descriptive message', () => {
  assertThrows(
    () => assertValidShareToken('short'),
    Error,
    'Expected 48 hexadecimal characters'
  )
})

Deno.test('generateShareToken - consistent format across multiple calls', () => {
  const tokens = Array.from({ length: 100 }, () => generateShareToken())
  
  // All tokens should pass validation
  for (const token of tokens) {
    assertEquals(validateShareToken(token), true)
  }
})

Deno.test('generateShareToken - no predictable patterns', () => {
  const token1 = generateShareToken()
  const token2 = generateShareToken()
  
  // Tokens should not share common prefixes or suffixes
  const commonPrefix = token1.slice(0, 10) === token2.slice(0, 10)
  const commonSuffix = token1.slice(-10) === token2.slice(-10)
  
  assertEquals(commonPrefix, false, 'Tokens should not have predictable prefixes')
  assertEquals(commonSuffix, false, 'Tokens should not have predictable suffixes')
})

Deno.test('validateShareToken - edge case: all zeros', () => {
  const allZeros = '0'.repeat(48)
  assertEquals(validateShareToken(allZeros), true, 'All zeros is technically valid hex')
})

Deno.test('validateShareToken - edge case: all f characters', () => {
  const allFs = 'f'.repeat(48)
  assertEquals(validateShareToken(allFs), true, 'All f characters is valid hex')
})

Deno.test('validateShareToken - mixed valid hex characters', () => {
  const mixedToken = '0123456789abcdef0123456789abcdef0123456789abcdef'
  assertEquals(validateShareToken(mixedToken), true)
})
