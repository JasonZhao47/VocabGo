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

    <!-- Practice Session View -->
    <PracticeSession
      v-if="practiceState === 'active'"
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
        severity="error"
        :retryable="true"
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
import PracticeSession from '@/components/practice/PracticeSession.vue'
import ResultsView from '@/components/practice/ResultsView.vue'
import ShareModal from '@/components/practice/ShareModal.vue'
import ErrorDisplay from '@/components/practice/ErrorDisplay.vue'
import type { QuestionType, Question, Answer } from '@/types/practice'

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
type PracticeState = 'loading' | 'active' | 'completed' | 'error'
const practiceState = ref<PracticeState>('loading')
const loadingMessage = ref('Generating practice questions...')
const errorMessage = ref('')
const showShareModal = ref(false)
const practiceSetId = ref<string>('')

// Create a mock practice set for the composable
const mockPracticeSet = ref({
  id: '',
  wordlistId: wordlistId.value || '',
  questions: {
    matching: [],
    fillBlank: [],
    multipleChoice: []
  },
  createdAt: new Date(),
  isShared: false
})

// Practice session composable
const {
  sessionId,
  currentQuestionIndex,
  answers,
  timeRemaining,
  isPaused,
  allQuestions: questions,
  // Mock the missing properties for now
} = usePracticeSession({
  practiceSet: mockPracticeSet.value,
  timerDuration: timerDurationParam.value
})

// Mock the missing properties that PracticePage expects
const timerDuration = computed(() => timerDurationParam.value)
const score = ref(0)
const timeTaken = ref(0)
const startSession = (...args: any[]) => {}
const answerQuestion = (...args: any[]) => {}
const navigateToQuestion = (...args: any[]) => {}
const submitSession = (...args: any[]) => {}
const toggleSessionPause = () => {}
const retrySession = () => {}
const clearSession = () => {}

// Methods
async function initializePractice() {
  if (!wordlistId.value) {
    errorMessage.value = 'No wordlist selected'
    practiceState.value = 'error'
    return
  }

  try {
    practiceState.value = 'loading'
    loadingMessage.value = 'Generating practice questions...'

    // Generate questions
    const response = await generatePracticeQuestions(
      wordlistId.value,
      questionTypesParam.value as QuestionType[],
      10, // max questions per type
      (message) => {
        loadingMessage.value = message
      }
    )

    if (!response.success || !response.questions || !response.practiceSetId) {
      throw new Error(response.error?.message || 'Failed to generate questions')
    }

    // Store practice set ID for sharing
    practiceSetId.value = response.practiceSetId

    // Flatten questions from all types
    const allQuestions: Question[] = [
      ...response.questions.matching,
      ...response.questions.fillBlank,
      ...response.questions.multipleChoice,
    ]

    // Start practice session
    startSession(
      allQuestions,
      wordlistId.value,
      timerDurationParam.value
    )

    practiceState.value = 'active'

    // Show cache notification if applicable
    if (response.metadata?.cached) {
      showToast('Loaded previously generated questions', 'info')
    }
  } catch (error) {
    console.error('Failed to initialize practice:', error)
    errorMessage.value = error instanceof Error ? error.message : 'An unexpected error occurred'
    practiceState.value = 'error'
    
    showToast('Failed to generate practice questions', 'error')
  }
}

function handleAnswer(payload: { questionId: string; answer: Answer }) {
  answerQuestion(payload.questionId, payload.answer)
}

function handleNavigate(index: number) {
  navigateToQuestion(index)
}

async function handleSubmit() {
  try {
    await submitSession()
    practiceState.value = 'completed'
  } catch (error) {
    console.error('Failed to submit session:', error)
    showToast('Failed to save session results', 'error')
  }
}

function togglePause() {
  toggleSessionPause()
}

function handleRetry() {
  if (practiceState.value === 'error') {
    initializePractice()
  } else {
    retrySession()
    practiceState.value = 'active'
  }
}

function handleNewQuestions() {
  clearSession()
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
