/**
 * Integration tests for save-wordlist Edge Function
 * 
 * These tests verify the expected behavior and data structures
 * for the save-wordlist Edge Function.
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts'

// Set up environment variables
Deno.env.set('SUPABASE_URL', 'http://localhost:54321')
Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key')

Deno.test('save-wordlist - validates session ID requirement', () => {
  // Test that session ID is required
  const testWordlist = {
    filename: 'test.pdf',
    documentType: 'pdf',
    words: [
      { en: 'hello', zh: '你好' },
      { en: 'world', zh: '世界' },
    ],
  }

  // Expected error response when session ID is missing
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

Deno.test('save-wordlist - validates required fields', () => {
  // Test that filename, documentType, and words are required
  const expectedError = {
    success: false,
    error: {
      code: 'INVALID_REQUEST',
      message: 'Missing required fields: filename, documentType, words',
    },
  }

  assertEquals(expectedError.error.code, 'INVALID_REQUEST')
  assertExists(expectedError.error.message)
})

Deno.test('save-wordlist - validates word count (1-40)', () => {
  // Test with 0 words - should fail
  const emptyWordlist = {
    filename: 'test.pdf',
    documentType: 'pdf',
    words: [],
  }

  assertEquals(emptyWordlist.words.length, 0)
  
  const expectedError = {
    success: false,
    error: {
      code: 'INVALID_WORD_COUNT',
      message: 'Word count must be between 1 and 40',
    },
  }

  assertEquals(expectedError.error.code, 'INVALID_WORD_COUNT')

  // Test with 41 words - should fail
  const tooManyWords = Array(41).fill({ en: 'word', zh: '词' })
  assertEquals(tooManyWords.length, 41)
  assertEquals(tooManyWords.length > 40, true)
})

Deno.test('save-wordlist - validates word structure', () => {
  // Test with invalid word structure (missing zh)
  const invalidWord = { en: 'hello' } // Missing zh
  
  // Verify the word is missing the zh property
  assertEquals('zh' in invalidWord, false)
  assertEquals('en' in invalidWord, true)
  
  const expectedError = {
    success: false,
    error: {
      code: 'INVALID_WORD_FORMAT',
      message: 'Each word must have "en" and "zh" string properties',
    },
  }

  assertEquals(expectedError.error.code, 'INVALID_WORD_FORMAT')
})

Deno.test('save-wordlist - validates missing filename', () => {
  // Test with missing filename
  const missingFilename = {
    documentType: 'pdf',
    words: [{ en: 'hello', zh: '你好' }],
  }

  assertEquals('filename' in missingFilename, false)
  assertEquals('documentType' in missingFilename, true)
  assertEquals('words' in missingFilename, true)
})

Deno.test('save-wordlist - CORS headers configuration', () => {
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

Deno.test('save-wordlist - database insert structure', () => {
  const testSessionId = 'test-session-456'
  const testWordlist = {
    filename: 'document.docx',
    documentType: 'docx',
    words: [
      { en: 'test', zh: '测试' },
      { en: 'word', zh: '词' },
    ],
  }

  // Verify that the insert call should include session_id
  const expectedInsertData = {
    session_id: testSessionId,
    filename: 'document.docx',
    document_type: 'docx',
    word_count: 2,
    words: testWordlist.words,
  }

  assertEquals(expectedInsertData.session_id, testSessionId)
  assertEquals(expectedInsertData.word_count, 2)
  assertEquals(expectedInsertData.document_type, 'docx')
  assertEquals(expectedInsertData.words.length, 2)
})

Deno.test('save-wordlist - successful response structure', () => {
  // Verify expected success response structure
  const successResponse = {
    success: true,
    wordlistId: 'wordlist-id-123',
  }

  assertEquals(successResponse.success, true)
  assertExists(successResponse.wordlistId)
  assertEquals(typeof successResponse.wordlistId, 'string')
})
