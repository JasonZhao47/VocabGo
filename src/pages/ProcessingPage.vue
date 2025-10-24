<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div data-animate-child class="max-w-md w-full">
      <!-- Processing State -->
      <div v-if="isProcessing || isUploading" class="text-center">
        <Transition name="fade" mode="out-in">
          <div :key="processingStage || 'uploading'">
            <h2 class="text-xl font-bold text-black mb-4">Processing Document</h2>
            
            <!-- File Name with skeleton fallback -->
            <div class="mb-6">
              <p class="text-sm text-gray-600 mb-2">File:</p>
              <Skeleton v-if="!currentFile" variant="text" height="24px" class="mx-auto max-w-xs" />
              <p v-else class="text-base font-normal text-black truncate">{{ currentFile.name }}</p>
            </div>

            <!-- Loading Spinner with smooth animation -->
            <div class="mb-8 flex justify-center">
              <div class="spinner-container">
                <div class="spinner"></div>
              </div>
            </div>

            <!-- Processing Stage with smooth transition -->
            <div v-if="processingStage" class="mb-6">
              <p class="text-sm text-gray-600 mb-3">Current Stage:</p>
              <Transition name="slide-fade" mode="out-in">
                <div :key="processingStage" class="flex items-center justify-center">
                  <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-normal bg-gray-100 text-black">
                    {{ stageLabel }}
                  </span>
                </div>
              </Transition>
            </div>

            <!-- Stage Progress Indicators with smooth transitions -->
            <div class="flex justify-center gap-6 mb-6">
              <div 
                v-for="stage in stages" 
                :key="stage.value"
                class="flex flex-col items-center gap-2"
              >
                <div 
                  class="stage-indicator"
                  :class="getStageIndicatorClass(stage.value)"
                ></div>
                <span class="text-xs text-gray-500 font-normal">{{ stage.label }}</span>
              </div>
            </div>

            <!-- Progress Bar with smooth animation -->
            <div class="w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
              <div 
                ref="progressBarRef"
                class="progress-bar"
                :style="{ width: `${progressPercentage}%` }"
              ></div>
            </div>

            <!-- Status Message -->
            <p class="text-sm text-gray-600 font-normal">
              {{ isUploading ? 'Uploading document...' : 'Processing your document. This may take a moment.' }}
            </p>
          </div>
        </Transition>
      </div>

      <!-- Error State with smooth transition -->
      <Transition name="fade" mode="out-in">
        <div v-if="hasError" class="text-center">
          <h2 class="text-xl font-bold text-red-600 mb-6">Processing Failed</h2>
          
          <!-- Error Icon with animation -->
          <div class="mb-6 error-icon-container">
            <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Error Message -->
          <div class="mb-8 p-4 bg-red-50 rounded-sm border border-red-100">
            <p class="text-sm text-red-800 font-normal">{{ error }}</p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <button 
              @click="goToUpload"
              class="w-full px-6 py-3 bg-black text-white rounded-full hover:opacity-90 active:opacity-80 transition-all duration-200 font-normal text-sm"
            >
              Try Again
            </button>
            <button 
              @click="goToHome"
              class="w-full px-6 py-3 bg-gray-100 text-black rounded-full hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 font-normal text-sm"
            >
              Go Home
            </button>
          </div>
        </div>
      </Transition>

      <!-- Fallback State (shouldn't normally be visible) -->
      <div v-if="!isProcessing && !isUploading && !hasError" class="text-center">
        <p class="text-gray-600 mb-6 font-normal">No document is being processed.</p>
        <button 
          @click="goToUpload"
          class="px-6 py-3 bg-black text-white rounded-full hover:opacity-90 active:opacity-80 transition-all duration-200 font-normal text-sm"
        >
          Upload Document
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoadingAnimation } from '@/composables/useLoadingAnimation'
import Skeleton from '@/components/ui/Skeleton.vue'
import uploadState, { isProcessing, isUploading, hasError, isCompleted } from '@/state/uploadState'
import type { ProcessingStage } from '@/state/uploadState'

const router = useRouter()
const progressBarRef = ref<HTMLElement | null>(null)
const { animateProgress } = useLoadingAnimation({ type: 'progress' })

// State
const currentFile = computed(() => uploadState.currentFile)
const error = computed(() => uploadState.error)
const processingStage = computed(() => uploadState.processingStage)

// Stage configuration
const stages = [
  { value: 'cleaning' as ProcessingStage, label: 'Cleaning' },
  { value: 'extracting' as ProcessingStage, label: 'Extracting' },
  { value: 'translating' as ProcessingStage, label: 'Translating' },
]

// Stage label
const stageLabel = computed(() => {
  if (!processingStage.value) return ''
  
  const stageMap: Record<ProcessingStage, string> = {
    cleaning: 'Cleaning Text',
    extracting: 'Extracting Words',
    translating: 'Translating to Mandarin',
  }
  
  return stageMap[processingStage.value]
})

// Get stage indicator class based on current stage
function getStageIndicatorClass(stage: ProcessingStage): string {
  if (!processingStage.value) return 'stage-pending'
  
  const stageOrder: ProcessingStage[] = ['cleaning', 'extracting', 'translating']
  const currentIndex = stageOrder.indexOf(processingStage.value)
  const stageIndex = stageOrder.indexOf(stage)
  
  if (stageIndex < currentIndex) {
    return 'stage-completed'
  } else if (stageIndex === currentIndex) {
    return 'stage-active'
  } else {
    return 'stage-pending'
  }
}

// Navigation
function goToUpload() {
  router.push('/upload')
}

function goToHome() {
  router.push('/')
}

// Compute progress based on stage
const progressPercentage = computed(() => {
  if (!processingStage.value) return 0
  
  const stageProgress: Record<ProcessingStage, number> = {
    cleaning: 33,
    extracting: 66,
    translating: 100,
  }
  
  return stageProgress[processingStage.value] || 0
})

// Watch for stage changes and animate progress
watch(processingStage, (newStage) => {
  if (newStage && progressBarRef.value) {
    animateProgress(progressBarRef.value, progressPercentage.value)
  }
})

// Auto-navigate to results when processing is complete
watch(isCompleted, (completed) => {
  if (completed) {
    router.push('/result')
  }
})
</script>

<style scoped>
/* ============================================
   SPINNER ANIMATION
   ============================================ */

.spinner-container {
  display: inline-block;
  width: 64px;
  height: 64px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 3px solid rgb(242, 242, 242);
  border-top-color: rgb(0, 0, 0);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================
   STAGE INDICATORS
   ============================================ */

.stage-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stage-pending {
  background-color: rgb(229, 229, 229);
}

.stage-active {
  background-color: rgb(0, 0, 0);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.stage-completed {
  background-color: rgb(34, 197, 94);
  animation: success-pulse 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes success-pulse {
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

/* ============================================
   PROGRESS BAR
   ============================================ */

.progress-bar {
  height: 100%;
  background-color: rgb(0, 0, 0);
  border-radius: 9999px;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left;
}

/* ============================================
   ERROR ICON ANIMATION
   ============================================ */

.error-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: rgb(239, 68, 68);
  animation: error-shake 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes error-shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

/* ============================================
   TRANSITIONS
   ============================================ */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

/* ============================================
   REDUCED MOTION SUPPORT
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  .spinner,
  .stage-indicator,
  .progress-bar,
  .error-icon,
  .fade-enter-active,
  .fade-leave-active,
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    animation: none !important;
    transition: none !important;
  }
  
  .stage-active {
    background-color: rgb(0, 0, 0);
  }
  
  .stage-completed {
    background-color: rgb(34, 197, 94);
  }
}
</style>

