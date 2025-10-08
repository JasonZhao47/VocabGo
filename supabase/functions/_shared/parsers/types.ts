/**
 * Document Parser Types
 * Defines interfaces and types for document parsing functionality
 */

export interface ParsedDocument {
  text: string
  pageCount?: number
  documentType: string
  metadata: Record<string, any>
}

export type DocumentType = 'pdf' | 'txt' | 'docx' | 'xlsx'

export interface ParserFunction {
  (buffer: ArrayBuffer): Promise<ParsedDocument>
}

export interface ParserRegistry {
  [key: string]: ParserFunction
}
