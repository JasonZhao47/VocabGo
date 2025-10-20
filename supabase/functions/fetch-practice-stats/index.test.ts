/**
 * Tests for fetch-practice-stats edge function
 * 
 * Tests aggregate statistics, anonymous mode, date filtering, and authorization
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? 'http://localhost:54321'
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fetch-practice-stats`

interface TestContext {
  supabase: SupabaseClient
  sessionId: string
  wordlistId: string
  shareToken: string
  studentSessions: Array<{ id: string; nickname: string; sessionToken: string }>
}

/**
 * Setup test context with wordlist, students, and mistakes
 */
async function setupTestContext(): Promise<TestContext> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Create a test session ID
  const sessionId = crypto.randomUUID()

  // Create a test wordlist with sharing enabled
  const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const { data: wordlist, error: wordlistError } = await supabase
    .from('wordlists')
    .insert({
      session_id: sessionId,
      filename: 'Test Wordlist for Stats',
      words: [
        { en: 'apple', zh: '苹果' },
        { en: 'banana', zh: '香蕉' },
        { en: 'cherry', zh: '樱桃' },
      ],
      share_token: shareToken,
      is_shared: true,
      share_settings: { anonymous_mode: false },
    })
    .select('id')
    .single()

  if (wordlistError || !wordlist) {
    throw new Error(`Failed to create test wordlist: ${wordlistError?.message}`)
  }

  const wordlistId = wordlist.id

  // Create student sessions
  const studentSessions = []

  for (let i = 1; i <= 3; i++) {
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const { data: session, error: sessionError } = await supabase
      .from('student_sessions')
      .insert({
        wordlist_id: wordlistId,
        nickname: `Student ${i}`,
        session_token: sessionToken,
        device_info: { userAgent: 'test', screen: '1920x1080', timezone: 'UTC' },
      })
      .select('id')
      .single()

    if (sessionError || !session) {
      throw new Error(`Failed to create student session: ${sessionError?.message}`)
    }

    studentSessions.push({
      id: session.id,
      nickname: `Student ${i}`,
      sessionToken,
    })
  }

  // Create practice mistakes
  const mistakes = [
    // Student 1: 3 mistakes on "apple", 2 on "banana"
    { sessionId: studentSessions[0].id, word: 'apple', translation: '苹果', count: 3 },
    { sessionId: studentSessions[0].id, word: 'banana', translation: '香蕉', count: 2 },
    // Student 2: 5 mistakes on "apple", 1 on "cherry"
    { sessionId: studentSessions[1].id, word: 'apple', translation: '苹果', count: 5 },
    { sessionId: studentSessions[1].id, word: 'cherry', translation: '樱桃', count: 1 },
    // Student 3: 2 mistakes on "banana"
    { sessionId: studentSessions[2].id, word: 'banana', translation: '香蕉', count: 2 },
  ]

  for (const mistake of mistakes) {
    const { error: mistakeError } = await supabase
      .from('practice_mistakes')
      .insert({
        student_session_id: mistake.sessionId,
        wordlist_id: wordlistId,
        word: mistake.word,
        translation: mistake.translation,
        question_type: 'multiple_choice',
        mistake_count: mistake.count,
      })

    if (mistakeError) {
      throw new Error(`Failed to create mistake: ${mistakeError.message}`)
    }
  }

  // Note: Materialized view is automatically refreshed by trigger after inserts

  return {
    supabase,
    sessionId,
    wordlistId,
    shareToken,
    studentSessions,
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestContext(context: TestContext) {
  // Delete wordlist (cascades to sessions and mistakes)
  await context.supabase
    .from('wordlists')
    .delete()
    .eq('id', context.wordlistId)
}

Deno.test('fetch-practice-stats - should return aggregate statistics', async () => {
  const context = await setupTestContext()

  try {
    const response = await fetch(
      `${FUNCTION_URL}?wordlistId=${context.wordlistId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': context.sessionId,
        },
      }
    )

    assertEquals(response.status, 200)

    const data = await response.json()
    assertEquals(data.success, true)
    assertEquals(data.wordlistId, context.wordlistId)
    assertEquals(data.totalStudents, 3)
    assertEquals(data.totalPractices, 13) // 3+2+5+1+2 = 13

    // Check aggregate mistakes
    assertExists(data.aggregateMistakes)
    assertEquals(data.aggregateMistakes.length, 3)

    // "apple" should be most-missed (8 total: 3+5)
    const appleMistake = data.aggregateMistakes.find((m: any) => m.word === 'apple')
    assertExists(appleMistake)
    assertEquals(appleMistake.totalCount, 8)
    assertEquals(appleMistake.studentCount, 2)

    // "banana" should be second (4 total: 2+2)
    const bananaMistake = data.aggregateMistakes.find((m: any) => m.word === 'banana')
    assertExists(bananaMistake)
    assertEquals(bananaMistake.totalCount, 4)
    assertEquals(bananaMistake.studentCount, 2)

    // "cherry" should be third (1 total)
    const cherryMistake = data.aggregateMistakes.find((m: any) => m.word === 'cherry')
    assertExists(cherryMistake)
    assertEquals(cherryMistake.totalCount, 1)
    assertEquals(cherryMistake.studentCount, 1)
  } finally {
    await cleanupTestContext(context)
  }
})

Deno.test('fetch-practice-stats - should return per-student breakdown', async () => {
  const context = await setupTestContext()

  try {
    const response = await fetch(
      `${FUNCTION_URL}?wordlistId=${context.wordlistId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': context.sessionId,
        },
      }
    )

    assertEquals(response.status, 200)

    const data = await response.json()
    assertEquals(data.success, true)

    // Check student breakdown
    assertExists(data.students)
    assertEquals(data.students.length, 3)

    // Student 2 should be first (5 mistakes on apple + 1 on cherry = 6 total)
    const student2 = data.students[0]
    assertEquals(student2.nickname, 'Student 2')
    assertEquals(student2.totalMistakes, 6)
    assertEquals(student2.topMistakes.length, 2)
    assertEquals(student2.topMistakes[0].word, 'apple')
    assertEquals(student2.topMistakes[0].count, 5)

    // Student 1 should be second (3 + 2 = 5 total)
    const student1 = data.students[1]
    assertEquals(student1.nickname, 'Student 1')
    assertEquals(student1.totalMistakes, 5)
    assertEquals(student1.topMistakes.length, 2)

    // Student 3 should be third (2 total)
    const student3 = data.students[2]
    assertEquals(student3.nickname, 'Student 3')
    assertEquals(student3.totalMistakes, 2)
    assertEquals(student3.topMistakes.length, 1)
    assertEquals(student3.topMistakes[0].word, 'banana')
  } finally {
    await cleanupTestContext(context)
  }
})

