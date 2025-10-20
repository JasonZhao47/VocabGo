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
        <div v-if="totalQuestions > 0" class="progress-indicator">
          <span class="progress-text">{{ answeredCount }} / {{ totalQuestions }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }" />
          </div>
        </div>
      </div>

      <!-- Practice Area -->
      <div class="practice-content">
        <!-- Placeholder for practice questions -->
        <Card class="practice-card">
          <div class="practice-placeholder">
            <div class="placeholder-icon">
              <svg class="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="placeholder-title">Ready to Practice!</h3>
            <p class="placeholder-text">
              Practice questions will appear here. Your mistakes will be tracked to help your teacher create better practice materials.
            </p>
            <div class="wordlist-preview">
              <h4 class="preview-title">Words in this list:</h4>
              <div class="word-grid">
                <div v-for="(word, index) in wordlist.words.slice(0, 6)" :key="index" class="word-item">
                  <span class="word-en">{{ word.en }}</span>
                  <span class="word-zh">{{ word.zh }}</span>
                </div>
                <div v-if="wordlist.words.length > 6" class="word-item-more">
                  +{{ wordlist.words.length - 6 }} more
                </div>
              </div>
            </div>
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
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Accordion from '@/components/ui/Accordion.vue'
import { useStudentSession } from '@/composables/useStudentSession'
import { useToast } from '@/composables/useToast'
import type { WordPair } from '@/composables/useStudentSession'

const route = useRoute()
const { showToast } = useToast()

// Get share token from route
const shareToken = computed(() => route.params.shareToken as string)

// Student session composable
const {
  nickname: studentNickname,
  isLoading: isLoadingSession,
  error: sessionError,
  registerSession,
  hasActiveSession,
} = useStudentSession()

// Local state
const showNicknameModal = ref(false)
const wordlist = ref<{ id: string; title: string; words: WordPair[] } | null>(null)
const personalMistakes = ref<Array<{ word: string; translation: string; count: number }>>([])

// Practice progress (placeholder for now)
const answeredCount = ref(0)
const totalQuestions = ref(0)

// Computed properties
const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((answeredCount.value / totalQuestions.value) * 100)
})

/**
 * Handle nickname submission
 */
async function handleNicknameSubmit(nickname: string) {
  try {
    const response = await registerSession(shareToken.value, nickname)

    if (response.success && response.wordlist) {
      wordlist.value = response.wordlist
      showNicknameModal.value = false
      
      // Store wordlist ID for practice HTML files to access
      if (response.wordlist.id) {
        localStorage.setItem('current_practice_wordlist_id', response.wordlist.id)
      }
      
      showToast({
        type: 'success',
        message: `Welcome, ${nickname}! Let's start practicing.`,
        duration: 3000,
      })
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
 * Handle nickname entry error
 */
function handleNicknameError(error: string) {
  showToast({
    type: 'error',
    message: error,
    duration: 5000,
  })
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
  // Check if user already has an active session
  if (hasActiveSession()) {
    // Try to load wordlist data
    // For now, we'll show the nickname modal if no wordlist data
    showNicknameModal.value = false
    
    // In a real implementation, you would fetch the wordlist here
    // For now, we'll just show a message
    showToast({
      type: 'info',
      message: 'Welcome back! Practice questions will be available soon.',
      duration: 3000,
    })
  } else {
    // Show nickname entry modal for first-time visitors
    showNicknameModal.value = true
  }
}

// Initialize on mount
onMounted(() => {
  if (!shareToken.value) {
    showToast({
      type: 'error',
      message: 'Invalid share link. Please check the URL.',
      duration: 5000,
    })
    return
  }

  initializePracticeView()
})
</script>

<style scoped>
.student-practice-view-wrapper {
  @apply min-h-screen bg-white;
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
