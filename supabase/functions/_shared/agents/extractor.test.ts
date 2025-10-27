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
  const mockWords = Array.from({ length: 50 }, (_, i) => `vocabulary${i}`)
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
  // Return at least one space to avoid LLM error
  const mockResponse = createMockAPIResponse(' ')
  
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
    assertEquals(result.confidence, 0.0)
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
  const mockWords = ['中文', '日本語', 'espanol']
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

    // Only 'espanol' has pure alphabetic chars (ñ is stripped)
    assertEquals(result.words.length, 1)
    assertEquals(result.words[0], 'espanol')
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
  const mockResponse = createMockAPIResponse('vocabulary\n\n\nalgorithm\n   \ndatabase   \n\n')
  
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
    assertEquals(result.words, ['vocabulary', 'algorithm', 'database'])
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
  // Create 40 unique words
  const mockWords = [
    'algorithm', 'database', 'network', 'security', 'protocol',
    'encryption', 'authentication', 'authorization', 'firewall', 'router',
    'server', 'client', 'bandwidth', 'latency', 'throughput',
    'packet', 'socket', 'interface', 'gateway', 'subnet',
    'topology', 'architecture', 'infrastructure', 'deployment', 'configuration',
    'monitoring', 'logging', 'debugging', 'testing', 'validation',
    'optimization', 'performance', 'scalability', 'reliability', 'availability',
    'redundancy', 'failover', 'backup', 'recovery', 'disaster'
  ]
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

// Test: Numbered list format handling
Deno.test('extract - handles numbered list format', async () => {
  const mockWords = ['1. algorithm', '2. database', '3. network', '4) security', '5 - protocol']
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

    assertEquals(result.words.length, 5)
    assertEquals(result.words, ['algorithm', 'database', 'network', 'security', 'protocol'])
  } finally {
    fetchStub.restore()
  }
})

// Test: Bulleted list format handling
Deno.test('extract - handles bulleted list format', async () => {
  const mockWords = ['• algorithm', '- database', '* network', '+ security', '> protocol']
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

    assertEquals(result.words.length, 5)
    assertEquals(result.words, ['algorithm', 'database', 'network', 'security', 'protocol'])
  } finally {
    fetchStub.restore()
  }
})

// Test: Mixed case word normalization
Deno.test('extract - normalizes mixed case words', async () => {
  const mockWords = ['Algorithm', 'DATABASE', 'NeTwOrK', 'SECURITY', 'protocol']
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

    assertEquals(result.words.length, 5)
    assertEquals(result.words, ['algorithm', 'database', 'network', 'security', 'protocol'])
  } finally {
    fetchStub.restore()
  }
})

// Test: Fallback regex extraction
Deno.test('extract - uses fallback extraction when primary yields 0 words', async () => {
  // LLM returns gibberish that won't parse
  const mockResponse = createMockAPIResponse('### !@# $$$ %%% ^^^ &&&')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'This document contains algorithm database network security protocol encryption authentication.',
      maxWords: 40,
    }

    const result = await extract(input)

    // Fallback should extract from the original text
    assertEquals(result.words.length > 0, true)
    assertEquals(result.confidence, 0.7)
  } finally {
    fetchStub.restore()
  }
})

// Test: Markdown formatting removal
Deno.test('extract - removes markdown formatting', async () => {
  const mockWords = ['**algorithm**', '__database__', '`network`', '*security*', '_protocol_']
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

    assertEquals(result.words.length, 5)
    assertEquals(result.words, ['algorithm', 'database', 'network', 'security', 'protocol'])
  } finally {
    fetchStub.restore()
  }
})

// Test: Extracts first word from multi-word lines
Deno.test('extract - extracts first word from multi-word lines', async () => {
  const mockWords = [
    'algorithm - a step-by-step procedure',
    'database: a structured collection',
    'network (interconnected system)',
    'security [protection measures]'
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

    assertEquals(result.words.length, 4)
    assertEquals(result.words, ['algorithm', 'database', 'network', 'security'])
  } finally {
    fetchStub.restore()
  }
})

// Test: Confidence 0.0 when no words extracted
Deno.test('extract - returns confidence 0.0 when no words extracted', async () => {
  const mockResponse = createMockAPIResponse('### !@# $$$ %%%')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const input: ExtractorInput = {
      cleanedText: 'a an the',  // Only very short words and stop words
      maxWords: 40,
    }

    const result = await extract(input)

    assertEquals(result.words.length, 0)
    assertEquals(result.confidence, 0.0)
  } finally {
    fetchStub.restore()
  }
})

