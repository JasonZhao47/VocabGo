/**
 * usePracticeStats Composable Tests
 * 
 * Tests for practice statistics management including:
 * - Fetching stats with date range filtering
 * - Generating questions from mistakes
 * - 30-second caching mechanism
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { usePracticeStats } from './usePracticeStats'
import type { FetchStatsResponse, GenerateQuestionsResponse } from './usePracticeStats'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

describe('usePracticeStats', () => {
  const mockWordlistId = 'wordlist-123'
  const mockSessionId = 'session-456'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    // Use the correct key that matches session.ts
    localStorageMock.setItem('vocabgo_session_id', mockSessionId)
    
    // Clear the cache between tests
    const { clearCache } = usePracticeStats(mockWordlistId)
    clearCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchStats', () => {
    it('should fetch practice stats successfully', async () => {
      const mockStats: FetchStatsResponse = {
        success: true,
        wordlistId: mockWordlistId,
        totalStudents: 5,
        totalPractices: 25,
        students: [
          {
            sessionId: 'student-1',
            nickname: 'Alice',
            lastActive: '2025-01-17T10:00:00Z',
            totalMistakes: 10,
            topMistakes: [
              { word: 'apple', translation: '苹果', count: 5 },
              { word: 'banana', translation: '香蕉', count: 3 },
            ],
          },
        ],
        aggregateMistakes: [
          {
            word: 'apple',
            translation: '苹果',
            studentCount: 3,
            totalCount: 15,
            avgPerStudent: 5.0,
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      const { stats, isLoading, error, fetchStats } = usePracticeStats(mockWordlistId)

      expect(stats.value).toBeNull()
      expect(isLoading.value).toBe(false)

      const result = await fetchStats('all')

      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(result).toEqual({
        wordlistId: mockWordlistId,
        totalStudents: 5,
        totalPractices: 25,
        students: mockStats.students,
        aggregateMistakes: mockStats.aggregateMistakes,
      })
      expect(stats.value).toEqual(result)

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const fetchCall = mockFetch.mock.calls[0]
      expect(fetchCall[0]).toContain('/functions/v1/fetch-practice-stats')
      expect(fetchCall[0]).toContain(`wordlistId=${mockWordlistId}`)
      expect(fetchCall[0]).toContain('dateRange=all')
      expect(fetchCall[1].headers['x-session-id']).toBe(mockSessionId)
    })

    it('should handle date range filtering', async () => {
      const mockStats: FetchStatsResponse = {
        success: true,
        wordlistId: mockWordlistId,
        totalStudents: 2,
        totalPractices: 10,
        students: [],
        aggregateMistakes: [],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      const { fetchStats } = usePracticeStats(mockWordlistId)
      await fetchStats('week')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const fetchCall = mockFetch.mock.calls[0]
      expect(fetchCall[0]).toContain('dateRange=week')
    })

    it('should handle API errors', async () => {
      const mockError: FetchStatsResponse = {
        success: false,
        error: {
          code: 'WORDLIST_NOT_FOUND',
          message: 'Wordlist not found',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      })

      const { stats, error, fetchStats } = usePracticeStats(mockWordlistId)
      const result = await fetchStats()

      expect(result).toBeNull()
      expect(stats.value).toBeNull()
      expect(error.value).toBe('Wordlist not found')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { stats, error, fetchStats } = usePracticeStats(mockWordlistId)
      const result = await fetchStats()

      expect(result).toBeNull()
      expect(stats.value).toBeNull()
      expect(error.value).toBe('Network error')
    })

    it('should auto-generate session ID if missing', async () => {
      localStorageMock.removeItem('vocabgo_session_id')

      const mockStats: FetchStatsResponse = {
        success: true,
        wordlistId: mockWordlistId,
        totalStudents: 0,
        totalPractices: 0,
        students: [],
        aggregateMistakes: [],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      const { fetchStats } = usePracticeStats(mockWordlistId)
      const result = await fetchStats()

      // Should auto-generate session ID and make the request
      expect(result).not.toBeNull()
      expect(mockFetch).toHaveBeenCalled()
      
      // Verify session ID was generated and stored
      const sessionId = localStorageMock.getItem('vocabgo_session_id')
      expect(sessionId).toBeTruthy()
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })
  })

  describe('caching', () => {
    it('should cache stats for 30 seconds', async () => {
      const mockStats: FetchStatsResponse = {
        success: true,
        wordlistId: mockWordlistId,
        totalStudents: 5,
        totalPractices: 25,
        students: [],
        aggregateMistakes: [],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      })

      const { fetchStats } = usePracticeStats(mockWordlistId)

      // First call - should fetch from API
      await fetchStats('all')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call immediately - should use cache
      await fetchStats('all')
      expect(mockFetch).toHaveBeenCalledTimes(1) // Still 1, not 2

      // Third call with different date range - should fetch from API
      await fetchStats('week')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should expire cache after 30 seconds', async () => {
      const mockStats: FetchStatsResponse = {
        success: true,
        wordlistId: mockWordlistId,
        totalStudents: 5,
        totalPractices: 25,
        students: [],
        aggregateMistakes: [],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      })

      const { fetchStats } = usePracticeStats(mockWordlistId)

      // First call
      await fetchStats('all')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Mock time passing (31 seconds)
      vi.useFakeTimers()
      vi.advanceTimersByTime(31 * 1000)

      // Second call after cache expiry - should fetch from API again
      await fetchStats('all')
      expect(mockFetch).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })

    it('should clear cache for wordlist', async () => {
      const mockStats: FetchStatsResponse = {
        success: true,
        wordlistId: mockWordlistId,
        totalStudents: 5,
        totalPractices: 25,
        students: [],
        aggregateMistakes: [],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      })

      const { fetchStats, clearCache } = usePracticeStats(mockWordlistId)

      // First call - should fetch from API
      await fetchStats('all')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Clear cache
      clearCache()

      // Second call - should fetch from API again
      await fetchStats('all')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('generateFromMistakes', () => {
    it('should generate questions from mistakes successfully', async () => {
      const mockResponse: GenerateQuestionsResponse = {
        success: true,
        questions: {
          matching: [
            {
              type: 'matching',
              pairs: [
                { en: 'apple', zh: '苹果' },
                { en: 'banana', zh: '香蕉' },
              ],
            },
          ],
          fillBlank: [
            {
              type: 'fill-blank',
              sentence: 'I like to eat ___.',
              correctAnswer: 'apple',
              translation: '我喜欢吃苹果。',
            },
          ],
          multipleChoice: [
            {
              type: 'multiple-choice',
              question: 'What is the translation of "apple"?',
              options: ['苹果', '香蕉', '橙子', '葡萄'],
              correctAnswer: '苹果',
              word: 'apple',
            },
          ],
        },
        targetWords: ['apple', 'banana'],
        metadata: {
          generationTimeMs: 1500,
          wordCount: 2,
          questionCounts: {
            matching: 1,
            fillBlank: 1,
            multipleChoice: 1,
          },
          filteredByStudents: false,
          mistakeStats: {
            totalMistakes: 20,
            studentCount: 5,
          },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { isLoading, error, generateFromMistakes } = usePracticeStats(mockWordlistId)

      expect(isLoading.value).toBe(false)

      const result = await generateFromMistakes(10)

      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(result).toEqual({
        questions: mockResponse.questions,
        targetWords: mockResponse.targetWords,
        metadata: mockResponse.metadata,
      })

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const fetchCall = mockFetch.mock.calls[0]
      expect(fetchCall[0]).toContain('/functions/v1/generate-questions-from-mistakes')
      expect(fetchCall[1].method).toBe('POST')
      expect(fetchCall[1].headers['x-session-id']).toBe(mockSessionId)

      const body = JSON.parse(fetchCall[1].body)
      expect(body.wordlistId).toBe(mockWordlistId)
      expect(body.topN).toBe(10)
    })

    it('should support custom question types', async () => {
      const mockResponse: GenerateQuestionsResponse = {
        success: true,
        questions: {
          matching: [],
          fillBlank: [
            {
              type: 'fill-blank',
              sentence: 'I like to eat ___.',
              correctAnswer: 'apple',
              translation: '我喜欢吃苹果。',
            },
          ],
          multipleChoice: [],
        },
        targetWords: ['apple'],
        metadata: {
          generationTimeMs: 1000,
          wordCount: 1,
          questionCounts: {
            matching: 0,
            fillBlank: 1,
            multipleChoice: 0,
          },
          filteredByStudents: false,
          mistakeStats: {
            totalMistakes: 10,
            studentCount: 3,
          },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { generateFromMistakes } = usePracticeStats(mockWordlistId)
      await generateFromMistakes(5, ['fill-blank'])

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.questionTypes).toEqual(['fill-blank'])
    })

    it('should support filtering by students', async () => {
      const mockResponse: GenerateQuestionsResponse = {
        success: true,
        questions: {
          matching: [],
          fillBlank: [],
          multipleChoice: [],
        },
        targetWords: [],
        metadata: {
          generationTimeMs: 500,
          wordCount: 0,
          questionCounts: {
            matching: 0,
            fillBlank: 0,
            multipleChoice: 0,
          },
          filteredByStudents: true,
          mistakeStats: {
            totalMistakes: 5,
            studentCount: 1,
          },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { generateFromMistakes } = usePracticeStats(mockWordlistId)
      await generateFromMistakes(10, undefined, ['student-1', 'student-2'])

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.studentSessionIds).toEqual(['student-1', 'student-2'])
    })

    it('should handle generation errors', async () => {
      const mockError: GenerateQuestionsResponse = {
        success: false,
        error: {
          code: 'NO_MISTAKES_FOUND',
          message: 'No practice mistakes found for this wordlist',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      })

      const { error, generateFromMistakes } = usePracticeStats(mockWordlistId)
      const result = await generateFromMistakes()

      expect(result).toBeNull()
      expect(error.value).toBe('No practice mistakes found for this wordlist')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { error, generateFromMistakes } = usePracticeStats(mockWordlistId)
      const result = await generateFromMistakes()

      expect(result).toBeNull()
      expect(error.value).toBe('Network error')
    })

    it('should auto-generate session ID if missing', async () => {
      localStorageMock.removeItem('vocabgo_session_id')

      const mockResponse: GenerateQuestionsResponse = {
        success: true,
        questions: {
          matching: [],
          fillBlank: [],
          multipleChoice: [],
        },
        targetWords: [],
        metadata: {
          generationTimeMs: 500,
          wordCount: 0,
          questionCounts: {
            matching: 0,
            fillBlank: 0,
            multipleChoice: 0,
          },
          filteredByStudents: false,
          mistakeStats: {
            totalMistakes: 0,
            studentCount: 0,
          },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { generateFromMistakes } = usePracticeStats(mockWordlistId)
      const result = await generateFromMistakes()

      // Should auto-generate session ID and make the request
      expect(result).not.toBeNull()
      expect(mockFetch).toHaveBeenCalled()
      
      // Verify session ID was generated and stored
      const sessionId = localStorageMock.getItem('vocabgo_session_id')
      expect(sessionId).toBeTruthy()
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })
  })
})
