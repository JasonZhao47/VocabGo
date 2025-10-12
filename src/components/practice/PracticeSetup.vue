<template>
  <div class="practice-setup">
    <!-- Header -->
    <div class="setup-header">
      <h2 class="setup-title">Practice Setup</h2>
      <p class="setup-subtitle">
        Configure your practice session for {{ wordlistName }}
      </p>
    </div>

    <!-- Question Type Selection -->
    <div class="setup-section">
      <h3 class="section-title">Question Types</h3>
      <p class="section-description">Select the types of questions you want to practice</p>
      
      <div class="question-types">
        <!-- Matching Questions -->
        <label class="question-type-card" :class="{ selected: selectedTypes.includes('matching') }">
          <input
            type="checkbox"
            value="matching"
            v-model="selectedTypes"
            class="question-type-checkbox"
          />
          <div class="question-type-content">
            <div class="question-type-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="question-type-info">
              <h4 class="question-type-name">Matching</h4>
              <p class="question-type-desc">Match English words with Mandarin translations</p>
            </div>
          </div>
        </label>

        <!-- Fill-in-the-Blank Questions -->
        <label class="question-type-card" :class="{ selected: selectedTypes.includes('fill-blank') }">
          <input
            type="checkbox"
            value="fill-blank"
            v-model="selectedTypes"
            class="question-type-checkbox"
          />
          <div class="question-type-content">
            <div class="question-type-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div class="question-type-info">
              <h4 class="question-type-name">Fill in the Blank</h4>
              <p class="question-type-desc">Complete sentences with vocabulary words</p>
            </div>
          </div>
        </label>

        <!-- Multiple Choice Questions -->
        <label class="question-type-card" :class="{ selected: selectedTypes.includes('multiple-choice') }">
          <input
            type="checkbox"
            value="multiple-choice"
            v-model="selectedTypes"
            class="question-type-checkbox"
          />
          <div class="question-type-content">
            <div class="question-type-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div class="question-type-info">
              <h4 class="question-type-name">Multiple Choice</h4>
              <p class="question-type-desc">Select correct translations from options</p>
            </div>
          </div>
        </label>
      </div>

      <!-- Error message for no selection -->
      <p v-if="showTypeError" class="error-message">
        Please select at least one question type
      </p>
    </div>

    <!-- Timer Configuration -->
    <div class="setup-section">
      <h3 class="section-title">Timer (Optional)</h3>
      <p class="section-description">Set a time limit for your practice session</p>
      
      <div class="timer-options">
        <label
          v-for="option in timerOptions"
          :key="option.value ?? 'no-timer'"
          class="timer-option"
          :class="{ selected: timerDuration === option.value }"
        >
          <input
            type="radio"
            :value="option.value"
            v-model="timerDuration"
            class="timer-radio"
          />
          <span class="timer-label">{{ option.label }}</span>
        </label>
      </div>

      <!-- Custom Timer Input -->
      <div v-if="timerDuration === 'custom'" class="custom-timer">
        <label for="custom-minutes" class="custom-timer-label">Minutes:</label>
        <input
          id="custom-minutes"
          type="number"
          v-model.number="customMinutes"
          min="1"
          max="60"
          class="custom-timer-input"
          placeholder="Enter minutes"
        />
      </div>
    </div>

    <!-- Estimated Completion Time -->
    <div class="setup-section">
      <div class="estimate-card">
        <div class="estimate-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="estimate-content">
          <p class="estimate-label">Estimated Time</p>
          <p class="estimate-value">{{ estimatedTime }} minutes</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="setup-actions">
      <button
        @click="$emit('cancel')"
        class="btn-secondary"
        :disabled="isGenerating"
      >
        Cancel
      </button>
      <button
        @click="handleGenerate"
        class="btn-primary"
        :disabled="isGenerating || selectedTypes.length === 0"
      >
        <span v-if="isGenerating" class="btn-spinner"></span>
        <span>{{ isGenerating ? 'Generating...' : 'Generate Questions' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QuestionType } from '@/types/practice'

// Props
interface Props {
  wordlistId: string
  wordlistName: string
  wordCount: number
  isGenerating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isGenerating: false,
})

// Emits
interface Emits {
  (e: 'generate', payload: { questionTypes: QuestionType[]; timerDuration?: number }): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

// State
const selectedTypes = ref<QuestionType[]>(['matching', 'fill-blank', 'multiple-choice'])
const timerDuration = ref<number | 'custom' | null>(null)
const customMinutes = ref<number>(10)
const showTypeError = ref(false)

// Timer options
const timerOptions = [
  { label: 'No Timer', value: null },
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '20 minutes', value: 20 },
  { label: 'Custom', value: 'custom' },
]

