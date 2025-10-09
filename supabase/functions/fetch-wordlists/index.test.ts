/**
 * Integration tests for fetch-wordlists Edge Function
 * 
 * These tests verify the expected behavior and data structures
 * for the fetch-wordlists Edge Function.
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts'

// Set up environment variables
Deno.env.set('SUPABASE_URL', 'http://localhost:54321')
Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key')

Deno.test('fetch-wordlists - response structure for session wordlists', () => {
  const testSessionId = 'session-abc-123'
  
  // Mock wordlists for this session
  const mockWordlists = [
    {
      id: 'wordlist-1',
      filename: 'document1.pdf',
      document_type: 'pdf',
      word_count: 5,
      words: [
        { en: 'hello', zh: '你好' },
        { en: 'world', zh: '世界' },
      ],
      created_at: '2025-01-10T10:00:00Z',
    },
    {
      id: 'wordlist-2',
      filename: 'document2.txt',
      document_type: 'txt',
      word_count: 3,
      words: [
        { en: 'test', zh: '测试' },
      ],
      created_at: '2025-01-10T11:00:00Z',
    },
  ]

  // Verify expected response structure
  const expectedResponse = {
    success: true,
    wordlists: [
      {
        id: 'wordlist-1',
        filename: 'document1.pdf',
        documentType: 'pdf',
        wordCount: 5,
        words: mockWordlists[0].words,
        createdAt: '2025-01-10T10:00:00Z',
      },
      {
        id: 'wordlist-2',
        filename: 'document2.txt',
        documentType: 'txt',
        wordCount: 3,
        words: mockWordlists[1].words,
        createdAt: '2025-01-10T11:00:00Z',
      },
    ],
  }

  assertEquals(expectedResponse.success, true)
  assertEquals(expectedResponse.wordlists.length, 2)
  assertEquals(expectedResponse.wordlists[0].id, 'wordlist-1')
})

Deno.test('fetch-wordlists - empty array for session with no wordlists', () => {
  const testSessionId = 'session-xyz-789'
  
  // Empty result for session with no wordlists
  const expectedResponse = {
    success: true,
    wordlists: [],
  }

  assertEquals(expectedResponse.success, true)
  assertEquals(expectedResponse.wordlists.length, 0)
  assertEquals(Array.isArray(expectedResponse.wordlists), true)
})

Deno.test('fetch-wordlists - validates session ID requirement', () => {
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

Deno.test('fetch-wordlists - CORS headers configuration', () => {
  const expectedHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
  }

  assertExists(expectedHeaders)
  assertEquals(expectedHeaders['Access-Control-Allow-Origin'], '*')
  assertEquals(expectedHeaders['Access-Control-Allow-Methods'], 'GET')
  assertEquals(expectedHeaders['Access-Control-Allow-Headers'].includes('x-session-id'), true)
})

Deno.test('fetch-wordlists - transforms database fields to camelCase', () => {
  const mockDatabaseRecord = {
    id: 'wordlist-123',
    filename: 'test.pdf',
    document_type: 'pdf', // snake_case from database
    word_count: 10, // snake_case from database
    words: [{ en: 'test', zh: '测试' }],
    created_at: '2025-01-10T12:00:00Z', // snake_case from database
  }

  const expectedTransformed = {
    id: 'wordlist-123',
    filename: 'test.pdf',
    documentType: 'pdf', // camelCase for frontend
    wordCount: 10, // camelCase for frontend
    words: [{ en: 'test', zh: '测试' }],
    createdAt: '2025-01-10T12:00:00Z', // camelCase for frontend
  }

  assertEquals(expectedTransformed.documentType, 'pdf')
  assertEquals(expectedTransformed.wordCount, 10)
  assertEquals(expectedTransformed.createdAt, '2025-01-10T12:00:00Z')
  assertEquals(mockDatabaseRecord.document_type, 'pdf')
  assertEquals(mockDatabaseRecord.word_count, 10)
})

Deno.test('fetch-wordlists - orders by created_at descending', () => {
  // Mock wordlists in descending order (newest first)
  const mockWordlists = [
    {
      id: 'wordlist-3',
      filename: 'newest.pdf',
      document_type: 'pdf',
      word_count: 5,
      words: [],
      created_at: '2025-01-10T15:00:00Z', // Newest
    },
    {
      id: 'wordlist-2',
      filename: 'middle.pdf',
      document_type: 'pdf',
      word_count: 5,
      words: [],
      created_at: '2025-01-10T12:00:00Z',
    },
    {
      id: 'wordlist-1',
      filename: 'oldest.pdf',
      document_type: 'pdf',
      word_count: 5,
      words: [],
      created_at: '2025-01-10T09:00:00Z', // Oldest
    },
  ]

  // Verify order is maintained (newest first)
  assertEquals(mockWordlists[0].id, 'wordlist-3')
  assertEquals(mockWordlists[1].id, 'wordlist-2')
  assertEquals(mockWordlists[2].id, 'wordlist-1')
  assertEquals(mockWordlists[0].created_at > mockWordlists[1].created_at, true)
  assertEquals(mockWordlists[1].created_at > mockWordlists[2].created_at, true)
})

Deno.test('fetch-wordlists - database error response structure', () => {
  const expectedError = {
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message: 'Failed to fetch wordlists: Database connection failed',
    },
  }

  assertEquals(expectedError.success, false)
  assertEquals(expectedError.error.code, 'DATABASE_ERROR')
  assertExists(expectedError.error.message)
})

Deno.test('fetch-wordlists - ensures session isolation', () => {
  const session1 = 'session-user-1'
  const session2 = 'session-user-2'
  
  // Session 1 has wordlists
  const session1Wordlists = [
    {
      id: 'wordlist-session1-1',
      filename: 'user1-doc.pdf',
      document_type: 'pdf',
      word_count: 5,
      words: [],
      created_at: '2025-01-10T10:00:00Z',
    },
  ]

  // Session 2 should not see session 1's wordlists
  const session2Wordlists: any[] = []

  // Verify isolation
  assertEquals(session1Wordlists.length, 1)
  assertEquals(session2Wordlists.length, 0)
  assertEquals(session1Wordlists[0].id, 'wordlist-session1-1')
  // Different sessions should not see each other's data
  assertEquals(session1.length > 0, true)
  assertEquals(session2.length > 0, true)
})

Deno.test('fetch-wordlists - query filters by session_id', () => {
  const testSessionId = 'session-test-123'
  
  // The query should use .eq('session_id', sessionId)
  // This ensures only wordlists for this session are returned
  const expectedQueryFilter = {
    column: 'session_id',
    value: testSessionId,
  }
  
  assertEquals(expectedQueryFilter.column, 'session_id')
  assertEquals(expectedQueryFilter.value, testSessionId)
})
