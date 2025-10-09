/**
 * Upload Service
 * 
 * Handles document upload and processing through the process-document Edge Function.
 * This is a simplified MVP version that processes documents synchronously.
 */

import { getSessionId } from '@/lib/session'
import type { WordPair } from '@/types/database'

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
} as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

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
      cleaning: number
      extraction: number
      translation: number
    }
  }
}

export interface ProcessResult {
  words: WordPair[]
  filename: string
  documentType: string
  wordCount: number
  processingTimeMs: number
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

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of 50MB`,
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
 * Processes a document through the AI pipeline
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
