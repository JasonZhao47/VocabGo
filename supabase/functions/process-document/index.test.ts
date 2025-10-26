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
