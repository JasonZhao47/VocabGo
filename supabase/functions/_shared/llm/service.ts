/**
 * LLM Service
 * Core service for GLM-Flash API integration
 */

import { getLLMConfig } from './config.ts'
import {
  LLMRequest,
  LLMResponse,
  GLMAPIRequest,
  GLMAPIResponse,
  LLMError,
  LLMErrorCode,
} from './types.ts'

const config = getLLMConfig()

/**
 * Call GLM-Flash API
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now()

  try {
    // Build API request
    const apiRequest: GLMAPIRequest = {
      model: config.model,
      messages: [],
      max_tokens: request.maxTokens || config.defaultMaxTokens,
      temperature: request.temperature ?? config.defaultTemperature,
      stream: false,
    }

    // Add system prompt if provided
    if (request.systemPrompt) {
      apiRequest.messages.push({
        role: 'system',
        content: request.systemPrompt,
      })
    }

    // Add user prompt
    apiRequest.messages.push({
      role: 'user',
      content: request.prompt,
    })

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs)

    try {
      // Make API call
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(apiRequest),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text()
        
        // Check for rate limiting
        if (response.status === 429) {
          throw new LLMError(
            LLMErrorCode.RATE_LIMIT,
            'Rate limit exceeded',
            true,
            { status: response.status, body: errorText }
          )
        }

        // Check for token limit
        if (response.status === 400 && errorText.includes('token')) {
          throw new LLMError(
            LLMErrorCode.TOKEN_LIMIT_EXCEEDED,
            'Token limit exceeded',
            false,
            { status: response.status, body: errorText }
          )
        }

        throw new LLMError(
          LLMErrorCode.API_ERROR,
          `API error: ${response.status}`,
          response.status >= 500, // Retry on 5xx errors
          { status: response.status, body: errorText }
        )
      }

      // Parse response
      const apiResponse: GLMAPIResponse = await response.json()

      // Validate response structure
      if (!apiResponse.choices || apiResponse.choices.length === 0) {
        throw new LLMError(
          LLMErrorCode.INVALID_RESPONSE,
          'Invalid API response: no choices',
          false,
          apiResponse
        )
      }

      const choice = apiResponse.choices[0]
      if (!choice.message || !choice.message.content) {
        throw new LLMError(
          LLMErrorCode.INVALID_RESPONSE,
          'Invalid API response: no content',
          false,
          apiResponse
        )
      }

      const latency = Date.now() - startTime

      return {
        content: choice.message.content,
        tokensUsed: apiResponse.usage.total_tokens,
        latency,
        model: apiResponse.model,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new LLMError(
          LLMErrorCode.TIMEOUT,
          `Request timeout after ${config.timeoutMs}ms`,
          true
        )
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new LLMError(
          LLMErrorCode.NETWORK_ERROR,
          'Network error',
          true,
          error
        )
      }

      // Re-throw LLMError
      if (error instanceof LLMError) {
        throw error
      }

      // Wrap unknown errors
      throw new LLMError(
        LLMErrorCode.API_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        false,
        error
      )
    }
  } catch (error) {
    // Re-throw LLMError
    if (error instanceof LLMError) {
      throw error
    }

    // Wrap configuration or other errors
    throw new LLMError(
      LLMErrorCode.API_ERROR,
      error instanceof Error ? error.message : 'Unknown error',
      false,
      error
    )
  }
}
