<template>
  <div class="practice-session">
    <!-- Header with Timer and Progress -->
    <div class="session-header">
      <div class="header-content">
        <!-- Progress Indicator -->
        <div class="progress-info">
          <h2 class="session-title">Practice Session</h2>
          <p class="progress-text">
            Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
          </p>
        </div>

        <!-- Timer Display -->
        <div v-if="timerDuration" class="timer-display" :class="timerColorClass">
          <svg class="timer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="timer-text">{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- Question Area -->
    <div class="question-area" ref="questionContainer">
      <!-- Swipe hint for mobile -->
      <div v-if="isTouch && currentQuestionIndex === 0" class="swipe-hint">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        <span>Swipe to navigate</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
      
      <Transition name="question-fade" mode="out-in">
        <div :key="currentQuestion.id" class="question-container">
          <!-- Matching Question -->
          <MatchingQuestion
            v-if="currentQuestion.type === 'matching'"
            :question="currentQuestion as MatchingQuestionType"
            :answer="currentAnswer as MatchingAnswer | undefined"
            @answer="handleAnswer"
          />

          <!-- Fill-in-the-Blank Question -->
          <FillBlankQuestion
            v-else-if="currentQuestion.type === 'fill-blank'"
            :question="currentQuestion as FillBlankQuestionType"
            :answer="currentAnswer as FillBlankAnswer | undefined"
            @answer="handleAnswer"
          />

          <!-- Multiple Choice Question -->
          <MultipleChoiceQuestion
            v-else-if="currentQuestion.type === 'multiple-choice'"
            :question="currentQuestion as MultipleChoiceQuestionType"
            :answer="currentAnswer as MultipleChoiceAnswer | undefined"
            @answer="handleAnswer"
          />
        </div>
      </Transition>
    </div>

    <!-- Navigation Controls -->
    <div class="session-controls">
      <div class="control-buttons">
        <!-- Previous Button -->
        <button
          @click="goToPrevious"
          :disabled="currentQuestionIndex === 0"
          class="btn-control btn-secondary"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <!-- Pause/Resume Button -->
        <button
          v-if="timerDuration"
          @click="togglePause"
          class="btn-control btn-ghost"
        >
          <svg v-if="isPaused" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ isPaused ? 'Resume' : 'Pause' }}</span>
        </button>

        <!-- Next/Submit Button -->
        <button
          @click="goToNext"
          class="btn-control btn-primary"
        >
          <span>{{ isLastQuestion ? 'Submit' : 'Next' }}</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Question Navigation Dots -->
      <div class="question-dots">
        <button
          v-for="(_, index) in allQuestions"
          :key="index"
          @click="goToQuestion(index)"
          class="question-dot"
          :class="{
            active: index === currentQuestionIndex,
            answered: hasAnswer(index),
          }"
          :aria-label="`Go to question ${index + 1}`"
        ></button>
      </div>
    </div>

    <!-- Pause Overlay -->
    <Transition name="fade">
      <div v-if="isPaused" class="pause-overlay" @click.self="togglePause">
        <div class="pause-card">
          <div class="pause-icon">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="pause-title">Session Paused</h3>
          <p class="pause-text">Your progress has been saved</p>
          <button @click="togglePause" class="btn-resume">
            Resume Practice
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Question, Answer, MatchingQuestion as MatchingQuestionType, FillBlankQuestion as FillBlankQuestionType, MultipleChoiceQuestion as MultipleChoiceQuestionType, MatchingAnswer, FillBlankAnswer, MultipleChoiceAnswer } from '@/types/practice'
import MatchingQuestion from './MatchingQuestion.vue'
import FillBlankQuestion from './FillBlankQuestion.vue'
import MultipleChoiceQuestion from './MultipleChoiceQuestion.vue'
import { useSwipeGesture, isTouchDevice } from '@/composables/useSwipeGesture'

// Props
interface Props {
  questions: Question[]
  currentQuestionIndex: number
  answers: Map<string, Answer>
  timeRemaining?: number
  timerDuration?: number
  isPaused: boolean
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'answer', payload: { questionId: string; answer: Answer }): void
  (e: 'navigate', index: number): void
  (e: 'submit'): void
  (e: 'togglePause'): void
}

const emit = defineEmits<Emits>()

// Refs
const questionContainer = ref<HTMLElement | null>(null)

// Computed
const allQuestions = computed(() => props.questions)
const isTouch = computed(() => isTouchDevice())
const totalQuestions = computed(() => props.questions.length)
const currentQuestion = computed(() => props.questions[props.currentQuestionIndex])
const isLastQuestion = computed(() => props.currentQuestionIndex === totalQuestions.value - 1)

const currentAnswer = computed(() => {
  return props.answers.get(currentQuestion.value.id)
})

const progressPercentage = computed(() => {
  return ((props.currentQuestionIndex + 1) / totalQuestions.value) * 100
})

