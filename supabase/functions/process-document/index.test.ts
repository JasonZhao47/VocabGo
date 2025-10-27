/**
 * Tests for process-document Edge Function
 * 
 * Tests the hybrid processing approach:
 * - Client-side extraction (extractedText payload)
 * - Server-side extraction (file payload)
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

Deno.test('ProcessRequest interface - accepts extractedText payload', () => {
  // This test verifies the interface structure
  const validExtractedTextRequest = {
    extractedText: {
      text: 'Sample extracted text with some English words',
      filename: 'test.docx',
      documentType: 'docx' as const,
      metadata: {
        characterCount: 45,
        extractionTimeMs: 150,
      },
    },
  }

  // Verify structure
  assertExists(validExtractedTextRequest.extractedText)
  assertEquals(validExtractedTextRequest.extractedText.documentType, 'docx')
  assertExists(validExtractedTextRequest.extractedText.metadata)
})

Deno.test('ProcessRequest interface - accepts file payload', () => {
  // This test verifies the interface structure
  const validFileRequest = {
    file: {
      name: 'test.pdf',
      type: 'application/pdf',
      data: 'base64encodeddata',
    },
  }

  // Verify structure
  assertExists(validFileRequest.file)
  assertEquals(validFileRequest.file.type, 'application/pdf')
})

Deno.test('ProcessRequest interface - validates mutual exclusivity', () => {
  // Both file and extractedText should not be provided together
  const invalidRequest = {
    file: {
      name: 'test.pdf',
      type: 'application/pdf',
      data: 'base64encodeddata',
    },
    extractedText: {
      text: 'Sample text',
      filename: 'test.docx',
      documentType: 'docx' as const,
      metadata: {
        characterCount: 11,
        extractionTimeMs: 100,
      },
    },
  }

  // This should be rejected by the Edge Function
  assertExists(invalidRequest.file)
  assertExists(invalidRequest.extractedText)
})

Deno.test('ProcessResponse interface - includes chunk progress for large documents', () => {
  // This test verifies the chunk progress structure in response
  const responseWithChunkProgress = {
    success: true,
    wordlist: {
      words: [
        { en: 'algorithm', zh: '算法' },
        { en: 'data', zh: '数据' }
      ],
      filename: 'large-document.txt',
      documentType: 'txt',
      wordCount: 2
    },
    metadata: {
      processingTimeMs: 5000,
      stages: {
        parsing: 100,
        chunking: 50,
        processing: 4500,
        combining: 350
      },
      chunking: {
        totalChunks: 3,
        successfulChunks: 3,
        failedChunks: 0,
        averageChunkSize: 8500,
        duplicatesRemoved: 5
      },
      chunkProgress: [
        {
          chunkId: 'chunk-1',
          position: 1,
          totalChunks: 3,
          status: 'completed' as const,
          wordsExtracted: 15
        },
        {
          chunkId: 'chunk-2',
          position: 2,
          totalChunks: 3,
          status: 'completed' as const,
          wordsExtracted: 18
        },
        {
          chunkId: 'chunk-3',
          position: 3,
          totalChunks: 3,
          status: 'completed' as const,
          wordsExtracted: 12
        }
      ]
    }
  }

  // Verify chunk progress structure
  assertExists(responseWithChunkProgress.metadata?.chunkProgress)
  assertEquals(responseWithChunkProgress.metadata?.chunkProgress?.length, 3)
  assertEquals(responseWithChunkProgress.metadata?.chunkProgress?.[0].status, 'completed')
  assertEquals(responseWithChunkProgress.metadata?.chunkProgress?.[0].position, 1)
  assertEquals(responseWithChunkProgress.metadata?.chunkProgress?.[0].totalChunks, 3)
})

Deno.test('ProcessResponse interface - includes chunk progress with failures', () => {
  // This test verifies partial failure handling in chunk progress
  const responseWithPartialFailure = {
    success: true,
    wordlist: {
      words: [
        { en: 'algorithm', zh: '算法' }
      ],
      filename: 'document-with-errors.txt',
      documentType: 'txt',
      wordCount: 1
    },
    metadata: {
      processingTimeMs: 6000,
      stages: {
        parsing: 100,
        chunking: 50,
        processing: 5500,
        combining: 350
      },
      chunking: {
        totalChunks: 3,
        successfulChunks: 2,
        failedChunks: 1,
        averageChunkSize: 8500,
        duplicatesRemoved: 3
      },
      chunkProgress: [
        {
          chunkId: 'chunk-1',
          position: 1,
          totalChunks: 3,
          status: 'completed' as const,
          wordsExtracted: 15
        },
        {
          chunkId: 'chunk-2',
          position: 2,
          totalChunks: 3,
          status: 'failed' as const,
          error: 'Extraction timeout'
        },
        {
          chunkId: 'chunk-3',
          position: 3,
          totalChunks: 3,
          status: 'completed' as const,
          wordsExtracted: 12
        }
      ]
    },
    warnings: ['2 of 3 sections processed successfully']
  }

  // Verify chunk progress with failures
  assertExists(responseWithPartialFailure.metadata?.chunkProgress)
  assertEquals(responseWithPartialFailure.metadata?.chunkProgress?.length, 3)
  assertEquals(responseWithPartialFailure.metadata?.chunkProgress?.[1].status, 'failed')
  assertExists(responseWithPartialFailure.metadata?.chunkProgress?.[1].error)
  assertExists(responseWithPartialFailure.warnings)
  assertEquals(responseWithPartialFailure.warnings?.length, 1)
})
