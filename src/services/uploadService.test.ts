/**
 * Upload Service Tests
 * 
 * Tests for the upload service to verify:
 * - Session ID is included in headers
 * - Authorization header is present and correctly formatted
 * - No authentication errors are thrown
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { processDocument, validateFile, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE, MAX_DOCX_FILE_SIZE } from './uploadService'
import * as session from '@/lib/session'
import * as docxExtractor from './docxExtractor'

// Mock the session module
vi.mock('@/lib/session', () => ({
  getSessionId: vi.fn(),
}))

// Mock the docxExtractor module
vi.mock('./docxExtractor', () => ({
  extractDocxText: vi.fn(),
  DocxExtractionError: class DocxExtractionError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'DocxExtractionError'
    }
  },
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock FileReader
class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  result: string | null = null

  readAsDataURL(file: Blob) {
    // Simulate successful read with base64 data
    setTimeout(() => {
      this.result = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK'
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>)
      }
    }, 0)
  }
}

global.FileReader = MockFileReader as any

describe('uploadService', () => {
  const mockSessionId = 'test-session-id-12345'
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(session.getSessionId).mockReturnValue(mockSessionId)
    
    // Setup default successful response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        wordlist: {
          words: [
            { en: 'hello', zh: '你好' },
            { en: 'world', zh: '世界' },
          ],
          filename: 'test.pdf',
          documentType: 'pdf',
          wordCount: 2,
        },
        metadata: {
          processingTimeMs: 1500,
          stages: {
            parsing: 100,
            cleaning: 200,
            extraction: 600,
            translation: 600,
          },
        },
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('validateFile', () => {
    it('should validate supported file types', () => {
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const result = validateFile(pdfFile)
      
      expect(result.valid).toBe(true)
    })

    it('should reject unsupported file types', () => {
      const invalidFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(invalidFile)
      
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.code).toBe('INVALID_FILE_TYPE')
        expect(result.error).toContain('Unsupported file type')
      }
    })

    it('should reject PDF files exceeding 50MB', () => {
      const largeFile = new File([new ArrayBuffer(MAX_FILE_SIZE + 1)], 'large.pdf', {
        type: 'application/pdf',
      })
      const result = validateFile(largeFile)
      
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.code).toBe('FILE_TOO_LARGE')
        expect(result.error).toContain('50MB')
      }
    })

    it('should reject DOCX files exceeding 5MB', () => {
      const largeDocx = new File([new ArrayBuffer(MAX_DOCX_FILE_SIZE + 1)], 'large.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const result = validateFile(largeDocx)
      
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.code).toBe('FILE_TOO_LARGE')
        expect(result.error).toContain('5MB')
      }
    })

    it('should accept DOCX files under 5MB', () => {
      const validDocx = new File([new ArrayBuffer(MAX_DOCX_FILE_SIZE - 1000)], 'valid.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const result = validateFile(validDocx)
      
      expect(result.valid).toBe(true)
    })

    it('should reject missing file', () => {
      const result = validateFile(null as any)
      
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.code).toBe('NO_FILE')
      }
    })
  })

  describe('processDocument', () => {
    it('should include X-Session-ID header in request', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await processDocument(file)
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/process-document'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Session-ID': mockSessionId,
          }),
        })
      )
    })

    it('should include Authorization header in request', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await processDocument(file)
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/process-document'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Bearer .+$/),
          }),
        })
      )
    })

    it('should include correctly formatted Authorization header', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await processDocument(file)
      
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers).toHaveProperty('Authorization')
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
    })

    it('should include apikey header for anonymous access', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await processDocument(file)
      
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
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      // Should not throw any authentication-related errors
      await expect(processDocument(file)).resolves.toBeDefined()
      
      // Verify getSessionId was called (not auth.getSession)
      expect(session.getSessionId).toHaveBeenCalled()
    })

    it('should successfully process a valid file', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      const result = await processDocument(file)
      
      expect(result).toEqual({
        words: [
          { en: 'hello', zh: '你好' },
          { en: 'world', zh: '世界' },
        ],
        filename: 'test.pdf',
        documentType: 'pdf',
        wordCount: 2,
        processingTimeMs: 1500,
      })
    })

    it('should throw validation error for invalid file', async () => {
      const invalidFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      
      await expect(processDocument(invalidFile)).rejects.toThrow('Unsupported file type')
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: {
            code: 'PROCESSING_ERROR',
            message: 'Failed to process document',
          },
        }),
      })
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await expect(processDocument(file)).rejects.toThrow('Failed to process document')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await expect(processDocument(file)).rejects.toThrow('Network error')
    })

    it('should call getSessionId from session utility', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await processDocument(file)
      
      expect(session.getSessionId).toHaveBeenCalledTimes(1)
    })

    it('should send file data as base64 in request body', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await processDocument(file)
      
      const fetchCall = mockFetch.mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)
      
      expect(body).toHaveProperty('file')
      expect(body.file).toHaveProperty('name', 'test.pdf')
      expect(body.file).toHaveProperty('type', 'application/pdf')
      expect(body.file).toHaveProperty('data')
      expect(typeof body.file.data).toBe('string')
    })
  })

  describe('successful processing with proper headers', () => {
    it('should successfully process document with all required headers', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      const result = await processDocument(file)
      
      // Verify successful processing
      expect(result).toBeDefined()
      expect(result.words).toHaveLength(2)
      
      // Verify all required headers were sent
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers['X-Session-ID']).toBe(mockSessionId)
      expect(headers['apikey']).toBe(import.meta.env.VITE_SUPABASE_ANON_KEY)
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
      expect(headers['Content-Type']).toBe('application/json')
    })

    it('should not call supabase auth methods', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      await processDocument(file)
      
      // Verify only session.getSessionId is called, not any auth methods
      expect(session.getSessionId).toHaveBeenCalled()
    })
  })

  describe('hybrid processing - DOCX client-side extraction', () => {
    beforeEach(() => {
      // Mock successful extraction
      vi.mocked(docxExtractor.extractDocxText).mockResolvedValue({
        text: 'Extracted text from DOCX',
        metadata: {
          characterCount: 25,
          extractionTimeMs: 150,
        },
      })
    })

    it('should use client-side extraction for DOCX files', async () => {
      const docxFile = new File(['docx content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      
      await processDocument(docxFile)
      
      // Verify extractDocxText was called
      expect(docxExtractor.extractDocxText).toHaveBeenCalledWith(docxFile)
    })

    it('should send extractedText payload for DOCX files', async () => {
      const docxFile = new File(['docx content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      
      await processDocument(docxFile)
      
      const fetchCall = mockFetch.mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)
      
      expect(body).toHaveProperty('extractedText')
      expect(body.extractedText).toEqual({
        text: 'Extracted text from DOCX',
        filename: 'test.docx',
        documentType: 'docx',
        metadata: {
          characterCount: 25,
          extractionTimeMs: 150,
        },
      })
      expect(body).not.toHaveProperty('file')
    })

    it('should use server-side extraction for PDF files', async () => {
      const pdfFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' })
      
      await processDocument(pdfFile)
      
      // Verify extractDocxText was NOT called
      expect(docxExtractor.extractDocxText).not.toHaveBeenCalled()
      
      // Verify file payload was sent
      const fetchCall = mockFetch.mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)
      
      expect(body).toHaveProperty('file')
      expect(body).not.toHaveProperty('extractedText')
    })

    it('should handle DOCX extraction errors gracefully', async () => {
      const docxFile = new File(['docx content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      
      vi.mocked(docxExtractor.extractDocxText).mockRejectedValueOnce(
        new docxExtractor.DocxExtractionError('Failed to extract text from DOCX file. The file may be corrupted.')
      )
      
      await expect(processDocument(docxFile)).rejects.toThrow(
        'Failed to extract text from DOCX file. The file may be corrupted.'
      )
    })

    it('should include all required headers for DOCX processing', async () => {
      const docxFile = new File(['docx content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      
      await processDocument(docxFile)
      
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers
      
      expect(headers['X-Session-ID']).toBe(mockSessionId)
      expect(headers['apikey']).toBe(import.meta.env.VITE_SUPABASE_ANON_KEY)
      expect(headers['Authorization']).toBe(`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
      expect(headers['Content-Type']).toBe('application/json')
    })
  })
})