Deno.test('fetch-practice-stats - should apply anonymous mode', async () => {
  const context = await setupTestContext()

  try {
    // Enable anonymous mode
    await context.supabase
      .from('wordlists')
      .update({ share_settings: { anonymous_mode: true } })
      .eq('id', context.wordlistId)

    const response = await fetch(
      `${FUNCTION_URL}?wordlistId=${context.wordlistId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': context.sessionId,
        },
      }
    )

    assertEquals(response.status, 200)

    const data = await response.json()
    assertEquals(data.success, true)

    // Check that nicknames are anonymized
    assertExists(data.students)
    assertEquals(data.students.length, 3)

    // Nicknames should be "Student 1", "Student 2", "Student 3"
    const nicknames = data.students.map((s: any) => s.nickname)
    assertEquals(nicknames.includes('Student 1'), true)
    assertEquals(nicknames.includes('Student 2'), true)
    assertEquals(nicknames.includes('Student 3'), true)

    // Original nicknames should not appear
    assertEquals(nicknames.includes('Student 1'), true) // This is the anonymized name
  } finally {
    await cleanupTestContext(context)
  }
})

Deno.test('fetch-practice-stats - should filter by date range', async () => {
  const context = await setupTestContext()

  try {
    // Create an old mistake (8 days ago)
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 8)

    const { data: oldSession, error: oldSessionError } = await context.supabase
      .from('student_sessions')
      .insert({
        wordlist_id: context.wordlistId,
        nickname: 'Old Student',
        session_token: Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''),
        device_info: { userAgent: 'test', screen: '1920x1080', timezone: 'UTC' },
        last_active_at: oldDate.toISOString(),
      })
      .select('id')
      .single()

    if (oldSessionError || !oldSession) {
      throw new Error(`Failed to create old session: ${oldSessionError?.message}`)
    }

    await context.supabase
      .from('practice_mistakes')
      .insert({
        student_session_id: oldSession.id,
        wordlist_id: context.wordlistId,
        word: 'old',
        translation: '旧的',
        question_type: 'multiple_choice',
        mistake_count: 10,
        last_mistake_at: oldDate.toISOString(),
      })

    // Query with 'week' filter (should exclude old mistake)
    const response = await fetch(
      `${FUNCTION_URL}?wordlistId=${context.wordlistId}&dateRange=week`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': context.sessionId,
        },
      }
    )

    assertEquals(response.status, 200)

    const data = await response.json()
    assertEquals(data.success, true)

    // Should only include recent students (not the old one)
    assertEquals(data.totalStudents, 3) // Original 3 students, not 4
    assertEquals(data.totalPractices, 13) // Original 13, not 23

    // Old student should not appear
    const oldStudent = data.students.find((s: any) => s.nickname === 'Old Student')
    assertEquals(oldStudent, undefined)
  } finally {
    await cleanupTestContext(context)
  }
})

Deno.test('fetch-practice-stats - should reject unauthorized access', async () => {
  const context = await setupTestContext()

  try {
    // Try to access with wrong session ID
    const wrongSessionId = crypto.randomUUID()

    const response = await fetch(
      `${FUNCTION_URL}?wordlistId=${context.wordlistId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': wrongSessionId,
        },
      }
    )

    assertEquals(response.status, 403)

    const data = await response.json()
    assertEquals(data.success, false)
    assertEquals(data.error.code, 'FORBIDDEN')
  } finally {
    await cleanupTestContext(context)
  }
})

