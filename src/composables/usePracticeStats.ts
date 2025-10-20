/**
 * usePracticeStats Composable
 * 
 * Manages practice statistics for shared wordlists.
 * Handles fetching stats, generating questions from mistakes, and caching.
 * 
 * Requirements: FR4, NFR1
 */

import { ref, readonly } from 'vue'

// API base URL
const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL

// Cache duration: 30 seconds
const CACHE_DURATION_MS = 30 * 1000

export interface TopMistake {
  word: string
  translation: string
  count: number
}

export interface StudentStats {
  sessionId: string
  nickname: string
  lastActive: string
  totalMistakes: number
  topMistakes: TopMistake[]
}

export interface AggregateMistake {
  word: string
  translation: string
  studentCount: number
  totalCount: number
  avgPerStudent: number
}

export interface PracticeStats {
  wordlistId: string
  totalStudents: number
  totalPractices: number
  students: StudentStats[]
  aggregateMistakes: AggregateMistake[]
}

export interface QuestionCounts {
  matching: number
  fillBlank: number
  multipleChoice: number
}

export interface MistakeStats {
  totalMistakes: number
  studentCount: number
}

export interface GenerateQuestionsMetadata {
  generationTimeMs: number
  wordCount: number
  questionCounts: QuestionCounts
  filteredByStudents: boolean
  mistakeStats: MistakeStats
}

export interface MatchingQuestion {
  type: 'matching'
  pairs: Array<{ en: string; zh: string }>
}

export interface FillBlankQuestion {
  type: 'fill-blank'
  sentence: string
  correctAnswer: string
  translation: string
}

export interface MultipleChoiceQuestion {
  type: 'multiple-choice'
  question: string
  options: string[]
  correctAnswer: string
  word: string
}

export interface QuestionSet {
  matching: MatchingQuestion[]
  fillBlank: FillBlankQuestion[]
  multipleChoice: MultipleChoiceQuestion[]
}

export interface GenerateQuestionsResult {
  questions: QuestionSet
  targetWords: string[]
  metadata: GenerateQuestionsMetadata
}

export interface FetchStatsResponse {
  success: boolean
  wordlistId?: string
  totalStudents?: number
  totalPractices?: number
  students?: StudentStats[]
  aggregateMistakes?: AggregateMistake[]
  error?: {
    code: string
    message: string
  }
}

export interface GenerateQuestionsResponse {
  success: boolean
  questions?: QuestionSet
  targetWords?: string[]
  metadata?: GenerateQuestionsMetadata
  error?: {
    code: string
    message: string
  }
}

// Cache storage
interface CacheEntry {
  data: PracticeStats
  timestamp: number
}

const statsCache = new Map<string, CacheEntry>()

/**
 * Get session ID from localStorage
 */
function getSessionId(): string | null {
  try {
    return localStorage.getItem('session_id')
  } catch (err) {
    console.error('Failed to get session ID from localStorage:', err)
    return null
  }
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION_MS
}

/**
 * Get cached stats if available and valid
 */
function getCachedStats(cacheKey: string): PracticeStats | null {
  const entry = statsCache.get(cacheKey)
  if (entry && isCacheValid(entry)) {
    return entry.data
  }
  return null
}

/**
 * Store stats in cache
 */
function setCachedStats(cacheKey: string, data: PracticeStats): void {
  statsCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  })
}

/**
 * Create composable instance for a specific wordlist
 */
export function usePracticeStats(wordlistId: string) {
  const stats = ref<PracticeStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch practice statistics for the wordlist
   * 
   * @param dateRange - Optional date range filter ('all', 'today', 'week', 'month', or ISO date)
   * @returns Promise with stats data
   */
  async function fetchStats(dateRange: string = 'all'): Promise<PracticeStats | null> {
    // Check cache first
    const cacheKey = `${wordlistId}:${dateRange}`
    const cached = getCachedStats(cacheKey)
    
    if (cached) {
      stats.value = cached
      return cached
    }

    isLoading.value = true
    error.value = null

    try {
      const sessionId = getSessionId()
      if (!sessionId) {
        throw new Error('No active session. Please log in.')
      }

      const url = new URL(`${API_BASE_URL}/functions/v1/fetch-practice-stats`)
      url.searchParams.set('wordlistId', wordlistId)
      url.searchParams.set('dateRange', dateRange)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
      })

      const data: FetchStatsResponse = await response.json()

      if (!response.ok || !data.success) {
        const errorMessage = data.error?.message || 'Failed to fetch practice stats'
        error.value = errorMessage
        return null
      }

      // Build stats object
      const statsData: PracticeStats = {
        wordlistId: data.wordlistId!,
        totalStudents: data.totalStudents!,
        totalPractices: data.totalPractices!,
        students: data.students!,
        aggregateMistakes: data.aggregateMistakes!,
      }

      stats.value = statsData

      // Cache the result
      setCachedStats(cacheKey, statsData)

      return statsData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.'
      error.value = errorMessage
      console.error('Failed to fetch practice stats:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Generate practice questions from most-missed words
   * 
   * @param topN - Number of top mistakes to target (default: 10)
   * @param questionTypes - Types of questions to generate (default: all types)
   * @param studentSessionIds - Optional: filter by specific students
   * @returns Promise with generated questions
   */
  async function generateFromMistakes(
    topN: number = 10,
    questionTypes?: ('matching' | 'fill-blank' | 'multiple-choice')[],
    studentSessionIds?: string[]
  ): Promise<GenerateQuestionsResult | null> {
    isLoading.value = true
    error.value = null

    try {
      const sessionId = getSessionId()
      if (!sessionId) {
        throw new Error('No active session. Please log in.')
      }

      const response = await fetch(`${API_BASE_URL}/functions/v1/generate-questions-from-mistakes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          wordlistId,
          topN,
          questionTypes,
          studentSessionIds,
        }),
      })

      const data: GenerateQuestionsResponse = await response.json()

      if (!response.ok || !data.success) {
        const errorMessage = data.error?.message || 'Failed to generate questions'
        error.value = errorMessage
        return null
      }

      return {
        questions: data.questions!,
        targetWords: data.targetWords!,
        metadata: data.metadata!,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.'
      error.value = errorMessage
      console.error('Failed to generate questions from mistakes:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear cached stats for this wordlist
   */
  function clearCache(): void {
    // Clear all cache entries for this wordlist
    const keysToDelete: string[] = []
    statsCache.forEach((_, key) => {
      if (key.startsWith(`${wordlistId}:`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => statsCache.delete(key))
  }

  return {
    // State (readonly)
    stats: readonly(stats),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Actions
    fetchStats,
    generateFromMistakes,
    clearCache,
  }
}
