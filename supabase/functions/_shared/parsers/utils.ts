/**
 * Document Parser Utilities
 * Shared utilities for text extraction and cleaning
 */

/**
 * Clean extracted text by removing excessive whitespace and normalizing line breaks
 */
export function cleanText(text: string): string {
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
 */
export function removeCommonNoise(text: string): string {
  // Remove page numbers (e.g., "Page 1", "- 1 -", "[1]")
  let cleaned = text.replace(/^(Page\s+)?\d+\s*$/gim, '')
  
  // Remove common header/footer patterns
  cleaned = cleaned.replace(/^[-=_]{3,}$/gm, '')
  
  return cleaned
}

/**
 * Extract text from buffer and apply basic cleaning
 */
export function processExtractedText(rawText: string): string {
  const cleaned = cleanText(rawText)
  return removeCommonNoise(cleaned)
}

/**
 * Validate that extracted text is not empty
 */
export function validateExtractedText(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new Error('No text content extracted from document')
  }
}

/**
 * Create metadata object with common fields
 */
export function createMetadata(
  documentType: string,
  additionalMetadata: Record<string, any> = {}
): Record<string, any> {
  return {
    extractedAt: new Date().toISOString(),
    documentType,
    ...additionalMetadata,
  }
}
