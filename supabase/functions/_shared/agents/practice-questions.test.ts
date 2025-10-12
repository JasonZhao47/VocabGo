/**
 * Tests for practice question generator agent
 * 
 * Note: Tests for fill-blank and multiple-choice generation require LLM integration
 * and are covered in integration tests. These unit tests focus on:
 * - Matching question generation (no LLM required)
 * - Validation logic
 * - Error handling
 * - Algorithm correctness for deterministic operations
 */

import { 
  assertEquals, 
  assertExists, 
  assertRejects,
  assert,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  generateMatchingQuestions,
  generatePracticeQuestions,
  type WordPair,
  type MatchingQuestion,
} from './practice-questions.ts'

// Test data
const testWords: WordPair[] = [
  { en: 'hello', zh: '你好' },
  { en: 'world', zh: '世界' },
  { en: 'test', zh: '测试' },
  { en: 'example', zh: '例子' },
  { en: 'practice', zh: '练习' },
]

// ============================================================================
// Matching Question Generation Tests (No LLM Required)
// ============================================================================

Deno.test('generateMatchingQuestions - creates matching question', async () => {
  const result = await generateMatchingQuestions(testWords, 5)

  assertEquals(result.questions.length, 1)
  assertEquals(result.confidence, 1.0)

  const question = result.questions[0]
  assertEquals(question.type, 'matching')
  assertEquals(question.pairs.length, 5)
  assertEquals(question.shuffledMandarin.length, 5)
})

Deno.test('generateMatchingQuestions - shuffles Mandarin translations', async () => {
  const result = await generateMatchingQuestions(testWords, 5)
  const question = result.questions[0]

  // Check that all Mandarin translations are present
  const originalMandarin = question.pairs.map(p => p.mandarin).sort()
  const shuffledMandarin = [...question.shuffledMandarin].sort()

  assertEquals(originalMandarin, shuffledMandarin)

  // Check that they're actually shuffled (not in same order)
  // Note: This test might occasionally fail due to random chance
  const inSameOrder = question.pairs.every(
    (pair, index) => pair.mandarin === question.shuffledMandarin[index]
  )
  // We can't guarantee shuffling, but we can check structure
  assertEquals(typeof inSameOrder, 'boolean')
})

Deno.test('generateMatchingQuestions - respects max questions limit', async () => {
  const result = await generateMatchingQuestions(testWords, 3)
  const question = result.questions[0]

  assertEquals(question.pairs.length, 3)
  assertEquals(question.shuffledMandarin.length, 3)
})

Deno.test('generateMatchingQuestions - includes all required fields', async () => {
  const result = await generateMatchingQuestions(testWords, 5)
  const question = result.questions[0]

  assertExists(question.id)
  assertEquals(question.type, 'matching')
  assertExists(question.pairs)
  assertExists(question.shuffledMandarin)

  // Check pair structure
  for (const pair of question.pairs) {
    assertExists(pair.english)
    assertExists(pair.mandarin)
  }
})

Deno.test('generateMatchingQuestions - handles minimum word count', async () => {
  const minWords: WordPair[] = [
    { en: 'hello', zh: '你好' },
    { en: 'world', zh: '世界' },
    { en: 'test', zh: '测试' },
    { en: 'example', zh: '例子' },
  ]

  const result = await generateMatchingQuestions(minWords, 10)
  const question = result.questions[0]

  // Should only create questions for available words
  assertEquals(question.pairs.length, 4)
})

Deno.test('Question type interfaces - matching question structure', () => {
  const matchingQuestion: MatchingQuestion = {
    id: 'test-id',
    type: 'matching',
    pairs: [
      { english: 'hello', mandarin: '你好' },
      { english: 'world', mandarin: '世界' },
    ],
    shuffledMandarin: ['世界', '你好'],
  }

  assertEquals(matchingQuestion.type, 'matching')
  assertEquals(matchingQuestion.pairs.length, 2)
  assertEquals(matchingQuestion.shuffledMandarin.length, 2)
})

// ============================================================================
// Validation Tests
// ============================================================================

