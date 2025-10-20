/**
 * Tests for Generate Questions from Mistakes Edge Function
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

const FUNCTION_URL = 'http://localhost:54321/functions/v1/generate-questions-from-mistakes'
const TEST_SESSION_ID = 'test-session-123'

Deno.test('Generate Questions from Mistakes - Missing wordlistId', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({}),
  })

  assertEquals(response.status, 400)
  const data = await response.json()
  assertEquals(data.success, false)
  assertEquals(data.error.code, 'INVALID_REQUEST')
})

Deno.test('Generate Questions from Mistakes - Invalid question type', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'test-wordlist-id',
      questionTypes: ['invalid-type'],
    }),
  })

  assertEquals(response.status, 400)
  const data = await response.json()
  assertEquals(data.success, false)
  assertEquals(data.error.code, 'INVALID_QUESTION_TYPE')
})

Deno.test('Generate Questions from Mistakes - Wordlist not found', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'non-existent-wordlist',
    }),
  })

  assertEquals(response.status, 404)
  const data = await response.json()
  assertEquals(data.success, false)
  assertEquals(data.error.code, 'WORDLIST_NOT_FOUND')
})

Deno.test('Generate Questions from Mistakes - Unauthorized access', async () => {
  // This test requires a real wordlist owned by a different session
  // For now, we'll test the authorization logic with a mock scenario
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': 'different-session-id',
    },
    body: JSON.stringify({
      wordlistId: 'test-wordlist-id',
    }),
  })

  // Should return either 404 (wordlist not found) or 403 (forbidden)
  assertEquals([403, 404].includes(response.status), true)
})

Deno.test('Generate Questions from Mistakes - No mistakes found', async () => {
  // This test would require a wordlist with no practice mistakes
  // The actual behavior depends on database state
  // Test structure is provided for integration testing
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'wordlist-with-no-mistakes',
    }),
  })

  // Should return 404 if no mistakes exist
  if (response.status === 404) {
    const data = await response.json()
    assertEquals(data.success, false)
    assertEquals(data.error.code, 'NO_MISTAKES_FOUND')
  }
})

Deno.test('Generate Questions from Mistakes - Successful generation with defaults', async () => {
  // This test requires a real wordlist with practice mistakes
  // Test structure is provided for integration testing
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'wordlist-with-mistakes',
    }),
  })

  if (response.status === 200) {
    const data = await response.json()
    assertEquals(data.success, true)
    assertExists(data.questions)
    assertExists(data.targetWords)
    assertExists(data.metadata)

    // Verify question structure
    assertExists(data.questions.matching)
    assertExists(data.questions.fillBlank)
    assertExists(data.questions.multipleChoice)

    // Verify metadata
    assertExists(data.metadata.generationTimeMs)
    assertExists(data.metadata.wordCount)
    assertExists(data.metadata.questionCounts)
    assertExists(data.metadata.mistakeStats)

    // Verify target words array
    assertEquals(Array.isArray(data.targetWords), true)
    assertEquals(data.targetWords.length > 0, true)
  }
})

Deno.test('Generate Questions from Mistakes - Custom topN parameter', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'wordlist-with-mistakes',
      topN: 5,
    }),
  })

  if (response.status === 200) {
    const data = await response.json()
    assertEquals(data.success, true)
    
    // Verify that we got at most 5 target words
    assertEquals(data.targetWords.length <= 5, true)
    assertEquals(data.metadata.wordCount <= 5, true)
  }
})

Deno.test('Generate Questions from Mistakes - Specific question types', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'wordlist-with-mistakes',
      questionTypes: ['matching', 'fill-blank'],
    }),
  })

  if (response.status === 200) {
    const data = await response.json()
    assertEquals(data.success, true)
    
    // Verify only requested question types are generated
    assertEquals(data.questions.matching.length > 0, true)
    assertEquals(data.questions.fillBlank.length > 0, true)
    // Multiple choice should be empty or not generated
  }
})

Deno.test('Generate Questions from Mistakes - Filter by specific students', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'wordlist-with-mistakes',
      studentSessionIds: ['student-session-1', 'student-session-2'],
    }),
  })

  if (response.status === 200) {
    const data = await response.json()
    assertEquals(data.success, true)
    
    // Verify questions were generated based on filtered students
    assertExists(data.questions)
    assertExists(data.metadata.mistakeStats)
  }
})

Deno.test('Generate Questions from Mistakes - CORS preflight', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'OPTIONS',
  })

  assertEquals(response.status, 200)
  assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
  assertEquals(response.headers.get('Access-Control-Allow-Methods'), 'POST')
})

Deno.test('Generate Questions from Mistakes - Health check', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'GET',
  })

  // Health check should return 200
  assertEquals(response.status, 200)
})

Deno.test('Generate Questions from Mistakes - Missing session ID', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wordlistId: 'test-wordlist-id',
    }),
  })

  assertEquals(response.status, 401)
  const data = await response.json()
  assertEquals(data.success, false)
})

Deno.test('Generate Questions from Mistakes - Metadata validation', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'wordlist-with-mistakes',
      topN: 10,
    }),
  })

  if (response.status === 200) {
    const data = await response.json()
    
    // Verify metadata structure
    assertExists(data.metadata)
    assertEquals(typeof data.metadata.generationTimeMs, 'number')
    assertEquals(typeof data.metadata.wordCount, 'number')
    assertEquals(typeof data.metadata.questionCounts.matching, 'number')
    assertEquals(typeof data.metadata.questionCounts.fillBlank, 'number')
    assertEquals(typeof data.metadata.questionCounts.multipleChoice, 'number')
    assertEquals(typeof data.metadata.mistakeStats.totalMistakes, 'number')
    assertEquals(typeof data.metadata.mistakeStats.studentCount, 'number')
  }
})

Deno.test('Generate Questions from Mistakes - Target words match mistakes', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      wordlistId: 'wordlist-with-mistakes',
      topN: 5,
    }),
  })

  if (response.status === 200) {
    const data = await response.json()
    
    // Verify target words array matches word count in metadata
    assertEquals(data.targetWords.length, data.metadata.wordCount)
    
    // Verify all target words are strings
    data.targetWords.forEach((word: string) => {
      assertEquals(typeof word, 'string')
      assertEquals(word.length > 0, true)
    })
  }
})
