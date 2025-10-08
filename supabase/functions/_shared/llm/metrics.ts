/**
 * LLM Metrics Logging
 * Logs metrics for observability and cost tracking
 */

import { LLMMetrics } from './types.ts'

/**
 * Log LLM metrics to console and database
 * In production, this would write to the llm_metrics table
 */
export function logMetrics(metrics: LLMMetrics): void {
  // Log to console for debugging
  console.log('LLM Metrics:', {
    agentType: metrics.agentType,
    jobId: metrics.jobId,
    promptTokens: metrics.promptTokens,
    completionTokens: metrics.completionTokens,
    totalTokens: metrics.totalTokens,
    latencyMs: metrics.latencyMs,
    confidence: metrics.confidence,
    timestamp: metrics.timestamp.toISOString(),
  })

  // TODO: Write to database in production
  // This will be implemented when we create the database integration
}

/**
 * Calculate estimated cost based on token usage
 * GLM-4-Flash pricing (example rates, adjust based on actual pricing)
 */
export function calculateCost(metrics: LLMMetrics): number {
  // Example pricing (adjust based on actual GLM-Flash pricing)
  const PROMPT_TOKEN_COST = 0.000001 // $0.001 per 1K tokens
  const COMPLETION_TOKEN_COST = 0.000002 // $0.002 per 1K tokens

  const promptCost = metrics.promptTokens * PROMPT_TOKEN_COST
  const completionCost = metrics.completionTokens * COMPLETION_TOKEN_COST

  return promptCost + completionCost
}

/**
 * Aggregate metrics for reporting
 */
export interface AggregatedMetrics {
  totalCalls: number
  totalTokens: number
  totalCost: number
  averageLatency: number
  successRate: number
  byAgent: Record<string, {
    calls: number
    tokens: number
    cost: number
    averageLatency: number
  }>
}

/**
 * Aggregate multiple metrics for reporting
 */
export function aggregateMetrics(metrics: LLMMetrics[]): AggregatedMetrics {
  const result: AggregatedMetrics = {
    totalCalls: metrics.length,
    totalTokens: 0,
    totalCost: 0,
    averageLatency: 0,
    successRate: 1.0, // Assuming all logged metrics are successful calls
    byAgent: {},
  }

  let totalLatency = 0

  for (const metric of metrics) {
    result.totalTokens += metric.totalTokens
    result.totalCost += calculateCost(metric)
    totalLatency += metric.latencyMs

    // Aggregate by agent type
    if (!result.byAgent[metric.agentType]) {
      result.byAgent[metric.agentType] = {
        calls: 0,
        tokens: 0,
        cost: 0,
        averageLatency: 0,
      }
    }

    const agentStats = result.byAgent[metric.agentType]
    agentStats.calls++
    agentStats.tokens += metric.totalTokens
    agentStats.cost += calculateCost(metric)
    agentStats.averageLatency = 
      (agentStats.averageLatency * (agentStats.calls - 1) + metric.latencyMs) / agentStats.calls
  }

  result.averageLatency = metrics.length > 0 ? totalLatency / metrics.length : 0

  return result
}
