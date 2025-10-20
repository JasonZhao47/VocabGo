/**
 * Practice Question Service
 * Handles API calls for practice question generation and mistake recording
 */

import { getSessionId } from '@/lib/session'
import type { PracticeQuestions } from '@/types/practice'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Offline queue for mistake recording
interface QueuedMistake {
  wordlistId: string
  word: string
  translation: string
  questionType: 'multiple_choice' | 'fill_blank' | 'matching'
  timestamp: number
}

let mistakeQueue: QueuedMistake[] = []
let isProcessingQueue = false

interface GenerateQuestionsRequest {
  wordlistId: string
  questionTypes?: ('matching' | 'fill-blank' | 'multiple-choice')[]
  maxQuestionsPerType?: number
}

interface GenerateQuestionsResponse {
  success: boolean
  practiceSetId?: string
  questions?: PracticeQuestions
  estimatedTimeMinutes?: number
  metadata?: {
    generationTimeMs: number
    wordCount: number
    questionCounts: {
      matching: number
      fillBlank: number
      multipleChoice: number
    }
    cached?: boolean
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * Generate practice questions from a wordlist
 */
export async function generatePracticeQuestions(
  wordlistId: string,
  questionTypes?: ('matching' | 'fill-blank' | 'multiple-choice')[],
  maxQuestionsPerType?: number
): Promise<PracticeQuestions> {
  try {
    const sessionId = getSessionId()

    const request: GenerateQuestionsRequest = {
      wordlistId,
      questionTypes: questionTypes || ['matching', 'fill-blank', 'multiple-choice'],
      maxQuestionsPerType: maxQuestionsPerType || 10,
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'x-session-id': sessionId,
        },
        body: JSON.stringify(request),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to generate practice questions')
    }

    const result: GenerateQuestionsResponse = await response.json()

    if (!result.success || !result.questions) {
      throw new Error(result.error?.message || 'Failed to generate practice questions')
    }

    return result.questions
  } catch (error) {
    console.error('Error generating practice questions:', error)
    throw error
  }
}

/**
 * Validate if a wordlist can generate practice questions
 */
export function canGenerateQuestions(wordCount: number): {
  canGenerate: boolean
  reason?: string
} {
  const MIN_WORDS = 4

  if (wordCount < MIN_WORDS) {
    return {
      canGenerate: false,
      reason: `At least ${MIN_WORDS} words are required to generate practice questions. This wordlist has ${wordCount} word${wordCount === 1 ? '' : 's'}.`,
    }
  }

  return { canGenerate: true }
}

/**
 * Get recommended question types based on word count
 */
export function getRecommendedQuestionTypes(
  wordCount: number
): ('matching' | 'fill-blank' | 'multiple-choice')[] {
  const types: ('matching' | 'fill-blank' | 'multiple-choice')[] = []

  // Matching requires at least 4 words
  if (wordCount >= 4) {
    types.push('matching')
  }

  // Fill-blank works with any number of words
  types.push('fill-blank')

  // Multiple choice requires at least 4 words for good distractors
  if (wordCount >= 4) {
    types.push('multiple-choice')
  }

  return types
}

/**
 * Estimate generation time based on word count
 */
export function estimateGenerationTime(wordCount: number): number {
  // Rough estimate: 0.2 seconds per word
  const baseTime = wordCount * 0.2

  // Add overhead for AI processing
  const overhead = 2

  return Math.ceil(baseTime + overhead)
}

/**
 * Record a practice mistake (fire and forget)
 * This function is called when a student answers incorrectly
 * It handles offline scenarios by queuing mistakes for later
 */
export async function recordPracticeMistake(
  wordlistId: string,
  word: string,
  translation: string,
  questionType: 'multiple_choice' | 'fill_blank' | 'matching'
): Promise<void> {
  // Get session token from localStorage
  const sessionToken = localStorage.getItem('student_session_token')
  
  if (!sessionToken) {
    console.warn('No student session token found, skipping mistake recording')
    return
  }

  // Fire and forget - don't block UI
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/record-practice-mistake`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionToken,
          wordlistId,
          word,
          translation,
          questionType,
        }),
      }
    )

    if (!response.ok) {
      // If offline or error, queue for later
      queueMistake({ wordlistId, word, translation, questionType, timestamp: Date.now() })
      console.warn('Failed to record mistake, queued for later:', { word, questionType })
    }
  } catch (error) {
    // Network error - queue for later
    queueMistake({ wordlistId, word, translation, questionType, timestamp: Date.now() })
    console.warn('Network error recording mistake, queued for later:', error)
  }
}

/**
 * Queue a mistake for later processing (offline support)
 */
function queueMistake(mistake: QueuedMistake): void {
  mistakeQueue.push(mistake)
  
  // Persist queue to localStorage
  try {
    localStorage.setItem('mistake_queue', JSON.stringify(mistakeQueue))
  } catch (error) {
    console.error('Failed to persist mistake queue:', error)
  }

  // Try to process queue
  processQueue()
}

/**
 * Process queued mistakes when back online
 */
async function processQueue(): Promise<void> {
  if (isProcessingQueue || mistakeQueue.length === 0) {
    return
  }

  isProcessingQueue = true

  // Load queue from localStorage if empty
  if (mistakeQueue.length === 0) {
    try {
      const stored = localStorage.getItem('mistake_queue')
      if (stored) {
        mistakeQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load mistake queue:', error)
    }
  }

  const sessionToken = localStorage.getItem('student_session_token')
  if (!sessionToken) {
    isProcessingQueue = false
    return
  }

  // Process each queued mistake
  const failedMistakes: QueuedMistake[] = []

  for (const mistake of mistakeQueue) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/record-practice-mistake`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            sessionToken,
            wordlistId: mistake.wordlistId,
            word: mistake.word,
            translation: mistake.translation,
            questionType: mistake.questionType,
          }),
        }
      )

      if (!response.ok) {
        failedMistakes.push(mistake)
      }
    } catch (error) {
      // Still offline, keep in queue
      failedMistakes.push(mistake)
    }
  }

  // Update queue with failed items
  mistakeQueue = failedMistakes

  // Update localStorage
  try {
    if (mistakeQueue.length > 0) {
      localStorage.setItem('mistake_queue', JSON.stringify(mistakeQueue))
    } else {
      localStorage.removeItem('mistake_queue')
    }
  } catch (error) {
    console.error('Failed to update mistake queue:', error)
  }

  isProcessingQueue = false
}

/**
 * Initialize mistake recording system
 * Call this when the app loads to process any queued mistakes
 */
export function initializeMistakeRecording(): void {
  // Try to process queue on load
processQueue()

  // Set up online/offline listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Back online, processing queued mistakes')
      processQueue()
    })
  }
}

/**
 * Expose recordMistake function to window for HTML practice files
 */
if (typeof window !== 'undefined') {
  (window as any).recordPracticeMistake = recordPracticeMistake
}