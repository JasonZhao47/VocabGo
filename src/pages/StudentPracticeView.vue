<template>
  <div class="student-practice-view-wrapper">
    <!-- Nickname Entry Modal -->
    <StudentNicknameEntry
      v-model="showNicknameModal"
      :share-token="shareToken"
      @submit="handleNicknameSubmit"
      @error="handleNicknameError"
    />
    
    <!-- Only show content when modal is closed -->
    <div v-if="!showNicknameModal" class="student-practice-view">
      <!-- Loading State -->
      <div v-if="isLoadingSession" class="loading-container">
        <div class="loading-spinner">
          <svg class="animate-spin h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p class="loading-text">Loading practice session...</p>
      </div>

    <!-- Error State -->
    <div v-else-if="sessionError" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ sessionError }}</p>
      <Button @click="retrySession" variant="secondary">
        Try Again
      </Button>
    </div>

    <!-- Practice Content -->
    <div v-else-if="wordlist && studentNickname" class="practice-container">
      <!-- Header -->
      <div class="practice-header">
        <div class="student-info">
          <span class="greeting">Hi, {{ studentNickname }}! 👋</span>
          <span class="wordlist-title">{{ wordlist.title }}</span>
        </div>
      </div>

      <!-- Practice Area -->
      <div class="practice-content">
        <!-- Loading Questions -->
        <div v-if="isLoadingQuestions" class="loading-container">
          <div class="loading-spinner">
            <svg class="animate-spin h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p class="loading-text">Generating practice questions...</p>
        </div>

        <!-- Practice Questions -->
        <div v-else-if="questions && allQuestions.length > 0">
          <AllQuestionsView
            v-if="!practiceCompleted"
            :questions="questions"
            :wordlist-id="wordlist!.id"
            :wordlist-name="wordlist!.title"
            @complete="handlePracticeComplete"
          />

          <!-- Completion -->
          <Card v-else class="completion-card">
            <div class="completion-content">
              <div class="completion-icon">🎉</div>
              <h3 class="completion-title">Practice Complete!</h3>
              <p class="completion-text">
                You answered <strong>{{ completionCorrectCount }}</strong> out of <strong>{{ completionTotalCount }}</strong> correctly
              </p>
              <div class="completion-score">
                <div class="score-circle">
                  <span class="score-percentage">{{ completionScore }}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- No Questions Available -->
        <Card v-else class="practice-card">
          <div class="practice-placeholder">
            <div class="placeholder-icon">
              <svg class="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="placeholder-title">No Questions Available</h3>
            <p class="placeholder-text">
              Practice questions could not be generated at this time. Please try again later.
            </p>
          </div>
        </Card>
      </div>

      <!-- Personal Stats (Collapsible) -->
      <Accordion
        v-if="personalMistakes.length > 0"
        title="Your Mistakes"
        variant="bordered"
        class="personal-stats"
      >
        <template #header>
          <div class="stats-header">
            <span class="stats-title">Your Mistakes</span>
            <span class="stats-badge">{{ personalMistakes.length }} words</span>
          </div>
        </template>

        <div class="mistake-list">
          <div
            v-for="mistake in personalMistakes"
            :key="mistake.word"
            class="mistake-item"
          >
            <div class="mistake-word-cell">
              <span class="mistake-word-en">{{ mistake.word }}</span>
              <span class="mistake-word-zh">{{ mistake.translation }}</span>
            </div>
            <span class="mistake-count">×{{ mistake.count }}</span>
          </div>
        </div>
      </Accordion>
    </div>
    </div> <!-- end student-practice-view -->
  </div> <!-- end student-practice-view-wrapper -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StudentNicknameEntry from '@/components/practice/StudentNicknameEntry.vue'
import AllQuestionsView from '@/components/practice/AllQuestionsView.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Accordion from '@/components/ui/Accordion.vue'
import { useStudentSession } from '@/composables/useStudentSession'
import { usePracticeQuestions } from '@/composables/usePracticeQuestions'
import { useToast } from '@/composables/useToast'
import type { WordPair } from '@/composables/useStudentSession'

