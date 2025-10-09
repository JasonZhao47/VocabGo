/**
 * Unit tests for Extractor Agent
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { stub } from 'https://deno.land/std@0.208.0/testing/mock.ts'
import { extract } from './extractor.ts'
import type { ExtractorInput } from './types.ts'
import type { GLMAPIResponse } from '../llm/types.ts'

// Setup environment variables for tests
Deno.env.set('GLM_API_KEY', 'test-api-key')
Deno.env.set('GLM_API_URL', 'https://test-api.example.com/v1/chat')
Deno.env.set('GLM_MODEL', 'glm-4-flash')
Deno.env.set('GLM_TIMEOUT_MS', '5000')

// Helper to create mock API response
function createMockAPIResponse(content: string): GLMAPIResponse {
  return {
    id: 'test-id-123',
    created: Date.now(),
    model: 'glm-4-flash',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content,
      },
      finish_reason: 'stop',
    }],
    usage: {
      prompt_tokens: 50,
      completion_tokens: 50,
      total_tokens: 100,
    },
  }
}

// Test: Basic word extraction
Deno.test('extract - extracts words from clean text', async () => {
  const mockWords = ['algorithm', 'database', 'network', 'security', 'protocol']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'This is a document about computer networks and database algorithms.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 5)
    assertEquals(result.words, mockWords)
    assertEquals(result.confidence >= 0.85, true)
    assertEquals(result.confidence <= 0.99, true)
    assertEquals(typeof result.filteredCount, 'number')
  } finally {
    fetchStub.restore()
  }
})

// Test: Respects maxWords limit
Deno.test('extract - respects maxWords limit', async () => {
  const mockWords = Array.from({ length: 50 }, (_, i) => `word${i}`)
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'A long document with many words.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 40)
    assertEquals(result.filteredCount, 10)
  } finally {
    fetchStub.restore()
  }
})

// Test: Filters out stop words
Deno.test('extract - filters out stop words', async () => {
  const mockWords = ['the', 'algorithm', 'and', 'database', 'is', 'network', 'of', 'security']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text here.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.includes('the'), false)
    assertEquals(result.words.includes('and'), false)
    assertEquals(result.words.includes('is'), false)
    assertEquals(result.words.includes('of'), false)
    assertEquals(result.words.includes('algorithm'), true)
    assertEquals(result.words.includes('database'), true)
    assertEquals(result.filteredCount, 4)
  } finally {
    fetchStub.restore()
  }
})

// Test: Removes duplicates
Deno.test('extract - removes duplicate words', async () => {
  const mockWords = ['algorithm', 'database', 'algorithm', 'network', 'database', 'security']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text here.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 4)
    const uniqueWords = new Set(result.words)
    assertEquals(uniqueWords.size, result.words.length)
    assertEquals(result.filteredCount, 2)
  } finally {
    fetchStub.restore()
  }
})

// Test: Filters non-alphabetic words
Deno.test('extract - filters non-alphabetic words', async () => {
  const mockWords = ['algorithm', '123', 'data-base', 'network', 'test@email', 'security']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text here.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.includes('algorithm'), true)
    assertEquals(result.words.includes('network'), true)
    assertEquals(result.words.includes('security'), true)
    assertEquals(result.words.includes('123'), false)
    assertEquals(result.words.includes('data-base'), false)
  } finally {
    fetchStub.restore()
  }
})

// Test: Converts to lowercase
Deno.test('extract - converts words to lowercase', async () => {
  const mockWords = ['Algorithm', 'DATABASE', 'Network', 'SECURITY']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text here.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words, ['algorithm', 'database', 'network', 'security'])
  } finally {
    fetchStub.restore()
  }
})

// Test: Empty text edge case
Deno.test('extract - handles empty text', async () => {
  const mockResponse = createMockAPIResponse('')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: '',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 0)
    assertEquals(result.confidence >= 0.85, true)
  } finally {
    fetchStub.restore()
  }
})

// Test: Very short text
Deno.test('extract - handles very short text with few words', async () => {
  const mockWords = ['algorithm', 'database']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'A short text.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 2)
    assertEquals(result.words, mockWords)
  } finally {
    fetchStub.restore()
  }
})

// Test: Non-English text
Deno.test('extract - handles non-English text gracefully', async () => {
  const mockWords = ['中文', '日本語', 'español']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: '这是中文文本。これは日本語です。Este es español.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Only 'español' has pure alphabetic chars
    assertEquals(result.words.length, 1)
    assertEquals(result.words[0], 'español')
  } finally {
    fetchStub.restore()
  }
})

// Test: Special characters in text
Deno.test('extract - handles special characters', async () => {
  const mockWords = ['algorithm', 'database', 'network']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Text with @#$% special !@# characters &*().',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 3)
    assertEquals(result.words, mockWords)
  } finally {
    fetchStub.restore()
  }
})

// Test: Malformed LLM response
Deno.test('extract - handles malformed LLM response', async () => {
  const mockResponse = createMockAPIResponse('word1\n\n\nword2\n   \nword3   \n\n')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 3)
    assertEquals(result.words, ['word1', 'word2', 'word3'])
  } finally {
    fetchStub.restore()
  }
})

// Test: LLM error handling
Deno.test('extract - throws error when LLM fails', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.reject(new Error('Network error'))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    await assertRejects(
      async () => await extract(input),
      Error,
      'Failed to extract words'
    )
  } finally {
    fetchStub.restore()
  }
})

// Test: Confidence calculation
Deno.test('extract - calculates confidence correctly', async () => {
  const mockWords = ['algorithm', 'database', 'network', 'security', 'protocol']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.confidence >= 0.95, true)
  } finally {
    fetchStub.restore()
  }
})

// Test: Lower confidence with many filtered words
Deno.test('extract - lower confidence when many words filtered', async () => {
  const mockWords = [
    'algorithm', 'the', 'and', 'database', 'is', 'of',
    '123', 'network', 'test@', 'security', 'was', 'been'
  ]
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.filteredCount > 5, true)
    assertEquals(result.confidence >= 0.85, true)
  } finally {
    fetchStub.restore()
  }
})

// Test: Large document handling
Deno.test('extract - handles large documents', async () => {
  const mockWords = Array.from({ length: 40 }, (_, i) => `vocabulary${i}`)
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const largeText = Array.from({ length: 1000 }, (_, i) => 
      `Paragraph ${i} with various content and vocabulary.`
    ).join(' ')

    const input: ExtractorInput = {
      cleanedText: largeText,
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 40)
    assertEquals(result.confidence >= 0.85, true)
  } finally {
    fetchStub.restore()
  }
})

// Test: Empty lines in LLM response
Deno.test('extract - filters empty lines from LLM response', async () => {
  const mockResponse = createMockAPIResponse('\n\nalgorithm\n\n\ndatabase\n\n')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 2)
    assertEquals(result.words, ['algorithm', 'database'])
  } finally {
    fetchStub.restore()
  }
})
