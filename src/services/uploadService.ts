/**
 * Upload Service
 * 
 * Handles document upload and processing through the process-document Edge Function.
 * This is a simplified MVP version that processes documents synchronously.
 * 
 * Hybrid Processing:
 * - DOCX files: Client-side text extraction, then send text to Edge Function
 * - Other files (PDF, TXT, XLSX): Server-side extraction (existing flow)
 */

import { getSessionId } from '@/lib/session'
import type { WordPair } from '@/types/database'
import { extractDocxText, DocxExtractionError } from './docxExtractor'

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
} as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB (for non-DOCX files)
export const MAX_DOCX_FILE_SIZE = 5 * 1024 * 1024 // 5MB (for DOCX files)

// Request types for Edge Function
interface PreExtractedDocument {
  text: string
  filename: string
  documentType: 'docx'
  metadata: {
    characterCount: number
    extractionTimeMs: number
  }
}

// Chunk progress tracking
export interface ChunkProgress {
  chunkId: string
  position: number
  totalChunks: number
  status: 'processing' | 'completed' | 'failed'
  wordsExtracted?: number
  error?: string
}

// Response types matching Edge Function
interface ProcessResponse {
  success: boolean
  wordlist?: {
    words: WordPair[]
    filename: string
    documentType: string
    wordCount: number
  }
  error?: {
    code: string
    message: string
  }
  metadata?: {
    processingTimeMs: number
    stages: {
      parsing: number
      cleaning?: number
      extraction?: number
      translation?: number
      chunking?: number
      processing?: number
      combining?: number
    }
    chunking?: {
      totalChunks: number
      successfulChunks: number
      failedChunks: number
      averageChunkSize: number
      duplicatesRemoved: number
    }
    chunkProgress?: ChunkProgress[]
  }
  warnings?: string[]
}

export interface ChunkingMetadata {
  totalChunks: number
  successfulChunks: number
  failedChunks: number
  averageChunkSize: number
  duplicatesRemoved: number
}

export interface ProcessResult {
  words: WordPair[]
  filename: string
  documentType: string
  wordCount: number
  processingTimeMs: number
  chunkProgress?: ChunkProgress[]
  warnings?: string[]
  chunkingMetadata?: ChunkingMetadata
}

export interface ValidationError {
  valid: false
  error: string
  code: 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'NO_FILE'
}

export interface ValidationSuccess {
  valid: true
}

export type ValidationResult = ValidationSuccess | ValidationError

/**
 * Validates a file before upload
 */
export function validateFile(file: File): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'No file selected',
      code: 'NO_FILE',
    }
  }

  // Check file type
  if (!(file.type in SUPPORTED_FILE_TYPES)) {
    const supportedFormats = Object.values(SUPPORTED_FILE_TYPES).join(', ')
    return {
      valid: false,
      error: `Unsupported file type. Supported formats: ${supportedFormats}`,
      code: 'INVALID_FILE_TYPE',
    }
  }

  // Check file size (different limits for DOCX vs other formats)
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  const maxSize = isDocx ? MAX_DOCX_FILE_SIZE : MAX_FILE_SIZE
  const maxSizeMB = isDocx ? 5 : 50

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSizeMB}MB`,
      code: 'FILE_TOO_LARGE',
    }
  }

  return { valid: true }
}

/**
 * Converts a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Process DOCX file with client-side extraction
 * Extracts text in browser, then sends to Edge Function
 */
async function processDocxWithClientExtraction(file: File): Promise<ProcessResult> {
  try {
    // Extract text client-side
    const extraction = await extractDocxText(file)

    // Get session ID for anonymous access
    const sessionId = getSessionId()

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

    // Send extracted text to Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          extractedText: {
            text: extraction.text,
            filename: file.name,
            documentType: 'docx',
            metadata: extraction.metadata,
          } as PreExtractedDocument,
        }),
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`
      )
    }

    const result: ProcessResponse = await response.json()

    console.log('[uploadService] DOCX response:', {
      success: result.success,
      hasWordlist: !!result.wordlist,
      wordCount: result.wordlist?.words?.length || 0,
      error: result.error
    })

    if (!result.success || !result.wordlist) {
      console.error('[uploadService] Invalid DOCX response:', result)
      throw new Error(result.error?.message || 'Processing failed')
    }

    const processResult = {
      words: result.wordlist.words,
      filename: result.wordlist.filename,
      documentType: result.wordlist.documentType,
      wordCount: result.wordlist.wordCount,
      processingTimeMs: result.metadata?.processingTimeMs || 0,
      chunkProgress: result.metadata?.chunkProgress,
      warnings: result.warnings,
      chunkingMetadata: result.metadata?.chunking,
    }

    console.log('[uploadService] Returning DOCX result:', {
      wordCount: processResult.words.length,
      sampleWords: processResult.words.slice(0, 3)
    })

    return processResult
  } catch (error) {
    // Handle extraction errors with user-friendly messages
    if (error instanceof DocxExtractionError) {
      throw new Error(error.message)
    }

    // Re-throw other errors
    if (error instanceof Error) {
      throw error
    }

    throw new Error('An unexpected error occurred while processing the DOCX file')
  }
}

/**
 * Process file with server-side extraction (PDF, TXT, XLSX)
 * Maintains backward compatibility with existing flow
 */
async function processWithServerExtraction(file: File): Promise<ProcessResult> {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file)

    // Get session ID for anonymous access
    const sessionId = getSessionId()

    // Call process-document Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          file: {
            name: file.name,
            type: file.type,
            data: base64Data,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`
      )
    }

    const result: ProcessResponse = await response.json()

    if (!result.success || !result.wordlist) {
      throw new Error(result.error?.message || 'Processing failed')
    }

    return {
      words: result.wordlist.words,
      filename: result.wordlist.filename,
      documentType: result.wordlist.documentType,
      wordCount: result.wordlist.wordCount,
      processingTimeMs: result.metadata?.processingTimeMs || 0,
      chunkProgress: result.metadata?.chunkProgress,
      warnings: result.warnings,
      chunkingMetadata: result.metadata?.chunking,
    }
  } catch (error) {
    console.error('Upload service error:', error)
    
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred while processing the document')
  }
}

/**
 * Processes a document through the AI pipeline
 * Routes to client-side or server-side extraction based on file type
 * 
 * @param file - The file to process
 * @returns Promise with the wordlist result
 * @throws Error if processing fails
 */
export async function processDocument(file: File): Promise<ProcessResult> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Route based on file type
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  
  if (isDocx) {
    // Client-side extraction for DOCX
    return processDocxWithClientExtraction(file)
  } else {
    // Server-side extraction for other formats
    return processWithServerExtraction(file)
  }
}