const route = useRoute()
const { showToast } = useToast()

// Get share token from route
const shareToken = computed(() => route.params.shareToken as string)

// Get optional student ID from query parameter
const studentId = computed(() => route.query.student as string | undefined)

// Student session composable
const {
  nickname: studentNickname,
  isLoading: isLoadingSession,
  error: sessionError,
  registerSession,
  hasActiveSession,
} = useStudentSession()

// Practice questions composable
const {
  questions,
  isLoading: isLoadingQuestions,
  loadQuestions
} = usePracticeQuestions()

// Local state
const showNicknameModal = ref(false)
const wordlist = ref<{ id: string; title: string; words: WordPair[] } | null>(null)
const personalMistakes = ref<Array<{ word: string; translation: string; count: number }>>([])
const practiceCompleted = ref(false)
const completionScore = ref(0)
const completionCorrectCount = ref(0)
const completionTotalCount = ref(0)

// Computed: all questions in a flat array
const allQuestions = computed(() => {
  if (!questions.value) return []
  return [
    ...questions.value.matching,
    ...questions.value.fillBlank,
    ...questions.value.multipleChoice
  ]
})

/**
 * Handle nickname submission
 */
async function handleNicknameSubmit(nickname: string) {
  try {
    const response = await registerSession(shareToken.value, nickname)

    if (response.success && response.wordlist) {
      wordlist.value = response.wordlist
      
      // Load practice questions
      await loadQuestions(response.wordlist.id)
      
      showNicknameModal.value = false
      
      // Store wordlist ID for practice HTML files to access
      if (response.wordlist.id) {
        localStorage.setItem('current_practice_wordlist_id', response.wordlist.id)
      }
      
      showToast(`Welcome, ${nickname}! Let's start practicing.`, 'success', 3000)
    } else {
      const errorMessage = response.error?.message || 'Failed to register session'
      handleNicknameError(errorMessage)
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred'
    handleNicknameError(errorMessage)
  }
}

/**
 * Handle practice complete
 */
function handlePracticeComplete(score: number, correct: number, total: number) {
  practiceCompleted.value = true
  completionScore.value = score
  completionCorrectCount.value = correct
  completionTotalCount.value = total
}

/**
 * Handle nickname entry error
 */
function handleNicknameError(error: string) {
  showToast(error, 'error', 5000)
}

/**
 * Retry session registration
 */
function retrySession() {
  showNicknameModal.value = true
}

/**
 * Initialize practice view
 */
async function initializePracticeView() {
  // Always show nickname modal
  // This ensures students enter their name each time they visit
  showNicknameModal.value = true
}

// Initialize on mount
onMounted(() => {
  if (!shareToken.value) {
    showToast('Invalid share link. Please check the URL.', 'error', 5000)
    return
  }

  initializePracticeView()
})

// Expose state and methods for testing
defineExpose({
  wordlist,
  totalQuestions: computed(() => allQuestions.value.length),
  answeredCount: computed(() => 0), // This would need to be tracked if needed
  progressPercentage: computed(() => 0), // This would need to be calculated if needed
  personalMistakes,
  handleNicknameSubmit,
  showNicknameModal,
})
</script>

<style scoped>
.student-practice-view-wrapper {
  @apply min-h-screen bg-white;
  /* Ensure fullscreen without any navigation offsets */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1000;
}

.student-practice-view {
  @apply min-h-screen bg-gray-50;
}

/* Loading & Error States */
.loading-container,
.error-container {
  @apply flex flex-col items-center justify-center min-h-screen px-4;
}

.loading-spinner {
  @apply mb-4;
}

.loading-text {
  @apply text-gray-600 text-lg;
}

.error-icon {
  @apply text-6xl mb-4;
}

.error-text {
  @apply text-red-600 text-lg mb-4 text-center;
}

/* Practice Container */
.practice-container {
  @apply max-w-4xl mx-auto px-4 py-6 space-y-6;
}

/* Header */
.practice-header {
  @apply bg-white rounded-2xl shadow-sm p-6;
  @apply border border-gray-100;
}

.student-info {
  @apply flex flex-col gap-2 mb-4;
}

.greeting {
  @apply text-2xl font-semibold;
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.wordlist-title {
  @apply text-base text-gray-600;
}

.progress-indicator {
  @apply flex flex-col gap-2;
}

.progress-text {
  @apply text-sm font-medium text-gray-700;
}

.progress-bar {
  @apply w-full h-2 bg-gray-100 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-500;
  background: linear-gradient(90deg, #a855f7 0%, #ec4899 100%);
}

/* Practice Content */
.practice-content {
  @apply space-y-4;
}

.practice-card {
  @apply min-h-[400px];
}

.practice-placeholder {
  @apply flex flex-col items-center justify-center text-center py-12 px-6;
}

/* Completion Card */
.completion-card {
  @apply bg-white rounded-2xl shadow-sm p-8;
  @apply border border-gray-100;
}

.completion-content {
  @apply flex flex-col items-center text-center;
}

.completion-icon {
  @apply text-6xl mb-4;
}

.completion-title {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.completion-text {
  @apply text-lg text-gray-600 mb-6;
}

.completion-score {
  @apply mt-4;
}

.score-circle {
  @apply w-32 h-32 rounded-full flex items-center justify-center;
  @apply border-4 border-purple-500;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
}

.score-percentage {
  @apply text-3xl font-bold;
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.placeholder-icon {
  @apply mb-4;
}

.placeholder-title {
  @apply text-2xl font-semibold text-gray-900 mb-2;
}

.placeholder-text {
  @apply text-gray-600 mb-8 max-w-md;
}

.wordlist-preview {
  @apply w-full max-w-2xl;
}

.preview-title {
  @apply text-lg font-medium text-gray-900 mb-4;
}

.word-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
}

.word-item {
  @apply flex items-center justify-between p-3 bg-gray-50 rounded-lg;
  @apply border border-gray-100;
}

.word-en {
  @apply text-sm font-medium text-gray-900;
}

.word-zh {
  @apply text-sm text-gray-600;
}

.word-item-more {
  @apply flex items-center justify-center p-3 bg-purple-50 rounded-lg;
  @apply border border-purple-100 text-purple-700 font-medium text-sm;
}

/* Personal Stats */
.personal-stats {
  @apply bg-white rounded-2xl shadow-sm;
  @apply border border-gray-100;
}

.stats-header {
  @apply flex items-center justify-between w-full;
}

.stats-title {
  @apply text-base font-medium text-gray-900;
}

.stats-badge {
  @apply px-3 py-1 rounded-full;
  @apply bg-purple-100 text-purple-700;
  @apply text-xs font-medium;
}

.mistake-list {
  @apply space-y-2 mt-4;
}

.mistake-item {
  @apply flex items-center justify-between p-3 bg-gray-50 rounded-lg;
  @apply border border-gray-100;
  @apply transition-all duration-200;
}

.mistake-item:hover {
  @apply bg-gray-100 border-gray-200;
}

.mistake-word-cell {
  @apply flex flex-col gap-1;
}

.mistake-word-en {
  @apply text-sm font-medium text-gray-900;
}

.mistake-word-zh {
  @apply text-xs text-gray-600;
}

.mistake-count {
  @apply px-3 py-1 rounded-full;
  @apply bg-red-100 text-red-700;
  @apply text-xs font-bold;
}

/* Responsive */
@media (max-width: 640px) {
  .practice-container {
    @apply px-3 py-4;
  }

  .practice-header {
    @apply p-4;
  }

  .greeting {
    @apply text-xl;
  }

  .placeholder-title {
    @apply text-xl;
  }

  .word-grid {
    @apply grid-cols-1;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.practice-container > * {
  animation: fadeIn 0.3s ease-out;
}

.practice-container > *:nth-child(1) {
  animation-delay: 0.05s;
}

.practice-container > *:nth-child(2) {
  animation-delay: 0.1s;
}

.practice-container > *:nth-child(3) {
  animation-delay: 0.15s;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    @apply transition-none;
  }

  .mistake-item {
    @apply transition-none;
  }

  .practice-container > * {
    animation: none;
  }
}
</style>
