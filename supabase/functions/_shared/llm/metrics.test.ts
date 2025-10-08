/**
 * Unit tests for LLM metrics logging
 */

import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { assertSpyCall, assertSpyCalls, spy } from 'https://deno.land/std@0.208.0/testing/mock.ts'
import { logMetrics, calculateCost, aggregateMetrics } from './metrics.ts'
import { LLMMetrics } from './types.ts'

function createTestMetrics(overrides: Partial<LLMMetrics> = {}): LLMMetrics {
  return {
    promptTokens: 50,
    completionTokens: 50,
    totalTokens: 100,
    latencyMs: 1000,
    timestamp: new Date('2025-01-08T12:00:00Z'),
    agentType: 'cleaner',
    jobId: 'test-job-123',
    confidence: 0.95,
    ...overrides,
  }
}

Deno.test('logMetrics - logs metrics to console', () => {
  const metrics = createTestMetrics()
  
  const consoleSpy = spy(console, 'log')
  
  try {
    logMetrics(metrics)
    
    assertSpyCalls(consoleSpy, 1)
    assertSpyCall(consoleSpy, 0, {
      args: [
        'LLM Metrics:',
        {
          agentType: 'cleaner',
          jobId: 'test-job-123',
          promptTokens: 50,
          completionTokens: 50,
          totalTokens: 100,
          latencyMs: 1000,
          confidence: 0.95,
          timestamp: '2025-01-08T12:00:00.000Z',
        },
      ],
    })
  } finally {
    consoleSpy.restore()
  }
})

Deno.test('logMetrics - handles metrics without optional fields', () => {
  const metrics: LLMMetrics = {
    promptTokens: 30,
    completionTokens: 20,
    totalTokens: 50,
    latencyMs: 500,
    timestamp: new Date(),
    agentType: 'extractor',
  }
  
  const consoleSpy = spy(console, 'log')
  
  try {
    logMetrics(metrics)
    
    assertSpyCalls(consoleSpy, 1)
    const loggedData = consoleSpy.calls[0].args[1] as any
    assertEquals(loggedData.agentType, 'extractor')
    assertEquals(loggedData.totalTokens, 50)
    assertEquals(loggedData.jobId, undefined)
    assertEquals(loggedData.confidence, undefined)
  } finally {
    consoleSpy.restore()
  }
})

Deno.test('calculateCost - calculates cost correctly', () => {
  const metrics = createTestMetrics({
    promptTokens: 1000,
    completionTokens: 2000,
  })
  
  const cost = calculateCost(metrics)
  
  // 1000 * 0.000001 + 2000 * 0.000002 = 0.001 + 0.004 = 0.005
  assertEquals(cost, 0.005)
})

Deno.test('calculateCost - handles zero tokens', () => {
  const metrics = createTestMetrics({
    promptTokens: 0,
    completionTokens: 0,
  })
  
  const cost = calculateCost(metrics)
  
  assertEquals(cost, 0)
})

Deno.test('calculateCost - handles large token counts', () => {
  const metrics = createTestMetrics({
    promptTokens: 100000,
    completionTokens: 50000,
  })
  
  const cost = calculateCost(metrics)
  
  // 100000 * 0.000001 + 50000 * 0.000002 = 0.1 + 0.1 = 0.2
  assertEquals(cost, 0.2)
})

Deno.test('aggregateMetrics - aggregates single metric', () => {
  const metrics = [createTestMetrics()]
  
  const result = aggregateMetrics(metrics)
  
  assertEquals(result.totalCalls, 1)
  assertEquals(result.totalTokens, 100)
  assertEquals(result.averageLatency, 1000)
  assertEquals(result.successRate, 1.0)
  assertEquals(typeof result.totalCost, 'number')
  assertEquals(result.totalCost > 0, true)
})

Deno.test('aggregateMetrics - aggregates multiple metrics', () => {
  const metrics = [
    createTestMetrics({ totalTokens: 100, latencyMs: 1000 }),
    createTestMetrics({ totalTokens: 200, latencyMs: 2000 }),
    createTestMetrics({ totalTokens: 150, latencyMs: 1500 }),
  ]
  
  const result = aggregateMetrics(metrics)
  
  assertEquals(result.totalCalls, 3)
  assertEquals(result.totalTokens, 450)
  assertEquals(result.averageLatency, 1500) // (1000 + 2000 + 1500) / 3
  assertEquals(result.successRate, 1.0)
})

