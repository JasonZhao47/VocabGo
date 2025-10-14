<template>
  <div class="results-view">
    <!-- Header with Score -->
    <div class="results-header">
      <div class="score-circle" :class="scoreColorClass">
        <div class="score-content">
          <div class="score-value">{{ Math.round(results.score) }}%</div>
          <div class="score-label">Score</div>
        </div>
      </div>
      
      <h2 class="results-title">Practice Complete!</h2>
      <p class="results-subtitle">
        You answered {{ results.correctAnswers }} out of {{ results.totalQuestions }} questions correctly
      </p>
    </div>

    <!-- Summary Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ results.correctAnswers }}</div>
          <div class="stat-label">Correct</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-error">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ results.totalQuestions - results.correctAnswers }}</div>
          <div class="stat-label">Incorrect</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-time">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formattedDuration }}</div>
          <div class="stat-label">Time</div>
        </div>
      </div>
    </div>

    <!-- Breakdown by Question Type -->
    <div v-if="hasBreakdown" class="breakdown-section">
      <h3 class="section-title">Performance by Question Type</h3>
      
      <div class="breakdown-cards">
        <!-- Matching -->
        <div v-if="results.breakdown.matching" class="breakdown-card">
          <div class="breakdown-header">
            <div class="breakdown-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 class="breakdown-title">Matching</h4>
          </div>
          <div class="breakdown-stats">
            <div class="breakdown-score">{{ Math.round(results.breakdown.matching.score) }}%</div>
            <div class="breakdown-detail">
              {{ results.breakdown.matching.correct }} / {{ results.breakdown.matching.total }} correct
            </div>
          </div>
          <div class="breakdown-bar">
            <div 
              class="breakdown-bar-fill"
              :style="{ width: results.breakdown.matching.score + '%' }"
            ></div>
          </div>
        </div>

        <!-- Fill in the Blank -->
        <div v-if="results.breakdown.fillBlank" class="breakdown-card">
          <div class="breakdown-header">
            <div class="breakdown-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h4 class="breakdown-title">Fill in the Blank</h4>
          </div>
          <div class="breakdown-stats">
            <div class="breakdown-score">{{ Math.round(results.breakdown.fillBlank.score) }}%</div>
            <div class="breakdown-detail">
              {{ results.breakdown.fillBlank.correct }} / {{ results.breakdown.fillBlank.total }} correct
            </div>
          </div>
          <div class="breakdown-bar">
            <div 
              class="breakdown-bar-fill"
              :style="{ width: results.breakdown.fillBlank.score + '%' }"
            ></div>
          </div>
        </div>

        <!-- Multiple Choice -->
        <div v-if="results.breakdown.multipleChoice" class="breakdown-card">
          <div class="breakdown-header">
            <div class="breakdown-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h4 class="breakdown-title">Multiple Choice</h4>
          </div>
          <div class="breakdown-stats">
            <div class="breakdown-score">{{ Math.round(results.breakdown.multipleChoice.score) }}%</div>
            <div class="breakdown-detail">
              {{ results.breakdown.multipleChoice.correct }} / {{ results.breakdown.multipleChoice.total }} correct
            </div>
          </div>
          <div class="breakdown-bar">
            <div 
              class="breakdown-bar-fill"
              :style="{ width: results.breakdown.multipleChoice.score + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Incorrect Answers -->
    <div v-if="incorrectAnswers.length > 0" class="review-section">
      <h3 class="section-title">Review Incorrect Answers</h3>
      
      <div class="review-cards">
        <div
          v-for="(item, index) in incorrectAnswers"
          :key="item.question.id"
          class="review-card"
        >
          <div class="review-header">
            <span class="review-number">Question {{ item.questionNumber }}</span>
            <span class="review-type">{{ formatQuestionType(item.question.type) }}</span>
          </div>
          
          <div class="review-content">
            <!-- Matching Question Review -->
            <template v-if="item.question.type === 'matching'">
              <p class="review-instruction">Match English words with Mandarin translations</p>
              <div class="review-pairs">
                <div
                  v-for="(pair, pairIndex) in item.question.pairs"
                  :key="pairIndex"
                  class="review-pair"
                >
                  <span class="review-english">{{ pair.english }}</span>
                  <span class="review-arrow">→</span>
                  <span class="review-mandarin">{{ pair.mandarin }}</span>
                </div>
              </div>
            </template>

            <!-- Fill Blank Question Review -->
            <template v-else-if="item.question.type === 'fill-blank'">
              <p class="review-sentence">{{ item.question.sentence }}</p>
              <div class="review-answer-section">
                <div class="review-answer-item">
                  <span class="review-answer-label">Your answer:</span>
                  <span class="review-answer-value review-answer-wrong">
                    {{ item.userAnswer || '(No answer)' }}
                  </span>
                </div>
                <div class="review-answer-item">
                  <span class="review-answer-label">Correct answer:</span>
                  <span class="review-answer-value review-answer-correct">
                    {{ item.question.correctAnswer }}
                  </span>
                </div>
              </div>
            </template>

            <!-- Multiple Choice Question Review -->
            <template v-else-if="item.question.type === 'multiple-choice'">
              <p class="review-sentence">{{ item.question.sentence }}</p>
              <div class="review-options">
                <div
                  v-for="(option, optionIndex) in item.question.options"
                  :key="optionIndex"
                  class="review-option"
                  :class="{
                    'review-option-correct': option.isCorrect,
                    'review-option-wrong': option.text === item.userAnswer && !option.isCorrect,
                  }"
                >
                  <span class="review-option-text">{{ option.text }}</span>
                  <span v-if="option.isCorrect" class="review-option-badge">Correct</span>
                  <span v-else-if="option.text === item.userAnswer" class="review-option-badge">Your answer</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="results-actions">
      <button @click="$emit('retry')" class="btn-action btn-secondary">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Retry Questions</span>
      </button>
      
      <button @click="$emit('new')" class="btn-action btn-primary">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Generate New Questions</span>
      </button>

      <button @click="downloadHtml" class="btn-action btn-secondary" :disabled="isDownloading" data-testid="download-button">
        <svg v-if="!isDownloading" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <svg v-else width="20" height="20" class="animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isDownloading ? 'Generating...' : 'Download HTML' }}</span>
      </button>

      <button @click="showShareModal = true" class="btn-action btn-secondary">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>Share Practice Set</span>
      </button>
      
      <button @click="$emit('close')" class="btn-action btn-ghost">
        <span>Back to Wordlists</span>
      </button>
    </div>

    <!-- Share Modal -->
    <ShareModal
      v-model="showShareModal"
      :practice-set-id="practiceSetId"
      :questions="questions"
      :wordlist-name="wordlistName"
      :existing-share-url="existingShareUrl"
      @share-created="handleShareCreated"
      @share-deleted="handleShareDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SessionResults } from '@/types/practice'
