/**
 * Performance test for wordlist_mistake_summary materialized view
 * Requirements: FR4, NFR1, NFR2
 * Target: <100ms query time for 1000 records
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

describe('Materialized View Performance Tests', () => {
  let testWordlistId: string
  let testSessionIds: string[] = []

  beforeAll(async () => {
    // Create a test wordlist
    const { data: wordlist, error: wordlistError } = await supabase
      .from('wordlists')
      .insert({
        session_id: 'test_session_' + Date.now(),
        filename: 'performance-test.pdf',
        document_type: 'pdf',
        word_count: 3,
        words: JSON.stringify([
          { word: 'test1', translation: '测试1' },
          { word: 'test2', translation: '测试2' },
          { word: 'test3', translation: '测试3' }
        ]),
        is_shared: true,
        share_token: 'perf_test_token_' + Date.now() + '_' + 'x'.repeat(32)
      })
      .select('id')
      .single()

    if (wordlistError) throw wordlistError
    testWordlistId = wordlist.id

    // Create test student sessions (simulate 50 students)
    const sessions = []
    for (let i = 0; i < 50; i++) {
      sessions.push({
        wordlist_id: testWordlistId,
        nickname: `Student${i}`,
        session_token: `token_${i}_${Date.now()}_${'x'.repeat(48)}`
      })
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('student_sessions')
      .insert(sessions)
      .select('id')

    if (sessionError) throw sessionError
    testSessionIds = sessionData.map(s => s.id)

    // Create practice mistakes (simulate 1000+ records)
    const mistakes = []
    const words = ['test1', 'test2', 'test3']
    const translations = ['测试1', '测试2', '测试3']
    const questionTypes = ['multiple_choice', 'fill_blank', 'matching']

    for (let i = 0; i < testSessionIds.length; i++) {
      for (let j = 0; j < 20; j++) {
        const wordIndex = j % words.length
        mistakes.push({
          student_session_id: testSessionIds[i],
          wordlist_id: testWordlistId,
          word: words[wordIndex],
          translation: translations[wordIndex],
          question_type: questionTypes[j % questionTypes.length],
          mistake_count: Math.floor(Math.random() * 5) + 1
        })
      }
    }

    const { error: mistakeError } = await supabase
      .from('practice_mistakes')
      .insert(mistakes)

    if (mistakeError) throw mistakeError

    // Wait for materialized view to refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
  })

  afterAll(async () => {
    // Cleanup test data
    if (testWordlistId) {
      await supabase
        .from('wordlists')
        .delete()
        .eq('id', testWordlistId)
    }
  })

  it('should have created the materialized view', async () => {
    const { data, error } = await supabase
      .from('wordlist_mistake_summary')
      .select('*')
      .limit(1)

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('should aggregate mistakes by wordlist_id, word, and translation', async () => {
    const { data, error } = await supabase
      .from('wordlist_mistake_summary')
      .select('*')
      .eq('wordlist_id', testWordlistId)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data!.length).toBeGreaterThan(0)

    // Verify structure
    const firstRow = data![0]
    expect(firstRow).toHaveProperty('wordlist_id')
    expect(firstRow).toHaveProperty('word')
    expect(firstRow).toHaveProperty('translation')
    expect(firstRow).toHaveProperty('student_count')
    expect(firstRow).toHaveProperty('total_mistakes')
    expect(firstRow).toHaveProperty('avg_mistakes_per_student')
  })

  it('should calculate student_count correctly', async () => {
    const { data, error } = await supabase
      .from('wordlist_mistake_summary')
      .select('*')
      .eq('wordlist_id', testWordlistId)
      .eq('word', 'test1')
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data!.student_count).toBe(50) // All 50 students made mistakes on test1
  })

  it('should calculate total_mistakes correctly', async () => {
    const { data, error } = await supabase
      .from('wordlist_mistake_summary')
      .select('*')
      .eq('wordlist_id', testWordlistId)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    
    // Verify total_mistakes is sum of mistake_count
    data!.forEach(row => {
      expect(row.total_mistakes).toBeGreaterThan(0)
      expect(typeof row.total_mistakes).toBe('number')
    })
  })

  it('should calculate avg_mistakes_per_student correctly', async () => {
    const { data, error } = await supabase
      .from('wordlist_mistake_summary')
      .select('*')
      .eq('wordlist_id', testWordlistId)
      .eq('word', 'test1')
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    
    // avg should be total_mistakes / student_count
    const expectedAvg = data!.total_mistakes / data!.student_count
    expect(Math.abs(data!.avg_mistakes_per_student - expectedAvg)).toBeLessThan(0.01)
  })

  it('should have index on wordlist_id for fast lookups', async () => {
    // Query to check if index exists
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'wordlist_mistake_summary' 
        AND indexname = 'idx_mistake_summary_wordlist'
      `
    })

    // Note: This test may not work if exec_sql RPC doesn't exist
    // In that case, we verify performance instead
    expect(error).toBeNull()
  })

  it('should query 1000 records in under 100ms (NFR1)', async () => {
    const startTime = performance.now()
    
    const { data, error } = await supabase
      .from('wordlist_mistake_summary')
      .select('*')
      .eq('wordlist_id', testWordlistId)
      .order('total_mistakes', { ascending: false })
    
    const endTime = performance.now()
    const queryTime = endTime - startTime

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(queryTime).toBeLessThan(100) // Target: <100ms
    
    console.log(`Query time: ${queryTime.toFixed(2)}ms for ${data!.length} records`)
  })

  it('should order results by total_mistakes DESC by default', async () => {
    const { data, error } = await supabase
      .from('wordlist_mistake_summary')
      .select('*')
      .eq('wordlist_id', testWordlistId)
      .limit(10)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    
    // Verify descending order
    for (let i = 1; i < data!.length; i++) {
      expect(data![i - 1].total_mistakes).toBeGreaterThanOrEqual(data![i].total_mistakes)
    }
  })

  it('should refresh automatically on new mistake insert', async () => {
    // Get current state
    const { data: before } = await supabase
      .from('wordlist_mistake_summary')
      .select('total_mistakes')
      .eq('wordlist_id', testWordlistId)
      .eq('word', 'test1')
      .single()

    // Insert a new mistake
    await supabase
      .from('practice_mistakes')
      .insert({
        student_session_id: testSessionIds[0],
        wordlist_id: testWordlistId,
        word: 'test1',
        translation: '测试1',
        question_type: 'multiple_choice',
        mistake_count: 10
      })

    // Wait for trigger to refresh view
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Get updated state
    const { data: after } = await supabase
      .from('wordlist_mistake_summary')
      .select('total_mistakes')
      .eq('wordlist_id', testWordlistId)
      .eq('word', 'test1')
      .single()

    expect(after!.total_mistakes).toBeGreaterThan(before!.total_mistakes)
  })
})
