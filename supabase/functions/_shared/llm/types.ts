/**
 * LLM Service Types
 * Types for GLM-Flash API integration
 */

export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

export interface LLMResponse {
  content: string
  tokensUsed: number
  latency: number
  model: string
}

export interface LLMMetrics {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  latencyMs: number
  timestamp: Date
  agentType: 'cleaner' | 'extractor' | 'translator'
  jobId?: string
  confidence?: number
}

export interface GLMAPIRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

export interface GLMAPIResponse {
  id: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export enum LLMErrorCode {
  TIMEOUT = 'LLM_TIMEOUT',
  RATE_LIMIT = 'LLM_RATE_LIMIT',
  TOKEN_LIMIT_EXCEEDED = 'TOKEN_LIMIT_EXCEEDED',
  API_ERROR = 'LLM_API_ERROR',
  INVALID_RESPONSE = 'LLM_INVALID_RESPONSE',
  NETWORK_ERROR = 'LLM_NETWORK_ERROR'
}

export class LLMError extends Error {
  constructor(
    public code: LLMErrorCode,
    message: string,
    public retryable: boolean = false,
    public details?: any
  ) {
    super(message)
    this.name = 'LLMError'
  }
}