import type { Question, FillBlankAnswer, MultipleChoiceAnswer } from '@/types/practice'
import ShareModal from './ShareModal.vue'
import { PracticeHtmlGenerator } from '@/services/practiceHtmlGenerator'
import { useToast } from '@/composables/useToast'

// Props
interface Props {
  results: SessionResults
  questions: Question[]
  userAnswers: Map<string, any>
  practiceSetId: string
  wordlistName: string
  existingShareUrl?: string | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'retry'): void
  (e: 'new'): void
  (e: 'close'): void
  (e: 'share-created', shareUrl: string): void
  (e: 'share-deleted'): void
}

const emit = defineEmits<Emits>()

// State
const showShareModal = ref(false)
const isDownloading = ref(false)

// Composables
const { showToast } = useToast()

// Computed
const scoreColorClass = computed(() => {
  const score = props.results.score
  if (score >= 90) return 'score-excellent'
  if (score >= 70) return 'score-good'
  if (score >= 50) return 'score-fair'
  return 'score-poor'
})

const formattedDuration = computed(() => {
  const seconds = props.results.duration
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes === 0) {
    return `${seconds}s`
  }
  return `${minutes}m ${remainingSeconds}s`
})

const hasBreakdown = computed(() => {
  return Object.keys(props.results.breakdown).length > 0
})

const incorrectAnswers = computed(() => {
  const incorrect: Array<{
    question: Question
    questionNumber: number
    userAnswer: string | null
  }> = []

  props.questions.forEach((question, index) => {
    const userAnswer = props.userAnswers.get(question.id)
    let isCorrect = false

    if (question.type === 'fill-blank') {
      const answer = userAnswer as FillBlankAnswer | undefined
      isCorrect = answer?.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()
    } else if (question.type === 'multiple-choice') {
      const answer = userAnswer as MultipleChoiceAnswer | undefined
      const correctOption = question.options.find(opt => opt.isCorrect)
      isCorrect = answer?.selectedOption === correctOption?.text
    } else if (question.type === 'matching') {
      // For matching, check if all pairs are correct
      const answer = userAnswer as any
      if (answer?.pairs) {
        isCorrect = answer.pairs.every((pair: any) => {
          const correctPair = question.pairs.find(p => p.english === pair.english)
          return correctPair?.mandarin === pair.selectedMandarin
        })
      }
    }

    if (!isCorrect) {
      incorrect.push({
        question,
        questionNumber: index + 1,
        userAnswer: getUserAnswerText(question, userAnswer),
      })
    }
  })

  return incorrect
})

// Methods
function formatQuestionType(type: string): string {
  const types: Record<string, string> = {
    'matching': 'Matching',
    'fill-blank': 'Fill in the Blank',
    'multiple-choice': 'Multiple Choice',
  }
  return types[type] || type
}

function getUserAnswerText(question: Question, answer: any): string | null {
  if (!answer) return null

  if (question.type === 'fill-blank') {
    return answer.userAnswer
  } else if (question.type === 'multiple-choice') {
    return answer.selectedOption
  }
  
  return null
}

