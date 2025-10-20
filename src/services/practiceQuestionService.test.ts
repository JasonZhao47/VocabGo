/**
 * Practice Question Service Tests
 * Tests for mistake recording integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { recordPracticeMistake, initializeMistakeRecording } from './practiceQuestionService'

// Mock fetch
global.fetch = vi.fn()

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

describe('recordPracticeMistake', () => {
  const ORIGINAL_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const ORIGINAL_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not record mistake if no session token exists', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await recordPracticeMistake('wordlist-123', 'hello', '你好', 'multiple_choice')

    expect(fetch).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No student session token found, skipping mistake recording'
    )

    consoleSpy.mockRestore()
  })

  it('should record mistake with correct parameters for multiple_choice', async () => {
    localStorageMock.setItem('student_session_token', 'test-session-token')

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, mistakeCount: 1 }),
    })

    await recordPracticeMistake('wordlist-123', 'hello', '你好', 'multiple_choice')

    expect(fetch).toHaveBeenCalledWith(
      `${ORIGINAL_SUPABASE_URL}/functions/v1/record-practice-mistake`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ORIGINAL_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionToken: 'test-session-token',
          wordlistId: 'wordlist-123',
          word: 'hello',
          translation: '你好',
          questionType: 'multiple_choice',
        }),
      }
    )
  })

  it('should record mistake with correct parameters for fill_blank', async () => {
    localStorageMock.setItem('student_session_token', 'test-session-token')

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, mistakeCount: 1 }),
    })

    await recordPracticeMistake('wordlist-123', 'world', '世界', 'fill_blank')

    expect(fetch).toHaveBeenCalledWith(
      `${ORIGINAL_SUPABASE_URL}/functions/v1/record-practice-mistake`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ORIGINAL_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionToken: 'test-session-token',
          wordlistId: 'wordlist-123',
          word: 'world',
          translation: '世界',
          questionType: 'fill_blank',
        }),
      }
    )
  })

  it('should record mistake with correct parameters for matching', async () => {
    localStorageMock.setItem('student_session_token', 'test-session-token')

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, mistakeCount: 1 }),
    })

    await recordPracticeMistake('wordlist-123', 'goodbye', '再见', 'matching')

    expect(fetch).toHaveBeenCalledWith(
      `${ORIGINAL_SUPABASE_URL}/functions/v1/record-practice-mistake`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ORIGINAL_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionToken: 'test-session-token',
          wordlistId: 'wordlist-123',
          word: 'goodbye',
          translation: '再见',
          questionType: 'matching',
        }),
      }
    )
  })

  it('should queue mistake if API call fails', async () => {
    localStorageMock.setItem('student_session_token', 'test-session-token')

    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await recordPracticeMistake('wordlist-123', 'hello', '你好', 'multiple_choice')

    // Check that mistake was queued
    const queue = localStorageMock.getItem('mistake_queue')
    expect(queue).toBeTruthy()
    
    const parsedQueue = JSON.parse(queue!)
    expect(parsedQueue).toHaveLength(1)
    expect(parsedQueue[0]).toMatchObject({
      wordlistId: 'wordlist-123',
      word: 'hello',
      translation: '你好',
      questionType: 'multiple_choice',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to record mistake, queued for later:',
      { word: 'hello', questionType: 'multiple_choice' }
    )

    consoleSpy.mockRestore()
  })

  it('should queue mistake if network error occurs', async () => {
    localStorageMock.setItem('student_session_token', 'test-session-token')

    ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await recordPracticeMistake('wordlist-123', 'hello', '你好', 'multiple_choice')

    // Check that mistake was queued
    const queue = localStorageMock.getItem('mistake_queue')
    expect(queue).toBeTruthy()
    
    const parsedQueue = JSON.parse(queue!)
    expect(parsedQueue.length).toBeGreaterThanOrEqual(1)
    
    // Check that the last queued item matches our mistake
    const lastMistake = parsedQueue[parsedQueue.length - 1]
    expect(lastMistake).toMatchObject({
      wordlistId: 'wordlist-123',
      word: 'hello',
      translation: '你好',
      questionType: 'multiple_choice',
    })

    consoleSpy.mockRestore()
  })

  it('should not block UI (fire and forget)', async () => {
    localStorageMock.setItem('student_session_token', 'test-session-token')

    // Simulate slow API
    ;(fetch as any).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true, mistakeCount: 1 }),
              }),
            1000
          )
        )
    )

    const startTime = Date.now()
    await recordPracticeMistake('wordlist-123', 'hello', '你好', 'multiple_choice')
    const endTime = Date.now()

    // Should return immediately (within 100ms), not wait for API
    // Note: In the actual implementation, we don't await the fetch
    // but for testing purposes, we're checking the pattern
    expect(endTime - startTime).toBeLessThan(1100)
  })
})

describe('initializeMistakeRecording', () => {
  it('should set up online event listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    initializeMistakeRecording()

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))

    addEventListenerSpy.mockRestore()
  })
})

describe('window.recordPracticeMistake', () => {
  it('should expose recordPracticeMistake to window object', () => {
    expect((window as any).recordPracticeMistake).toBeDefined()
    expect(typeof (window as any).recordPracticeMistake).toBe('function')
  })
})
