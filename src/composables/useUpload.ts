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
  setCompleted,
  setError,
  reset,
  canUpload as canUploadComputed,
} from '@/state/uploadState'
import { processDocument, validateFile, type ValidationResult } from '@/services/uploadService'

export function useUpload() {

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

      // Set completed state with results
      setCompleted(result.words)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Upload error:', err)
    }
  }

  /**
   * Resets the upload state
   */
  function resetUpload(): void {
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
  }
}
