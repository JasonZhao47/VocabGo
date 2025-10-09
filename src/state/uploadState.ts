import { reactive, computed } from 'vue'

// Simplified status for single upload at a time
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error'

// Processing stages
export type ProcessingStage = 'cleaning' | 'extracting' | 'translating'

export interface WordPair { 
  en: string
  zh: string 
}

export interface UploadState {
  status: UploadStatus
  currentFile: File | null
  currentResult: WordPair[] | null
  error: string | null
  processingStage: ProcessingStage | null
}

const state = reactive<UploadState>({
  status: 'idle',
  currentFile: null,
  currentResult: null,
  error: null,
  processingStage: null
})

// Computed properties
export const isUploading = computed(() => state.status === 'uploading')
export const isProcessing = computed(() => state.status === 'processing')
export const isCompleted = computed(() => state.status === 'completed')
export const hasError = computed(() => state.status === 'error')
export const canUpload = computed(() => state.status === 'idle' || state.status === 'completed' || state.status === 'error')

// State management functions
export function startUpload(file: File) {
  state.status = 'uploading'
  state.currentFile = file
  state.currentResult = null
  state.error = null
  state.processingStage = null
}

export function setProcessing(stage?: ProcessingStage) {
  state.status = 'processing'
  state.processingStage = stage || 'cleaning'
}

export function setProcessingStage(stage: ProcessingStage) {
  state.processingStage = stage
}

export function setCompleted(wordPairs: WordPair[]) {
  state.status = 'completed'
  state.currentResult = wordPairs
  state.error = null
  state.processingStage = null
}

export function setError(errorMessage: string) {
  state.status = 'error'
  state.error = errorMessage
  state.currentResult = null
  state.processingStage = null
}

export function reset() {
  state.status = 'idle'
  state.currentFile = null
  state.currentResult = null
  state.error = null
  state.processingStage = null
}

export default state