const formattedTime = computed(() => {
  if (!props.timeRemaining) return '0:00'
  
  const minutes = Math.floor(props.timeRemaining / 60)
  const seconds = props.timeRemaining % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const timerColorClass = computed(() => {
  if (!props.timeRemaining || !props.timerDuration) return ''
  
  const totalSeconds = props.timerDuration * 60
  const percentage = (props.timeRemaining / totalSeconds) * 100
  
  if (percentage <= 10) return 'timer-critical'
  if (percentage <= 25) return 'timer-warning'
  return 'timer-normal'
})

// Methods
function handleAnswer(answer: Answer) {
  emit('answer', {
    questionId: currentQuestion.value.id,
    answer,
  })
}

function goToPrevious() {
  if (props.currentQuestionIndex > 0) {
    emit('navigate', props.currentQuestionIndex - 1)
  }
}

function goToNext() {
  if (isLastQuestion.value) {
    emit('submit')
  } else {
    emit('navigate', props.currentQuestionIndex + 1)
  }
}

function goToQuestion(index: number) {
  emit('navigate', index)
}

function togglePause() {
  emit('togglePause')
}

function hasAnswer(index: number): boolean {
  const question = props.questions[index]
  return props.answers.has(question.id)
}

// Swipe gesture support for mobile
useSwipeGesture(questionContainer, {
  threshold: 75,
  onSwipeLeft: () => {
    if (isTouch.value && !props.isPaused) {
      goToNext()
    }
  },
  onSwipeRight: () => {
    if (isTouch.value && !props.isPaused) {
      goToPrevious()
    }
  },
})
</script>

<style scoped>
.practice-session {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.session-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.progress-info {
  flex: 1;
}

.session-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
}

.progress-text {
  font-size: 14px;
  color: #6b7280;
}

/* Timer */
.timer-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 200ms ease-out;
}

.timer-display.timer-normal {
  border-color: #10b981;
  background: #ecfdf5;
}

.timer-display.timer-warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.timer-display.timer-critical {
  border-color: #ef4444;
  background: #fef2f2;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.timer-icon {
  width: 20px;
  height: 20px;
  color: currentColor;
}

.timer-text {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  min-width: 60px;
  text-align: center;
}

/* Progress Bar */
.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #000000;
  transition: width 300ms ease-out;
  border-radius: 4px;
}

/* Question Area */
.question-area {
  flex: 1;
  margin-bottom: 32px;
}

.question-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px;
  min-height: 400px;
}

/* Question Transitions */
.question-fade-enter-active,
.question-fade-leave-active {
  transition: all 200ms ease-out;
}

.question-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.question-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Session Controls */
.session-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
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

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-ghost {
  color: #374151;
  background: transparent;
  border: 2px solid transparent;
}

.btn-ghost:hover {
  background: #f9fafb;
}

.btn-primary {
  color: #ffffff;
  background: #000000;
  border: 2px solid #000000;
}

.btn-primary:hover {
  background: #1f2937;
}

/* Question Dots */
.question-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.question-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e5e7eb;
  border: none;
  cursor: pointer;
  transition: all 150ms ease-out;
  padding: 0;
}

.question-dot:hover {
  background: #9ca3af;
  transform: scale(1.2);
}

.question-dot.answered {
  background: #10b981;
}

.question-dot.active {
  background: #000000;
  transform: scale(1.4);
}

/* Pause Overlay */
.pause-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.pause-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 48px 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.pause-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: #f3f4f6;
  border-radius: 50%;
  color: #374151;
}

.pause-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
}

.pause-text {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 32px;
}

.btn-resume {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: #000000;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 150ms ease-out;
}

.btn-resume:hover {
  background: #1f2937;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Swipe Hint */
.swipe-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 16px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0;
  }
  10%, 90% {
    opacity: 1;
  }
}

/* Touch optimizations */
@media (hover: none) and (pointer: coarse) {
  /* Increase touch target sizes */
  .btn-control {
    min-height: 48px;
    padding: 0 28px;
  }

  .question-dot {
    width: 12px;
    height: 12px;
  }

  /* Improve tap feedback */
  .btn-control:active {
    transform: scale(0.98);
  }

  .question-dot:active {
    transform: scale(1.5);
  }

  /* Disable hover effects on touch devices */
  .btn-control:hover {
    background: inherit;
    border-color: inherit;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #ffffff;
    border-color: #e5e7eb;
  }

  .btn-primary:hover {
    background: #000000;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .practice-session {
    padding: 16px 12px;
  }

  .session-title {
    font-size: 18px;
  }

  .question-container {
    padding: 24px 16px;
    min-height: 300px;
  }

  .control-buttons {
    flex-wrap: wrap;
  }

  .btn-control {
    flex: 1;
    min-width: 120px;
  }

  .btn-ghost {
    flex-basis: 100%;
  }

  .timer-display {
    padding: 8px 12px;
  }

  .timer-text {
    font-size: 14px;
    min-width: 50px;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
  }

  .timer-display {
    width: 100%;
    justify-content: center;
  }

  .question-dots {
    gap: 6px;
  }

  .question-dot {
    width: 8px;
    height: 8px;
  }

  /* Optimize for small screens */
  .question-container {
    padding: 16px 12px;
    min-height: 250px;
  }

  .session-controls {
    gap: 16px;
  }

  .control-buttons {
    gap: 8px;
  }

  .btn-control {
    font-size: 14px;
    padding: 0 16px;
    height: 40px;
  }

  .btn-control svg {
    width: 16px;
    height: 16px;
  }
}

/* Landscape mobile optimization */
@media (max-width: 896px) and (orientation: landscape) {
  .practice-session {
    padding: 12px;
  }

  .session-header {
    margin-bottom: 16px;
  }

  .question-area {
    margin-bottom: 16px;
  }

  .question-container {
    min-height: 200px;
    padding: 16px;
  }

  .session-controls {
    gap: 12px;
  }
}
</style>
