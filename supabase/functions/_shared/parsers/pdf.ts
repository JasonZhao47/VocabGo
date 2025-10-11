/**
 * PDF Parser
 * Extracts text from PDF documents page-by-page
 */

import { ParsedDocument } from './types.ts'
import {
  processExtractedText,
  validateExtractedText,
  createMetadata,
} from './utils.ts'

// Using pdf-parse via npm: for Deno edge functions
// @deno-types="npm:@types/pdf-parse"
import pdfParse from 'npm:pdf-parse@1.1.1'
// Import Buffer from Node.js compatibility layer
import { Buffer } from 'node:buffer'

/**
 * Parse PDF document and extract text
 */
export async function parsePDF(buffer: ArrayBuffer): Promise<ParsedDocument> {
  try {
    // Convert ArrayBuffer to Buffer for pdf-parse
    const bufferData = Buffer.from(buffer)
    
    // Parse PDF
    const data = await pdfParse(bufferData, {
      // Extract text page by page for better structure
      pagerender: (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          return textContent.items
            .map((item: any) => item.str)
            .join(' ')
        })
      },
    })

    // Extract and clean text
    const rawText = data.text
    const cleanedText = processExtractedText(rawText)
    
    validateExtractedText(cleanedText)

    // Extract metadata
    const metadata = createMetadata('pdf', {
      pageCount: data.numpages,
      title: data.info?.Title || null,
      author: data.info?.Author || null,
      subject: data.info?.Subject || null,
      creator: data.info?.Creator || null,
      producer: data.info?.Producer || null,
      creationDate: data.info?.CreationDate || null,
      modificationDate: data.info?.ModDate || null,
    })

    return {
      text: cleanedText,
      pageCount: data.numpages,
      documentType: 'pdf',
      metadata,
    }
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`)
  }
}
