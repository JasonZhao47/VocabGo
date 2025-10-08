/**
 * Document Parser Service
 * Main entry point for document parsing functionality
 */

export * from './types.ts'
export * from './utils.ts'
export { parsePDF } from './pdf.ts'
export { parseTXT } from './txt.ts'
export { parseDOCX } from './docx.ts'
export { parseXLSX } from './xlsx.ts'

import { ParsedDocument, DocumentType, ParserRegistry } from './types.ts'
import { parsePDF } from './pdf.ts'
import { parseTXT } from './txt.ts'
import { parseDOCX } from './docx.ts'
import { parseXLSX } from './xlsx.ts'

/**
 * Parser registry mapping file types to parser functions
 */
const parsers: ParserRegistry = {
  pdf: parsePDF,
  txt: parseTXT,
  docx: parseDOCX,
  xlsx: parseXLSX,
}

/**
 * Parse document based on file type
 * @param buffer - Document file as ArrayBuffer
 * @param documentType - Type of document (pdf, txt, docx, xlsx)
 * @returns Parsed document with extracted text and metadata
 */
export async function parseDocument(
  buffer: ArrayBuffer,
  documentType: DocumentType
): Promise<ParsedDocument> {
  const parser = parsers[documentType]
  
  if (!parser) {
    throw new Error(`Unsupported document type: ${documentType}`)
  }
  
  return await parser(buffer)
}

/**
 * Get supported document types
 */
export function getSupportedTypes(): DocumentType[] {
  return Object.keys(parsers) as DocumentType[]
}

/**
 * Check if document type is supported
 */
export function isTypeSupported(type: string): type is DocumentType {
  return type in parsers
}
