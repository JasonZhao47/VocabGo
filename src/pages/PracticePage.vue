<template>
  <div class="practice-page">
    <!-- Header Navigation (only show when not in active session) -->
    <header v-if="practiceState !== 'active'" class="practice-header">
      <div class="header-container">
        <button @click="handleBack" class="back-button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Wordlists</span>
        </button>
        <h1 class="header-title">{{ wordlistName }}</h1>
      </div>
    </header>

    <!-- Practice Setup View (currently unused - goes directly to active) -->
    <PracticeSetup
      v-if="practiceState === 'setup'"
      :wordlist-id="wordlistId"
      :wordlist-name="wordlistName"
      :word-count="questions.length"
      @generate="handleStart"
      @cancel="handleBack"
    />

    <!-- Practice Session View -->
    <PracticeSession
      v-else-if="practiceState === 'active'"
      :questions="questions"
      :current-question-index="currentQuestionIndex"
      :answers="answers"
      :time-remaining="timeRemaining"
      :timer-duration="timerDuration"
      :is-paused="isPaused"
      @answer="handleAnswer"
      @navigate="handleNavigate"
      @submit="handleSubmit"
      @toggle-pause="togglePause"
    />

    <!-- Results View -->
    <ResultsView
      v-else-if="practiceState === 'completed'"
      :results="{
        sessionId: sessionId,
        totalQuestions: questions.length,
        correctAnswers: score,
        score: score,
        duration: timeTaken,
        breakdown: {}
      }"
      :questions="questions"
      :user-answers="answers"
      :practice-set-id="practiceSetId"
      :wordlist-name="wordlistName"
      @retry="handleRetry"
      @new="handleNewQuestions"
      @close="handleBack"
      @share-created="handleShare"
    />

    <!-- Loading State -->
    <div v-else-if="practiceState === 'loading'" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="practiceState === 'error'" class="error-container">
      <ErrorDisplay
        title="Failed to Load Practice Session"
        :message="errorMessage"
        :details="errorDetails"
        severity="error"
        :retryable="isRetryable"
        :dismissible="false"
        @retry="handleRetry"
      />
      <button @click="handleBack" class="btn-back">
        Back to Wordlists
      </button>
    </div>

    <!-- Share Modal -->
    <ShareModal
      v-if="showShareModal"
      :model-value="showShareModal"
      :practice-set-id="practiceSetId"
      :questions="questions"
      :wordlist-name="wordlistName"
      @update:model-value="showShareModal = $event"
      @share-created="handleShareCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePracticeSession } from '@/composables/usePracticeSession'
import { generatePracticeQuestions } from '@/services/practiceQuestionService'
import { useToast } from '@/composables/useToast'
import PracticeSetup from '@/components/practice/PracticeSetup.vue'
import PracticeSession from '@/components/practice/PracticeSession.vue'
import ResultsView from '@/components/practice/ResultsView.vue'
import ShareModal from '@/components/practice/ShareModal.vue'
import ErrorDisplay from '@/components/practice/ErrorDisplay.vue'
import type { QuestionType, Question, Answer, PracticeSet, SessionResults } from '@/types/practice'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

// Route params
const wordlistId = computed(() => route.query.wordlistId as string)
const wordlistName = computed(() => route.query.wordlistName as string || 'Wordlist')
const questionTypesParam = computed(() => {
  const types = route.query.questionTypes as string
  return types ? types.split(',') as QuestionType[] : ['matching', 'fill-blank', 'multiple-choice']
})
const timerDurationParam = computed(() => {
  const duration = route.query.timerDuration as string
  return duration ? parseInt(duration) : undefined
})

// State
type PracticeState = 'loading' | 'setup' | 'active' | 'completed' | 'error'
const practiceState = ref<PracticeState>('loading')
const loadingMessage = ref('Generating practice questions...')
const errorMessage = ref('')
const errorDetails = ref('')
const isRetryable = ref(true)
const showShareModal = ref(false)
const practiceSetId = ref<string>('')

// Practice set and session composable - initialized after questions are generated
const practiceSet = ref<PracticeSet | null>(null)
const sessionComposable = ref<ReturnType<typeof usePracticeSession> | null>(null)

// Session results for completed state
const sessionResults = ref<SessionResults | null>(null)

// Computed properties for template bindings
const questions = computed(() => {
  return sessionComposable.value?.allQuestions || []
})

