<template>
  <div class="all-questions-container">
    <!-- Header -->
    <div class="practice-header">
      <h1 class="practice-title">{{ wordlistName }}</h1>
      <p class="practice-subtitle">Complete all questions below</p>
    </div>

    <!-- Questions List -->
    <div class="questions-list">
      <div
        v-for="(question, index) in transformedQuestions"
        :key="question.id"
        class="question"
      >
        <!-- Question Header -->
        <div class="question-header">
          <span class="question-number">Question {{ index + 1 }} of {{ transformedQuestions.length }}</span>
          <span class="question-type">{{ getQuestionTypeLabel(question.type) }}</span>
        </div>

        <!-- Matching Question -->
        <div v-if="question.type === 'matching'" class="matching-question">
          <p class="sentence">Match English words with their Mandarin translations</p>
          <div class="matching-pairs">
            <!-- English Column -->
            <div class="matching-column">
              <div
                v-for="pair in question.pairs"
                :key="pair.english"
                :class="[
                  'matching-item',
                  {
                    'selected': isEnglishSelected(question.id, pair.english),
                    'matched': isEnglishMatched(question.id, pair.english),
                    'incorrect': isEnglishIncorrect(question.id, pair.english)
                  }
                ]"
                @click="handleEnglishClick(question.id, pair.english, question.pairs!)"
              >
                {{ pair.english }}
              </div>
            </div>
            <!-- Mandarin Column -->
            <div class="matching-column">
              <div
                v-for="mandarin in question.shuffledMandarin"
                :key="mandarin"
                :class="[
                  'matching-item',
                  {
                    'selected': isMandarinSelected(question.id, mandarin),
                    'matched': isMandarinMatched(question.id, mandarin),
                    'incorrect': isMandarinIncorrect(question.id, mandarin)
                  }
                ]"
                @click="handleMandarinClick(question.id, mandarin, question.pairs!)"
              >
                {{ mandarin }}
              </div>
            </div>
          </div>
        </div>

        <!-- Fill-Blank Question -->
        <div v-else-if="question.type === 'fill-blank'" class="fill-blank-question">
          <p class="sentence">{{ getSentenceWithHint(question) }}</p>
          <input
            v-model="(answers[question.id] as FillBlankAnswer).textAnswer"
            type="text"
            class="fill-blank-input"
            placeholder="Type your answer..."
          />
        </div>

        <!-- Multiple-Choice Question -->
        <div v-else-if="question.type === 'multiple-choice'" class="multiple-choice-question">
          <p class="sentence" v-html="question.question"></p>
          <div class="options-list">
            <button
              v-for="(option, optIndex) in question.options"
              :key="optIndex"
              :class="[
                'option-button',
                {
                  'selected': isOptionSelected(question.id, option.text)
                }
              ]"
              @click="handleOptionClick(question.id, option.text)"
            >
              {{ option.text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div v-if="!showResults" class="submit-section">
      <button class="submit-button" @click="handleSubmit">
        Submit Answers
      </button>
    </div>

    <!-- Results Display -->
    <div v-if="showResults" class="results-container">
      <div class="results-content">
        <div class="results-icon">🎉</div>
        <h2 class="results-title">Practice Complete!</h2>
        <p class="results-text">
          You scored <strong>{{ score }}%</strong>
        </p>
        <p class="results-count">
          {{ correctCount }} out of {{ totalCount }} correct
        </p>
        <button class="try-again-button" @click="handleTryAgain">
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PracticeQuestions } from '@/types/practice'
import { transformQuestionsForView, type TransformedQuestion } from '@/utils/questionTransform'
import { useStudentSession } from '@/composables/useStudentSession'

// Props
interface Props {
  questions: PracticeQuestions
  wordlistId: string
  wordlistName: string
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'complete', score: number, correct: number, total: number): void
}

const emit = defineEmits<Emits>()

// Use student session composable for recording mistakes
const { recordMistake } = useStudentSession()

// State for answers
interface MatchingAnswer {
  matches: Array<{ english: string; mandarin: string }>
  selectedEnglish: string | null
  selectedMandarin: string | null
}

interface FillBlankAnswer {
  textAnswer: string
}

interface MultipleChoiceAnswer {
  selectedOption: string | null
}

type QuestionAnswer = MatchingAnswer | FillBlankAnswer | MultipleChoiceAnswer

const answers = ref<Record<string, QuestionAnswer>>({})

// Results state
const showResults = ref(false)
const score = ref(0)
const correctCount = ref(0)
const totalCount = ref(0)

// Transform questions for rendering
const transformedQuestions = computed<TransformedQuestion[]>(() => {
  return transformQuestionsForView(props.questions)
})

// Initialize answers for all questions
function initializeAnswers() {
  transformedQuestions.value.forEach(question => {
    if (question.type === 'matching') {
      answers.value[question.id] = {
        matches: [],
        selectedEnglish: null,
        selectedMandarin: null
      } as MatchingAnswer
    } else if (question.type === 'fill-blank') {
      answers.value[question.id] = {
        textAnswer: ''
      } as FillBlankAnswer
    } else if (question.type === 'multiple-choice') {
      answers.value[question.id] = {
        selectedOption: null
      } as MultipleChoiceAnswer
    }
  })
}