// Test: Text sampling for large documents
Deno.test('extract - samples text when exceeding 20,000 characters', async () => {
  const mockWords = ['algorithm', 'database', 'network', 'security', 'protocol']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    // Create text larger than 20,000 characters
    const largeText = 'word '.repeat(5000) // ~25,000 characters
    
    const input: ExtractorInput = {
      cleanedText: largeText,
      maxWords: 40,
    }

    const result = await extract(input)

    // Should still extract words successfully
    assertEquals(result.words.length, 5)
    assertEquals(result.words, mockWords)
    assertEquals(result.confidence >= 0.85, true)
  } finally {
    fetchStub.restore()
  }
})

// Test: Text sampling preserves beginning, middle, and end
Deno.test('extract - text sampling uses 40-30-30 distribution', async () => {
  const mockWords = ['beginning', 'middle', 'ending']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  let capturedPrompt = ''
  const fetchStub = stub(
    globalThis,
    'fetch',
    async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.body) {
        const body = JSON.parse(init.body as string)
        capturedPrompt = body.messages?.[1]?.content || ''
      }
      return Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
    }
  )

  try {
    // Create text with distinct sections
    const beginning = 'beginning '.repeat(2000) // ~20,000 chars
    const middle = 'middle '.repeat(2000)       // ~14,000 chars
    const ending = 'ending '.repeat(2000)       // ~14,000 chars
    const largeText = beginning + middle + ending // ~48,000 chars total
    
    const input: ExtractorInput = {
      cleanedText: largeText,
      maxWords: 40,
    }

    const result = await extract(input)

    // Verify sampling occurred and contains all sections
    assertEquals(capturedPrompt.includes('beginning'), true)
    assertEquals(capturedPrompt.includes('middle'), true)
    assertEquals(capturedPrompt.includes('ending'), true)
    assertEquals(capturedPrompt.includes('...'), true) // Should have ellipsis separators
    assertEquals(capturedPrompt.length < largeText.length, true)
    assertEquals(capturedPrompt.length <= 20000, true)
  } finally {
    fetchStub.restore()
  }
})

// Test: Dynamic token calculation
Deno.test('extract - uses dynamic max_tokens based on word count', async () => {
  const mockWords = ['algorithm', 'database', 'network']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  let capturedMaxTokens = 0
  const fetchStub = stub(
    globalThis,
    'fetch',
    async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.body) {
        const body = JSON.parse(init.body as string)
        capturedMaxTokens = body.max_tokens || 0
      }
      return Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
    }
  )

  try {
    // Test with 40 words: min(40 * 2 + 50, 500) = min(130, 500) = 130
    const input1: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }
    await extract(input1)
    assertEquals(capturedMaxTokens, 130)

    // Test with 100 words: min(100 * 2 + 50, 500) = min(250, 500) = 250
    const input2: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 100,
    }
    await extract(input2)
    assertEquals(capturedMaxTokens, 250)

    // Test with 300 words: min(300 * 2 + 50, 500) = min(650, 500) = 500 (capped)
    const input3: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 300,
    }
    await extract(input3)
    assertEquals(capturedMaxTokens, 500)

    // Test with 10 words: min(10 * 2 + 50, 500) = min(70, 500) = 70
    const input4: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 10,
    }
    await extract(input4)
    assertEquals(capturedMaxTokens, 70)
  } finally {
    fetchStub.restore()
  }
})

// Test: Token usage logging
Deno.test('extract - logs token usage metrics', async () => {
  const mockWords = ['algorithm', 'database', 'network', 'security', 'protocol']
  const mockResponse = createMockAPIResponse(mockWords.join('\n'))
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  // Capture console logs
  const logs: string[] = []
  const originalLog = console.log
  console.log = (...args: unknown[]) => {
    logs.push(args.join(' '))
  }

  try {
    const input: ExtractorInput = {
      cleanedText: 'Document text.',
      maxWords: 40,
    }

    await extract(input)

    // Verify token-related logs exist
    const hasMaxTokensLog = logs.some(log => log.includes('Using max_tokens:'))
    const hasTokensUsedLog = logs.some(log => log.includes('tokens:'))
    const hasTokensPerWordLog = logs.some(log => log.includes('Tokens per word:'))

    assertEquals(hasMaxTokensLog, true)
    assertEquals(hasTokensUsedLog, true)
    assertEquals(hasTokensPerWordLog, true)
  } finally {
    console.log = originalLog
    fetchStub.restore()
  }
})
