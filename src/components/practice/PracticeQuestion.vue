<template>
  <div class="practice-question">
    <!-- Multiple Choice -->
    <div v-if="question.type === 'multiple-choice'" class="question-card">
      <h3 class="question-title" v-html="question.sentence"></h3>
      <div class="options-grid">
        <button
          v-for="(option, index) in question.options"
          :key="index"
          :class="['option-button', getOptionClass(option.text)]"
          :disabled="answered"
          @click="handleMultipleChoiceAnswer(option.text, option.isCorrect)"
        >
          {{ option.text }}
        </button>
      </div>
      <div v-if="answered" class="feedback">
        {{ isCorrect ? '✓ Correct!' : '✗ Incorrect' }}
      </div>
    </div>

    <!-- Fill in the Blank -->
    <div v-else-if="question.type === 'fill-blank'" class="question-card">
      <h3 class="question-title">Fill in the blank:</h3>
      <p class="sentence">{{ question.sentence }}</p>
      <input
        v-model="userAnswer"
        type="text"
        class="answer-input"
        :disabled="answered"
        placeholder="Type your answer..."
        @keyup.enter="handleFillBlankAnswer"
      />
      <button
        v-if="!answered"
        class="submit-button"
        @click="handleFillBlankAnswer"
      >
        Submit
      </button>
      <div v-if="answered" class="feedback">
        {{ isCorrect ? '✓ Correct!' : `✗ Incorrect. Answer: ${question.correctAnswer}` }}
      </div>
    </div>

    <!-- Matching -->
    <div v-else-if="question.type === 'matching'" class="question-card">
      <h3 class="question-title">Match the words:</h3>
      <div class="matching-grid">
        <div
          v-for="(pair, index) in question.pairs"
          :key="index"
          class="matching-pair"
        >
          <div class="english-word">{{ pair.english }}</div>
          <div class="chinese-word">{{ pair.mandarin }}</div>
        </div>
      </div>
      <button
        v-if="!answered"
        class="submit-button"
        @click="handleMatchingComplete"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PracticeQuestion } from '@/types/practice'
import { recordPracticeMistake } from '@/services/practiceQuestionService'

const props = defineProps<{
  question: PracticeQuestion
  wordlistId: string
}>()

const emit = defineEmits<{
  answered: [correct: boolean]
}>()

const answered = ref(false)
const isCorrect = ref(false)
const userAnswer = ref('')
const selectedOption = ref<string | null>(null)

function getOptionClass(option: string) {
  if (!answered.value) return ''
  if (props.question.type === 'multiple-choice') {
    const correctOption = props.question.options.find(opt => opt.isCorrect)
    if (correctOption && option === correctOption.text) return 'correct'
    if (option === selectedOption.value && !isCorrect.value) return 'incorrect'
  }
  return ''
}

async function handleMultipleChoiceAnswer(optionText: string, isCorrectOption: boolean) {
  if (answered.value) return
  
  selectedOption.value = optionText
  isCorrect.value = isCorrectOption
  answered.value = true

  if (!isCorrect.value) {
    await recordMistake()
  }

  setTimeout(() => {
    emit('answered', isCorrect.value)
  }, 1500)
}

async function handleFillBlankAnswer() {
  if (answered.value || !userAnswer.value.trim()) return

  isCorrect.value = userAnswer.value.trim().toLowerCase() === 
    (props.question as any).correctAnswer.toLowerCase()
  answered.value = true

  if (!isCorrect.value) {
    await recordMistake()
  }

  setTimeout(() => {
    emit('answered', isCorrect.value)
  }, 2000)
}

async function handleMatchingComplete() {
  if (answered.value) return
  
  answered.value = true
  isCorrect.value = true

  setTimeout(() => {
    emit('answered', true)
  }, 500)
}

async function recordMistake() {
  try {
    const { word, translation, questionType } = getWordFromQuestion()
    if (word && translation) {
      await recordPracticeMistake(props.wordlistId, word, translation, questionType)
    }
  } catch (e) {
    console.error('Failed to record mistake:', e)
  }
}

function getWordFromQuestion(): { 
  word: string | null
  translation: string | null
  questionType: 'multiple_choice' | 'fill_blank' | 'matching'
} {
  if (props.question.type === 'multiple-choice') {
    return {
      word: props.question.targetWord,
      translation: '', // We don't have translation in multiple choice
      questionType: 'multiple_choice'
    }
  } else if (props.question.type === 'fill-blank') {
    return {
      word: props.question.correctAnswer,
      translation: '', // We don't have translation in fill blank
      questionType: 'fill_blank'
    }
  } else if (props.question.type === 'matching' && props.question.pairs.length > 0) {
    return {
      word: props.question.pairs[0].english,
      translation: props.question.pairs[0].mandarin,
      questionType: 'matching'
    }
  }
  return { word: null, translation: null, questionType: 'multiple_choice' }
}
</script>

<style scoped>
.practice-question {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1a1a1a;
}

.question-title :deep(strong) {
  font-weight: 700;
  color: #000000;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
}

.sentence {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
  line-height: 1.6;
}

.options-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.option-button {
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.option-button:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-button:disabled {
  cursor: not-allowed;
}

.option-button.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.option-button.incorrect {
  border-color: #ef4444;
  background: #fee2e2;
}

.answer-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;
}

.answer-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.answer-input:disabled {
  background: #f9fafb;
}

.submit-button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-button:hover {
  background: #2563eb;
}

.feedback {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}

.matching-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.matching-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.english-word,
.chinese-word {
  padding: 12px;
  background: white;
  border-radius: 6px;
  text-align: center;
  font-size: 16px;
}

.english-word {
  font-weight: 500;
  color: #1a1a1a;
}

.chinese-word {
  color: #4b5563;
}
</style>
