/**
 * Sharing Service Tests
 * 
 * Tests for wordlist sharing operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { enableSharing, disableSharing, copyShareUrl } from './sharingService'
import * as session from '@/lib/session'

// Mock session module
vi.mock('@/lib/session', () => ({
  getSessionId: vi.fn(() => 'test-session-id'),
}))

describe('sharingService', () => {
  const mockFetch = vi.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = mockFetch
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('enableSharing', () => {
    it('should enable sharing and return share token and URL', async () => {
      const mockResponse = {
        success: true,
        shareToken: 'abc123xyz',
        shareUrl: 'http://localhost:5173/practice/abc123xyz',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await enableSharing('wordlist-123')

      expect(result).toEqual({
        shareToken: 'abc123xyz',
        shareUrl: 'http://localhost:5173/practice/abc123xyz',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/share-wordlist'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Session-ID': 'test-session-id',
          }),
          body: JSON.stringify({
            wordlistId: 'wordlist-123',
            enable: true,
            settings: undefined,
          }),
        })
      )
    })

    it('should enable sharing with custom settings', async () => {
      const mockResponse = {
        success: true,
        shareToken: 'abc123xyz',
        shareUrl: 'http://localhost:5173/practice/abc123xyz',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const settings = { anonymousMode: true }
      await enableSharing('wordlist-123', settings)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            wordlistId: 'wordlist-123',
            enable: true,
            settings,
          }),
        })
      )
    })

    it('should throw error if wordlistId is missing', async () => {
      await expect(enableSharing('')).rejects.toThrow('Wordlist ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should throw error if API returns error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          success: false,
          error: {
            code: 'WORDLIST_NOT_FOUND',
            message: 'Wordlist not found',
          },
        }),
      })

      await expect(enableSharing('wordlist-123')).rejects.toThrow('Wordlist not found')
    })

    it('should throw error if response is missing share data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          // Missing shareToken and shareUrl
        }),
      })

      await expect(enableSharing('wordlist-123')).rejects.toThrow('Failed to enable sharing')
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(enableSharing('wordlist-123')).rejects.toThrow('Network error')
    })

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error')

      await expect(enableSharing('wordlist-123')).rejects.toThrow(
        'An unexpected error occurred while enabling sharing'
      )
    })
  })

  describe('disableSharing', () => {
    it('should disable sharing successfully', async () => {
      const mockResponse = {
        success: true,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await expect(disableSharing('wordlist-123')).resolves.toBeUndefined()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/share-wordlist'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Session-ID': 'test-session-id',
          }),
          body: JSON.stringify({
            wordlistId: 'wordlist-123',
            enable: false,
          }),
        })
      )
    })

    it('should throw error if wordlistId is missing', async () => {
      await expect(disableSharing('')).rejects.toThrow('Wordlist ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should throw error if API returns error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this wordlist',
          },
        }),
      })

      await expect(disableSharing('wordlist-123')).rejects.toThrow(
        'You do not have permission to modify this wordlist'
      )
    })

    it('should throw error if response indicates failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update database',
          },
        }),
      })

      await expect(disableSharing('wordlist-123')).rejects.toThrow('Failed to update database')
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'))

      await expect(disableSharing('wordlist-123')).rejects.toThrow('Connection timeout')
    })

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error')

      await expect(disableSharing('wordlist-123')).rejects.toThrow(
        'An unexpected error occurred while disabling sharing'
      )
    })
  })

  describe('copyShareUrl', () => {
    const mockClipboard = {
      writeText: vi.fn(),
    }

    beforeEach(() => {
      // Mock navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
        configurable: true,
      })

      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:5173',
        },
        writable: true,
        configurable: true,
      })

      vi.clearAllMocks()
    })

    it('should copy share URL to clipboard', async () => {
      mockClipboard.writeText.mockResolvedValueOnce(undefined)

      await expect(copyShareUrl('abc123xyz')).resolves.toBeUndefined()

      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:5173/practice/abc123xyz'
      )
    })

    it('should throw error if share token is missing', async () => {
      await expect(copyShareUrl('')).rejects.toThrow('Share token is required')
      expect(mockClipboard.writeText).not.toHaveBeenCalled()
    })

    it('should throw error if clipboard API is not available', async () => {
      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      await expect(copyShareUrl('abc123xyz')).rejects.toThrow(
        'Your browser does not support copying to clipboard'
      )
    })

    it('should handle clipboard write errors', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Permission denied'))

      await expect(copyShareUrl('abc123xyz')).rejects.toThrow('Permission denied')
    })

    it('should construct URL with correct format', async () => {
      mockClipboard.writeText.mockResolvedValueOnce(undefined)

      await copyShareUrl('test-token-123')

      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:5173/practice/test-token-123'
      )
    })

    it('should handle non-Error exceptions', async () => {
      mockClipboard.writeText.mockRejectedValueOnce('Unknown error')

      await expect(copyShareUrl('abc123xyz')).rejects.toThrow(
        'Failed to copy share URL to clipboard'
      )
    })
  })
})
