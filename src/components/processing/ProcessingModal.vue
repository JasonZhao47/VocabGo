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

      <!-- Stage Label -->
      <div class="text-center">
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
import { computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Button from '@/components/ui/Button.vue'
import uploadState, { isUploading, isProcessing, hasError } from '@/state/uploadState'
import { announcePolite, announceError } from '@/utils/accessibilityAnnouncer'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'retry'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed property for modal visibility based on uploadState
const isActiveProcessing = computed(() => 
  isUploading.value || isProcessing.value
)

const modalTitle = computed(() => {
  if (hasError.value) return 'Processing Failed'
  if (isUploading.value) return 'Uploading Document'
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

// Screen reader announcement
const screenReaderAnnouncement = computed(() => {
  if (hasError.value) {
    return `Error: ${uploadState.error || 'Processing failed'}`
  }
  if (isUploading.value) {
    return `Uploading document ${uploadState.currentFile?.name || ''}`
  }
  if (isProcessing.value) {
    return `Processing stage: ${currentStageLabel.value}`
  }
  return ''
})

// Processing stages configuration - dynamic based on whether client-side extraction is used
const stages = computed(() => {
  const currentStage = uploadState.processingStage
  
  // Check if we're using client-side extraction (DOCX files)
  // If current stage is extracting-client, or if we've passed it (cleaning/extracting/translating after client extraction)
  const isUsingClientExtraction = currentStage === 'extracting-client'
  
  if (isUsingClientExtraction) {
    // Show all stages including client-side extraction
    return [
      { id: 'extracting-client', label: 'Extracting' },
      { id: 'cleaning', label: 'Cleaning' },
      { id: 'extracting', label: 'Extracting' },
      { id: 'translating', label: 'Translating' }
    ] as const
  }
  
  // Default stages without client-side extraction (for non-DOCX files)
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
  
  const stageMap = {
    'extracting-client': 'Extracting text from document...',
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
  
  const stageOrder = ['extracting-client', 'cleaning', 'extracting', 'translating']
  const currentIndex = stageOrder.indexOf(currentStage)
  const stageIndex = stageOrder.indexOf(stageId)
  
  if (stageIndex < currentIndex) return 'completed'
  if (stageIndex === currentIndex) return 'active'
  return 'pending'
}

// Calculate progress percentage based on stage
const progressPercentage = computed(() => {
  const stage = uploadState.processingStage
  if (!stage) return 0
  
  const stageProgress = {
    'extracting-client': 25,
    cleaning: 50,
    extracting: 75,
    translating: 100
  }
  
  return stageProgress[stage] || 0
})

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

// Watch for status changes and announce to screen readers
watch(isUploading, (newValue) => {
  if (newValue && uploadState.currentFile) {
    announcePolite(`Uploading document ${uploadState.currentFile.name}`)
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
  .stage-fade-leave-active {
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