const currentQuestionIndex = computed(() => {
  return sessionComposable.value?.currentQuestionIndex || 0
})

const answers = computed(() => {
  return sessionComposable.value?.answers || new Map()
})

const timeRemaining = computed(() => {
  return sessionComposable.value?.timeRemaining || 0
})

const isPaused = computed(() => {
  return sessionComposable.value?.isPaused || false
})

const sessionId = computed(() => {
  return sessionComposable.value?.sessionId || ''
})

const score = computed(() => {
  if (!sessionResults.value) return 0
  return sessionResults.value.correctAnswers
})

const timeTaken = computed(() => {
  if (!sessionResults.value) return 0
  return sessionResults.value.duration
})

const timerDuration = computed(() => {
  return timerDurationParam.value || 0
})

// Methods
async function initializePractice() {
  if (!wordlistId.value) {
    errorMessage.value = 'No wordlist selected'
    errorDetails.value = 'Please select a wordlist from the wordlists page to start practicing.'
    isRetryable.value = false
    practiceState.value = 'error'
    return
  }

  try {
    // Reset error state
    errorMessage.value = ''
    errorDetails.value = ''
    isRetryable.value = true
    
    practiceState.value = 'loading'
    loadingMessage.value = 'Preparing your practice session...'

    // 1. Generate questions first with progress updates
    const response = await generatePracticeQuestions(
      wordlistId.value,
      questionTypesParam.value as QuestionType[],
      10, // max questions per type
      (message) => {
        // Update loading message with progress
        loadingMessage.value = message
      }
    )

    // 2. Handle error response from API
    if (!response.success) {
      const errorCode = response.error?.code || 'UNKNOWN_ERROR'
      const errorMsg = response.error?.message || 'Failed to generate questions'
      
      // Determine if error is retryable based on error code
      isRetryable.value = isErrorRetryable(errorCode)
      
      // Set user-friendly error message
      errorMessage.value = errorMsg
      
      // Add helpful details based on error type
      if (errorCode === 'INSUFFICIENT_WORDS') {
        errorDetails.value = 'Try adding more words to your wordlist before generating practice questions.'
        isRetryable.value = false
      } else if (errorCode === 'GENERATION_TIMEOUT') {
        errorDetails.value = 'The AI took too long to generate questions. This usually resolves on retry.'
      } else if (errorCode === 'NETWORK_ERROR' || errorCode === 'OFFLINE') {
        errorDetails.value = 'Please check your internet connection and try again.'
      } else if (errorCode === 'VALIDATION_ERROR') {
        errorDetails.value = 'The generated questions did not meet quality standards. Please try again.'
      }
      
      practiceState.value = 'error'
      showToast('Failed to generate practice questions', 'error')
      return
    }

    // 3. Validate response has required data
    if (!response.questions || !response.practiceSetId) {
      errorMessage.value = 'Invalid response from server'
      errorDetails.value = 'The server returned an incomplete response. Please try again.'
      isRetryable.value = true
      practiceState.value = 'error'
      showToast('Failed to generate practice questions', 'error')
      return
    }

    // Store practice set ID for sharing
    practiceSetId.value = response.practiceSetId

    // 4. Create complete PracticeSet object with generated questions
    loadingMessage.value = 'Setting up your practice session...'
    
    practiceSet.value = {
      id: response.practiceSetId,
      wordlistId: wordlistId.value,
      questions: response.questions,
      createdAt: new Date(),
      isShared: false
    }

    // 5. Initialize composable with complete data
    sessionComposable.value = usePracticeSession({
      practiceSet: practiceSet.value,
      timerDuration: timerDurationParam.value,
      onTimerExpire: handleTimerExpire,
      onSessionComplete: handleSessionComplete
    })

    // 6. Start the practice session immediately (questions already generated)
    practiceState.value = 'active'
    
    // Start the timer if configured
    if (sessionComposable.value && timerDurationParam.value) {
      sessionComposable.value.startTimer()
    }

    // Show cache notification if applicable
    if (response.metadata?.cached) {
      showToast('Loaded previously generated questions', 'info')
    }
  } catch (error) {
    console.error('Failed to initialize practice:', error)
    
    // Extract error information
    const errorObj = error as any
    const errorCode = errorObj?.code || 'UNKNOWN_ERROR'
    
    // Set retryable flag based on error type
    isRetryable.value = isErrorRetryable(errorCode)
    
    // Set user-friendly error message
    errorMessage.value = errorObj?.userMessage || errorObj?.message || 'An unexpected error occurred'
    
    // Add technical details for debugging
    if (errorObj?.message && errorObj?.message !== errorMessage.value) {
      errorDetails.value = `Technical details: ${errorObj.message}`
    }
    
    practiceState.value = 'error'
    showToast('Failed to generate practice questions', 'error')
  }
}

