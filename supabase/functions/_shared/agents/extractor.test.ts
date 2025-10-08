/**
 * Unit tests for Extractor Agent
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { stub } from 'https://deno.land/std@0.208.0/testing/mock.ts'
import { extract } from './extractor.ts'
import type { ExtractorInput, ExtractorOutput } from './types.ts'
import type { LLMResponse } from '../llm/types.ts'

// Helper to create mock LLM response
function createMockLLMResponse(words: string[]): LLMResponse {
  return {
    content: words.join('\n'),
    tokensUsed: 100,
    latency: 150,
    model: 'glm-4-flash',
  }
}

// Test: Basic word extraction
Deno.test('extract - extracts words from clean text', async () => {
  const mockWords = ['algorithm', 'database', 'network', 'security', 'protocol']
  const mockResponse = createMockLLMResponse(mockWords)
  
  // Mock the LLM service
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
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
    callLLMStub.restore()
  }
})

// Test: Respects maxWords limit
Deno.test('extract - respects maxWords limit', async () => {
  // Generate 50 words but maxWords is 40
  const mockWords = Array.from({ length: 50 }, (_, i) => `word${i}`)
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'A long document with many words.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Should return exactly 40 words
    assertEquals(result.words.length, 40)
    assertEquals(result.filteredCount, 10) // 50 - 40 = 10 filtered
  } finally {
    callLLMStub.restore()
  }
})

// Test: Filters out stop words
Deno.test('extract - filters out stop words', async () => {
  const mockWords = ['the', 'algorithm', 'and', 'database', 'is', 'network', 'of', 'security']
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text here.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Should filter out stop words: 'the', 'and', 'is', 'of'
    assertEquals(result.words.includes('the'), false)
    assertEquals(result.words.includes('and'), false)
    assertEquals(result.words.includes('is'), false)
    assertEquals(result.words.includes('of'), false)
    
    // Should keep content words
    assertEquals(result.words.includes('algorithm'), true)
    assertEquals(result.words.includes('database'), true)
    assertEquals(result.words.includes('network'), true)
    assertEquals(result.words.includes('security'), true)
    
    assertEquals(result.filteredCount, 4) // 4 stop words filtered
  } finally {
    callLLMStub.restore()
  }
})

// Test: Removes duplicates
Deno.test('extract - removes duplicate words', async () => {
  const mockWords = ['algorithm', 'database', 'algorithm', 'network', 'database', 'security']
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text here.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Should have unique words only
    assertEquals(result.words.length, 4)
    assertEquals(result.words.includes('algorithm'), true)
    assertEquals(result.words.includes('database'), true)
    assertEquals(result.words.includes('network'), true)
    assertEquals(result.words.includes('security'), true)
    
    // Check no duplicates
    const uniqueWords = new Set(result.words)
    assertEquals(uniqueWords.size, result.words.length)
    
    assertEquals(result.filteredCount, 2) // 2 duplicates filtered
  } finally {
    callLLMStub.restore()
  }
})

// Test: Filters non-alphabetic words
Deno.test('extract - filters non-alphabetic words', async () => {
  const mockWords = ['algorithm', '123', 'data-base', 'network', 'test@email', 'security']
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text here.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Should only include pure alphabetic words
    assertEquals(result.words.includes('algorithm'), true)
    assertEquals(result.words.includes('network'), true)
    assertEquals(result.words.includes('security'), true)
    
    // Should filter out non-alphabetic
    assertEquals(result.words.includes('123'), false)
    assertEquals(result.words.includes('data-base'), false)
    assertEquals(result.words.includes('test@email'), false)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Converts to lowercase
Deno.test('extract - converts words to lowercase', async () => {
  const mockWords = ['Algorithm', 'DATABASE', 'Network', 'SECURITY']
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text here.',
      maxWords: 40,
    }

    const result = await extract(input)

    // All words should be lowercase
    assertEquals(result.words, ['algorithm', 'database', 'network', 'security'])
  } finally {
    callLLMStub.restore()
  }
})

// Test: Empty text edge case
Deno.test('extract - handles empty text', async () => {
  const mockResponse = createMockLLMResponse([])
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
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
    callLLMStub.restore()
  }
})

// Test: Very short text
Deno.test('extract - handles very short text with few words', async () => {
  const mockWords = ['algorithm', 'database']
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'A short text.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Should return fewer than maxWords if text is short
    assertEquals(result.words.length, 2)
    assertEquals(result.words, mockWords)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Non-English text
Deno.test('extract - handles non-English text gracefully', async () => {
  const mockWords = ['中文', '日本語', 'español']
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: '这是中文文本。これは日本語です。Este es español.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Non-alphabetic words should be filtered out
    assertEquals(result.words.length, 1) // Only 'español' has alphabetic chars
    assertEquals(result.words[0], 'español')
  } finally {
    callLLMStub.restore()
  }
})

// Test: Special characters in text
Deno.test('extract - handles special characters', async () => {
  const mockWords = ['algorithm', 'database', 'network']
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Text with @#$% special !@# characters &*().',
      maxWords: 40,
    }

    const result = await extract(input)

    // Should extract words normally despite special characters
    assertEquals(result.words.length, 3)
    assertEquals(result.words, mockWords)
  } finally {
    callLLMStub.restore()
  }
})

// Test: LLM returns malformed response
Deno.test('extract - handles malformed LLM response', async () => {
  const mockResponse: LLMResponse = {
    content: 'word1\n\n\nword2\n   \nword3   \n\n',
    tokensUsed: 50,
    latency: 100,
    model: 'glm-4-flash',
  }
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Should handle extra whitespace and empty lines
    assertEquals(result.words.length, 3)
    assertEquals(result.words, ['word1', 'word2', 'word3'])
  } finally {
    callLLMStub.restore()
  }
})

// Test: LLM error handling
Deno.test('extract - throws error when LLM fails', async () => {
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.reject(new Error('LLM service unavailable'))
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
    callLLMStub.restore()
  }
})

// Test: Confidence calculation
Deno.test('extract - calculates confidence correctly', async () => {
  // High quality: all valid words
  const mockWords = ['algorithm', 'database', 'network', 'security', 'protocol']
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    const result = await extract(input)

    // High confidence when all words are valid
    assertEquals(result.confidence >= 0.95, true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Lower confidence with many filtered words
Deno.test('extract - lower confidence when many words filtered', async () => {
  // Mix of valid and invalid words
  const mockWords = [
    'algorithm', 'the', 'and', 'database', 'is', 'of',
    '123', 'network', 'test@', 'security', 'was', 'been'
  ]
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Should have filtered many words
    assertEquals(result.filteredCount > 5, true)
    // Confidence should still be reasonable
    assertEquals(result.confidence >= 0.85, true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Prompt includes maxWords parameter
Deno.test('extract - prompt includes maxWords parameter', async () => {
  const mockResponse = createMockLLMResponse(['word1', 'word2'])
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    (request) => {
      // Verify system prompt includes maxWords
      assertEquals(request.systemPrompt?.includes('40'), true)
      return Promise.resolve(mockResponse)
    }
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    await extract(input)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Uses appropriate temperature
Deno.test('extract - uses low temperature for consistency', async () => {
  const mockResponse = createMockLLMResponse(['word1'])
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    (request) => {
      // Verify low temperature for consistent extraction
      assertEquals(request.temperature, 0.3)
      return Promise.resolve(mockResponse)
    }
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    await extract(input)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Large document handling
Deno.test('extract - handles large documents', async () => {
  // Generate 40 unique words
  const mockWords = Array.from({ length: 40 }, (_, i) => `vocabulary${i}`)
  const mockResponse = createMockLLMResponse(mockWords)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    // Create a large document
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
    callLLMStub.restore()
  }
})

// Test: Empty lines in LLM response
Deno.test('extract - filters empty lines from LLM response', async () => {
  const mockResponse: LLMResponse = {
    content: '\n\nalgorithm\n\n\ndatabase\n\n',
    tokensUsed: 50,
    latency: 100,
    model: 'glm-4-flash',
  }
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
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
    callLLMStub.restore()
  }
})
