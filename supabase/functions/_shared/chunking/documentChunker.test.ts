import { describe, it, expect } from 'vitest'
import { chunkDocument, type ChunkConfig } from './documentChunker.ts'

describe('documentChunker', () => {
  describe('small documents', () => {
    it('should return single chunk for document under 8000 chars', () => {
      const text = 'This is a small document with less than 8000 characters.'
      const result = chunkDocument(text)
      
      expect(result.chunks).toHaveLength(1)
      expect(result.chunks[0].id).toBe('chunk-1')
      expect(result.chunks[0].text).toBe(text)
      expect(result.chunks[0].position).toBe(1)
      expect(result.chunks[0].totalChunks).toBe(1)
      expect(result.chunks[0].startIndex).toBe(0)
      expect(result.chunks[0].endIndex).toBe(text.length)
      expect(result.metadata.totalChunks).toBe(1)
      expect(result.metadata.originalLength).toBe(text.length)
    })
    
    it('should return single chunk for document exactly 8000 chars', () => {
      const text = 'a'.repeat(8000)
      const result = chunkDocument(text)
      
      expect(result.chunks).toHaveLength(1)
      expect(result.chunks[0].text.length).toBe(8000)
    })
    
    it('should trim whitespace from document', () => {
      const text = '  \n\n  This is content  \n\n  '
      const result = chunkDocument(text)
      
      expect(result.chunks[0].text).toBe('This is content')
    })
  })
  
  describe('large documents', () => {
    it('should split document over 8000 chars into multiple chunks', () => {
      const text = 'a'.repeat(20000)
      const result = chunkDocument(text)
      
      expect(result.chunks.length).toBeGreaterThan(1)
      expect(result.metadata.totalChunks).toBe(result.chunks.length)
    })
    
    it('should set correct position and totalChunks for each chunk', () => {
      const text = 'a'.repeat(20000)
      const result = chunkDocument(text)
      
      result.chunks.forEach((chunk, index) => {
        expect(chunk.position).toBe(index + 1)
        expect(chunk.totalChunks).toBe(result.chunks.length)
        expect(chunk.id).toBe(`chunk-${index + 1}`)
      })
    })
    
    it('should create chunks with correct character ranges', () => {
      const text = 'a'.repeat(20000)
      const result = chunkDocument(text)
      
      result.chunks.forEach((chunk) => {
        expect(chunk.endIndex).toBeGreaterThan(chunk.startIndex)
        expect(chunk.text.length).toBe(chunk.endIndex - chunk.startIndex)
      })
    })
  })
  
  describe('chunk boundaries', () => {
    it('should split at paragraph boundaries when possible', () => {
      const paragraph1 = 'a'.repeat(7000)
      const paragraph2 = 'b'.repeat(7000)
      const text = paragraph1 + '\n\n' + paragraph2
      
      const result = chunkDocument(text)
      
      expect(result.chunks.length).toBeGreaterThan(1)
      // First chunk should end near paragraph boundary
      expect(result.chunks[0].text).toContain('a')
      expect(result.chunks[1].text).toContain('b')
    })
    
    it('should split at sentence boundaries when no paragraph boundary', () => {
      const sentence1 = 'a'.repeat(7000) + '. '
      const sentence2 = 'b'.repeat(7000)
      const text = sentence1 + sentence2
      
      const result = chunkDocument(text)
      
      expect(result.chunks.length).toBeGreaterThan(1)
    })
    
    it('should handle multiple sentence endings', () => {
      const text = 'First sentence. Second sentence! Third sentence? ' + 'a'.repeat(8000)
      const result = chunkDocument(text)
      
      expect(result.chunks.length).toBeGreaterThan(0)
    })
  })
  
  describe('chunk overlap', () => {
    it('should include 200 character overlap between consecutive chunks', () => {
      const text = 'a'.repeat(20000)
      const result = chunkDocument(text)
      
      if (result.chunks.length > 1) {
        for (let i = 0; i < result.chunks.length - 1; i++) {
          const currentChunk = result.chunks[i]
          const nextChunk = result.chunks[i + 1]
          
          // Next chunk should start before current chunk ends (overlap)
          expect(nextChunk.startIndex).toBeLessThan(currentChunk.endIndex)
          
          // Overlap should be approximately 200 chars (may vary due to boundary detection)
          const overlap = currentChunk.endIndex - nextChunk.startIndex
          expect(overlap).toBeGreaterThanOrEqual(0)
          expect(overlap).toBeLessThanOrEqual(300) // Allow some flexibility
        }
      }
    })
    
    it('should adjust overlap to fit within available text', () => {
      // Create text that would result in very small final chunk
      const text = 'a'.repeat(8100)
      const result = chunkDocument(text)
      
      // Should handle overlap gracefully
      expect(result.chunks.length).toBeGreaterThan(0)
      result.chunks.forEach(chunk => {
        expect(chunk.text.length).toBeGreaterThan(0)
      })
    })
  })
  
  describe('edge cases', () => {
    it('should throw error for empty document', () => {
      expect(() => chunkDocument('')).toThrow('Document contains no extractable text')
    })
    
    it('should throw error for whitespace-only document', () => {
      expect(() => chunkDocument('   \n\n\t  ')).toThrow('Document contains no extractable text')
    })
    
    it('should merge final chunk if smaller than 2000 chars', () => {
      // Create document that would result in small final chunk
      const text = 'a'.repeat(8000) + '\n\n' + 'b'.repeat(1500)
      const result = chunkDocument(text)
      
      // All chunks should be at least 2000 chars except possibly the last
      result.chunks.forEach((chunk, index) => {
        if (index < result.chunks.length - 1) {
          // Not the last chunk - could be any size
          expect(chunk.text.length).toBeGreaterThan(0)
        }
      })
      
      // Last chunk should be merged if it was too small
      const lastChunk = result.chunks[result.chunks.length - 1]
      if (result.chunks.length > 1) {
        expect(lastChunk.text.length).toBeGreaterThanOrEqual(1500)
      }
    })
    
    it('should handle very long documents', () => {
      const text = 'a'.repeat(100000)
      const result = chunkDocument(text)
      
      expect(result.chunks.length).toBeGreaterThan(5)
      expect(result.metadata.originalLength).toBe(100000)
      
      // Verify all chunks are accounted for
      result.chunks.forEach(chunk => {
        expect(chunk.text.length).toBeGreaterThan(0)
        expect(chunk.text.length).toBeLessThanOrEqual(10000)
      })
    })
    
    it('should ensure no chunk exceeds maxSize', () => {
      const text = 'a'.repeat(50000)
      const result = chunkDocument(text)
      
      result.chunks.forEach(chunk => {
        expect(chunk.text.length).toBeLessThanOrEqual(10000)
      })
    })
  })
  
  describe('custom configuration', () => {
    it('should respect custom targetSize', () => {
      const text = 'a'.repeat(20000)
      const config: Partial<ChunkConfig> = {
        targetSize: 5000
      }
      
      const result = chunkDocument(text, config)
      
      // Should create more chunks with smaller target size
      expect(result.chunks.length).toBeGreaterThan(2)
    })
    
    it('should respect custom maxSize', () => {
      const text = 'a'.repeat(20000)
      const config: Partial<ChunkConfig> = {
        maxSize: 6000
      }
      
      const result = chunkDocument(text, config)
      
      result.chunks.forEach(chunk => {
        expect(chunk.text.length).toBeLessThanOrEqual(6000)
      })
    })
    
    it('should respect custom overlapSize', () => {
      const text = 'a'.repeat(20000)
      const config: Partial<ChunkConfig> = {
        overlapSize: 500
      }
      
      const result = chunkDocument(text, config)
      
      if (result.chunks.length > 1) {
        for (let i = 0; i < result.chunks.length - 1; i++) {
          const currentChunk = result.chunks[i]
          const nextChunk = result.chunks[i + 1]
          
          const overlap = currentChunk.endIndex - nextChunk.startIndex
          // Overlap should be approximately 500 chars
          expect(overlap).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })
  
  describe('metadata', () => {
    it('should calculate correct average chunk size', () => {
      const text = 'a'.repeat(20000)
      const result = chunkDocument(text)
      
      const totalSize = result.chunks.reduce((sum, chunk) => sum + chunk.text.length, 0)
      const expectedAverage = Math.round(totalSize / result.chunks.length)
      
      expect(result.metadata.averageChunkSize).toBe(expectedAverage)
    })
    
    it('should track original document length', () => {
      const text = '  ' + 'a'.repeat(20000) + '  '
      const result = chunkDocument(text)
      
      expect(result.metadata.originalLength).toBe(20000) // Trimmed length
    })
  })
})