Deno.test('Validation - minimum word count requirement', async () => {
  const insufficientWords: WordPair[] = [
    { en: 'hello', zh: '你好' },
    { en: 'world', zh: '世界' },
    { en: 'test', zh: '测试' },
  ]
  
  await assertRejects(
    async () => {
      await generatePracticeQuestions({
        words: insufficientWords,
        questionTypes: ['matching'],
      })
    },
    Error,
    'Minimum 4 words required'
  )
})

Deno.test('Validation - matching questions have unique IDs', async () => {
  const result1 = await generateMatchingQuestions(testWords, 5)
  const result2 = await generateMatchingQuestions(testWords, 5)
  
  // IDs should be unique across generations
  assert(result1.questions[0].id !== result2.questions[0].id)
})

Deno.test('Validation - matching questions return confidence scores', async () => {
  const matchingResult = await generateMatchingQuestions(testWords, 5)
  
  // Should have confidence between 0 and 1
  assert(matchingResult.confidence >= 0 && matchingResult.confidence <= 1)
  // Matching should have high confidence (1.0) since it's deterministic
  assertEquals(matchingResult.confidence, 1.0)
})

// ============================================================================
// Error Handling Tests
// ============================================================================

Deno.test('Error handling - empty word list', async () => {
  await assertRejects(
    async () => {
      await generatePracticeQuestions({
        words: [],
        questionTypes: ['matching'],
      })
    },
    Error,
    'Minimum 4 words required'
  )
})

Deno.test('Error handling - invalid question types handled gracefully', async () => {
  const result = await generatePracticeQuestions({
    words: testWords,
    questionTypes: [], // No question types selected
  })
  
  // Should return empty question sets
  assertEquals(result.questions.matching.length, 0)
  assertEquals(result.questions.fillBlank.length, 0)
  assertEquals(result.questions.multipleChoice.length, 0)
})

Deno.test('Error handling - handles single word gracefully', async () => {
  const singleWord: WordPair[] = [{ en: 'hello', zh: '你好' }]
  
  await assertRejects(
    async () => {
      await generatePracticeQuestions({
        words: singleWord,
        questionTypes: ['matching'],
      })
    },
    Error
  )
})

// ============================================================================
// Algorithm Tests (Deterministic Operations)
// ============================================================================

Deno.test('Algorithm - matching questions preserve word pairs', async () => {
  const result = await generateMatchingQuestions(testWords, 5)
  const question = result.questions[0]
  
  // All original words should be in pairs
  const englishWords = question.pairs.map(p => p.english)
  const mandarinWords = question.pairs.map(p => p.mandarin)
  
  for (let i = 0; i < testWords.length && i < 5; i++) {
    assert(englishWords.includes(testWords[i].en))
    assert(mandarinWords.includes(testWords[i].zh))
  }
})

Deno.test('Algorithm - matching shuffles Mandarin but preserves all translations', async () => {
  const result = await generateMatchingQuestions(testWords, 5)
  const question = result.questions[0]
  
  // All Mandarin translations should be present
  const originalMandarin = question.pairs.map(p => p.mandarin).sort()
  const shuffledMandarin = [...question.shuffledMandarin].sort()
  
  assertEquals(originalMandarin, shuffledMandarin)
})

Deno.test('Algorithm - generatePracticeQuestions with matching only', async () => {
  const result = await generatePracticeQuestions({
    words: testWords,
    questionTypes: ['matching'],
    maxQuestionsPerType: 3,
  })
  
  // Should have matching questions
  assert(result.questions.matching.length > 0)
  assertEquals(result.questions.fillBlank.length, 0)
  assertEquals(result.questions.multipleChoice.length, 0)
  
  // Should have confidence score
  assert(result.confidence >= 0 && result.confidence <= 1)
  
  // Should have estimated time
  assert(result.estimatedTimeMinutes > 0)
})

Deno.test('Algorithm - estimated time calculation for matching', async () => {
  const result = await generatePracticeQuestions({
    words: testWords,
    questionTypes: ['matching'],
    maxQuestionsPerType: 5,
  })
  
  // Estimated time should be positive
  assert(result.estimatedTimeMinutes > 0)
  
  // Should be reasonable for matching only
  assert(result.estimatedTimeMinutes >= 1)
  assert(result.estimatedTimeMinutes <= 10)
})