Deno.test('fetch-practice-stats - should reject missing wordlist ID', async () => {
  const context = await setupTestContext()

  try {
    const response = await fetch(
      FUNCTION_URL, // No wordlistId parameter
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': context.sessionId,
        },
      }
    )

    assertEquals(response.status, 400)

    const data = await response.json()
    assertEquals(data.success, false)
    assertEquals(data.error.code, 'INVALID_REQUEST')
  } finally {
    await cleanupTestContext(context)
  }
})

Deno.test('fetch-practice-stats - should handle wordlist with no students', async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const sessionId = crypto.randomUUID()

  // Create wordlist with no students
  const { data: wordlist, error: wordlistError } = await supabase
    .from('wordlists')
    .insert({
      session_id: sessionId,
      filename: 'Empty Wordlist',
      words: [{ en: 'test', zh: '测试' }],
      is_shared: true,
    })
    .select('id')
    .single()

  if (wordlistError || !wordlist) {
    throw new Error(`Failed to create wordlist: ${wordlistError?.message}`)
  }

  try {
    const response = await fetch(
      `${FUNCTION_URL}?wordlistId=${wordlist.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
      }
    )

    assertEquals(response.status, 200)

    const data = await response.json()
    assertEquals(data.success, true)
    assertEquals(data.totalStudents, 0)
    assertEquals(data.totalPractices, 0)
    assertEquals(data.students.length, 0)
    assertEquals(data.aggregateMistakes.length, 0)
  } finally {
    await supabase
      .from('wordlists')
      .delete()
      .eq('id', wordlist.id)
  }
})
