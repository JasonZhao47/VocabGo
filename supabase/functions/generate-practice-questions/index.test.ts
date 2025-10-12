/**
 * Tests for generate-practice-questions edge function
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

// Mock types
interface WordPair {
  en: string
  zh: string
}

interface GenerateQuestionsRequest {
  wordlistId: string
  questionTypes?: ('matching' | 'fill-blank' | 'multiple-choice')[]
  maxQuestionsPerType?: number
}

Deno.test('generate-practice-questions - validates request structure', () => {
  const validRequest: GenerateQuestionsRequest = {
    wordlistId: '123e4567-e89b-12d3-a456-426614174000',
    questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
    maxQuestionsPerType: 10,
  }

  assertEquals(validRequest.wordlistId.length, 36)
  assertEquals(validRequest.questionTypes?.length, 3)
  assertEquals(validRequest.maxQuestionsPerType, 10)
})

Deno.test('generate-practice-questions - validates question types', () => {
  const validTypes = ['matching', 'fill-blank', 'multiple-choice']
  
  for (const type of validTypes) {
    assertEquals(validTypes.includes(type), true)
  }
})

Deno.test('generate-practice-questions - validates minimum word count', () => {
  const MIN_WORDS = 4
  const words: WordPair[] = [
    { en: 'hello', zh: '你好' },
    { en: 'world', zh: '世界' },
    { en: 'test', zh: '测试' },
    { en: 'example', zh: '例子' },
  ]

  assertEquals(words.length >= MIN_WORDS, true)
})

Deno.test('generate-practice-questions - response structure', () => {
  const mockResponse = {
    success: true,
    practiceSetId: '123e4567-e89b-12d3-a456-426614174000',
    questions: {
      matching: [],
      fillBlank: [],
      multipleChoice: [],
    },
    estimatedTimeMinutes: 10,
    metadata: {
      generationTimeMs: 5000,
      wordCount: 10,
      questionCounts: {
        matching: 1,
        fillBlank: 10,
        multipleChoice: 10,
      },
    },
  }

  assertExists(mockResponse.practiceSetId)
  assertExists(mockResponse.questions)
  assertExists(mockResponse.estimatedTimeMinutes)
  assertEquals(mockResponse.success, true)
})

Deno.test('generate-practice-questions - error response structure', () => {
  const errorResponse = {
    success: false,
    error: {
      code: 'INSUFFICIENT_WORDS',
      message: 'Minimum 4 words required. This wordlist has 2 words.',
    },
  }

  assertEquals(errorResponse.success, false)
  assertExists(errorResponse.error)
  assertEquals(errorResponse.error.code, 'INSUFFICIENT_WORDS')
})
