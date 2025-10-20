/**
 * Tests for useStudentSession composable
 * 
 * Tests localStorage persistence, API integration, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useStudentSession } from './useStudentSession'

// Mock fetch globally
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock navigator and window for device fingerprinting
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
  },
  writable: true,
})

Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
  },
  writable: true,
})

// Mock Intl.DateTimeFormat
global.Intl = {
  DateTimeFormat: () => ({
    resolvedOptions: () => ({ timeZone: 'America/New_York' }),
  }),
} as any

// Helper to reset the composable state
function resetComposableState() {
  const { clearSession } = useStudentSession()
  clearSession()
}

describe('useStudentSession', () => {
  beforeEach(() => {
    localStorageMock.clear()
    mockFetch.mockClear()
    vi.clearAllMocks()
    resetComposableState()
  })

  afterEach(() => {
    localStorageMock.clear()
    resetComposableState()
  })

  describe('localStorage persistence', () => {
    it('should load session data from localStorage on mount', () => {
      // Pre-populate localStorage
      localStorageMock.setItem('student_session_token', 'test-token-123')
      localStorageMock.setItem('student_nickname', 'TestStudent')
      localStorageMock.setItem('student_session_id', 'session-id-456')

      const { sessionToken, nickname, sessionId } = useStudentSession()

      // Values should be loaded from localStorage
      expect(sessionToken.value).toBe('test-token-123')
      expect(nickname.value).toBe('TestStudent')
      expect(sessionId.value).toBe('session-id-456')
    })

    it('should handle missing localStorage data gracefully', () => {
      const { sessionToken, nickname, sessionId } = useStudentSession()

      expect(sessionToken.value).toBeNull()
      expect(nickname.value).toBeNull()
      expect(sessionId.value).toBeNull()
    })

    it('should save session data to localStorage after registration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionToken: 'new-token-789',
          sessionId: 'new-session-id-012',
          wordlist: {
            id: 'wordlist-123',
            title: 'Test Wordlist',
            words: [{ en: 'hello', zh: '你好' }],
          },
        }),
      })

      const { registerSession } = useStudentSession()

      await registerSession('share-token-abc', 'NewStudent')

      expect(localStorageMock.getItem('student_session_token')).toBe('new-token-789')
      expect(localStorageMock.getItem('student_nickname')).toBe('NewStudent')
      expect(localStorageMock.getItem('student_session_id')).toBe('new-session-id-012')
    })

    it('should clear localStorage when clearing session', () => {
      localStorageMock.setItem('student_session_token', 'test-token')
      localStorageMock.setItem('student_nickname', 'TestStudent')
      localStorageMock.setItem('student_session_id', 'session-id')

      const { clearSession } = useStudentSession()
      clearSession()

      expect(localStorageMock.getItem('student_session_token')).toBeNull()
      expect(localStorageMock.getItem('student_nickname')).toBeNull()
      expect(localStorageMock.getItem('student_session_id')).toBeNull()
    })
  })

  describe('registerSession', () => {
    it('should successfully register a new session', async () => {
      const mockResponse = {
        success: true,
        sessionToken: 'token-abc123',
        sessionId: 'session-xyz789',
        wordlist: {
          id: 'wordlist-001',
          title: 'My Wordlist',
          words: [
            { en: 'apple', zh: '苹果' },
            { en: 'book', zh: '书' },
          ],
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { registerSession, sessionToken, nickname, sessionId } = useStudentSession()

      const result = await registerSession('share-token-123', 'Alice')

      expect(result.success).toBe(true)
      expect(result.sessionToken).toBe('token-abc123')
      expect(result.sessionId).toBe('session-xyz789')
      expect(result.wordlist?.title).toBe('My Wordlist')

      // State should be updated
      expect(sessionToken.value).toBe('token-abc123')
      expect(nickname.value).toBe('Alice')
      expect(sessionId.value).toBe('session-xyz789')
    })

    it('should include device fingerprint in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionToken: 'token',
          sessionId: 'session',
          wordlist: { id: 'w1', title: 'Test', words: [] },
        }),
      })

      const { registerSession } = useStudentSession()

      await registerSession('share-token', 'Bob')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/register-student-session'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"deviceInfo"'),
        })
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.deviceInfo).toEqual({
        userAgent: 'Mozilla/5.0 (Test Browser)',
        screenResolution: '1920x1080',
        timezone: 'America/New_York',
      })
    })

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            code: 'INVALID_SHARE_TOKEN',
            message: 'Invalid share token format',
          },
        }),
      })

      const { registerSession, error } = useStudentSession()

      const result = await registerSession('invalid-token', 'Charlie')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_SHARE_TOKEN')
      expect(error.value).toBe('Invalid share token format')
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'))

      const { registerSession, error } = useStudentSession()

      const result = await registerSession('share-token', 'David')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(error.value).toContain('Network connection failed')
    })

    it('should set loading state during registration', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockFetch.mockReturnValueOnce(promise as any)

      const { registerSession, isLoading } = useStudentSession()

      const registrationPromise = registerSession('share-token', 'Eve')

      // Should be loading
      expect(isLoading.value).toBe(true)

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({
          success: true,
          sessionToken: 'token',
          sessionId: 'session',
          wordlist: { id: 'w1', title: 'Test', words: [] },
        }),
      })

      await registrationPromise

      // Should no longer be loading
      expect(isLoading.value).toBe(false)
    })
  })

  describe('recordMistake', () => {
    it('should successfully record a mistake', async () => {
      // Set up existing session
      localStorageMock.setItem('student_session_token', 'active-token')
      localStorageMock.setItem('student_nickname', 'TestStudent')
      localStorageMock.setItem('student_session_id', 'session-123')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          mistakeCount: 1,
        }),
      })

      const { recordMistake } = useStudentSession()

      const result = await recordMistake(
        'wordlist-123',
        'apple',
        '苹果',
        'multiple_choice'
      )

      expect(result.success).toBe(true)
      expect(result.mistakeCount).toBe(1)

      // Check that fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalled()
      const fetchCall = mockFetch.mock.calls[0]
      expect(fetchCall[0]).toContain('/record-practice-mistake')
      expect(fetchCall[1].method).toBe('POST')
      const body = JSON.parse(fetchCall[1].body)
      expect(body.sessionToken).toBe('active-token')
      expect(body.wordlistId).toBe('wordlist-123')
    })

    it('should handle missing session gracefully', async () => {
      // Ensure no session exists
      localStorageMock.clear()
      resetComposableState()
      
      const { recordMistake } = useStudentSession()

      const result = await recordMistake(
        'wordlist-123',
        'apple',
        '苹果',
        'fill_blank'
      )

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NO_SESSION')

      // Should not make API call
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle API errors without blocking', async () => {
      localStorageMock.setItem('student_session_token', 'active-token')
      localStorageMock.setItem('student_nickname', 'TestStudent')
      localStorageMock.setItem('student_session_id', 'session-123')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
          },
        }),
      })

      const { recordMistake } = useStudentSession()

      const result = await recordMistake(
        'wordlist-123',
        'book',
        '书',
        'matching'
      )

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should handle network errors without blocking', async () => {
      localStorageMock.setItem('student_session_token', 'active-token')
      localStorageMock.setItem('student_nickname', 'TestStudent')
      localStorageMock.setItem('student_session_id', 'session-123')

      mockFetch.mockRejectedValueOnce(new Error('Network timeout'))

      const { recordMistake } = useStudentSession()

      const result = await recordMistake(
        'wordlist-123',
        'cat',
        '猫',
        'multiple_choice'
      )

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
    })

    it('should support all question types', async () => {
      localStorageMock.setItem('student_session_token', 'active-token')
      localStorageMock.setItem('student_nickname', 'TestStudent')
      localStorageMock.setItem('student_session_id', 'session-123')

      const questionTypes: Array<'multiple_choice' | 'fill_blank' | 'matching'> = [
        'multiple_choice',
        'fill_blank',
        'matching',
      ]

      for (const questionType of questionTypes) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            mistakeCount: 1,
          }),
        })

        const { recordMistake } = useStudentSession()

        const result = await recordMistake(
          'wordlist-123',
          'test',
          '测试',
          questionType
        )

        expect(result.success).toBe(true)
      }

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('session management', () => {
    it('should correctly identify active session', () => {
      localStorageMock.setItem('student_session_token', 'token')
      localStorageMock.setItem('student_nickname', 'Frank')
      localStorageMock.setItem('student_session_id', 'session')

      const { hasActiveSession } = useStudentSession()

      expect(hasActiveSession()).toBe(true)
    })

    it('should correctly identify inactive session', () => {
      const { hasActiveSession } = useStudentSession()

      expect(hasActiveSession()).toBe(false)
    })

    it('should clear all session state', () => {
      localStorageMock.setItem('student_session_token', 'token')
      localStorageMock.setItem('student_nickname', 'Grace')
      localStorageMock.setItem('student_session_id', 'session')

      const { clearSession, sessionToken, nickname, sessionId } = useStudentSession()

      clearSession()

      expect(sessionToken.value).toBeNull()
      expect(nickname.value).toBeNull()
      expect(sessionId.value).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should clear error state on successful registration', async () => {
      // First, trigger an error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { registerSession, error } = useStudentSession()

      await registerSession('share-token', 'Henry')
      expect(error.value).toBeTruthy()

      // Then, succeed
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionToken: 'token',
          sessionId: 'session',
          wordlist: { id: 'w1', title: 'Test', words: [] },
        }),
      })

      await registerSession('share-token', 'Henry')
      expect(error.value).toBeNull()
    })

    it('should provide user-friendly error messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            code: 'INVALID_NICKNAME',
            message: 'Nickname must be at least 2 characters',
          },
        }),
      })

      const { registerSession, error } = useStudentSession()

      await registerSession('share-token', 'I')

      expect(error.value).toBe('Nickname must be at least 2 characters')
    })
  })
})