/**
 * Determine if an error code is retryable
 */
function isErrorRetryable(errorCode: string): boolean {
  const retryableErrors = [
    'GENERATION_FAILED',
    'GENERATION_TIMEOUT',
    'NETWORK_ERROR',
    'OFFLINE',
    'TIMEOUT',
    'INTERNAL_ERROR',
    'UNKNOWN_ERROR',
  ]
  
  return retryableErrors.includes(errorCode)
}

function handleAnswer(payload: { questionId: string; answer: Answer }) {
  if (sessionComposable.value) {
    sessionComposable.value.submitAnswer(payload.questionId, payload.answer)
  }
}

function handleNavigate(index: number) {
  if (sessionComposable.value) {
    sessionComposable.value.goToQuestion(index)
  }
}

async function handleSubmit() {
  try {
    if (sessionComposable.value) {
      sessionResults.value = sessionComposable.value.completeSession()
      practiceState.value = 'completed'
    }
  } catch (error) {
    console.error('Failed to submit session:', error)
    showToast('Failed to save session results', 'error')
  }
}

function togglePause() {
  if (sessionComposable.value) {
    if (sessionComposable.value.isPaused) {
      sessionComposable.value.resumeTimer()
    } else {
      sessionComposable.value.pauseTimer()
    }
  }
}

function handleTimerExpire() {
  showToast('Time is up!', 'info')
  handleSubmit()
}

function handleSessionComplete() {
  // Called when session is completed
  practiceState.value = 'completed'
}

function handleRetry() {
  if (practiceState.value === 'error') {
    // Reset all state before retrying
    errorMessage.value = ''
    errorDetails.value = ''
    isRetryable.value = true
    practiceSet.value = null
    sessionComposable.value = null
    sessionResults.value = null
    
    // Reinitialize practice session
    initializePractice()
  } else if (sessionComposable.value) {
    // Retry from results view - reset the session
    sessionComposable.value.resetSession()
    practiceState.value = 'active'
  }
}

function handleNewQuestions() {
  // Clear current session and generate new questions
  practiceSet.value = null
  sessionComposable.value = null
  sessionResults.value = null
  
  // Reinitialize with new questions
  initializePractice()
}

function handleShare() {
  showShareModal.value = true
}

function handleShareCreated(shareUrl: string) {
  // Handle share URL creation
  console.log('Share URL created:', shareUrl)
}

function handleBack() {
  router.push('/wordlists')
}

function handleStart(config: { timerDuration?: number; questionTypes?: QuestionType[] }) {
  // User clicked "Start Practice" from setup screen
  // Transition from setup to active state
  practiceState.value = 'active'
  
  // Start the timer if configured
  if (sessionComposable.value && config.timerDuration) {
    sessionComposable.value.startTimer()
  }
}

const estimatedTime = computed(() => {
  // Calculate estimated time based on number of questions
  // Rough estimate: 30 seconds per question
  const questionCount = questions.value.length
  return Math.ceil(questionCount * 0.5) // minutes
})

// Lifecycle
onMounted(() => {
  initializePractice()
})

onUnmounted(() => {
  // Session is automatically persisted by the composable
})
</script>

<style scoped>
.practice-page {
  min-height: 100vh;
  background: #f9fafb;
}

/* Header */
.practice-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.back-button:hover {
  color: #000000;
  background: #f9fafb;
  border-color: #9ca3af;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 24px;
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
  gap: 24px;
}

.btn-back {
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 150ms ease-out;
  cursor: pointer;
  color: #374151;
  background: #ffffff;
  border: 2px solid #e5e7eb;
}

.btn-back:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Responsive */
@media (max-width: 640px) {
  .error-container {
    padding: 24px 16px;
  }

  .btn-back {
    width: 100%;
  }

  .header-container {
    padding: 12px 16px;
  }

  .back-button span {
    display: none;
  }
}
</style>