// Initialize on mount
initializeAnswers()

// Handle try again
function handleTryAgain() {
  window.location.reload()
}

// Get question type label
function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case 'matching':
      return 'Matching'
    case 'fill-blank':
      return 'Fill in the Blank'
    case 'multiple-choice':
      return 'Multiple Choice'
    default:
      return ''
  }
}

// Get sentence with hint for fill-blank questions
function getSentenceWithHint(question: TransformedQuestion): string {
  if (!question.sentence || !question.hint) {
    return question.sentence || ''
  }
  
  // Replace ___ in sentence with the hint
  return question.sentence.replace(/___/g, question.hint)
}

// Matching question state tracking
const incorrectMatches = ref<Record<string, { english: string; mandarin: string }>>({})

// Check if English item is selected
function isEnglishSelected(questionId: string, english: string): boolean {
  const answer = answers.value[questionId] as MatchingAnswer
  return answer?.selectedEnglish === english
}

// Check if English item is matched
function isEnglishMatched(questionId: string, english: string): boolean {
  const answer = answers.value[questionId] as MatchingAnswer
  return answer?.matches.some(m => m.english === english) || false
}

// Check if English item is incorrect
function isEnglishIncorrect(questionId: string, english: string): boolean {
  const key = `${questionId}-${english}`
  return incorrectMatches.value[key]?.english === english
}

// Check if Mandarin item is selected
function isMandarinSelected(questionId: string, mandarin: string): boolean {
  const answer = answers.value[questionId] as MatchingAnswer
  return answer?.selectedMandarin === mandarin
}

// Check if Mandarin item is matched
function isMandarinMatched(questionId: string, mandarin: string): boolean {
  const answer = answers.value[questionId] as MatchingAnswer
  return answer?.matches.some(m => m.mandarin === mandarin) || false
}

// Check if Mandarin item is incorrect
function isMandarinIncorrect(questionId: string, mandarin: string): boolean {
  const key = `${questionId}-${mandarin}`
  return incorrectMatches.value[key]?.mandarin === mandarin
}

// Handle English item click
function handleEnglishClick(
  questionId: string,
  english: string,
  pairs: Array<{ english: string; mandarin: string }>
) {
  const answer = answers.value[questionId] as MatchingAnswer
  
  // Don't allow clicking matched items
  if (isEnglishMatched(questionId, english)) {
    return
  }
  
  // Toggle selection
  if (answer.selectedEnglish === english) {
    answer.selectedEnglish = null
  } else {
    answer.selectedEnglish = english
    
    // If Mandarin is already selected, try to match
    if (answer.selectedMandarin) {
      validateMatch(questionId, english, answer.selectedMandarin, pairs)
    }
  }
}

// Handle Mandarin item click
function handleMandarinClick(
  questionId: string,
  mandarin: string,
  pairs: Array<{ english: string; mandarin: string }>
) {
  const answer = answers.value[questionId] as MatchingAnswer
  
  // Don't allow clicking matched items
  if (isMandarinMatched(questionId, mandarin)) {
    return
  }
  
  // Toggle selection
  if (answer.selectedMandarin === mandarin) {
    answer.selectedMandarin = null
  } else {
    answer.selectedMandarin = mandarin
    
    // If English is already selected, try to match
    if (answer.selectedEnglish) {
      validateMatch(questionId, answer.selectedEnglish, mandarin, pairs)
    }
  }
}

// Validate a match attempt
async function validateMatch(
  questionId: string,
  english: string,
  mandarin: string,
  pairs: Array<{ english: string; mandarin: string }>
) {
  const answer = answers.value[questionId] as MatchingAnswer
  
  // Check if match is correct
  const isCorrect = pairs.some(p => p.english === english && p.mandarin === mandarin)
  
  if (isCorrect) {
    // Correct match - add to matches and clear selection
    answer.matches.push({ english, mandarin })
    answer.selectedEnglish = null
    answer.selectedMandarin = null
  } else {
    // Incorrect match - show error animation and record mistake
    const englishKey = `${questionId}-${english}`
    const mandarinKey = `${questionId}-${mandarin}`
    incorrectMatches.value[englishKey] = { english, mandarin }
    incorrectMatches.value[mandarinKey] = { english, mandarin }
    
    // Record mistake (find correct translation)
    const correctPair = pairs.find(p => p.english === english)
    if (correctPair) {
      await recordMistake(props.wordlistId, english, correctPair.mandarin, 'matching')
    }
    
    // Clear incorrect state after animation
    setTimeout(() => {
      delete incorrectMatches.value[englishKey]
      delete incorrectMatches.value[mandarinKey]
      answer.selectedEnglish = null
      answer.selectedMandarin = null
    }, 300)
  }
}

// Check if option is selected
function isOptionSelected(questionId: string, optionText: string): boolean {
  const answer = answers.value[questionId] as MultipleChoiceAnswer
  return answer?.selectedOption === optionText
}

