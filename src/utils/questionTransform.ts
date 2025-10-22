import type { PracticeQuestions } from '@/types/practice'

/**
 * Transformed question format for AllQuestionsView component
 */
export interface TransformedQuestion {
  id: string
  type: 'matching' | 'fill-blank' | 'multiple-choice'
  
  // Matching question fields
  pairs?: Array<{ english: string; mandarin: string }>
  shuffledMandarin?: string[]
  
  // Fill-blank question fields
  sentence?: string
  correctAnswer?: string
  hint?: string
  
  // Multiple-choice question fields
  question?: string
  options?: Array<{ text: string; isCorrect: boolean }>
}

/**
 * Transform PracticeQuestions to format suitable for AllQuestionsView
 * Adds ID generation, Mandarin shuffling, and hint generation
 */
export function transformQuestionsForView(questions: PracticeQuestions): TransformedQuestion[] {
  const result: TransformedQuestion[] = []

  // Transform matching questions
  questions.matching.forEach((q) => {
    // Questions from API already have english/mandarin format
    const pairs = q.pairs
    
    // Shuffle Mandarin translations
    const shuffledMandarin = [...pairs.map(p => p.mandarin)]
      .sort(() => Math.random() - 0.5)
    
    result.push({
      id: q.id || generateQuestionId(),
      type: 'matching',
      pairs,
      shuffledMandarin
    })
  })

  // Transform fill-blank questions
  questions.fillBlank.forEach((q) => {
    // Generate hint: first letter + spaced underscores for remaining letters
    const hint = generateHint(q.correctAnswer)
    
    result.push({
      id: q.id || generateQuestionId(),
      type: 'fill-blank',
      sentence: q.sentence,
      correctAnswer: q.correctAnswer,
      hint
    })
  })

  // Transform multiple-choice questions
  questions.multipleChoice.forEach((q) => {
    // Questions from API already have options with text/isCorrect format
    const options = q.options
    
    result.push({
      id: q.id || generateQuestionId(),
      type: 'multiple-choice',
      question: q.sentence,
      options
    })
  })

  return result
}

/**
 * Generate a hint for fill-blank questions
 * Format: first letter + spaced underscores for remaining letters
 * Example: "hello" -> "h _ _ _ _"
 */
export function generateHint(answer: string): string {
  if (!answer || answer.length === 0) {
    return ''
  }
  
  const firstLetter = answer.charAt(0)
  const remainingLength = Math.max(0, answer.length - 1)
  
  if (remainingLength === 0) {
    return firstLetter
  }
  
  const underscores = Array(remainingLength).fill('_').join(' ')
  return `${firstLetter} ${underscores}`
}

/**
 * Generate a unique ID for a question
 */
function generateQuestionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
