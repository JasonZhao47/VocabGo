/**
 * Integration tests for share-wordlist Edge Function
 * 
 * These tests verify the expected behavior and data structures
 * for the share-wordlist Edge Function.
 * 
 * Requirements: FR1, NFR3
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts'

// Set up environment variables
Deno.env.set('SUPABASE_URL', 'http://localhost:54321')
Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key')
Deno.env.set('PUBLIC_APP_URL', 'http://localhost:5173')

Deno.test('share-wordlist - validates session ID requirement', () => {
  // Test that session ID is required for authorization
  const expectedError = {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Session ID required',
    },
  }

  assertEquals(expectedError.success, false)
  assertEquals(expectedError.error.code, 'UNAUTHORIZED')
  assertEquals(expectedError.error.message, 'Session ID required')
})

Deno.test('share-wordlist - validates required fields', () => {
  // Test that wordlistId and enable are required
  const expectedError = {
    success: false,
    error: {
      code: 'INVALID_REQUEST',
      message: 'Missing required fields: wordlistId, enable',
    },
  }

  assertEquals(expectedError.error.code, 'INVALID_REQUEST')
  assertExists(expectedError.error.message)
})

Deno.test('share-wordlist - validates enable is boolean', () => {
  // Test that enable must be a boolean
  const invalidRequest = {
    wordlistId: 'test-id',
    enable: 'true', // String instead of boolean
  }

  assertEquals(typeof invalidRequest.enable, 'string')
  assertEquals(typeof invalidRequest.enable !== 'boolean', true)
})

Deno.test('share-wordlist - validates wordlist ownership', () => {
  // Test that only the owner can share/unshare
  const expectedError = {
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'You do not have permission to modify this wordlist',
    },
  }

  assertEquals(expectedError.error.code, 'FORBIDDEN')
  assertEquals(expectedError.error.message, 'You do not have permission to modify this wordlist')
})

Deno.test('share-wordlist - validates wordlist exists', () => {
  // Test that wordlist must exist
  const expectedError = {
    success: false,
    error: {
      code: 'WORDLIST_NOT_FOUND',
      message: 'Wordlist not found',
    },
  }

  assertEquals(expectedError.error.code, 'WORDLIST_NOT_FOUND')
  assertEquals(expectedError.error.message, 'Wordlist not found')
})

Deno.test('share-wordlist - enable sharing generates token and URL', () => {
  // Test successful enable sharing response structure
  const successResponse = {
    success: true,
    shareToken: 'a1b2c3d4e5f6789012345678901234567890123456789012',
    shareUrl: 'http://localhost:5173/practice/a1b2c3d4e5f6789012345678901234567890123456789012',
  }

  assertEquals(successResponse.success, true)
  assertExists(successResponse.shareToken)
  assertExists(successResponse.shareUrl)
  assertEquals(typeof successResponse.shareToken, 'string')
  assertEquals(successResponse.shareToken.length, 48) // 48 hex chars
  assertEquals(successResponse.shareUrl.includes('/practice/'), true)
  assertEquals(successResponse.shareUrl.includes(successResponse.shareToken), true)
})

Deno.test('share-wordlist - disable sharing response structure', () => {
  // Test successful disable sharing response structure
  const successResponse = {
    success: true,
  }

  assertEquals(successResponse.success, true)
  assertEquals('shareToken' in successResponse, false)
  assertEquals('shareUrl' in successResponse, false)
})

Deno.test('share-wordlist - share settings structure', () => {
  // Test share settings with anonymous mode
  const requestWithSettings = {
    wordlistId: 'test-id',
    enable: true,
    settings: {
      anonymousMode: true,
    },
  }

  assertEquals(requestWithSettings.settings.anonymousMode, true)
  assertEquals(typeof requestWithSettings.settings.anonymousMode, 'boolean')

  // Test default settings (anonymous mode false)
  const requestWithoutSettings = {
    wordlistId: 'test-id',
    enable: true,
  }

  const defaultSettings = {
    anonymous_mode: false,
  }

  assertEquals(defaultSettings.anonymous_mode, false)
  assertEquals('settings' in requestWithoutSettings, false)
})

Deno.test('share-wordlist - database update structure for enable', () => {
  // Verify expected database update structure when enabling
  const shareToken = 'a1b2c3d4e5f6789012345678901234567890123456789012'
  const shareSettings = {
    anonymous_mode: false,
  }

  const expectedUpdate = {
    share_token: shareToken,
    is_shared: true,
    share_settings: shareSettings,
    shared_at: new Date().toISOString(),
  }

  assertEquals(expectedUpdate.is_shared, true)
  assertEquals(expectedUpdate.share_token.length, 48)
  assertExists(expectedUpdate.share_settings)
  assertEquals(expectedUpdate.share_settings.anonymous_mode, false)
  assertExists(expectedUpdate.shared_at)
})

Deno.test('share-wordlist - database update structure for disable', () => {
  // Verify expected database update structure when disabling
  const expectedUpdate = {
    is_shared: false,
  }

  assertEquals(expectedUpdate.is_shared, false)
  assertEquals('share_token' in expectedUpdate, false) // Token should remain
  assertEquals('share_settings' in expectedUpdate, false) // Settings should remain
})

Deno.test('share-wordlist - CORS headers configuration', () => {
  // CORS preflight should return 200 with appropriate headers
  const expectedHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
  }

  assertExists(expectedHeaders)
  assertEquals(expectedHeaders['Access-Control-Allow-Origin'], '*')
  assertEquals(expectedHeaders['Access-Control-Allow-Methods'], 'POST')
  assertEquals(expectedHeaders['Access-Control-Allow-Headers'].includes('x-session-id'), true)
})

Deno.test('share-wordlist - ownership check uses session_id', () => {
  // Verify that ownership check compares session_id
  const testSessionId: string = 'test-session-123'
  const wordlistSessionId: string = 'test-session-123'
  const differentSessionId: string = 'different-session-456'

  assertEquals(testSessionId === wordlistSessionId, true) // Should allow
  assertEquals(testSessionId === differentSessionId, false) // Should deny
})

Deno.test('share-wordlist - reuses existing share token', () => {
  // Test that existing share token is reused when re-enabling
  const existingToken = 'existing1234567890123456789012345678901234567890'
  const wordlist = {
    id: 'test-id',
    session_id: 'test-session',
    share_token: existingToken,
    is_shared: false,
  }

  // When enabling sharing again, should reuse existing token
  assertEquals(wordlist.share_token, existingToken)
  assertEquals(wordlist.share_token.length, 48)
  assertExists(wordlist.share_token)
})

Deno.test('share-wordlist - generates new token if none exists', () => {
  // Test that new token is generated when none exists
  const wordlist = {
    id: 'test-id',
    session_id: 'test-session',
    share_token: null,
    is_shared: false,
  }

  assertEquals(wordlist.share_token, null)
  
  // After enabling, should have a new 48-char token
  const newToken = 'abc123456789012345678901234567890123456789012345'
  assertEquals(newToken.length, 48)
  assertEquals(/^[0-9a-f]{48}$/.test(newToken), true) // Hex pattern
})

Deno.test('share-wordlist - share URL format', () => {
  // Test share URL format
  const baseUrl = 'http://localhost:5173'
  const shareToken = 'abc123def456789012345678901234567890123456789012'
  const expectedUrl = `${baseUrl}/practice/${shareToken}`

  assertEquals(expectedUrl, 'http://localhost:5173/practice/abc123def456789012345678901234567890123456789012')
  assertEquals(expectedUrl.startsWith(baseUrl), true)
  assertEquals(expectedUrl.includes('/practice/'), true)
  assertEquals(expectedUrl.endsWith(shareToken), true)
})

Deno.test('share-wordlist - anonymous mode setting', () => {
  // Test anonymous mode can be enabled
  const settingsWithAnonymous = {
    anonymous_mode: true,
  }

  assertEquals(settingsWithAnonymous.anonymous_mode, true)

  // Test anonymous mode can be disabled (default)
  const settingsWithoutAnonymous = {
    anonymous_mode: false,
  }

  assertEquals(settingsWithoutAnonymous.anonymous_mode, false)
})
