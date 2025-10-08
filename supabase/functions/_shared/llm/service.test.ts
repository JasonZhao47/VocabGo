/**
 * Unit tests for LLM service
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { assertSpyCall, assertSpyCalls, spy, stub } from 'https://deno.land/std@0.208.0/testing/mock.ts'
import { callLLM } from './service.ts'
import { LLMError, LLMErrorCode, GLMAPIResponse } from './types.ts'

// Mock successful API response
function createMockSuccessResponse(content: string, tokens = 100): GLMAPIResponse {
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
      total_tokens: tokens,
    },
  }
}

// Setup environment variables for tests
Deno.env.set('GLM_API_KEY', 'test-api-key')
Deno.env.set('GLM_API_URL', 'https://test-api.example.com/v1/chat')
Deno.env.set('GLM_TIMEOUT_MS', '5000')

Deno.test('callLLM - successful API call with basic prompt', async () => {
  const mockResponse = createMockSuccessResponse('This is a test response')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    const result = await callLLM({
      prompt: 'Test prompt',
    })

    assertEquals(result.content, 'This is a test response')
    assertEquals(result.tokensUsed, 100)
    assertEquals(result.model, 'glm-4-flash')
    assertEquals(typeof result.latency, 'number')
    assertEquals(result.latency >= 0, true)

    // Verify fetch was called correctly
    assertSpyCalls(fetchStub, 1)
    const call = fetchStub.calls[0]
    assertEquals(call.args[0], 'https://test-api.example.com/v1/chat')
    
    const fetchOptions = call.args[1] as RequestInit
    assertEquals(fetchOptions.method, 'POST')
    assertEquals(fetchOptions.headers, {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-api-key',
    })
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - includes system prompt when provided', async () => {
  const mockResponse = createMockSuccessResponse('Response with system prompt')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    await callLLM({
      prompt: 'User prompt',
      systemPrompt: 'You are a helpful assistant',
    })

    const call = fetchStub.calls[0]
    const fetchOptions = call.args[1] as RequestInit
    const body = JSON.parse(fetchOptions.body as string)
    
    assertEquals(body.messages.length, 2)
    assertEquals(body.messages[0].role, 'system')
    assertEquals(body.messages[0].content, 'You are a helpful assistant')
    assertEquals(body.messages[1].role, 'user')
    assertEquals(body.messages[1].content, 'User prompt')
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - respects custom maxTokens and temperature', async () => {
  const mockResponse = createMockSuccessResponse('Custom config response')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
  )

  try {
    await callLLM({
      prompt: 'Test',
      maxTokens: 500,
      temperature: 0.9,
    })

    const call = fetchStub.calls[0]
    const fetchOptions = call.args[1] as RequestInit
    const body = JSON.parse(fetchOptions.body as string)
    
    assertEquals(body.max_tokens, 500)
    assertEquals(body.temperature, 0.9)
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - throws RATE_LIMIT error on 429 response', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response('Rate limit exceeded', { status: 429 }))
  )

  try {
    await assertRejects(
      async () => await callLLM({ prompt: 'Test' }),
      LLMError,
      'Rate limit exceeded'
    )

    // Verify error properties
    try {
      await callLLM({ prompt: 'Test' })
    } catch (error) {
      assertEquals(error instanceof LLMError, true)
      if (error instanceof LLMError) {
        assertEquals(error.code, LLMErrorCode.RATE_LIMIT)
        assertEquals(error.retryable, true)
      }
    }
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - throws TOKEN_LIMIT_EXCEEDED error on token limit', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response('Token limit exceeded in request', { status: 400 }))
  )

  try {
    await assertRejects(
      async () => await callLLM({ prompt: 'Test' }),
      LLMError,
      'Token limit exceeded'
    )

    // Verify error is not retryable
    try {
      await callLLM({ prompt: 'Test' })
    } catch (error) {
      if (error instanceof LLMError) {
        assertEquals(error.code, LLMErrorCode.TOKEN_LIMIT_EXCEEDED)
        assertEquals(error.retryable, false)
      }
    }
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - throws API_ERROR on 500 server error (retryable)', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response('Internal server error', { status: 500 }))
  )

  try {
    await assertRejects(
      async () => await callLLM({ prompt: 'Test' }),
      LLMError,
      'API error: 500'
    )

    // Verify error is retryable for 5xx errors
    try {
      await callLLM({ prompt: 'Test' })
    } catch (error) {
      if (error instanceof LLMError) {
        assertEquals(error.code, LLMErrorCode.API_ERROR)
        assertEquals(error.retryable, true)
      }
    }
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - throws TIMEOUT error when request times out', async () => {
  // Set very short timeout for this test
  Deno.env.set('GLM_TIMEOUT_MS', '100')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => new Promise((resolve) => {
      // Never resolve to simulate timeout
      setTimeout(() => resolve(new Response('Too late', { status: 200 })), 5000)
    })
  )

  try {
    await assertRejects(
      async () => await callLLM({ prompt: 'Test' }),
      LLMError,
      'Request timeout'
    )

    // Verify error is retryable
    try {
      await callLLM({ prompt: 'Test' })
    } catch (error) {
      if (error instanceof LLMError) {
        assertEquals(error.code, LLMErrorCode.TIMEOUT)
        assertEquals(error.retryable, true)
      }
    }
  } finally {
    fetchStub.restore()
    Deno.env.set('GLM_TIMEOUT_MS', '5000') // Reset
  }
})

Deno.test('callLLM - throws NETWORK_ERROR on network failure', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.reject(new TypeError('Network request failed'))
  )

  try {
    await assertRejects(
      async () => await callLLM({ prompt: 'Test' }),
      LLMError,
      'Network error'
    )

    // Verify error is retryable
    try {
      await callLLM({ prompt: 'Test' })
    } catch (error) {
      if (error instanceof LLMError) {
        assertEquals(error.code, LLMErrorCode.NETWORK_ERROR)
        assertEquals(error.retryable, true)
      }
    }
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - throws INVALID_RESPONSE when no choices in response', async () => {
  const invalidResponse = {
    id: 'test-id',
    created: Date.now(),
    model: 'glm-4-flash',
    choices: [],
    usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
  }
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(invalidResponse), { status: 200 }))
  )

  try {
    await assertRejects(
      async () => await callLLM({ prompt: 'Test' }),
      LLMError,
      'Invalid API response: no choices'
    )

    try {
      await callLLM({ prompt: 'Test' })
    } catch (error) {
      if (error instanceof LLMError) {
        assertEquals(error.code, LLMErrorCode.INVALID_RESPONSE)
        assertEquals(error.retryable, false)
      }
    }
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - throws INVALID_RESPONSE when no content in message', async () => {
  const invalidResponse = {
    id: 'test-id',
    created: Date.now(),
    model: 'glm-4-flash',
    choices: [{
      index: 0,
      message: { role: 'assistant', content: '' },
      finish_reason: 'stop',
    }],
    usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
  }
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve(new Response(JSON.stringify(invalidResponse), { status: 200 }))
  )

  try {
    await assertRejects(
      async () => await callLLM({ prompt: 'Test' }),
      LLMError,
      'Invalid API response: no content'
    )
  } finally {
    fetchStub.restore()
  }
})

Deno.test('callLLM - measures latency correctly', async () => {
  const mockResponse = createMockSuccessResponse('Test response')
  
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
      }, 100) // 100ms delay
    })
  )

  try {
    const result = await callLLM({ prompt: 'Test' })
    
    // Latency should be at least 100ms
    assertEquals(result.latency >= 100, true)
    // But not too much more (allowing for some overhead)
    assertEquals(result.latency < 500, true)
  } finally {
    fetchStub.restore()
  }
})
