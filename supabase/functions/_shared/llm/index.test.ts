/**
 * Unit tests for LLM service integration functions
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { assertSpyCalls, stub } from 'https://deno.land/std@0.208.0/testing/mock.ts'
import { callLLMWithRetry, callLLMWithMetrics } from './index.ts'
import { LLMError, LLMErrorCode, GLMAPIResponse } from './types.ts'

// Mock successful API response
function createMockSuccessResponse(content: string): GLMAPIResponse {
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

// Setup environment
Deno.env.set('GLM_API_KEY', 'test-api-key')
Deno.env.set('GLM_API_URL', 'https://test-api.example.com/v1/chat')
Deno.env.set('GLM_TIMEOUT_MS', '5000')

Deno.test('callLLMWithRetry - succeeds without retry', async () => {
  const mockResponse = createMockSuccessResponse('Success on first try')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const result = await callLLMWithRetry({
      prompt: 'Test prompt',
    })

    assertEquals(result.content, 'Success on first try')
    assertEquals(result.tokensUsed, 100)
    assertSpyCalls(fetchStub, 1)
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLMWithRetry - retries on timeout and succeeds', async () => {
  let callCount = 0
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve(new Response('Timeout', { status: 500 }))
      }
      return Promise.resolve(
        new Response(JSON.stringify(createMockSuccessResponse('Success after retry')), { status: 200 })
      )
    }
  )

  try {
    const result = await callLLMWithRetry(
      { prompt: 'Test' },
      { maxRetries: 2, baseDelayMs: 10 }
    )

    assertEquals(result.content, 'Success after retry')
    assertEquals(callCount, 2)
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLMWithRetry - exhausts retries and throws', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response('Server error', { status: 500 }))
  )

  try {
    await assertRejects(
      async () => await callLLMWithRetry(
        { prompt: 'Test' },
        { maxRetries: 2, baseDelayMs: 10 }
      ),
      LLMError
    )
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLMWithRetry - does not retry non-retryable errors', async () => {
  let callCount = 0
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => {
      callCount++
      return Promise.resolve(new Response('Token limit exceeded', { status: 400 }))
    }
  )

  try {
    await assertRejects(
      async () => await callLLMWithRetry(
        { prompt: 'Test' },
        { maxRetries: 3, baseDelayMs: 10 }
      ),
      LLMError,
      'Token limit exceeded'
    )
    
    // Should only try once
    assertEquals(callCount, 1)
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLMWithMetrics - logs metrics on success', async () => {
  const mockResponse = createMockSuccessResponse('Success with metrics')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  const consoleStub = stub(console, 'log')

  try {
    const result = await callLLMWithMetrics(
      { prompt: 'Test' },
      'cleaner',
      'job-123'
    )

    assertEquals(result.content, 'Success with metrics')
    
    // Should log metrics
    const metricsLog = consoleStub.calls.find(call => 
      call.args[0] === 'LLM Metrics:'
    )
    assertEquals(metricsLog !== undefined, true)
    
    if (metricsLog) {
      const metrics = metricsLog.args[1] as any
      assertEquals(metrics.agentType, 'cleaner')
      assertEquals(metrics.jobId, 'job-123')
      assertEquals(metrics.totalTokens, 100)
    }
  } finally {
    fetchStub.restore()
    consoleStub.restore()
  }
})

Deno.test('callLLMWithMetrics - logs metrics on failure', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response('Token limit', { status: 400 }))
  )

  const consoleStub = stub(console, 'log')

  try {
    await assertRejects(
      async () => await callLLMWithMetrics(
        { prompt: 'Test' },
        'extractor',
        'job-456'
      ),
      LLMError
    )
    
    // Should still log metrics even on failure
    const metricsLog = consoleStub.calls.find(call => 
      call.args[0] === 'LLM Metrics:'
    )
    assertEquals(metricsLog !== undefined, true)
    
    if (metricsLog) {
      const metrics = metricsLog.args[1] as any
      assertEquals(metrics.agentType, 'extractor')
      assertEquals(metrics.jobId, 'job-456')
      assertEquals(metrics.totalTokens, 0) // Failed, so no tokens
    }
  } finally {
    fetchStub.restore()
    consoleStub.restore()
  }
})

Deno.test('callLLMWithMetrics - works without jobId', async () => {
  const mockResponse = createMockSuccessResponse('Success without jobId')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  const consoleStub = stub(console, 'log')

  try {
    const result = await callLLMWithMetrics(
      { prompt: 'Test' },
      'translator'
    )

    assertEquals(result.content, 'Success without jobId')
    
    const metricsLog = consoleStub.calls.find(call => 
      call.args[0] === 'LLM Metrics:'
    )
    
    if (metricsLog) {
      const metrics = metricsLog.args[1] as any
      assertEquals(metrics.agentType, 'translator')
      assertEquals(metrics.jobId, undefined)
    }
  } finally {
    fetchStub.restore()
    consoleStub.restore()
  }
})

Deno.test('callLLMWithMetrics - retries with custom config', async () => {
  let callCount = 0
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => {
      callCount++
      if (callCount < 3) {
        return Promise.resolve(new Response('Server error', { status: 500 }))
      }
      return Promise.resolve(
        new Response(JSON.stringify(createMockSuccessResponse('Success after retries')), { status: 200 })
      )
    }
  )

  const consoleStub = stub(console, 'log')

  try {
    const result = await callLLMWithMetrics(
      { prompt: 'Test' },
      'cleaner',
      'job-789',
      { maxRetries: 3, baseDelayMs: 10 }
    )

    assertEquals(result.content, 'Success after retries')
    assertEquals(callCount, 3)
    
    // Should log metrics for successful call
    const metricsLog = consoleStub.calls.find(call => 
      call.args[0] === 'LLM Metrics:'
    )
    assertEquals(metricsLog !== undefined, true)
  } finally {
    fetchStub.restore()
    consoleStub.restore()
  }
})

Deno.test('callLLMWithMetrics - measures latency correctly', async () => {
  const mockResponse = createMockSuccessResponse('Test response')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
      }, 100)
    })
  )

  const consoleStub = stub(console, 'log')

  try {
    await callLLMWithMetrics(
      { prompt: 'Test' },
      'cleaner'
    )
    
    const metricsLog = consoleStub.calls.find(call => 
      call.args[0] === 'LLM Metrics:'
    )
    
    if (metricsLog) {
      const metrics = metricsLog.args[1] as any
      // Latency should be at least 100ms
      assertEquals(metrics.latencyMs >= 100, true)
    }
  } finally {
    fetchStub.restore()
    consoleStub.restore()
  }
})

Deno.test('callLLMWithMetrics - handles all agent types', async () => {
  const mockResponse = createMockSuccessResponse('Test')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  const consoleStub = stub(console, 'log')

  try {
    // Test cleaner
    await callLLMWithMetrics({ prompt: 'Test' }, 'cleaner')
    let metricsLog = consoleStub.calls.find(call => call.args[0] === 'LLM Metrics:')
    assertEquals((metricsLog?.args[1] as any)?.agentType, 'cleaner')
    
    consoleStub.calls = []
    
    // Test extractor
    await callLLMWithMetrics({ prompt: 'Test' }, 'extractor')
    metricsLog = consoleStub.calls.find(call => call.args[0] === 'LLM Metrics:')
    assertEquals((metricsLog?.args[1] as any)?.agentType, 'extractor')
    
    consoleStub.calls = []
    
    // Test translator
    await callLLMWithMetrics({ prompt: 'Test' }, 'translator')
    metricsLog = consoleStub.calls.find(call => call.args[0] === 'LLM Metrics:')
    assertEquals((metricsLog?.args[1] as any)?.agentType, 'translator')
  } finally {
    fetchStub.restore()
    consoleStub.restore()
  }
})
