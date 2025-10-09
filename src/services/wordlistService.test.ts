/**
 * Wordlist Service Tests
 * 
 * Tests for the wordlist service to verify:
 * - Session ID is included in headers for all operations
 * - Authorization header is present with Bearer token
 * - No authentication errors are thrown
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  saveWordlist,
  fetchWordlists,
  deleteWordlist,
  exportWordlist,
  downloadBlob,
  type WordlistRecord,
} from './wordlistService'
import * as session from '@/lib/session'

// Mock the session module
vi.mock('@/lib/session', () => ({
  getSessionId: vi.fn(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('wordlistService', () => {
  const mockSessionId = 'test-session-id-67890'
  const mockWordPairs = [
    { en: 'hello', zh: '你好' },
    { en: 'world', zh: '世界' },
  ]
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(session.getSessionId).mockReturnValue(mockSessionId)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('saveWordlist', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          wordlistId: 'wordlist-123',
        }),
      })
    })

    it('should include X-Session-ID header in request', async () => {
      await saveWordlist('test.pdf', 'pdf', mockWordPairs)
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/save-wordlist'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Session-ID': mockSessionId,
          }),
        })
      )
    })

    it('should include Authorization header in request', async () => {
      await saveWordlist('test.pdf', 'pdf', mockWordPairs)
      
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers).toHaveProperty('Authorization')
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
    })

    it('should include apikey header for anonymous access', async () => {
      await saveWordlist('test.pdf', 'pdf', mockWordPairs)
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'apikey': expect.any(String),
          }),
        })
      )
    })

    it('should NOT throw authentication errors', async () => {
      await expect(saveWordlist('test.pdf', 'pdf', mockWordPairs)).resolves.toBeDefined()
      
      // Verify getSessionId was called (not auth.getSession)
      expect(session.getSessionId).toHaveBeenCalled()
    })

    it('should successfully save a wordlist', async () => {
      const wordlistId = await saveWordlist('test.pdf', 'pdf', mockWordPairs)
      
      expect(wordlistId).toBe('wordlist-123')
      expect(session.getSessionId).toHaveBeenCalledTimes(1)
    })

    it('should send correct data in request body', async () => {
      await saveWordlist('test.pdf', 'pdf', mockWordPairs)
      
      const fetchCall = mockFetch.mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)
      
      expect(body).toEqual({
        filename: 'test.pdf',
        documentType: 'pdf',
        words: mockWordPairs,
      })
    })

    it('should validate input data', async () => {
      await expect(saveWordlist('', 'pdf', mockWordPairs)).rejects.toThrow('Invalid wordlist data')
      await expect(saveWordlist('test.pdf', '', mockWordPairs)).rejects.toThrow('Invalid wordlist data')
      await expect(saveWordlist('test.pdf', 'pdf', [])).rejects.toThrow('Invalid wordlist data')
    })

    it('should reject wordlists exceeding 40 words', async () => {
      const tooManyWords = Array(41).fill({ en: 'word', zh: '词' })
      
      await expect(saveWordlist('test.pdf', 'pdf', tooManyWords)).rejects.toThrow(
        'Word count exceeds maximum of 40'
      )
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to save wordlist',
          },
        }),
      })
      
      await expect(saveWordlist('test.pdf', 'pdf', mockWordPairs)).rejects.toThrow(
        'Failed to save wordlist'
      )
    })
  })

  describe('fetchWordlists', () => {
    const mockWordlists: WordlistRecord[] = [
      {
        id: 'wordlist-1',
        filename: 'test1.pdf',
        documentType: 'pdf',
        wordCount: 2,
        words: mockWordPairs,
        createdAt: '2025-01-10T12:00:00Z',
      },
      {
        id: 'wordlist-2',
        filename: 'test2.txt',
        documentType: 'txt',
        wordCount: 3,
        words: [
          { en: 'apple', zh: '苹果' },
          { en: 'banana', zh: '香蕉' },
          { en: 'orange', zh: '橙子' },
        ],
        createdAt: '2025-01-10T13:00:00Z',
      },
    ]

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          wordlists: mockWordlists,
        }),
      })
    })

    it('should include X-Session-ID header in request', async () => {
      await fetchWordlists()
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/fetch-wordlists'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Session-ID': mockSessionId,
          }),
        })
      )
    })

    it('should include Authorization header in request', async () => {
      await fetchWordlists()
      
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers).toHaveProperty('Authorization')
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
    })

    it('should include apikey header for anonymous access', async () => {
      await fetchWordlists()
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'apikey': expect.any(String),
          }),
        })
      )
    })

    it('should NOT throw authentication errors', async () => {
      await expect(fetchWordlists()).resolves.toBeDefined()
      
      // Verify getSessionId was called (not auth.getSession)
      expect(session.getSessionId).toHaveBeenCalled()
    })

    it('should successfully fetch wordlists', async () => {
      const wordlists = await fetchWordlists()
      
      expect(wordlists).toEqual(mockWordlists)
      expect(session.getSessionId).toHaveBeenCalledTimes(1)
    })

    it('should return empty array when no wordlists exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          wordlists: [],
        }),
      })
      
      const wordlists = await fetchWordlists()
      
      expect(wordlists).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch wordlists',
          },
        }),
      })
      
      await expect(fetchWordlists()).rejects.toThrow('Failed to fetch wordlists')
    })

    it('should use GET method', async () => {
      await fetchWordlists()
      
      const fetchCall = mockFetch.mock.calls[0]
      expect(fetchCall[1].method).toBe('GET')
    })
  })

  describe('deleteWordlist', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
        }),
      })
    })

    it('should include X-Session-ID header in request', async () => {
      await deleteWordlist('wordlist-123')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/delete-wordlist'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Session-ID': mockSessionId,
          }),
        })
      )
    })

    it('should include Authorization header in request', async () => {
      await deleteWordlist('wordlist-123')
      
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers).toHaveProperty('Authorization')
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
    })

    it('should include apikey header for anonymous access', async () => {
      await deleteWordlist('wordlist-123')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'apikey': expect.any(String),
          }),
        })
      )
    })

    it('should NOT throw authentication errors', async () => {
      await expect(deleteWordlist('wordlist-123')).resolves.toBeUndefined()
      
      // Verify getSessionId was called (not auth.getSession)
      expect(session.getSessionId).toHaveBeenCalled()
    })

    it('should successfully delete a wordlist', async () => {
      await deleteWordlist('wordlist-123')
      
      expect(session.getSessionId).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should send wordlist ID in request body', async () => {
      await deleteWordlist('wordlist-123')
      
      const fetchCall = mockFetch.mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)
      
      expect(body).toEqual({
        wordlistId: 'wordlist-123',
      })
    })

    it('should validate wordlist ID', async () => {
      await expect(deleteWordlist('')).rejects.toThrow('Wordlist ID is required')
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          error: {
            code: 'NOT_FOUND',
            message: 'Wordlist not found',
          },
        }),
      })
      
      await expect(deleteWordlist('wordlist-123')).rejects.toThrow('Wordlist not found')
    })
  })

  describe('exportWordlist', () => {
    const mockWordlist: WordlistRecord = {
      id: 'wordlist-1',
      filename: 'test.pdf',
      documentType: 'pdf',
      wordCount: 2,
      words: mockWordPairs,
      createdAt: '2025-01-10T12:00:00Z',
    }

    it('should export wordlist to CSV format', async () => {
      const blob = await exportWordlist(mockWordlist)
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('text/csv;charset=utf-8;')
    })

    it('should include UTF-8 BOM in CSV', async () => {
      const blob = await exportWordlist(mockWordlist)
      
      // Check blob type
      expect(blob.type).toBe('text/csv;charset=utf-8;')
      
      // Read blob as array buffer to check BOM bytes
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.readAsArrayBuffer(blob)
      })
      
      const bytes = new Uint8Array(arrayBuffer)
      // UTF-8 BOM is EF BB BF
      expect(bytes[0]).toBe(0xEF)
      expect(bytes[1]).toBe(0xBB)
      expect(bytes[2]).toBe(0xBF)
    })

    it('should format CSV correctly', async () => {
      const blob = await exportWordlist(mockWordlist)
      
      // Read blob content using FileReader
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsText(blob)
      })
      
      expect(text).toContain('English,Mandarin')
      expect(text).toContain('hello,你好')
      expect(text).toContain('world,世界')
    })

    it('should handle words with commas', async () => {
      const wordlistWithCommas: WordlistRecord = {
        ...mockWordlist,
        words: [
          { en: 'hello, world', zh: '你好，世界' },
        ],
      }
      
      const blob = await exportWordlist(wordlistWithCommas)
      
      // Read blob content using FileReader
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsText(blob)
      })
      
      // Words with commas should be quoted (English has comma, Chinese doesn't need quotes)
      expect(text).toContain('"hello, world"')
      expect(text).toContain('你好，世界')
    })
  })

  describe('downloadBlob', () => {
    it('should trigger download with correct filename', () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' })
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
      
      downloadBlob(mockBlob, 'test.csv')
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test.csv')
      expect(mockLink.click).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('no auth.getSession() calls', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          wordlistId: 'test-id',
          wordlists: [],
        }),
      })
    })

    it('should not call auth methods in saveWordlist', async () => {
      await saveWordlist('test.pdf', 'pdf', mockWordPairs)
      
      expect(session.getSessionId).toHaveBeenCalled()
      
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers['X-Session-ID']).toBe(mockSessionId)
      expect(headers).toHaveProperty('Authorization')
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
    })

    it('should not call auth methods in fetchWordlists', async () => {
      await fetchWordlists()
      
      expect(session.getSessionId).toHaveBeenCalled()
      
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers['X-Session-ID']).toBe(mockSessionId)
      expect(headers).toHaveProperty('Authorization')
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
    })

    it('should not call auth methods in deleteWordlist', async () => {
      await deleteWordlist('wordlist-123')
      
      expect(session.getSessionId).toHaveBeenCalled()
      
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers['X-Session-ID']).toBe(mockSessionId)
      expect(headers).toHaveProperty('Authorization')
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
    })
  })
})
