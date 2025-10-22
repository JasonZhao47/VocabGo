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

// Batching and rate limiting for mistake recording
interface PendingMistake {
  wordlistId: string
  word: string
  translation: string
  questionType: 'multiple_choice' | 'fill_blank' | 'matching'
}

const pendingMistakes: PendingMistake[] = []
const recordedMistakes: Set<string> = new Set()
let batchTimeout: ReturnType<typeof setTimeout> | null = null
const BATCH_DELAY_MS = 500 // Wait 500ms before sending batch
const MAX_BATCH_SIZE = 10 // Send batch if it reaches 10 items

/**
 * Record a practice mistake (batched and rate-limited)
 * This function is called when a student answers incorrectly
 * Batches multiple mistakes together to avoid rate limiting
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

  // Deduplicate: check if we already recorded this exact mistake
  const mistakeKey = `${wordlistId}-${word}-${questionType}`
  if (recordedMistakes.has(mistakeKey)) {
    console.log(`Skipping duplicate mistake for "${word}"`)
    return
  }
  
  // Mark as recorded
  recordedMistakes.add(mistakeKey)
  
  // Add to pending batch
  pendingMistakes.push({ wordlistId, word, translation, questionType })
  
  // If batch is full, send immediately
  if (pendingMistakes.length >= MAX_BATCH_SIZE) {
    if (batchTimeout) {
      clearTimeout(batchTimeout)
      batchTimeout = null
    }
    await sendMistakeBatch()
    return
  }
  
  // Otherwise, schedule batch send
  if (!batchTimeout) {
    batchTimeout = setTimeout(async () => {
      await sendMistakeBatch()
      batchTimeout = null
    }, BATCH_DELAY_MS)
  }
}

/**
 * Send batched mistakes to the API
 */
async function sendMistakeBatch(): Promise<void> {
  if (pendingMistakes.length === 0) return
  
  const sessionToken = localStorage.getItem('student_session_token')
  if (!sessionToken) return
  
  // Take all pending mistakes
  const batch = [...pendingMistakes]
  pendingMistakes.length = 0 // Clear the array
  
  console.log(`Sending batch of ${batch.length} mistakes`)
  
  // Send each mistake with a small delay between requests
  for (let i = 0; i < batch.length; i++) {
    const mistake = batch[i]
    
    // Add small delay between requests (100ms) to avoid rate limiting
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
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
        // If offline or error, queue for later
        queueMistake({ 
          wordlistId: mistake.wordlistId, 
          word: mistake.word, 
          translation: mistake.translation, 
          questionType: mistake.questionType, 
          timestamp: Date.now() 
        })
        console.warn('Failed to record mistake, queued for later:', { word: mistake.word, questionType: mistake.questionType })
      }
    } catch (error) {
      // Network error - queue for later
      queueMistake({ 
        wordlistId: mistake.wordlistId, 
        word: mistake.word, 
        translation: mistake.translation, 
        questionType: mistake.questionType, 
        timestamp: Date.now() 
      })
      console.warn('Network error recording mistake, queued for later:', error)
    }
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