function handleShareCreated(shareUrl: string) {
  emit('share-created', shareUrl)
}

function handleShareDeleted() {
  emit('share-deleted')
}

async function downloadHtml() {
  if (isDownloading.value) return
  
  try {
    isDownloading.value = true
    
    // Generate HTML using the practice HTML generator
    const htmlGenerator = new PracticeHtmlGenerator()
    const result = htmlGenerator.generateHtml({
      wordlistName: props.wordlistName,
      questions: props.questions,
      timestamp: new Date()
    })
    
    // Create blob and download
    const blob = new Blob([result.html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    // Create temporary download link
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = result.filename
    downloadLink.style.display = 'none'
    
    // Trigger download
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    
    // Clean up object URL
    URL.revokeObjectURL(url)
    
    // Show success message
    showToast(`Practice questions saved as ${result.filename}`, 'success', 4000)
    
  } catch (error) {
    console.error('Failed to download HTML:', error)
    showToast('Unable to generate HTML file. Please try again.', 'error', 5000)
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
.results-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 16px;
}

/* Header */
.results-header {
  text-align: center;
  margin-bottom: 48px;
}

.score-circle {
  width: 160px;
  height: 160px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 8px solid;
  transition: all 300ms ease-out;
}

.score-circle.score-excellent {
  border-color: #10b981;
  background: #ecfdf5;
}

.score-circle.score-good {
  border-color: #3b82f6;
  background: #eff6ff;
}

.score-circle.score-fair {
  border-color: #f59e0b;
  background: #fffbeb;
}

.score-circle.score-poor {
  border-color: #ef4444;
  background: #fef2f2;
}

.score-content {
  text-align: center;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  color: #000000;
  line-height: 1;
  margin-bottom: 4px;
}

.score-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.results-title {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
}

.results-subtitle {
  font-size: 16px;
  color: #6b7280;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #ecfdf5;
  border-radius: 10px;
  color: #10b981;
}

.stat-icon-error {
  background: #fef2f2;
  color: #ef4444;
}

.stat-icon-time {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* Section Title */
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 20px;
}

/* Breakdown Section */
.breakdown-section {
  margin-bottom: 48px;
}

.breakdown-cards {
  display: grid;
  gap: 16px;
}

.breakdown-card {
  padding: 20px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
}

.breakdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.breakdown-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border-radius: 8px;
  color: #374151;
}

.breakdown-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.breakdown-stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.breakdown-score {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
}

.breakdown-detail {
  font-size: 14px;
  color: #6b7280;
}

.breakdown-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.breakdown-bar-fill {
  height: 100%;
  background: #000000;
  border-radius: 4px;
  transition: width 500ms ease-out;
}

/* Review Section */
.review-section {
  margin-bottom: 48px;
}

.review-cards {
  display: grid;
  gap: 16px;
}

.review-card {
  padding: 20px;
  background: #ffffff;
  border: 2px solid #fee2e2;
  border-radius: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.review-number {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
}

.review-type {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.review-content {
  font-size: 15px;
}

.review-instruction {
  color: #6b7280;
  margin-bottom: 12px;
}

.review-sentence {
  color: #000000;
  margin-bottom: 16px;
  line-height: 1.6;
}

.review-pairs {
  display: grid;
  gap: 8px;
}

.review-pair {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.review-english {
  font-weight: 500;
  color: #000000;
}

.review-arrow {
  color: #9ca3af;
}

.review-mandarin {
  color: #374151;
}

.review-answer-section {
  display: grid;
  gap: 12px;
}

.review-answer-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-answer-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.review-answer-value {
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.review-answer-wrong {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.review-answer-correct {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.review-options {
  display: grid;
  gap: 8px;
}

.review-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.review-option-correct {
  background: #ecfdf5;
  border-color: #10b981;
}

.review-option-wrong {
  background: #fef2f2;
  border-color: #ef4444;
}

.review-option-text {
  color: #000000;
}

.review-option-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.review-option-correct .review-option-badge {
  background: #10b981;
  color: #ffffff;
}

.review-option-wrong .review-option-badge {
  background: #ef4444;
  color: #ffffff;
}

/* Action Buttons */
.results-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 150ms ease-out;
  cursor: pointer;
}

.btn-secondary {
  color: #374151;
  background: #ffffff;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  color: #ffffff;
  background: #000000;
  border: 2px solid #000000;
}

.btn-primary:hover {
  background: #1f2937;
}

.btn-ghost {
  color: #6b7280;
  background: transparent;
  border: 2px solid transparent;
}

.btn-ghost:hover {
  color: #374151;
  background: #f9fafb;
}

/* Loading Animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Disabled Button State */
.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-action:disabled:hover {
  background: inherit;
  border-color: inherit;
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 640px) {
  .results-view {
    padding: 24px 12px;
  }

  .results-title {
    font-size: 24px;
  }

  .score-circle {
    width: 120px;
    height: 120px;
    border-width: 6px;
  }

  .score-value {
    font-size: 36px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
