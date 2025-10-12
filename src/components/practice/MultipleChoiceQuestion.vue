<template>
  <div class="multiple-choice-question">
    <!-- Question Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Choose the correct meaning
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Select the option that best matches the highlighted word
      </p>
    </div>

    <!-- Practice Sentence -->
    <div class="mb-8">
      <div class="sentence-container p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p class="text-lg leading-relaxed text-gray-900 dark:text-gray-100">
          <template v-for="(part, index) in sentenceParts" :key="index">
            <span v-if="!part.isTarget">{{ part.text }}</span>
            <span
              v-else
              class="target-word px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 font-semibold rounded"
            >
              {{ part.text }}
            </span>
          </template>
        </p>
      </div>
    </div>

    <!-- Answer Options -->
    <div class="space-y-3">
      <div
        v-for="(option, index) in question.options"
        :key="index"
        class="option-container"
        :class="{
          'selected': selectedOption === index,
          'correct': showFeedback && option.isCorrect,
          'incorrect': showFeedback && selectedOption === index && !option.isCorrect,
          'disabled': disabled || showFeedback
        }"
        @click="selectOption(index)"
        role="radio"
        :aria-checked="selectedOption === index"
        :aria-label="`Option ${index + 1}: ${option.text}`"
        tabindex="0"
        @keydown.enter="selectOption(index)"
        @keydown.space.prevent="selectOption(index)"
      >
        <div class="flex items-start gap-4">
          <!-- Radio Button -->
          <div class="radio-button flex-shrink-0 mt-0.5">
            <div class="radio-outer">
              <div v-if="selectedOption === index" class="radio-inner"></div>
            </div>
          </div>

          <!-- Option Text -->
          <div class="flex-1">
            <p class="text-base text-gray-900 dark:text-gray-100">
              {{ option.text }}
            </p>
          </div>

          <!-- Feedback Icon -->
          <div v-if="showFeedback" class="feedback-icon flex-shrink-0">
            <svg
              v-if="option.isCorrect"
              class="w-6 h-6 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="selectedOption === index"
              class="w-6 h-6 text-red-600 dark:text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Message -->
    <div v-if="showFeedback" class="mt-6">
      <div
        v-if="isCorrect"
        class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
      >
        <div class="flex items-start gap-3">
          <svg
            class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p class="text-green-800 dark:text-green-200 font-medium">
              Correct! 🎉
            </p>
            <p class="text-sm text-green-700 dark:text-green-300 mt-1">
              "{{ question.targetWord }}" means "{{ correctAnswer?.text }}"
            </p>
          </div>
        </div>
      </div>
      <div
        v-else
        class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <div class="flex items-start gap-3">
          <svg
            class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p class="text-red-800 dark:text-red-200 font-medium">
              Not quite right
            </p>
            <p class="text-sm text-red-700 dark:text-red-300 mt-1">
              The correct answer is: <span class="font-medium">{{ correctAnswer?.text }}</span>
            </p>
            <p class="text-sm text-red-700 dark:text-red-300 mt-2">
              "{{ question.targetWord }}" means "{{ correctAnswer?.text }}" in this context.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { MultipleChoiceQuestion as MultipleChoiceQuestionType, MultipleChoiceAnswer } from '@/types/practice';

interface Props {
  question: MultipleChoiceQuestionType;
  answer?: MultipleChoiceAnswer;
  showFeedback?: boolean;
  disabled?: boolean;
}

interface Emits {
  (e: 'answer', answer: MultipleChoiceAnswer): void;
}

const props = withDefaults(defineProps<Props>(), {
  showFeedback: false,
  disabled: false,
});

const emit = defineEmits<Emits>();

// Selected option index
const selectedOption = ref<number | null>(null);

// Parse sentence to highlight target word
interface SentencePart {
  text: string;
  isTarget: boolean;
}

