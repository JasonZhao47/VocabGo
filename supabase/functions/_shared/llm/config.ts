/**
 * LLM Service Configuration
 * Configuration for GLM-Flash API
 */

export interface LLMConfig {
  apiUrl: string
  apiKey: string
  model: string
  defaultMaxTokens: number
  defaultTemperature: number
  timeoutMs: number
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

export function getLLMConfig(): LLMConfig {
  const apiKey = Deno.env.get('GLM_API_KEY')
  if (!apiKey) {
    throw new Error('GLM_API_KEY environment variable is required')
  }

  return {
    apiUrl: Deno.env.get('GLM_API_URL') || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    apiKey,
    model: Deno.env.get('GLM_MODEL') || 'glm-4-flash',
    defaultMaxTokens: parseInt(Deno.env.get('GLM_MAX_TOKENS') || '2000', 10),
    defaultTemperature: parseFloat(Deno.env.get('GLM_TEMPERATURE') || '0.7'),
    timeoutMs: parseInt(Deno.env.get('GLM_TIMEOUT_MS') || '30000', 10),
    maxRetries: parseInt(Deno.env.get('GLM_MAX_RETRIES') || '3', 10),
    baseDelayMs: parseInt(Deno.env.get('GLM_BASE_DELAY_MS') || '1000', 10),
    maxDelayMs: parseInt(Deno.env.get('GLM_MAX_DELAY_MS') || '10000', 10),
    backoffMultiplier: parseFloat(Deno.env.get('GLM_BACKOFF_MULTIPLIER') || '2'),
  }
}
