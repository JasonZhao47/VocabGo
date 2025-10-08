/**
 * Unit tests for Translator Agent
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { stub } from 'https://deno.land/std@0.208.0/testing/mock.ts'
import { translate } from './translator.ts'
import type { TranslatorInput, TranslatorOutput, WordPair } from './types.ts'
import type { LLMResponse } from '../llm/types.ts'

// Helper to create mock LLM response with translations
function createMockLLMResponse(translations: Array<{ en: string; zh: string }>): LLMResponse {
  const content = translations.map(t => `${t.en}|${t.zh}`).join('\n')
  return {
    content,
    tokensUsed: translations.length * 15,
    latency: 200,
    model: 'glm-4-flash',
  }
}

// Test: Basic translation
Deno.test('translate - translates English words to Mandarin', async () => {
  const mockTranslations = [
    { en: 'algorithm', zh: '算法' },
    { en: 'database', zh: '数据库' },
    { en: 'network', zh: '网络' },
  ]
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network'],
    }

    const result = await translate(input)

    assertEquals(result.translations.length, 3)
    assertEquals(result.translations[0], { en: 'algorithm', zh: '算法' })
    assertEquals(result.translations[1], { en: 'database', zh: '数据库' })
    assertEquals(result.translations[2], { en: 'network', zh: '网络' })
    assertEquals(result.confidence >= 0.85, true)
    assertEquals(result.fallbackUsed.length, 0)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Empty word list
Deno.test('translate - handles empty word list', async () => {
  const input: TranslatorInput = {
    words: [],
  }

  const result = await translate(input)

  assertEquals(result.translations.length, 0)
  assertEquals(result.confidence, 1.0)
  assertEquals(result.fallbackUsed.length, 0)
})

// Test: Single word translation
Deno.test('translate - translates single word', async () => {
  const mockTranslations = [{ en: 'computer', zh: '计算机' }]
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['computer'],
    }

    const result = await translate(input)

    assertEquals(result.translations.length, 1)
    assertEquals(result.translations[0], { en: 'computer', zh: '计算机' })
  } finally {
    callLLMStub.restore()
  }
})

// Test: Context-aware translation
Deno.test('translate - uses context for polysemous words', async () => {
  const mockTranslations = [
    { en: 'bank', zh: '银行' }, // financial context
  ]
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    (request) => {
      // Verify context is included in prompt
      assertEquals(request.prompt.includes('financial'), true)
      return Promise.resolve(mockResponse)
    }
  )

  try {
    const input: TranslatorInput = {
      words: ['bank'],
      context: 'This document discusses financial institutions and banking systems.',
    }

    const result = await translate(input)

    assertEquals(result.translations[0], { en: 'bank', zh: '银行' })
  } finally {
    callLLMStub.restore()
  }
})

// Test: Context truncation for long documents
Deno.test('translate - truncates long context', async () => {
  const mockTranslations = [{ en: 'word', zh: '词' }]
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    (request) => {
      // Context should be truncated to 500 chars
      const contextMatch = request.prompt.match(/Document context.*:\n(.+)/s)
      if (contextMatch) {
        assertEquals(contextMatch[1].length <= 500, true)
      }
      return Promise.resolve(mockResponse)
    }
  )

  try {
    const longContext = 'A'.repeat(1000) // 1000 characters
    const input: TranslatorInput = {
      words: ['word'],
      context: longContext,
    }

    await translate(input)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Validates Chinese characters in translation
Deno.test('translate - validates Chinese characters', async () => {
  const mockResponse: LLMResponse = {
    content: 'algorithm|算法\ndatabase|invalid-translation\nnetwork|网络',
    tokensUsed: 100,
    latency: 150,
    model: 'glm-4-flash',
  }
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network'],
    }

    const result = await translate(input)

    // Valid translations
    assertEquals(result.translations[0], { en: 'algorithm', zh: '算法' })
    assertEquals(result.translations[2], { en: 'network', zh: '网络' })
    
    // Invalid translation should use fallback
    assertEquals(result.translations[1], { en: 'database', zh: 'database' })
    assertEquals(result.fallbackUsed.includes('database'), true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Case-insensitive word matching
Deno.test('translate - matches words case-insensitively', async () => {
  const mockResponse: LLMResponse = {
    content: 'Algorithm|算法\nDATABASE|数据库\nNetwork|网络',
    tokensUsed: 100,
    latency: 150,
    model: 'glm-4-flash',
  }
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network'],
    }

    const result = await translate(input)

    // Should match despite case differences
    assertEquals(result.translations[0], { en: 'algorithm', zh: '算法' })
    assertEquals(result.translations[1], { en: 'database', zh: '数据库' })
    assertEquals(result.translations[2], { en: 'network', zh: '网络' })
    assertEquals(result.fallbackUsed.length, 0)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Malformed LLM response
Deno.test('translate - handles malformed response lines', async () => {
  const mockResponse: LLMResponse = {
    content: 'algorithm|算法\ninvalid-line-without-pipe\ndatabase|数据库\n|||multiple|pipes\nnetwork|网络',
    tokensUsed: 100,
    latency: 150,
    model: 'glm-4-flash',
  }
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network', 'security'],
    }

    const result = await translate(input)

    // Valid translations
    assertEquals(result.translations[0], { en: 'algorithm', zh: '算法' })
    assertEquals(result.translations[1], { en: 'database', zh: '数据库' })
    assertEquals(result.translations[2], { en: 'network', zh: '网络' })
    
    // Malformed line should use fallback
    assertEquals(result.translations[3], { en: 'security', zh: 'security' })
    assertEquals(result.fallbackUsed.includes('security'), true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Missing translations
Deno.test('translate - uses fallback for missing translations', async () => {
  const mockResponse: LLMResponse = {
    content: 'algorithm|算法\ndatabase|数据库',
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
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network', 'security'],
    }

    const result = await translate(input)

    // First two have translations
    assertEquals(result.translations[0], { en: 'algorithm', zh: '算法' })
    assertEquals(result.translations[1], { en: 'database', zh: '数据库' })
    
    // Last two missing, should use fallback
    assertEquals(result.translations[2], { en: 'network', zh: 'network' })
    assertEquals(result.translations[3], { en: 'security', zh: 'security' })
    assertEquals(result.fallbackUsed.length, 2)
    assertEquals(result.fallbackUsed.includes('network'), true)
    assertEquals(result.fallbackUsed.includes('security'), true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: LLM error handling with fallback
Deno.test('translate - returns fallback translations on LLM error', async () => {
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.reject(new Error('LLM service unavailable'))
  )

  try {
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network'],
    }

    const result = await translate(input)

    // Should return fallback translations (English words as Chinese)
    assertEquals(result.translations.length, 3)
    assertEquals(result.translations[0], { en: 'algorithm', zh: 'algorithm' })
    assertEquals(result.translations[1], { en: 'database', zh: 'database' })
    assertEquals(result.translations[2], { en: 'network', zh: 'network' })
    
    // All should be marked as fallback
    assertEquals(result.fallbackUsed.length, 3)
    assertEquals(result.confidence, 0.5)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Confidence calculation
Deno.test('translate - calculates confidence based on success rate', async () => {
  const mockResponse: LLMResponse = {
    content: 'algorithm|算法\ndatabase|数据库\nnetwork|网络\nsecurity|安全',
    tokensUsed: 100,
    latency: 150,
    model: 'glm-4-flash',
  }
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network', 'security'],
    }

    const result = await translate(input)

    // All translations successful
    assertEquals(result.fallbackUsed.length, 0)
    // High confidence
    assertEquals(result.confidence >= 0.95, true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Lower confidence with fallbacks
Deno.test('translate - lower confidence when fallbacks used', async () => {
  const mockResponse: LLMResponse = {
    content: 'algorithm|算法\ndatabase|invalid',
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
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network', 'security'],
    }

    const result = await translate(input)

    // 3 out of 4 used fallback
    assertEquals(result.fallbackUsed.length, 3)
    // Lower confidence
    assertEquals(result.confidence < 0.95, true)
    assertEquals(result.confidence >= 0.85, true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Uses low temperature
Deno.test('translate - uses low temperature for consistency', async () => {
  const mockTranslations = [{ en: 'word', zh: '词' }]
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    (request) => {
      // Verify low temperature
      assertEquals(request.temperature, 0.2)
      return Promise.resolve(mockResponse)
    }
  )

  try {
    const input: TranslatorInput = {
      words: ['word'],
    }

    await translate(input)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Token estimation
Deno.test('translate - estimates tokens correctly', async () => {
  const words = Array.from({ length: 20 }, (_, i) => `word${i}`)
  const mockTranslations = words.map(w => ({ en: w, zh: '词' }))
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    (request) => {
      // Should request ~20 tokens per word
      assertEquals(request.maxTokens, 20 * 20) // 400 tokens
      return Promise.resolve(mockResponse)
    }
  )

  try {
    const input: TranslatorInput = {
      words,
    }

    await translate(input)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Special characters in words
Deno.test('translate - handles words with special characters', async () => {
  const mockTranslations = [
    { en: 'e-mail', zh: '电子邮件' },
    { en: 'co-operate', zh: '合作' },
  ]
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['e-mail', 'co-operate'],
    }

    const result = await translate(input)

    assertEquals(result.translations[0], { en: 'e-mail', zh: '电子邮件' })
    assertEquals(result.translations[1], { en: 'co-operate', zh: '合作' })
  } finally {
    callLLMStub.restore()
  }
})

// Test: Whitespace handling
Deno.test('translate - handles whitespace in response', async () => {
  const mockResponse: LLMResponse = {
    content: '  algorithm  |  算法  \n  database  |  数据库  ',
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
    const input: TranslatorInput = {
      words: ['algorithm', 'database'],
    }

    const result = await translate(input)

    // Should trim whitespace
    assertEquals(result.translations[0], { en: 'algorithm', zh: '算法' })
    assertEquals(result.translations[1], { en: 'database', zh: '数据库' })
  } finally {
    callLLMStub.restore()
  }
})

// Test: Empty lines in response
Deno.test('translate - filters empty lines in response', async () => {
  const mockResponse: LLMResponse = {
    content: '\n\nalgorithm|算法\n\n\ndatabase|数据库\n\n',
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
    const input: TranslatorInput = {
      words: ['algorithm', 'database'],
    }

    const result = await translate(input)

    assertEquals(result.translations.length, 2)
    assertEquals(result.translations[0], { en: 'algorithm', zh: '算法' })
    assertEquals(result.translations[1], { en: 'database', zh: '数据库' })
  } finally {
    callLLMStub.restore()
  }
})

// Test: Large batch translation
Deno.test('translate - handles large batch of words', async () => {
  const words = Array.from({ length: 40 }, (_, i) => `word${i}`)
  const mockTranslations = words.map(w => ({ en: w, zh: `词${w.slice(4)}` }))
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words,
    }

    const result = await translate(input)

    assertEquals(result.translations.length, 40)
    assertEquals(result.fallbackUsed.length, 0)
    assertEquals(result.confidence >= 0.95, true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Mixed valid and invalid Chinese characters
Deno.test('translate - validates Chinese character presence', async () => {
  const mockResponse: LLMResponse = {
    content: 'algorithm|算法\ndatabase|abc123\nnetwork|网络test\nsecurity|安全',
    tokensUsed: 100,
    latency: 150,
    model: 'glm-4-flash',
  }
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['algorithm', 'database', 'network', 'security'],
    }

    const result = await translate(input)

    // Valid: contains Chinese characters
    assertEquals(result.translations[0], { en: 'algorithm', zh: '算法' })
    assertEquals(result.translations[2], { en: 'network', zh: '网络test' })
    assertEquals(result.translations[3], { en: 'security', zh: '安全' })
    
    // Invalid: no Chinese characters
    assertEquals(result.translations[1], { en: 'database', zh: 'database' })
    assertEquals(result.fallbackUsed.includes('database'), true)
  } finally {
    callLLMStub.restore()
  }
})

// Test: Rare/specialized words
Deno.test('translate - handles rare or specialized words', async () => {
  const mockTranslations = [
    { en: 'cryptocurrency', zh: '加密货币' },
    { en: 'blockchain', zh: '区块链' },
    { en: 'algorithm', zh: '算法' },
  ]
  const mockResponse = createMockLLMResponse(mockTranslations)
  
  const { callLLM } = await import('../llm/service.ts')
  const callLLMStub = stub(
    await import('../llm/service.ts'),
    'callLLM',
    () => Promise.resolve(mockResponse)
  )

  try {
    const input: TranslatorInput = {
      words: ['cryptocurrency', 'blockchain', 'algorithm'],
    }

    const result = await translate(input)

    assertEquals(result.translations.length, 3)
    assertEquals(result.translations[0], { en: 'cryptocurrency', zh: '加密货币' })
    assertEquals(result.translations[1], { en: 'blockchain', zh: '区块链' })
    assertEquals(result.fallbackUsed.length, 0)
  } finally {
    callLLMStub.restore()
  }
})
