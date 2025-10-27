import { reactive, computed } from 'vue'
import type { PDFExtractionProgress } from '@/services/pdfExtractor'

// Simplified status for single upload at a time
export type UploadStatus = 'idle' | 'uploading' | 'extracting' | 'processing' | 'completed' | 'error'

// Processing stages
export type ProcessingStage = 'extracting-client' | 'cleaning' | 'extracting' | 'translating'

// Re-export PDF extraction progress type for convenience
export type ExtractionProgress = PDFExtractionProgress

export interface WordPair { 
  en: string
  zh: string 
}

export interface ChunkProgress {
  chunkId: string
  position: number
  totalChunks: number
  status: 'processing' | 'completed' | 'failed'
  wordsExtracted?: number
  error?: string
}

export interface ChunkingMetadata {
  totalChunks: number
  successfulChunks: number
  failedChunks: number
  averageChunkSize: number
  duplicatesRemoved: number
}

export interface UploadState {
  status: UploadStatus
  currentFile: File | null
  currentResult: WordPair[] | null
  error: string | null
  processingStage: ProcessingStage | null
  chunkProgress: ChunkProgress[]
  isChunked: boolean
  warnings: string[]
  chunkingMetadata: ChunkingMetadata | null
  extractionProgress: ExtractionProgress | null
}

const state = reactive<UploadState>({
  status: 'idle',
  currentFile: null,
  currentResult: null,
  error: null,
  processingStage: null,
  chunkProgress: [],
  isChunked: false,
  warnings: [],
  chunkingMetadata: null,
  extractionProgress: null
})

// Computed properties
export const isUploading = computed(() => state.status === 'uploading')
export const isExtracting = computed(() => state.status === 'extracting')
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
  state.chunkProgress = []
  state.isChunked = false
  state.warnings = []
  state.chunkingMetadata = null
  state.extractionProgress = null
}

export function setExtractingPDF(progress?: ExtractionProgress) {
  state.status = 'extracting'
  state.extractionProgress = progress || null
}

export function updateExtractionProgress(progress: ExtractionProgress) {
  state.extractionProgress = progress
}

export function setProcessing(stage?: ProcessingStage) {
  state.status = 'processing'
  state.processingStage = stage || 'cleaning'
}

export function setExtracting() {
  state.status = 'processing'
  state.processingStage = 'extracting-client'
}

export function setProcessingStage(stage: ProcessingStage) {
  state.processingStage = stage
}

export function setCompleted(wordPairs: WordPair[], warnings?: string[], chunkingMetadata?: ChunkingMetadata) {
  state.status = 'completed'
  state.currentResult = wordPairs
  state.error = null
  state.processingStage = null
  state.warnings = warnings || []
  state.chunkingMetadata = chunkingMetadata || null
  // Keep chunk progress for display in completed state
}

export function setChunkProgress(progress: ChunkProgress[]) {
  state.chunkProgress = progress
  state.isChunked = progress.length > 0
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
  state.chunkProgress = []
  state.isChunked = false
  state.warnings = []
  state.chunkingMetadata = null
  state.extractionProgress = null
}

export default state

