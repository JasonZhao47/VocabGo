/**
 * DOCX Extractor Tests
 * 
 * Tests for client-side DOCX text extraction
 */

import { describe, it, expect, vi } from 'vitest'
import { extractDocxText, DocxExtractionError } from './docxExtractor'

// Mock mammoth
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(),
  },
}))

import mammoth from 'mammoth'

// Helper to create a mock file with arrayBuffer support
function createMockFile(name: string): File {
  const file = new File(['mock content'], name, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  
  // Mock arrayBuffer method
  file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8))
  
  return file
}

describe('docxExtractor', () => {
  describe('extractDocxText', () => {
    it('successfully extracts text from valid DOCX', async () => {
      // Mock mammoth to return sample text
      vi.mocked(mammoth.extractRawText).mockResolvedValue({
        value: '  Hello World  \n\n\n  This is a test document.  ',
        messages: [],
      })

      const mockFile = createMockFile('test.docx')

      const result = await extractDocxText(mockFile)

      // Text should be cleaned (whitespace normalized, line breaks collapsed)
      expect(result.text).toContain('Hello World')
      expect(result.text).toContain('This is a test document.')
      expect(result.metadata.characterCount).toBeGreaterThan(0)
      expect(result.metadata.extractionTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('handles corrupted DOCX files gracefully', async () => {
      // Mock mammoth to throw an error
      vi.mocked(mammoth.extractRawText).mockRejectedValue(
        new Error('Invalid DOCX format')
      )

      const mockFile = createMockFile('corrupted.docx')

      await expect(extractDocxText(mockFile)).rejects.toThrow(DocxExtractionError)
      await expect(extractDocxText(mockFile)).rejects.toThrow(
        'Failed to extract text from DOCX file'
      )
    })

    it('validates extracted text is not empty', async () => {
      // Mock mammoth to return empty text
      vi.mocked(mammoth.extractRawText).mockResolvedValue({
        value: '   \n\n   ',
        messages: [],
      })

      const mockFile = createMockFile('empty.docx')

      await expect(extractDocxText(mockFile)).rejects.toThrow(DocxExtractionError)
      await expect(extractDocxText(mockFile)).rejects.toThrow(
        'No text content found in document'
      )
    })

    it('returns correct metadata', async () => {
      const testText = 'Test document with some content'
      vi.mocked(mammoth.extractRawText).mockResolvedValue({
        value: testText,
        messages: [],
      })

      const mockFile = createMockFile('test.docx')

      const result = await extractDocxText(mockFile)

      expect(result.metadata.characterCount).toBe(testText.length)
      expect(result.metadata.extractionTimeMs).toBeGreaterThanOrEqual(0)
      expect(typeof result.metadata.extractionTimeMs).toBe('number')
    })

    it('applies text processing correctly', async () => {
      // Mock mammoth with text that needs cleaning
      vi.mocked(mammoth.extractRawText).mockResolvedValue({
        value: '  Line 1  \r\n\r\n\r\n  Line 2  \n\n  Line 3  ',
        messages: [],
      })

      const mockFile = createMockFile('test.docx')

      const result = await extractDocxText(mockFile)

      // Should normalize line endings, collapse whitespace
      expect(result.text).not.toContain('\r')
      expect(result.text).not.toMatch(/\n{3,}/)
      expect(result.text).not.toMatch(/  +/)
      expect(result.text).toContain('Line 1')
      expect(result.text).toContain('Line 2')
      expect(result.text).toContain('Line 3')
    })
  })
})
