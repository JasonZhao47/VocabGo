# LLM Service

GLM-Flash API integration with retry logic and metrics logging.

## Features

- **GLM-Flash API Integration**: Direct integration with GLM-4-Flash model
- **Automatic Retry**: Exponential backoff retry for transient failures
- **Error Handling**: Comprehensive error classification and handling
- **Metrics Logging**: Track token usage, latency, and costs
- **Timeout Management**: Configurable request timeouts
- **Type Safety**: Full TypeScript type definitions

## Usage

### Basic Usage

```typescript
import { callLLM } from './_shared/llm/index.ts'

const response = await callLLM({
  prompt: 'Extract key vocabulary words from this text...',
  systemPrompt: 'You are a vocabulary extraction assistant.',
  maxTokens: 2000,
  temperature: 0.7,
})

console.log(response.content)
console.log(`Tokens used: ${response.tokensUsed}`)
console.log(`Latency: ${response.latency}ms`)
```

### With Retry Logic

```typescript
import { callLLMWithRetry } from './_shared/llm/index.ts'

const response = await callLLMWithRetry(
  {
    prompt: 'Translate these words to Mandarin...',
    maxTokens: 1000,
  },
  {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
  }
)
```

### With Metrics Logging

```typescript
import { callLLMWithMetrics } from './_shared/llm/index.ts'

const response = await callLLMWithMetrics(
  {
    prompt: 'Clean this document text...',
  },
  'cleaner', // Agent type
  'job-123' // Job ID
)
```

## Configuration

Set these environment variables:

```bash
# Required
GLM_API_KEY=your-api-key

# Optional (with defaults)
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
GLM_MODEL=glm-4-flash
GLM_MAX_TOKENS=2000
GLM_TEMPERATURE=0.7
GLM_TIMEOUT_MS=30000
GLM_MAX_RETRIES=3
GLM_BASE_DELAY_MS=1000
GLM_MAX_DELAY_MS=10000
GLM_BACKOFF_MULTIPLIER=2
```

## Error Handling

The service throws `LLMError` with specific error codes:

- `LLM_TIMEOUT`: Request timeout (retryable)
- `LLM_RATE_LIMIT`: Rate limit exceeded (retryable)
- `TOKEN_LIMIT_EXCEEDED`: Token limit exceeded (not retryable)
- `LLM_API_ERROR`: API error (retryable if 5xx)
- `LLM_INVALID_RESPONSE`: Invalid response format (not retryable)
- `LLM_NETWORK_ERROR`: Network error (retryable)

```typescript
import { LLMError, LLMErrorCode } from './_shared/llm/index.ts'

try {
  const response = await callLLM(request)
} catch (error) {
  if (error instanceof LLMError) {
    console.error(`LLM Error [${error.code}]: ${error.message}`)
    console.error(`Retryable: ${error.retryable}`)
  }
}
```

## Retry Strategy

The retry logic uses exponential backoff:

1. First retry: 1 second delay
2. Second retry: 2 seconds delay
3. Third retry: 4 seconds delay
4. Maximum delay: 10 seconds

Only retryable errors are retried (timeouts, rate limits, network errors, 5xx errors).

## Metrics

Metrics are logged for each LLM call:

```typescript
{
  agentType: 'cleaner' | 'extractor' | 'translator',
  jobId: 'job-123',
  promptTokens: 150,
  completionTokens: 850,
  totalTokens: 1000,
  latencyMs: 2500,
  confidence: 0.95,
  timestamp: '2025-01-08T12:00:00Z'
}
```

Use `aggregateMetrics()` to calculate totals and costs:

```typescript
import { aggregateMetrics } from './_shared/llm/index.ts'

const stats = aggregateMetrics(allMetrics)
console.log(`Total cost: $${stats.totalCost.toFixed(4)}`)
console.log(`Average latency: ${stats.averageLatency}ms`)
```

## Architecture

```
llm/
├── types.ts       # TypeScript types and interfaces
├── config.ts      # Configuration management
├── service.ts     # Core GLM-Flash API integration
├── retry.ts       # Retry logic with exponential backoff
├── metrics.ts     # Metrics logging and aggregation
├── index.ts       # Main entry point
└── README.md      # This file
```