// Computed
const estimatedTime = computed(() => {
  // Estimate 30 seconds per question
  const questionsPerType = Math.min(10, props.wordCount)
  const totalQuestions = selectedTypes.value.length * questionsPerType
  const estimatedSeconds = totalQuestions * 30
  return Math.ceil(estimatedSeconds / 60)
})

const finalTimerDuration = computed(() => {
  if (timerDuration.value === 'custom') {
    return customMinutes.value
  }
  return timerDuration.value ?? undefined
})

// Methods
function handleGenerate() {
  if (selectedTypes.value.length === 0) {
    showTypeError.value = true
    return
  }

  showTypeError.value = false
  emit('generate', {
    questionTypes: selectedTypes.value,
    timerDuration: finalTimerDuration.value,
  })
}
</script>

<style scoped>
.practice-setup {
  max-width: 640px;
  margin: 0 auto;
}

/* Header */
.setup-header {
  margin-bottom: 32px;
  text-align: center;
}

.setup-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
}

.setup-subtitle {
  font-size: 15px;
  color: #6b7280;
}

/* Section */
.setup-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
}

.section-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

/* Question Types */
.question-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-type-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.question-type-card:hover {
  border-color: #9ca3af;
}

.question-type-card.selected {
  border-color: #000000;
  background: #f9fafb;
}

.question-type-checkbox {
  margin-right: 16px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.question-type-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.question-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-right: 12px;
  color: #374151;
}

.question-type-card.selected .question-type-icon {
  background: #000000;
  color: #ffffff;
}

.question-type-info {
  flex: 1;
}

.question-type-name {
  font-size: 15px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 2px;
}

.question-type-desc {
  font-size: 13px;
  color: #6b7280;
}

/* Timer Options */
.timer-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.timer-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.timer-option:hover {
  border-color: #9ca3af;
}

.timer-option.selected {
  border-color: #000000;
  background: #f9fafb;
}

.timer-radio {
  display: none;
}

.timer-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.timer-option.selected .timer-label {
  color: #000000;
  font-weight: 600;
}

/* Custom Timer */
.custom-timer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.custom-timer-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.custom-timer-input {
  flex: 1;
  max-width: 200px;
  height: 44px;
  padding: 0 16px;
  font-size: 14px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 150ms ease-out;
}

.custom-timer-input:focus {
  outline: none;
  border-color: #000000;
}

/* Estimate Card */
.estimate-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.estimate-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 8px;
  margin-right: 12px;
  color: #374151;
}

.estimate-content {
  flex: 1;
}

.estimate-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 2px;
}

.estimate-value {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
}

/* Error Message */
.error-message {
  margin-top: 8px;
  font-size: 13px;
  color: #dc2626;
}

/* Action Buttons */
.setup-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 150ms ease-out;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  color: #374151;
  background: #ffffff;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  color: #ffffff;
  background: #000000;
  border: 2px solid #000000;
}

.btn-primary:hover:not(:disabled) {
  background: #1f2937;
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .question-type-card,
  .timer-option {
    min-height: 48px;
    padding: 16px;
  }

  .question-type-card:active {
    transform: scale(0.98);
  }

  .timer-option:active {
    transform: scale(0.98);
  }

  .btn-primary,
  .btn-secondary {
    min-height: 48px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  /* Disable hover effects on touch */
  .question-type-card:hover {
    border-color: #e5e7eb;
    background: #ffffff;
  }

  .question-type-card.selected:hover {
    border-color: #000000;
    background: #f9fafb;
  }

  .timer-option:hover {
    background: #ffffff;
  }

  .timer-option.selected:hover {
    background: #f9fafb;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .setup-title {
    font-size: 20px;
  }

  .question-types {
    gap: 12px;
  }

  .question-type-card {
    padding: 14px;
  }

  .question-type-name {
    font-size: 15px;
  }

  .question-type-desc {
    font-size: 13px;
  }

  .timer-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .timer-option {
    padding: 12px;
  }

  .setup-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .practice-setup {
    padding: 16px;
  }

  .setup-header {
    margin-bottom: 20px;
  }

  .setup-section {
    margin-bottom: 24px;
  }

  .timer-options {
    grid-template-columns: 1fr;
  }
}
</style>
