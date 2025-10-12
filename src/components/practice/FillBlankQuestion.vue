<template>
  <div class="fill-blank-question">
    <!-- Question Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Fill in the blank
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Type the correct word to complete the sentence
      </p>
    </div>

    <!-- Sentence Display -->
    <div class="mb-6">
      <div class="sentence-container p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p class="text-lg leading-relaxed text-gray-900 dark:text-gray-100">
          <template v-for="(part, index) in sentenceParts" :key="index">
            <span v-if="part.type === 'text'">{{ part.content }}</span>
            <span
              v-else-if="part.type === 'blank'"
              class="inline-flex items-center"
            >
              <span
                v-if="showFeedback && !isCorrect"
                class="blank-space correct-answer px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium rounded"
              >
                {{ question.correctAnswer }}
              </span>
              <input
                v-else
                ref="inputRef"
                v-model="userAnswer"
                type="text"
                class="blank-input"
                :class="{
                  'correct': showFeedback && isCorrect,
                  'incorrect': showFeedback && !isCorrect
                }"
                :placeholder="showHint ? hintText : '______'"
                :disabled="disabled || showFeedback"
                :aria-label="'Fill in the blank'"
                @input="handleInput"
                @keydown.enter="handleSubmit"
              />
            </span>
          </template>
        </p>
      </div>
    </div>

    <!-- Hint Button -->
    <div v-if="!showFeedback && question.hint" class="mb-4">
      <button
        type="button"
        class="hint-button px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
        @click="toggleHint"
        :disabled="disabled"
      >
        <span v-if="!showHint">💡 Show Hint</span>
        <span v-else>🔒 Hide Hint</span>
      </button>
    </div>

    <!-- Real-time Feedback -->
    <div v-if="userAnswer && !showFeedback" class="mb-4">
      <div class="flex items-center gap-2 text-sm">
        <div
          v-if="similarityScore >= 0.8"
          class="flex items-center gap-1 text-green-600 dark:text-green-400"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Looks good!</span>
        </div>
        <div
          v-else-if="similarityScore >= 0.5"
          class="flex items-center gap-1 text-amber-600 dark:text-amber-400"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>Close, check your spelling</span>
        </div>
      </div>
    </div>

    <!-- Feedback Message -->
    <div v-if="showFeedback" class="feedback-container">
      <div
        v-if="isCorrect"
        class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
      >
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-green-800 dark:text-green-200 font-medium">
              Correct! 🎉
            </p>
            <p class="text-sm text-green-700 dark:text-green-300 mt-1">
              {{ completeSentence }}
            </p>
          </div>
        </div>
      </div>
      <div
        v-else
        class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-red-800 dark:text-red-200 font-medium">
              Not quite right
            </p>
            <p class="text-sm text-red-700 dark:text-red-300 mt-1">
              Your answer: <span class="font-medium">{{ userAnswer || '(empty)' }}</span>
            </p>
            <p class="text-sm text-red-700 dark:text-red-300 mt-1">
              Correct answer: <span class="font-medium">{{ question.correctAnswer }}</span>
            </p>
            <p class="text-sm text-red-700 dark:text-red-300 mt-2">
              Complete sentence: {{ completeSentence }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import type { FillBlankQuestion as FillBlankQuestionType, FillBlankAnswer } from '@/types/practice';

interface Props {
  question: FillBlankQuestionType;
  answer?: FillBlankAnswer;
  showFeedback?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

interface Emits {
  (e: 'answer', answer: FillBlankAnswer): void;
  (e: 'submit'): void;
}

const props = withDefaults(defineProps<Props>(), {
  showFeedback: false,
  disabled: false,
  autoFocus: true,
});

const emit = defineEmits<Emits>();

// User input
const userAnswer = ref('');
const showHint = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

// Parse sentence into parts (text and blank)
interface SentencePart {
  type: 'text' | 'blank';
  content: string;
}

const sentenceParts = computed<SentencePart[]>(() => {
  const sentence = props.question.sentence;
  const blankMarker = '______';
  
  if (!sentence.includes(blankMarker)) {
    // If no blank marker, assume the whole sentence needs the word at the end
    return [
      { type: 'text', content: sentence + ' ' },
      { type: 'blank', content: '' },
    ];
  }
  
  const parts: SentencePart[] = [];
  const segments = sentence.split(blankMarker);
  
  segments.forEach((segment, index) => {
    if (segment) {
      parts.push({ type: 'text', content: segment });
    }
    if (index < segments.length - 1) {
      parts.push({ type: 'blank', content: '' });
    }
  });
  
  return parts;
});

// Hint text (first letter + underscores)
const hintText = computed(() => {
  if (!props.question.hint) return '';
  return props.question.hint;
});

// Calculate similarity score using Levenshtein distance
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
};

// Check if answer is correct (with fuzzy matching)
const isCorrect = computed(() => {
  if (!userAnswer.value) return false;
  
  const normalized = userAnswer.value.toLowerCase().trim();
  const correctNormalized = props.question.correctAnswer.toLowerCase().trim();
  
  // Exact match
  if (normalized === correctNormalized) return true;
  
  // Check acceptable variations
  if (props.question.acceptableVariations) {
    const isAcceptable = props.question.acceptableVariations.some(
      variation => variation.toLowerCase().trim() === normalized
    );
    if (isAcceptable) return true;
  }
  
  // Fuzzy match with high threshold (0.85)
  return calculateSimilarity(normalized, correctNormalized) >= 0.85;
});

// Similarity score for real-time feedback
const similarityScore = computed(() => {
  if (!userAnswer.value) return 0;
  return calculateSimilarity(userAnswer.value, props.question.correctAnswer);
});

// Complete sentence with correct answer
const completeSentence = computed(() => {
  return props.question.sentence.replace('______', props.question.correctAnswer);
});

// Toggle hint
const toggleHint = () => {
  showHint.value = !showHint.value;
};

// Handle input
const handleInput = () => {
  emitAnswer();
};

// Handle submit (Enter key)
const handleSubmit = () => {
  if (!props.disabled && !props.showFeedback) {
    emit('submit');
  }
};

// Emit answer to parent
const emitAnswer = () => {
  const answer: FillBlankAnswer = {
    questionId: props.question.id,
    userAnswer: userAnswer.value,
  };
  
  emit('answer', answer);
};

// Load existing answer if provided
const loadAnswer = () => {
  if (props.answer) {
    userAnswer.value = props.answer.userAnswer;
  }
};

// Auto-focus input on mount
onMounted(async () => {
  loadAnswer();
  
  if (props.autoFocus && !props.disabled && !props.showFeedback) {
    await nextTick();
    inputRef.value?.focus();
  }
});

// Watch for answer changes
watch(() => props.answer, loadAnswer);

// Watch for showFeedback changes to refocus
watch(() => props.showFeedback, async (newVal) => {
  if (!newVal && props.autoFocus && !props.disabled) {
    await nextTick();
    inputRef.value?.focus();
  }
});
</script>

<style scoped>
.blank-input {
  @apply inline-block min-w-[120px] px-3 py-1 border-b-2 border-gray-400 dark:border-gray-500 bg-transparent text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors;
}

.blank-input::placeholder {
  @apply text-gray-400 dark:text-gray-500;
}

.blank-input:disabled {
  @apply cursor-not-allowed opacity-60;
}

.blank-input.correct {
  @apply border-green-500 dark:border-green-400 text-green-700 dark:text-green-300;
}

.blank-input.incorrect {
  @apply border-red-500 dark:border-red-400 text-red-700 dark:text-red-300;
}

.hint-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .answer-input {
    min-height: 48px;
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 12px 16px;
  }

  .submit-button,
  .hint-button {
    min-height: 48px;
    padding: 0 20px;
  }

  .submit-button:active,
  .hint-button:active {
    transform: scale(0.98);
  }

  /* Disable hover effects */
  .answer-input:hover {
    @apply border-gray-300 dark:border-gray-600;
  }

  .answer-input:focus:hover {
    @apply border-indigo-500 dark:border-indigo-400;
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .answer-input {
    font-size: 15px;
  }

  .input-actions {
    flex-direction: column;
    gap: 12px;
  }

  .submit-button,
  .hint-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .fill-blank-question {
    padding: 16px;
  }

  .sentence-display {
    font-size: 16px;
    line-height: 1.6;
  }

  .blank-space {
    min-width: 100px;
  }
}
</style>
