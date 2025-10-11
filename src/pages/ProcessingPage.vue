<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div data-animate-child class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <!-- Processing State -->
      <div v-if="isProcessing || isUploading" class="text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Processing Document</h2>
        
        <!-- File Name -->
        <div v-if="currentFile" class="mb-6">
          <p class="text-sm text-gray-600 mb-1">File:</p>
          <p class="text-lg font-medium text-gray-800 truncate">{{ currentFile.name }}</p>
        </div>

        <!-- Loading Spinner with enhanced animation (Task 9.3) -->
        <div class="mb-6">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-black" style="animation-duration: 0.8s;"></div>
        </div>

        <!-- Processing Stage with animation (Task 9.3) -->
        <div v-if="processingStage" class="mb-6">
          <p class="text-sm text-gray-600 mb-2">Current Stage:</p>
          <div class="flex items-center justify-center space-x-2">
            <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-black transition-all duration-250 animate-fade-in">
              {{ stageLabel }}
            </span>
          </div>
        </div>

        <!-- Stage Progress Indicators -->
        <div class="flex justify-center space-x-2 mb-4">
          <div 
            v-for="stage in stages" 
            :key="stage.value"
            class="flex flex-col items-center"
          >
            <div 
              class="w-3 h-3 rounded-full mb-1 transition-colors"
              :class="getStageIndicatorClass(stage.value)"
            ></div>
            <span class="text-xs text-gray-500">{{ stage.label }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
          <div 
            ref="progressBarRef"
            class="h-full bg-black rounded-full transition-all duration-300 origin-left"
            :style="{ transform: `scaleX(${progressPercentage / 100})` }"
          ></div>
        </div>

        <!-- Status Message -->
        <p class="text-sm text-gray-600">
          {{ isUploading ? 'Uploading document...' : 'Processing your document. This may take a moment.' }}
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="text-center">
        <h2 class="text-2xl font-bold text-red-600 mb-4">Processing Failed</h2>
        
        <!-- Error Icon -->
        <div class="mb-6">
          <svg class="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Error Message -->
        <div class="mb-6 p-4 bg-red-50 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col space-y-3">
          <button 
            @click="goToUpload"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button 
            @click="goToHome"
            class="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>
      </div>

      <!-- Fallback State (shouldn't normally be visible) -->
      <div v-else class="text-center">
        <p class="text-gray-600 mb-4">No document is being processed.</p>
        <button 
          @click="goToUpload"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Upload Document
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoadingAnimation } from '@/composables/useLoadingAnimation'
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

// Get stage indicator class based on current stage (Task 9.3: Enhanced with smooth transitions)
function getStageIndicatorClass(stage: ProcessingStage): string {
  if (!processingStage.value) return 'bg-gray-300'
  
  const stageOrder: ProcessingStage[] = ['cleaning', 'extracting', 'translating']
  const currentIndex = stageOrder.indexOf(processingStage.value)
  const stageIndex = stageOrder.indexOf(stage)
  
  if (stageIndex < currentIndex) {
    return 'bg-green-500 success-pulse' // Completed with success animation
  } else if (stageIndex === currentIndex) {
    return 'bg-black animate-pulse' // Current with pulse animation
  } else {
    return 'bg-gray-300' // Pending
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

