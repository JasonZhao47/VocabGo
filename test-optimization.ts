import { PracticeHtmlGenerator } from './src/services/practiceHtmlGenerator'
import type { Question } from './src/types/practice'

// Create test questions
const testQuestions: Question[] = [
  {
    id: '1',
    type: 'multiple-choice',
    data: {
      sentence: 'The cat is on the mat.',
      targetWord: 'cat',
      options: [
        { text: 'dog', isCorrect: false },
        { text: 'cat', isCorrect: true },
        { text: 'bird', isCorrect: false },
        { text: 'fish', isCorrect: false }
      ]
    }
  },
  {
    id: '2',
    type: 'fill-blank',
    data: {
      sentence: 'The ___ is shining brightly.',
      correctAnswer: 'sun',
      acceptableVariations: ['Sun', 'SUN']
    }
  }
]

// Test HTML generation with optimizations
const generator = new PracticeHtmlGenerator()
const result = generator.generateHtml({
  wordlistName: 'Test Wordlist',
  questions: testQuestions,
  timestamp: new Date()
})

console.log('\n=== Optimization Test Results ===')
console.log(`Filename: ${result.filename}`)
console.log(`File size: ${(result.size / 1024).toFixed(2)} KB`)
console.log(`Within 500KB target: ${result.size < 500 * 1024 ? 'YES ✓' : 'NO ✗'}`)
console.log(`HTML length: ${result.html.length} characters`)
console.log('\n=== First 500 characters of HTML ===')
console.log(result.html.substring(0, 500))
