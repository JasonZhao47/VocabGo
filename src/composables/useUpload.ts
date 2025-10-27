/**
 * useUpload Composable
 * 
 * Provides upload functionality with validation and state management.
 * Simplified MVP version without cooldown or queue logic.
 */

import { computed } from 'vue'
import uploadState, {
  startUpload,
  setProcessing,
  setProcessingStage,
  setExtracting,
  setExtractingPDF,
  updateExtractionProgress,
  setCompleted,
  setError,
  setChunkProgress,
  reset,
  canUpload as canUploadComputed,
} from '@/state/uploadState'
import { processDocument, validateFile, type ValidationResult } from '@/services/uploadService'
import { pdfExtractor, PDFExtractionError } from '@/services/pdfExtractor'
import { getSessionId } from '@/lib/session'
import type { WordPair } from '@/types/database'

// 5MB threshold for large PDF detection
const PDF_SIZE_THRESHOLD = 5 * 1024 * 1024

export function useUpload() {
  // AbortController for cancellation support
  let abortController: AbortController | null = null

  // Expose computed properties from state
  const canUpload = canUploadComputed
  const status = computed(() => uploadState.status)
  const currentFile = computed(() => uploadState.currentFile)
  const currentResult = computed(() => uploadState.currentResult)
  const error = computed(() => uploadState.error)

  /**
   * Validates a file before upload
   */
  function validateUploadFile(file: File): ValidationResult {
    return validateFile(file)
  }

  /**
   * Handle large PDF extraction (>5MB)
   * Extracts text client-side and sends to server
   */
  async function handleLargePDFExtraction(file: File): Promise<void> {
    try {
      // Create new AbortController for this extraction
      abortController = new AbortController()

      // Set extracting status
      setExtractingPDF()

      // Extract text with progress updates and cancellation support
      const result = await pdfExtractor.extractText(file, {
        onProgress: (progress) => {
          updateExtractionProgress(progress)
        },
        signal: abortController.signal
      })

      // Update status to processing
      setProcessing('cleaning')

      // Simulate stage progression for server processing
      const stageSimulation = async () => {
        // Cleaning stage (simulate 1 second)
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (uploadState.status === 'processing') {
          uploadState.processingStage = 'extracting'
        }

        // Extracting stage (simulate 1 second)
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (uploadState.status === 'processing') {
          uploadState.processingStage = 'translating'
        }
      }

      stageSimulation()

      // Send extracted text to server
      const sessionId = getSessionId()
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
              text: result.text,
              filename: file.name,
              documentType: 'pdf',
              metadata: {
                characterCount: result.metadata.characterCount,
                extractionTimeMs: result.metadata.extractionTimeMs,
                pageCount: result.metadata.pageCount
              }
            }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`
        )
      }

      const serverResult = await response.json()

      if (!serverResult.success || !serverResult.wordlist) {
        throw new Error(serverResult.error?.message || 'Processing failed')
      }

      // Update chunk progress if available
      if (serverResult.metadata?.chunkProgress && serverResult.metadata.chunkProgress.length > 0) {
        setChunkProgress(serverResult.metadata.chunkProgress)
      }

      // Set completed state
      setCompleted(
        serverResult.wordlist.words,
        serverResult.warnings,
        serverResult.metadata?.chunking
      )

      console.log('[useUpload] Large PDF processing complete:', {
        wordCount: serverResult.wordlist.words.length,
        extractionTime: result.metadata.extractionTimeMs,
        pageCount: result.metadata.pageCount
      })
    } catch (err) {
      // Handle PDF extraction errors with user-friendly messages
      if (err instanceof PDFExtractionError) {
        setError(err.userMessage)
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
      }
      console.error('Large PDF extraction error:', err)
    } finally {
      // Clean up AbortController
      abortController = null
    }
  }

  /**
   * Uploads and processes a file
   */
  async function uploadFile(file: File): Promise<void> {
    // Validate file
    const validation = validateUploadFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    try {
      // Start upload
      startUpload(file)

      // Check if this is a large PDF (>5MB) - route to client-side extraction
      const isPDF = file.type === 'application/pdf'
      if (isPDF && file.size > PDF_SIZE_THRESHOLD) {
        await handleLargePDFExtraction(file)
        return
      }

      // Check if this is a DOCX file (client-side extraction)
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

      // Set initial processing stage based on file type
      if (isDocx) {
        // For DOCX: start with client-side extraction
        setExtracting()
      } else {
        // For other files: start with cleaning (server-side extraction)
        setProcessing('cleaning')
      }

      // Simulate stage progression (since we don't have real-time updates from Edge Function)
      // In a production system, this would be replaced with polling or WebSocket updates
      const stageSimulation = async () => {
        if (isDocx) {
          // Client-side extraction stage (simulate brief extraction time)
          await new Promise(resolve => setTimeout(resolve, 500))
          if (uploadState.status === 'processing') {
            uploadState.processingStage = 'cleaning'
          }
        }

        // Cleaning stage (simulate 1 second)
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (uploadState.status === 'processing') {
          uploadState.processingStage = 'extracting'
        }

        // Extracting stage (simulate 1 second)
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (uploadState.status === 'processing') {
          uploadState.processingStage = 'translating'
        }
      }

      // Start stage simulation in parallel with actual processing
      stageSimulation()

      // Process document (actual API call)
      const result = await processDocument(file)

      console.log('[useUpload] Processing result:', {
        wordCount: result.words?.length || 0,
        hasWords: !!result.words,
        sampleWords: result.words?.slice(0, 3),
        warnings: result.warnings,
        chunkingMetadata: result.chunkingMetadata
      })

      // Update chunk progress if available
      if (result.chunkProgress && result.chunkProgress.length > 0) {
        setChunkProgress(result.chunkProgress)
      }

      // Set completed state with results, warnings, and chunking metadata
      setCompleted(result.words, result.warnings, result.chunkingMetadata)
      
      console.log('[useUpload] State after setCompleted:', {
        status: uploadState.status,
        resultCount: uploadState.currentResult?.length || 0
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Upload error:', err)
    }
  }

  /**
   * Cancels the current upload/extraction
   */
  function cancelUpload(): void {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    reset()
  }

  /**
   * Resets the upload state
   */
  function resetUpload(): void {
    // Cancel any ongoing extraction
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    reset()
  }

  return {
    // State
    canUpload,
    status,
    currentFile,
    currentResult,
    error,

    // Actions
    uploadFile,
    validateUploadFile,
    resetUpload,
    cancelUpload,
  }
}