// Handle option click
function handleOptionClick(questionId: string, optionText: string) {
  const answer = answers.value[questionId] as MultipleChoiceAnswer
  answer.selectedOption = optionText
}

// Handle submit
async function handleSubmit() {
  let correct = 0
  const total = transformedQuestions.value.length

  // Calculate score for each question
  for (const question of transformedQuestions.value) {
    const answer = answers.value[question.id]

    if (question.type === 'matching') {
      const matchingAnswer = answer as MatchingAnswer
      // Correct only if all pairs are matched
      if (matchingAnswer.matches.length === question.pairs!.length) {
        correct++
      } else {
        // Record unmatched pairs as mistakes
        const unmatchedPairs = question.pairs!.filter(
          pair => !matchingAnswer.matches.some(
            m => m.english === pair.english && m.mandarin === pair.mandarin
          )
        )
        for (const pair of unmatchedPairs) {
          await recordMistake(
            props.wordlistId,
            pair.english,
            pair.mandarin,
            'matching'
          )
        }
      }
    } else if (question.type === 'fill-blank') {
      const fillBlankAnswer = answer as FillBlankAnswer
      // Case-insensitive comparison
      const isCorrect = fillBlankAnswer.textAnswer.trim().toLowerCase() === 
        question.correctAnswer!.toLowerCase()
      
      if (isCorrect) {
        correct++
      } else {
        // Record mistake - extract translation from sentence context
        const word = question.correctAnswer!
        const translation = question.sentence!.includes('(') 
          ? question.sentence!.match(/\((.+?)\)/)?.[1] || word
          : word
        await recordMistake(
          props.wordlistId,
          word,
          translation,
          'fill_blank'
        )
      }
    } else if (question.type === 'multiple-choice') {
      const mcAnswer = answer as MultipleChoiceAnswer
      // Check if selected option is correct
      const correctOption = question.options!.find(opt => opt.isCorrect)
      const isCorrect = mcAnswer.selectedOption === correctOption?.text
      
      if (isCorrect) {
        correct++
      } else {
        // Record mistake - extract word and translation from question
        const sentenceParts = question.question!.match(/["'](.+?)["']/)
        const word = sentenceParts ? sentenceParts[1] : question.question!.split(' ')[0]
        const translation = correctOption?.text || ''
        await recordMistake(
          props.wordlistId,
          word,
          translation,
          'multiple_choice'
        )
      }
    }
  }

  // Calculate percentage
  const percentage = Math.round((correct / total) * 100)

  // Update results state
  correctCount.value = correct
  totalCount.value = total
  score.value = percentage
  showResults.value = true

  // Emit complete event
  emit('complete', percentage, correct, total)
}
</script>

<style scoped>
/* Container */
.all-questions-container {
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header */
.practice-header {
  margin-bottom: 32px;
  text-align: center;
}

.practice-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.practice-subtitle {
  font-size: 15px;
  color: #6b7280;
}

/* Questions List */
.questions-list {
  margin-bottom: 32px;
}

/* Question Card */
.question {
  margin-bottom: 32px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.question-number {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
}

.question-type {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}





.matching-pairs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.matching-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.matching-item {
  padding: 12px 16px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
  font-size: 15px;
  color: #1a1a1a;
  text-align: center;
  position: relative;
}

.matching-item:hover:not(.matched) {
  border-color: #9ca3af;
  background: #f9fafb;
  transform: translateY(-1px);
}

.matching-item.selected {
  border-color: #000000;
  background: #f3f4f6;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.matching-item.matched {
  border-color: #10b981;
  background: #ecfdf5;
  cursor: default;
  opacity: 0.7;
  pointer-events: none;
}

.matching-item.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { 
    transform: translateX(0); 
  }
  25% { 
    transform: translateX(-4px); 
  }
  75% { 
    transform: translateX(4px); 
  }
}

.sentence {
  font-size: 15px;
  color: #000000;
  margin-bottom: 16px;
}

.sentence :deep(strong) {
  font-weight: 700;
  color: #000000;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
}

.fill-blank-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  color: #1a1a1a;
  transition: all 150ms ease-out;
}

.fill-blank-input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.fill-blank-input::placeholder {
  color: #9ca3af;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-button {
  padding: 12px 16px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  color: #1a1a1a;
  text-align: left;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.option-button:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.option-button.selected {
  border-color: #000000;
  background: #f3f4f6;
}

/* Submit Section */
.submit-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.submit-button {
  padding: 12px 24px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.submit-button:hover {
  background: #1f2937;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Results */
.results-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.results-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 48px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.results-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.results-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.results-text {
  font-size: 20px;
  color: #4b5563;
  margin-bottom: 8px;
}

.results-count {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 32px;
}

.try-again-button {
  padding: 14px 32px;
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.try-again-button:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
  .all-questions-container {
    padding: 20px;
  }

  .practice-title {
    font-size: 24px;
  }

  .matching-pairs {
    grid-template-columns: 1fr;
  }

  .question {
    padding: 16px;
  }

  .results-content {
    padding: 32px 24px;
    margin: 16px;
  }

  .results-title {
    font-size: 28px;
  }
}
</style>
