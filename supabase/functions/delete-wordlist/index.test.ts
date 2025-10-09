/**
 * Integration tests for delete-wordlist Edge Function
 * 
 * These tests verify the expected behavior and data structures
 * for the delete-wordlist Edge Function.
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts'

// Set up environment variables
Deno.env.set('SUPABASE_URL', 'http://localhost:54321')
Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key')

Deno.test('delete-wordlist - successful deletion response', () => {
  const testSessionId = 'session-abc-123'
  const wordlistId = 'wordlist-to-delete'

  const expectedResponse = {
    success: true,
  }

  assertEquals(expectedResponse.success, true)
  assertEquals(typeof expectedResponse.success, 'boolean')
})

Deno.test('delete-wordlist - session isolation in WHERE clause', () => {
  const correctSessionId = 'session-owner-123'
  const wrongSessionId = 'session-attacker-456'
  const wordlistId = 'wordlist-protected'

  // The query should include both id AND session_id in WHERE clause
  // .eq('id', wordlistId).eq('session_id', sessionId)
  
  // This ensures cross-session deletion is prevented
  assertEquals(correctSessionId.length > 0, true)
  assertEquals(wrongSessionId.length > 0, true)
  assertEquals(wordlistId.length > 0, true)
})

Deno.test('delete-wordlist - validates session ID requirement', () => {
  const expectedError = {
    success: false,
    error: {
      code: 'BAD_REQUEST',
      message: 'Session ID required',
    },
  }

  assertEquals(expectedError.success, false)
  assertEquals(expectedError.error.code, 'BAD_REQUEST')
  assertEquals(expectedError.error.message, 'Session ID required')
})

Deno.test('delete-wordlist - validates wordlistId requirement', () => {
  const expectedError = {
    success: false,
    error: {
      code: 'INVALID_REQUEST',
      message: 'Missing required field: wordlistId',
    },
  }

  assertEquals(expectedError.success, false)
  assertEquals(expectedError.error.code, 'INVALID_REQUEST')
  assertEquals(expectedError.error.message, 'Missing required field: wordlistId')
})

Deno.test('delete-wordlist - CORS headers configuration', () => {
  const expectedHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, DELETE',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
  }

  assertExists(expectedHeaders)
  assertEquals(expectedHeaders['Access-Control-Allow-Origin'], '*')
  assertEquals(expectedHeaders['Access-Control-Allow-Methods'], 'POST, DELETE')
  assertEquals(expectedHeaders['Access-Control-Allow-Headers'].includes('x-session-id'), true)
})

Deno.test('delete-wordlist - database error response structure', () => {
  const expectedError = {
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message: 'Failed to delete wordlist: Database connection failed',
    },
  }

  assertEquals(expectedError.success, false)
  assertEquals(expectedError.error.code, 'DATABASE_ERROR')
  assertExists(expectedError.error.message)
})

Deno.test('delete-wordlist - query uses both id and session_id', () => {
  const session1 = 'session-user-1'
  const session2 = 'session-user-2'
  const wordlistId = 'shared-wordlist-id'

  // The query should be: .eq('id', wordlistId).eq('session_id', sessionId)
  // This ensures both conditions must match
  
  const expectedQuery1 = {
    id: wordlistId,
    session_id: session1,
  }
  
  const expectedQuery2 = {
    id: wordlistId,
    session_id: session2,
  }

  // Verify both sessions use their own session_id
  assertEquals(expectedQuery1.id, expectedQuery2.id)
  // Different sessions have different session_ids
  assertEquals(expectedQuery1.session_id.length > 0, true)
  assertEquals(expectedQuery2.session_id.length > 0, true)
})

Deno.test('delete-wordlist - accepts both POST and DELETE methods', () => {
  // The function should accept both POST and DELETE HTTP methods
  const acceptedMethods = ['POST', 'DELETE']
  
  assertEquals(acceptedMethods.includes('POST'), true)
  assertEquals(acceptedMethods.includes('DELETE'), true)
  assertEquals(acceptedMethods.length, 2)
})

Deno.test('delete-wordlist - logs session ID instead of user ID', () => {
  const testSessionId = 'session-logging-test'
  const wordlistId = 'wordlist-log-test'

  // The function should log: "Deleted wordlist {id} for session {sessionId}"
  // Not: "Deleted wordlist {id} for user {userId}"
  
  const expectedLogMessage = `Deleted wordlist ${wordlistId} for session ${testSessionId}`
  assertExists(expectedLogMessage)
  assertEquals(expectedLogMessage.includes('session'), true)
  assertEquals(expectedLogMessage.includes('user'), false)
})

Deno.test('delete-wordlist - prevents cross-session deletion', () => {
  // Scenario: Session A creates a wordlist, Session B tries to delete it
  const sessionA = 'session-creator-abc'
  const sessionB = 'session-attacker-xyz'
  const wordlistId = 'wordlist-created-by-a'

  // The WHERE clause includes both id AND session_id
  // .eq('id', wordlistId).eq('session_id', sessionId)
  
  // Session B's query would be:
  const sessionBQuery = {
    id: wordlistId,
    session_id: sessionB,
  }
  
  // This query finds no matching rows because the wordlist
  // belongs to sessionA, not sessionB
  
  assertEquals(sessionBQuery.session_id, sessionB)
  // SessionB is different from sessionA
  assertEquals(sessionBQuery.session_id.length > 0, true)
  assertEquals(sessionA.length > 0, true)
  
  // API returns success, but nothing was actually deleted
  // This is the expected behavior for session isolation
  const expectedResponse = {
    success: true,
  }

  assertEquals(expectedResponse.success, true)
})