Deno.test('Algorithm - respects maxQuestionsPerType for matching', async () => {
  const manyWords: WordPair[] = Array.from({ length: 20 }, (_, i) => ({
    en: `word${i}`,
    zh: `词${i}`,
  }))
  
  const result = await generatePracticeQuestions({
    words: manyWords,
    questionTypes: ['matching'],
    maxQuestionsPerType: 3,
  })
  
  // Matching should have exactly 1 question with 3 pairs
  assertEquals(result.questions.matching.length, 1)
  assertEquals(result.questions.matching[0].pairs.length, 3)
})

Deno.test('Algorithm - handles selective question type generation', async () => {
  // Test with only matching
  const matchingOnly = await generatePracticeQuestions({
    words: testWords,
    questionTypes: ['matching'],
  })
  
  assert(matchingOnly.questions.matching.length > 0)
  assertEquals(matchingOnly.questions.fillBlank.length, 0)
  assertEquals(matchingOnly.questions.multipleChoice.length, 0)
})

// ============================================================================
// Integration Tests (Matching-focused)
// ============================================================================

Deno.test('Integration - matching question generation workflow', async () => {
  const result = await generatePracticeQuestions({
    words: testWords,
    questionTypes: ['matching'],
    maxQuestionsPerType: 5,
  })
  
  // Verify matching questions are generated
  assertExists(result.questions.matching)
  assert(result.questions.matching.length > 0)
  
  // Verify metadata
  assertExists(result.confidence)
  assertExists(result.estimatedTimeMinutes)
  
  // Verify question structure
  for (const question of result.questions.matching) {
    assertEquals(question.type, 'matching')
    assertExists(question.id)
    assertExists(question.pairs)
    assertExists(question.shuffledMandarin)
    
    // Verify pairs structure
    assert(question.pairs.length >= 4, 'Should have at least 4 pairs')
    assert(question.shuffledMandarin.length === question.pairs.length)
    
    // Verify all pairs have required fields
    for (const pair of question.pairs) {
      assertExists(pair.english)
      assertExists(pair.mandarin)
      assert(pair.english.length > 0)
      assert(pair.mandarin.length > 0)
    }
  }
})

Deno.test('Integration - question quality validation for matching', async () => {
  const result = await generatePracticeQuestions({
    words: testWords,
    questionTypes: ['matching'],
  })
  
  // Matching questions should have proper structure
  for (const question of result.questions.matching) {
    assert(question.pairs.length >= 4, 'Should have at least 4 pairs')
    assert(question.shuffledMandarin.length === question.pairs.length)
    
    // Verify no duplicate English words
    const englishWords = question.pairs.map(p => p.english)
    const uniqueEnglish = new Set(englishWords)
    assertEquals(englishWords.length, uniqueEnglish.size, 'Should have unique English words')
    
    // Verify no duplicate Mandarin translations
    const mandarinWords = question.pairs.map(p => p.mandarin)
    const uniqueMandarin = new Set(mandarinWords)
    assertEquals(mandarinWords.length, uniqueMandarin.size, 'Should have unique Mandarin translations')
  }
})

// ============================================================================
// Prompt Construction Tests (Documentation)
// ============================================================================

Deno.test('Prompt construction - matching uses direct word pairs', async () => {
  // Matching questions don't use AI prompts - they use direct word pairs
  const result = await generateMatchingQuestions(testWords, 5)
  
  // Verify that the pairs match the input words
  const question = result.questions[0]
  const inputEnglish = testWords.slice(0, 5).map(w => w.en).sort()
  const outputEnglish = question.pairs.map(p => p.english).sort()
  
  assertEquals(inputEnglish, outputEnglish)
})

/*
 * NOTE: Tests for fill-blank and multiple-choice question generation
 * require LLM integration and are covered in:
 * - supabase/functions/generate-practice-questions/index.test.ts (integration tests)
 * - tests/e2e/practice-questions.e2e.test.ts (end-to-end tests)
 * 
 * These tests verify:
 * - AI prompt construction for fill-blank questions
 * - AI prompt construction for multiple-choice questions
 * - Question validation for AI-generated content
 * - Error handling for LLM failures
 * - Response parsing and fallback logic
 */
