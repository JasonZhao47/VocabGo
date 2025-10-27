/**
 * Simple verification script for dynamic token calculation
 */

function calculateMaxTokens(wordCount: number): number {
  return Math.min(wordCount * 2 + 50, 500)
}

// Test cases
const testCases = [
  { wordCount: 10, expected: 70 },   // 10 * 2 + 50 = 70
  { wordCount: 40, expected: 130 },  // 40 * 2 + 50 = 130
  { wordCount: 100, expected: 250 }, // 100 * 2 + 50 = 250
  { wordCount: 225, expected: 500 }, // 225 * 2 + 50 = 500 (capped)
  { wordCount: 300, expected: 500 }, // 300 * 2 + 50 = 650, but capped at 500
]

console.log('Testing dynamic token calculation...\n')

let allPassed = true
for (const testCase of testCases) {
  const result = calculateMaxTokens(testCase.wordCount)
  const passed = result === testCase.expected
  allPassed = allPassed && passed
  
  const status = passed ? '✅' : '❌'
  console.log(`${status} wordCount: ${testCase.wordCount} → maxTokens: ${result} (expected: ${testCase.expected})`)
}

console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`)

if (!allPassed) {
  Deno.exit(1)
}
