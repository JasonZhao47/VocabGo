/**
 * DOCX Parser
 * Extracts text from Word documents
 */

import { ParsedDocument } from './types.ts'
import {
  processExtractedText,
  validateExtractedText,
  createMetadata,
} from './utils.ts'

// Using mammoth for DOCX parsing via npm
import mammoth from 'npm:mammoth@1.6.0'
// Import Buffer from Node.js compatibility layer
import { Buffer } from 'node:buffer'

/**
 * Parse DOCX document and extract text
 */
export async function parseDOCX(buffer: ArrayBuffer): Promise<ParsedDocument> {
  try {
    // Convert ArrayBuffer to Buffer for mammoth
    const bufferData = Buffer.from(buffer)
    
    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer: bufferData })
    
    const rawText = result.value
    const cleanedText = processExtractedText(rawText)
    
    validateExtractedText(cleanedText)

    // Create metadata
    const metadata = createMetadata('docx', {
      messages: result.messages, // Any warnings or errors from mammoth
      size: buffer.byteLength,
    })

    return {
      text: cleanedText,
      documentType: 'docx',
      metadata,
    }
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`)
  }
}
