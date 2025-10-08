/**
 * TXT Parser
 * Extracts text from plain text files
 */

import { ParsedDocument } from './types.ts'
import {
  processExtractedText,
  validateExtractedText,
  createMetadata,
} from './utils.ts'

/**
 * Parse plain text document
 */
export async function parseTXT(buffer: ArrayBuffer): Promise<ParsedDocument> {
  try {
    // Decode text with UTF-8
    const decoder = new TextDecoder('utf-8')
    const rawText = decoder.decode(buffer)
    
    // Clean text
    const cleanedText = processExtractedText(rawText)
    
    validateExtractedText(cleanedText)

    // Create metadata
    const metadata = createMetadata('txt', {
      encoding: 'utf-8',
      size: buffer.byteLength,
    })

    return {
      text: cleanedText,
      documentType: 'txt',
      metadata,
    }
  } catch (error) {
    throw new Error(`Failed to parse TXT: ${error.message}`)
  }
}