const sentenceParts = computed<SentencePart[]>(() => {
  const sentence = props.question.sentence;
  const targetWord = props.question.targetWord;
  
  // Case-insensitive search for the target word
  const regex = new RegExp(`\\b(${targetWord})\\b`, 'gi');
  const parts: SentencePart[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(sentence)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        text: sentence.substring(lastIndex, match.index),
        isTarget: false,
      });
    }
    
    // Add the matched target word
    parts.push({
      text: match[0],
      isTarget: true,
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < sentence.length) {
    parts.push({
      text: sentence.substring(lastIndex),
      isTarget: false,
    });
  }
  
  // If no match found, return the whole sentence
  if (parts.length === 0) {
    parts.push({
      text: sentence,
      isTarget: false,
    });
  }
  
  return parts;
});

// Get correct answer
const correctAnswer = computed(() => {
  return props.question.options.find(opt => opt.isCorrect);
});

// Check if selected answer is correct
const isCorrect = computed(() => {
  if (selectedOption.value === null) return false;
  return props.question.options[selectedOption.value]?.isCorrect || false;
});

// Select an option
const selectOption = (index: number) => {
  if (props.disabled || props.showFeedback) return;
  
  selectedOption.value = index;
  emitAnswer();
};

// Emit answer to parent
const emitAnswer = () => {
  if (selectedOption.value === null) return;
  
  const answer: MultipleChoiceAnswer = {
    questionId: props.question.id,
    selectedOption: props.question.options[selectedOption.value].text,
  };
  
  emit('answer', answer);
};

// Load existing answer if provided
const loadAnswer = () => {
  if (!props.answer) {
    selectedOption.value = null;
    return;
  }
  
  const index = props.question.options.findIndex(
    opt => opt.text === props.answer?.selectedOption
  );
  
  if (index !== -1) {
    selectedOption.value = index;
  }
};

// Watch for answer changes
watch(() => props.answer, loadAnswer, { immediate: true });
</script>

<style scoped>
.option-container {
  @apply p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200;
}

.option-container:hover:not(.disabled) {
  @apply border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20;
}

.option-container.selected:not(.disabled) {
  @apply border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20;
}

.option-container.correct {
  @apply border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20;
}

.option-container.incorrect {
  @apply border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20;
}

.option-container.disabled {
  @apply cursor-default;
}

.option-container:focus-visible {
  @apply outline-none ring-2 ring-indigo-500 ring-offset-2;
}

/* Radio Button Styles */
.radio-outer {
  @apply w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center transition-colors;
}

.option-container.selected:not(.disabled) .radio-outer {
  @apply border-indigo-500 dark:border-indigo-400;
}

.option-container.correct .radio-outer {
  @apply border-green-500 dark:border-green-400;
}

.option-container.incorrect .radio-outer {
  @apply border-red-500 dark:border-red-400;
}

.radio-inner {
  @apply w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400;
}

.option-container.correct .radio-inner {
  @apply bg-green-500 dark:bg-green-400;
}

.option-container.incorrect .radio-inner {
  @apply bg-red-500 dark:bg-red-400;
}

/* Target Word Highlight */
.target-word {
  @apply transition-colors;
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .option-card {
    min-height: 56px;
    padding: 16px;
  }

  .option-card:active {
    transform: scale(0.98);
  }

  .submit-button {
    min-height: 48px;
    padding: 0 24px;
    font-size: 16px;
  }

  .submit-button:active {
    transform: scale(0.98);
  }

  /* Disable hover effects */
  .option-card:hover {
    @apply border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800;
  }

  .option-card.selected:hover {
    @apply border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20;
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .sentence-display {
    font-size: 16px;
    line-height: 1.6;
  }

  .option-card {
    padding: 14px;
  }

  .option-text {
    font-size: 15px;
  }

  .submit-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .multiple-choice-question {
    padding: 16px;
  }

  .options-grid {
    gap: 12px;
  }

  .option-card {
    padding: 12px;
  }
}
</style>