Deno.test('aggregateMetrics - aggregates by agent type', () => {
  const metrics = [
    createTestMetrics({ agentType: 'cleaner', totalTokens: 100, latencyMs: 1000 }),
    createTestMetrics({ agentType: 'cleaner', totalTokens: 150, latencyMs: 1200 }),
    createTestMetrics({ agentType: 'extractor', totalTokens: 200, latencyMs: 2000 }),
    createTestMetrics({ agentType: 'translator', totalTokens: 300, latencyMs: 3000 }),
  ]
  
  const result = aggregateMetrics(metrics)
  
  assertEquals(result.totalCalls, 4)
  assertEquals(result.totalTokens, 750)
  
  // Check cleaner stats
  assertEquals(result.byAgent.cleaner.calls, 2)
  assertEquals(result.byAgent.cleaner.tokens, 250)
  assertEquals(result.byAgent.cleaner.averageLatency, 1100) // (1000 + 1200) / 2
  
  // Check extractor stats
  assertEquals(result.byAgent.extractor.calls, 1)
  assertEquals(result.byAgent.extractor.tokens, 200)
  assertEquals(result.byAgent.extractor.averageLatency, 2000)
  
  // Check translator stats
  assertEquals(result.byAgent.translator.calls, 1)
  assertEquals(result.byAgent.translator.tokens, 300)
  assertEquals(result.byAgent.translator.averageLatency, 3000)
})

Deno.test('aggregateMetrics - calculates costs by agent', () => {
  const metrics = [
    createTestMetrics({
      agentType: 'cleaner',
      promptTokens: 1000,
      completionTokens: 500,
    }),
    createTestMetrics({
      agentType: 'extractor',
      promptTokens: 2000,
      completionTokens: 1000,
    }),
  ]
  
  const result = aggregateMetrics(metrics)
  
  assertEquals(typeof result.byAgent.cleaner.cost, 'number')
  assertEquals(result.byAgent.cleaner.cost > 0, true)
  assertEquals(typeof result.byAgent.extractor.cost, 'number')
  assertEquals(result.byAgent.extractor.cost > 0, true)
  
  // Total cost should equal sum of agent costs
  const sumOfAgentCosts = result.byAgent.cleaner.cost + result.byAgent.extractor.cost
  assertEquals(Math.abs(result.totalCost - sumOfAgentCosts) < 0.0001, true)
})

Deno.test('aggregateMetrics - handles empty metrics array', () => {
  const result = aggregateMetrics([])
  
  assertEquals(result.totalCalls, 0)
  assertEquals(result.totalTokens, 0)
  assertEquals(result.totalCost, 0)
  assertEquals(result.averageLatency, 0)
  assertEquals(result.successRate, 1.0)
  assertEquals(Object.keys(result.byAgent).length, 0)
})

Deno.test('aggregateMetrics - handles metrics with varying token counts', () => {
  const metrics = [
    createTestMetrics({ promptTokens: 10, completionTokens: 5, totalTokens: 15 }),
    createTestMetrics({ promptTokens: 100, completionTokens: 50, totalTokens: 150 }),
    createTestMetrics({ promptTokens: 1000, completionTokens: 500, totalTokens: 1500 }),
  ]
  
  const result = aggregateMetrics(metrics)
  
  assertEquals(result.totalCalls, 3)
  assertEquals(result.totalTokens, 1665)
  
  // Cost should increase with token count
  assertEquals(result.totalCost > 0, true)
})

Deno.test('aggregateMetrics - calculates average latency correctly for each agent', () => {
  const metrics = [
    createTestMetrics({ agentType: 'cleaner', latencyMs: 1000 }),
    createTestMetrics({ agentType: 'cleaner', latencyMs: 2000 }),
    createTestMetrics({ agentType: 'cleaner', latencyMs: 3000 }),
    createTestMetrics({ agentType: 'extractor', latencyMs: 500 }),
    createTestMetrics({ agentType: 'extractor', latencyMs: 1500 }),
  ]
  
  const result = aggregateMetrics(metrics)
  
  // Cleaner average: (1000 + 2000 + 3000) / 3 = 2000
  assertEquals(result.byAgent.cleaner.averageLatency, 2000)
  
  // Extractor average: (500 + 1500) / 2 = 1000
  assertEquals(result.byAgent.extractor.averageLatency, 1000)
  
  // Overall average: (1000 + 2000 + 3000 + 500 + 1500) / 5 = 1600
  assertEquals(result.averageLatency, 1600)
})

Deno.test('aggregateMetrics - handles all three agent types', () => {
  const metrics = [
    createTestMetrics({ agentType: 'cleaner' }),
    createTestMetrics({ agentType: 'extractor' }),
    createTestMetrics({ agentType: 'translator' }),
  ]
  
  const result = aggregateMetrics(metrics)
  
  assertEquals(Object.keys(result.byAgent).length, 3)
  assertEquals(result.byAgent.cleaner.calls, 1)
  assertEquals(result.byAgent.extractor.calls, 1)
  assertEquals(result.byAgent.translator.calls, 1)
})

Deno.test('aggregateMetrics - accumulates tokens correctly', () => {
  const metrics = [
    createTestMetrics({
      agentType: 'cleaner',
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
    }),
    createTestMetrics({
      agentType: 'cleaner',
      promptTokens: 200,
      completionTokens: 100,
      totalTokens: 300,
    }),
  ]
  
  const result = aggregateMetrics(metrics)
  
  assertEquals(result.byAgent.cleaner.tokens, 450) // 150 + 300
  assertEquals(result.totalTokens, 450)
})
