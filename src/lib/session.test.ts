import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getSessionId, clearSession } from './session'

describe('Session Management', () => {
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
      }
    }
  })()

  beforeEach(() => {
    // Reset localStorage before each test
    localStorageMock.clear()
    // Replace global localStorage with mock
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
  })

  describe('getSessionId', () => {
    it('should generate a UUID on first call', () => {
      const sessionId = getSessionId()
      
      expect(sessionId).toBeDefined()
      expect(typeof sessionId).toBe('string')
      expect(sessionId.length).toBeGreaterThan(0)
    })

    it('should generate a valid UUID v4 format', () => {
      const sessionId = getSessionId()
      
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // where x is any hexadecimal digit and y is one of 8, 9, A, or B
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      
      expect(sessionId).toMatch(uuidV4Regex)
    })

    it('should return the same ID on subsequent calls', () => {
      const firstCall = getSessionId()
      const secondCall = getSessionId()
      const thirdCall = getSessionId()
      
      expect(firstCall).toBe(secondCall)
      expect(secondCall).toBe(thirdCall)
    })

    it('should store the session ID in localStorage', () => {
      const sessionId = getSessionId()
      const storedId = localStorage.getItem('vocabgo_session_id')
      
      expect(storedId).toBe(sessionId)
    })

    it('should retrieve existing session ID from localStorage', () => {
      const existingId = 'existing-uuid-1234-5678-abcd'
      localStorage.setItem('vocabgo_session_id', existingId)
      
      const sessionId = getSessionId()
      
      expect(sessionId).toBe(existingId)
    })

    it('should not generate a new ID if one already exists', () => {
      const firstId = getSessionId()
      
      // Mock crypto.randomUUID to verify it's not called again
      const originalRandomUUID = crypto.randomUUID
      const mockRandomUUID = vi.fn(() => 'should-not-be-used' as `${string}-${string}-${string}-${string}-${string}`)
      crypto.randomUUID = mockRandomUUID as any
      
      const secondId = getSessionId()
      
      expect(secondId).toBe(firstId)
      expect(mockRandomUUID).not.toHaveBeenCalled()
      
      // Restore original function
      crypto.randomUUID = originalRandomUUID
    })
  })

  describe('clearSession', () => {
    it('should remove session ID from localStorage', () => {
      // First, create a session
      getSessionId()
      expect(localStorage.getItem('vocabgo_session_id')).not.toBeNull()
      
      // Clear the session
      clearSession()
      
      expect(localStorage.getItem('vocabgo_session_id')).toBeNull()
    })

    it('should allow generating a new session ID after clearing', () => {
      const firstId = getSessionId()
      
      clearSession()
      
      const newId = getSessionId()
      
      expect(newId).not.toBe(firstId)
      expect(newId).toBeDefined()
    })

    it('should not throw error if no session exists', () => {
      expect(() => clearSession()).not.toThrow()
    })

    it('should handle multiple clear calls gracefully', () => {
      getSessionId()
      
      expect(() => {
        clearSession()
        clearSession()
        clearSession()
      }).not.toThrow()
      
      expect(localStorage.getItem('vocabgo_session_id')).toBeNull()
    })
  })

  describe('Session isolation', () => {
    it('should generate unique IDs for different sessions', () => {
      const id1 = getSessionId()
      clearSession()
      const id2 = getSessionId()
      clearSession()
      const id3 = getSessionId()
      
      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })

    it('should maintain session across multiple getSessionId calls', () => {
      const calls = Array.from({ length: 10 }, () => getSessionId())
      const uniqueIds = new Set(calls)
      
      expect(uniqueIds.size).toBe(1)
    })
  })

  describe('Edge cases', () => {
    it('should handle localStorage being unavailable gracefully', () => {
      // This test documents expected behavior if localStorage fails
      // In a real browser environment, crypto.randomUUID would still work
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage unavailable')
      })
      
      expect(() => getSessionId()).toThrow()
      
      // Restore
      localStorage.getItem = originalGetItem
    })

    it('should use the correct localStorage key', () => {
      getSessionId()
      
      const storedValue = localStorage.getItem('vocabgo_session_id')
      expect(storedValue).not.toBeNull()
      expect(storedValue).toBeDefined()
    })
  })
})
