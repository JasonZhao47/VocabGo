<template>
  <Modal
    :model-value="modelValue"
    size="medium"
    :closable="!isActiveProcessing"
    :close-on-backdrop="!isActiveProcessing"
    :close-on-escape="!isActiveProcessing"
    :persistent="isActiveProcessing"
    @update:model-value="handleModalUpdate"
  >
    <template #header>
      <h2 id="processing-title" class="modal-title">
        {{ modalTitle }}
      </h2>
    </template>

    <!-- Screen Reader Announcements -->
    <div
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ screenReaderAnnouncement }}
    </div>

    <!-- Upload State Display -->
    <div v-if="isUploading" class="processing-modal-content">
      <!-- File Info Section -->
      <div class="file-info-section">
        <div class="file-name">
          <Skeleton v-if="!uploadState.currentFile" variant="text" width="200px" height="20px" />
          <span v-else class="file-name-text">
            {{ uploadState.currentFile.name }}
          </span>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div class="flex justify-center">
        <LoadingSpinner :size="spinnerSize" aria-label="Uploading document" />
      </div>

      <!-- Upload Message -->
      <div class="text-center">
        <p class="status-message">Uploading document...</p>
      </div>
    </div>

    <!-- Extracting State Display (Client-side PDF extraction) -->
    <div v-else-if="isExtracting" class="processing-modal-content">
      <!-- File Info Section -->
      <div class="file-info-section">
        <div class="file-name">
          <span v-if="uploadState.currentFile" class="file-name-text">
            {{ uploadState.currentFile.name }}
          </span>
        </div>
      </div>

      <!-- Local Processing Indicator -->
      <div class="extraction-indicator">
        <div class="extraction-icon">
          <svg
            class="extraction-icon-svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p class="extraction-message">Large PDF detected, processing locally...</p>
      </div>

      <!-- Extraction Progress -->
      <div v-if="uploadState.extractionProgress" class="extraction-progress-section">
        <p class="extraction-progress-label">
          Extracting page {{ uploadState.extractionProgress.currentPage }} of {{ uploadState.extractionProgress.totalPages }}...
        </p>
        
        <!-- Progress Bar -->
        <div class="progress-bar-container">
          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              :style="{ width: `${extractionProgressPercentage}%` }"
              role="progressbar"
              :aria-valuenow="extractionProgressPercentage"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Extracting page ${uploadState.extractionProgress.currentPage} of ${uploadState.extractionProgress.totalPages}`"
            />
          </div>
        </div>

        <!-- Extraction Stats -->
        <div class="extraction-stats">
          <span class="extraction-stat-item">
            {{ formatCharCount(uploadState.extractionProgress.extractedChars) }} extracted
          </span>
          <span v-if="uploadState.extractionProgress.estimatedTimeMs > 0" class="extraction-stat-item">
            ~{{ formatTime(uploadState.extractionProgress.estimatedTimeMs) }} remaining
          </span>
        </div>
      </div>

      <!-- Fallback message if no progress data yet -->
      <div v-else class="text-center">
        <p class="status-message">Preparing to extract PDF text...</p>
      </div>

      <!-- Cancel Button -->
      <div class="extraction-actions">
        <Button
          variant="ghost"
          :size="buttonSize"
          full-width
          @click="handleCancel"
        >
          Cancel Extraction
        </Button>
      </div>
    </div>

    <!-- Processing State Display -->
    <div v-else-if="isProcessing" class="processing-modal-content">
      <!-- File Info Section -->
      <div class="file-info-section">
        <div class="file-name">
          <span v-if="uploadState.currentFile" class="file-name-text">
            {{ uploadState.currentFile.name }}
          </span>
        </div>
      </div>

      <!-- Chunk Progress Display (if chunked) -->
      <div v-if="uploadState.isChunked && uploadState.chunkProgress.length > 0" class="chunk-progress-section">
        <p class="chunk-progress-label">
          Processing chunk {{ completedChunks + 1 }} of {{ totalChunks }}
        </p>
        <div class="chunk-status-grid">
          <div
            v-for="chunk in uploadState.chunkProgress"
            :key="chunk.chunkId"
            :class="[
              'chunk-status-indicator',
              {
                'chunk-completed': chunk.status === 'completed',
                'chunk-failed': chunk.status === 'failed',
                'chunk-processing': chunk.status === 'processing'
              }
            ]"
            :aria-label="`Chunk ${chunk.position} - ${chunk.status}`"
          >
            <svg
              v-if="chunk.status === 'completed'"
              class="chunk-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              v-else-if="chunk.status === 'failed'"
              class="chunk-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div v-else class="chunk-spinner" />
          </div>
        </div>
        <p class="chunk-summary-text">
          {{ successfulChunks }} successful, {{ failedChunks }} failed
        </p>
      </div>

      <!-- Stage Label (for non-chunked or before chunk info available) -->
      <div v-else class="text-center">
        <Transition name="stage-fade" mode="out-in">
          <p :key="currentStageLabel" class="stage-label">
            {{ currentStageLabel }}
          </p>
        </Transition>
      </div>

      <!-- Stage Indicators -->
      <div class="stage-indicators">
        <div
          v-for="stage in stages"
          :key="stage.id"
          :class="[
            'stage-indicator',
            {
              'stage-pending': getStageState(stage.id) === 'pending',
              'stage-active': getStageState(stage.id) === 'active',
              'stage-completed': getStageState(stage.id) === 'completed'
            }
          ]"
          :aria-label="`${stage.label} - ${getStageState(stage.id)}`"
        >
          <div class="stage-circle">
            <svg
              v-if="getStageState(stage.id) === 'completed'"
              class="stage-checkmark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="stage-label-text">{{ stage.label }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar-track">
          <div
            class="progress-bar-fill"
            :style="{ width: `${progressPercentage}%` }"
            role="progressbar"
            :aria-valuenow="progressPercentage"
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>

      <!-- Status Message -->
      <div class="text-center">
        <p class="status-message-small">Processing your document...</p>
      </div>
    </div>

    <!-- Error State Display -->
    <div v-else-if="hasError" class="processing-modal-content">
      <!-- Error Icon -->
      <div class="flex justify-center">
        <div class="error-icon">
          <svg
            class="error-icon-svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error-message-box">
        <p class="error-message-text">
          {{ uploadState.error || 'An error occurred while processing your document' }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="error-actions">
        <Button
          variant="primary"
          :size="buttonSize"
          full-width
          @click="handleRetry"
        >
          Try Again
        </Button>
        <Button
          variant="ghost"
          :size="buttonSize"
          full-width
          @click="handleClose"
        >
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Button from '@/components/ui/Button.vue'
import uploadState, { isUploading, isExtracting, isProcessing, hasError } from '@/state/uploadState'
import { announcePolite, announceError } from '@/utils/accessibilityAnnouncer'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'retry'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed property for modal visibility based on uploadState
const isActiveProcessing = computed(() => 
  isUploading.value || isExtracting.value || isProcessing.value
)

const modalTitle = computed(() => {
  if (hasError.value) return 'Processing Failed'
  if (isUploading.value) return 'Uploading Document'
  if (isExtracting.value) return 'Extracting PDF'
  if (isProcessing.value) return 'Processing Document'
  return 'Processing'
})

const handleModalUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

const handleRetry = () => {
  emit('retry')
  emit('update:modelValue', false)
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

// Screen reader announcement
const screenReaderAnnouncement = computed(() => {
  if (hasError.value) {
    return `Error: ${uploadState.error || 'Processing failed'}`
  }
  if (isUploading.value) {
    return `Uploading document ${uploadState.currentFile?.name || ''}`
  }
  if (isExtracting.value) {
    if (uploadState.extractionProgress) {
      return `Extracting page ${uploadState.extractionProgress.currentPage} of ${uploadState.extractionProgress.totalPages}`
    }
    return 'Extracting PDF text'
  }
  if (isProcessing.value) {
    return `Processing stage: ${currentStageLabel.value}`
  }
  return ''
})

// Track if client-side extraction was used (for DOCX files)
const usedClientExtraction = ref(false)

// Watch for extracting-client stage to set the flag
watch(() => uploadState.processingStage, (newStage) => {
  if (newStage === 'extracting-client') {
    usedClientExtraction.value = true
  }
})

// Reset flag when modal closes
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    usedClientExtraction.value = false
  }
})

// Processing stages configuration - dynamic based on whether client-side extraction is used
const stages = computed(() => {
  // For DOCX files with client-side extraction, skip the "Extracting" stage in the modal
  // since extraction happens in the browser before the modal shows processing stages
  // Show only: Cleaning → Extracting (LLM) → Translating
  
  // Default stages for all files (server-side or post-client-extraction)
  return [
    { id: 'cleaning', label: 'Cleaning' },
    { id: 'extracting', label: 'Extracting' },
    { id: 'translating', label: 'Translating' }
  ] as const
})

// Get current stage label
const currentStageLabel = computed(() => {
  const stage = uploadState.processingStage
  if (!stage) return 'Processing'
  
  // Skip extracting-client stage in display (it happens before modal shows)
  if (stage === 'extracting-client') return 'Extracting text from document...'
  
  const stageMap = {
    cleaning: 'Cleaning Text',
    extracting: 'Extracting Words',
    translating: 'Translating'
  }
  
  return stageMap[stage] || 'Processing'
})

// Get stage state (pending, active, completed)
const getStageState = (stageId: string) => {
  const currentStage = uploadState.processingStage
  if (!currentStage) return 'pending'
  
  // Only track the 3 main stages shown in the modal (skip extracting-client)
  const stageOrder = ['cleaning', 'extracting', 'translating']
  
  // If we're in extracting-client stage, treat it as before cleaning
  const actualStage = currentStage === 'extracting-client' ? 'cleaning' : currentStage
  
  const currentIndex = stageOrder.indexOf(actualStage)
  const stageIndex = stageOrder.indexOf(stageId)
  
  if (stageIndex < currentIndex) return 'completed'
  if (stageIndex === currentIndex) return 'active'
  return 'pending'
}

// Calculate progress percentage based on stage or chunk progress
const progressPercentage = computed(() => {
  // If we have chunk progress, calculate based on chunks
  if (uploadState.isChunked && uploadState.chunkProgress.length > 0) {
    const total = uploadState.chunkProgress.length
    const completed = uploadState.chunkProgress.filter(c => c.status === 'completed' || c.status === 'failed').length
    return Math.round((completed / total) * 100)
  }
  
  // Otherwise use stage-based progress (3 stages: 33%, 66%, 100%)
  const stage = uploadState.processingStage
  if (!stage) return 0
  
  const stageProgress = {
    'extracting-client': 10, // Brief client-side extraction (not shown in modal)
    cleaning: 33,
    extracting: 66,
    translating: 100
  }
  
  return stageProgress[stage] || 0
})

// Chunk progress computed properties
const totalChunks = computed(() => uploadState.chunkProgress.length)
const completedChunks = computed(() => 
  uploadState.chunkProgress.filter(c => c.status === 'completed' || c.status === 'failed').length
)
const successfulChunks = computed(() => 
  uploadState.chunkProgress.filter(c => c.status === 'completed').length
)
const failedChunks = computed(() => 
  uploadState.chunkProgress.filter(c => c.status === 'failed').length
)

// Responsive spinner size
const spinnerSize = computed(() => {
  // Use 'md' for mobile (48px) and 'lg' for desktop (64px)
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return 'md'
  }
  return 'lg'
})

// Responsive button size (Requirements: 6.3)
const buttonSize = computed(() => {
  // Use 'lg' for mobile (40px) to meet 44px touch target with padding
  // Use 'md' for desktop (36px)
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return 'lg'
  }
  return 'md'
})

// Extraction progress percentage
const extractionProgressPercentage = computed(() => {
  if (!uploadState.extractionProgress) return 0
  const { currentPage, totalPages } = uploadState.extractionProgress
  return Math.round((currentPage / totalPages) * 100)
})

// Format character count for display
const formatCharCount = (chars: number): string => {
  if (chars < 1000) return `${chars} chars`
  if (chars < 1000000) return `${(chars / 1000).toFixed(1)}K chars`
  return `${(chars / 1000000).toFixed(1)}M chars`
}

// Format time in milliseconds to human-readable format
const formatTime = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

// Watch for status changes and announce to screen readers
watch(isUploading, (newValue) => {
  if (newValue && uploadState.currentFile) {
    announcePolite(`Uploading document ${uploadState.currentFile.name}`)
  }
})

watch(isExtracting, (newValue) => {
  if (newValue) {
    announcePolite('Large PDF detected, extracting text locally')
  }
})

watch(() => uploadState.extractionProgress, (progress) => {
  if (progress && progress.currentPage % 5 === 0) {
    // Announce every 5 pages to avoid overwhelming screen readers
    announcePolite(`Extracting page ${progress.currentPage} of ${progress.totalPages}`)
  }
})

watch(isProcessing, (newValue) => {
  if (newValue) {
    announcePolite('Processing document')
  }
})

watch(() => uploadState.processingStage, (newStage) => {
  if (newStage) {
    const stageLabels = {
      'extracting-client': 'Extracting text from document',
      cleaning: 'Cleaning text',
      extracting: 'Extracting words',
      translating: 'Translating words'
    }
    announcePolite(`Processing stage: ${stageLabels[newStage]}`)
  }
})

watch(hasError, (newValue) => {
  if (newValue && uploadState.error) {
    announceError(uploadState.error)
  }
})

// Expose computed properties for testing
defineExpose({
  isActiveProcessing,
})
</script>

<style scoped>
/* Modal Title - Responsive */
.modal-title {
  font-size: 1.25rem; /* 20px - text-xl */
  font-weight: 600;
  color: rgb(17, 24, 39); /* gray-900 */
}

@media (max-width: 767px) {
  .modal-title {
    font-size: 1.125rem; /* 18px - text-lg */
  }
}

/* Processing Modal Content */
.processing-modal-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 767px) {
  .processing-modal-content {
    gap: 20px; /* Slightly reduced gap on mobile */
  }
}

/* File Info Section */
.file-info-section {
  padding: 16px;
  background-color: rgb(249, 250, 251);
  border-radius: 8px;
  text-align: center;
}

/* Extraction Indicator */
.extraction-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, rgb(249, 250, 251) 0%, rgb(243, 244, 246) 100%);
  border-radius: 12px;
  border: 1px solid rgb(229, 231, 235);
}

@media (max-width: 767px) {
  .extraction-indicator {
    padding: 16px;
    gap: 10px;
  }
}

.extraction-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0, 0, 0);
  border-radius: 12px;
  animation: pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 767px) {
  .extraction-icon {
    width: 48px;
    height: 48px;
  }
}

.extraction-icon-svg {
  width: 32px;
  height: 32px;
  color: white;
}

@media (max-width: 767px) {
  .extraction-icon-svg {
    width: 28px;
    height: 28px;
  }
}

.extraction-message {
  font-size: 1rem;
  font-weight: 500;
  color: rgb(17, 24, 39);
  text-align: center;
}

@media (max-width: 767px) {
  .extraction-message {
    font-size: 0.875rem;
  }
}

/* Extraction Progress Section */
.extraction-progress-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: rgb(249, 250, 251);
  border-radius: 8px;
}

@media (max-width: 767px) {
  .extraction-progress-section {
    padding: 12px;
    gap: 12px;
  }
}

.extraction-progress-label {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(17, 24, 39);
  text-align: center;
}

@media (max-width: 767px) {
  .extraction-progress-label {
    font-size: 0.875rem;
  }
}

.extraction-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 767px) {
  .extraction-stats {
    gap: 12px;
  }
}

.extraction-stat-item {
  font-size: 0.875rem;
  color: rgb(75, 85, 99);
  font-weight: 500;
}

@media (max-width: 767px) {
  .extraction-stat-item {
    font-size: 0.8125rem;
  }
}

/* Extraction Actions */
.extraction-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

@media (max-width: 767px) {
  .extraction-actions :deep(button) {
    min-height: 44px;
    padding-top: 12px;
    padding-bottom: 12px;
  }
}

@media (max-width: 767px) {
  .file-info-section {
    padding: 12px; /* Reduced padding on mobile */
  }
}

.file-name {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20px;
}

.file-name-text {
  font-size: 1rem; /* 16px - text-base */
  font-weight: 500;
  color: rgb(17, 24, 39); /* gray-900 */
  word-break: break-word; /* Prevent long filenames from overflowing */
}

@media (max-width: 767px) {
  .file-name-text {
    font-size: 0.875rem; /* 14px - text-sm */
  }
}

/* Chunk Progress Section */
.chunk-progress-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: rgb(249, 250, 251);
  border-radius: 8px;
}

@media (max-width: 767px) {
  .chunk-progress-section {
    padding: 12px;
    gap: 12px;
  }
}

.chunk-progress-label {
  font-size: 1rem; /* 16px - text-base */
  font-weight: 600;
  color: rgb(17, 24, 39); /* gray-900 */
  text-align: center;
}

@media (max-width: 767px) {
  .chunk-progress-label {
    font-size: 0.875rem; /* 14px - text-sm */
  }
}

.chunk-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
}

@media (max-width: 767px) {
  .chunk-status-grid {
    gap: 6px;
    max-width: 300px;
  }
}

.chunk-status-indicator {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 767px) {
  .chunk-status-indicator {
    width: 28px;
    height: 28px;
  }
}

.chunk-completed {
  background-color: rgb(34, 197, 94); /* green-500 */
  color: white;
}

.chunk-failed {
  background-color: rgb(239, 68, 68); /* red-500 */
  color: white;
}

.chunk-processing {
  background-color: rgb(0, 0, 0);
  color: white;
}

.chunk-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 767px) {
  .chunk-icon {
    width: 16px;
    height: 16px;
  }
}

.chunk-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 767px) {
  .chunk-spinner {
    width: 14px;
    height: 14px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chunk-summary-text {
  font-size: 0.875rem; /* 14px - text-sm */
  color: rgb(75, 85, 99); /* gray-600 */
  text-align: center;
}

@media (max-width: 767px) {
  .chunk-summary-text {
    font-size: 0.8125rem; /* 13px */
  }
}

/* Stage Label */
.stage-label {
  font-size: 1.125rem; /* 18px - text-lg */
  font-weight: 500;
  color: rgb(17, 24, 39); /* gray-900 */
}

@media (max-width: 767px) {
  .stage-label {
    font-size: 1rem; /* 16px - text-base */
  }
}

/* Status Messages */
.status-message {
  font-size: 1rem; /* 16px - text-base */
  color: rgb(75, 85, 99); /* gray-600 */
}

.status-message-small {
  font-size: 0.875rem; /* 14px - text-sm */
  color: rgb(75, 85, 99); /* gray-600 */
}

@media (max-width: 767px) {
  .status-message {
    font-size: 0.875rem; /* 14px - text-sm */
  }
  
  .status-message-small {
    font-size: 0.8125rem; /* 13px */
  }
}

/* Stage Indicators */
.stage-indicators {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
}

@media (max-width: 767px) {
  .stage-indicators {
    gap: 16px; /* Reduced gap on mobile */
    padding: 12px 0;
  }
}

.stage-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

@media (max-width: 767px) {
  .stage-indicator {
    gap: 6px; /* Slightly reduced gap on mobile */
  }
}

.stage-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 767px) {
  .stage-circle {
    width: 10px; /* Slightly smaller on mobile */
    height: 10px;
  }
}

.stage-pending .stage-circle {
  background-color: rgb(209, 213, 219); /* gray-300 */
}

.stage-active .stage-circle {
  background-color: rgb(0, 0, 0);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.stage-completed .stage-circle {
  background-color: rgb(34, 197, 94); /* green-500 */
  animation: scale-in 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stage-checkmark {
  width: 10px;
  height: 10px;
  color: white;
}

@media (max-width: 767px) {
  .stage-checkmark {
    width: 8px;
    height: 8px;
  }
}

.stage-label-text {
  font-size: 12px;
  font-weight: 500;
  color: rgb(107, 114, 128); /* gray-600 */
}

@media (max-width: 767px) {
  .stage-label-text {
    font-size: 11px; /* Slightly smaller on mobile */
  }
}

.stage-active .stage-label-text {
  color: rgb(0, 0, 0);
}

/* Progress Bar */
.progress-bar-container {
  width: 100%;
}

.progress-bar-track {
  width: 100%;
  height: 6px;
  background-color: rgb(229, 231, 235); /* gray-200 */
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: rgb(0, 0, 0);
  border-radius: 9999px;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Stage Label Transition */
.stage-fade-enter-active,
.stage-fade-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stage-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.stage-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes pulse-gentle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes scale-in {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Error State Styles */
.error-icon {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.error-icon-svg {
  width: 4rem; /* 64px - w-16 */
  height: 4rem; /* 64px - h-16 */
  color: rgb(239, 68, 68); /* red-500 */
}

@media (max-width: 767px) {
  .error-icon-svg {
    width: 3rem; /* 48px - smaller on mobile */
    height: 3rem; /* 48px */
  }
}

.error-message-box {
  padding: 16px;
  background-color: rgb(254, 242, 242); /* red-50 */
  border: 1px solid rgb(252, 165, 165); /* red-300 */
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 767px) {
  .error-message-box {
    padding: 12px; /* Reduced padding on mobile */
  }
}

.error-message-text {
  font-size: 1rem; /* 16px - text-base */
  font-weight: 500;
  color: rgb(185, 28, 28); /* red-700 */
}

@media (max-width: 767px) {
  .error-message-text {
    font-size: 0.875rem; /* 14px - text-sm */
  }
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Touch-friendly button sizes on mobile (Requirements: 6.3) */
@media (max-width: 767px) {
  .error-actions :deep(button) {
    min-height: 44px; /* Minimum 44px touch target */
    padding-top: 12px;
    padding-bottom: 12px;
  }
}

/* Ensure modal is scrollable on small screens (Requirements: 6.4) */
@media (max-width: 767px) {
  .processing-modal-content {
    max-height: calc(90vh - 120px); /* Account for header and padding */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  }
}

/* Shake Animation for Error Icon */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .stage-circle,
  .progress-bar-fill,
  .stage-fade-enter-active,
  .stage-fade-leave-active,
  .extraction-icon {
    transition: none;
    animation: none;
  }
  
  .error-icon {
    animation: none;
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
