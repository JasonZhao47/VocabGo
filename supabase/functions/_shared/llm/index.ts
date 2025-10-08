/**
 * LLM Service
 * Main entry point for LLM functionality
 */

export * from './types.ts'
export * from './config.ts'
export * from './service.ts'
export * from './retry.ts'
export * from './metrics.ts'

import { callLLM } from './service.ts'
import { withRetry, RetryConfig } from './retry.ts'
import { logMetrics } from './metrics.ts'
import { LLMRequest, LLMResponse, LLMMetrics } from './types.ts'

/**
 * Call LLM with automatic retry logic
 */
export async function callLLMWithRetry(
  request: LLMRequest,
  retryConfig?: Partial<RetryConfig>
): Promise<LLMResponse> {
  return withRetry(() => callLLM(request), retryConfig)
}

/**
 * Call LLM with retry and metrics logging
 */
export async function callLLMWithMetrics(
  request: LLMRequest,
  agentType: 'cleaner' | 'extractor' | 'translator',
  jobId?: string,
  retryConfig?: Partial<RetryConfig>
): Promise<LLMResponse> {
  const startTime = Date.now()
  
  try {
    const response = await callLLMWithRetry(request, retryConfig)
    
    // Log metrics
    const metrics: LLMMetrics = {
      promptTokens: 0, // Will be calculated from response
      completionTokens: 0, // Will be calculated from response
      totalTokens: response.tokensUsed,
      latencyMs: response.latency,
      timestamp: new Date(),
      agentType,
      jobId,
    }
    
    logMetrics(metrics)
    
    return response
  } catch (error) {
    // Log failed attempt metrics
    const metrics: LLMMetrics = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: Date.now() - startTime,
      timestamp: new Date(),
      agentType,
      jobId,
    }
    
    logMetrics(metrics)
    
    throw error
  }
}
