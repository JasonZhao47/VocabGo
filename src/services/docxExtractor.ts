/**
 * Client-Side DOCX Text Extractor
 * Extracts text from DOCX files in the browser before upload
 */

import mammoth from 'mammoth'

/**
 * Result of DOCX text extraction
 */
export interface DocxExtractionResult {
  text: string
  metadata: {
    characterCount: number
    extractionTimeMs: number
  }
}

/**
 * Error thrown when DOCX extraction fails
 */
export class DocxExtractionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message)
    this.name = 'DocxExtractionError'
  }
}

/**
 * Clean extracted text by removing excessive whitespace and normalizing line breaks
 * Matches server-side text processing for consistency
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple line breaks
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces/tabs
    .replace(/^\s+|\s+$/gm, '') // Trim lines
    .trim()
}

/**
 * Remove common noise patterns from text
 * Matches server-side noise removal for consistency
 */
function removeCommonNoise(text: string): string {
  // Remove page numbers (e.g., "Page 1", "- 1 -", "[1]")
  let cleaned = text.replace(/^(Page\s+)?\d+\s*$/gim, '')
  
  // Remove common header/footer patterns
  cleaned = cleaned.replace(/^[-=_]{3,}$/gm, '')
  
  return cleaned
}

/**
 * Process extracted text with cleaning and noise removal
 */
function processExtractedText(rawText: string): string {
  const cleaned = cleanText(rawText)
  return removeCommonNoise(cleaned)
}

/**
 * Validate that extracted text is not empty
 */
function validateExtractedText(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new DocxExtractionError('No text content found in document')
  }
}

/**
 * Extract text from a DOCX file in the browser
 * 
 * @param file - The DOCX file to extract text from
 * @returns Extraction result with text and metadata
 * @throws DocxExtractionError if extraction fails
 */
export async function extractDocxText(file: File): Promise<DocxExtractionResult> {
  const startTime = performance.now()

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Extract raw text using mammoth
    const result = await mammoth.extractRawText({ arrayBuffer })
    const rawText = result.value

    // Process text (clean and remove noise)
    const processedText = processExtractedText(rawText)

    // Validate extracted text is not empty
    validateExtractedText(processedText)

    // Calculate extraction time
    const extractionTimeMs = Math.round(performance.now() - startTime)

    return {
      text: processedText,
      metadata: {
        characterCount: processedText.length,
        extractionTimeMs,
      },
    }
  } catch (error) {
    // Handle specific error types
    if (error instanceof DocxExtractionError) {
      throw error
    }

    // Handle file reading errors
    if (error instanceof DOMException) {
      throw new DocxExtractionError(
        'Failed to read DOCX file. The file may be corrupted or inaccessible.',
        error
      )
    }

    // Handle mammoth extraction errors
    if (error instanceof Error) {
      throw new DocxExtractionError(
        'Failed to extract text from DOCX file. The file may be corrupted.',
        error
      )
    }

    // Handle unknown errors
    throw new DocxExtractionError(
      'An unexpected error occurred during text extraction.',
      error as Error
    )
  }
}
