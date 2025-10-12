<template>
  <div class="matching-question">
    <!-- Question Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Match the English words with their Mandarin translations
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Click an English word, then click its matching Mandarin translation
      </p>
    </div>

    <!-- Matching Grid -->
    <div class="matching-grid grid grid-cols-2 gap-8 relative">
      <!-- English Column -->
      <div class="space-y-3">
        <div
          v-for="(pair, index) in question.pairs"
          :key="`english-${index}`"
          :ref="el => setEnglishRef(index, el)"
          class="matching-item"
          :class="{
            'selected': selectedEnglish === index,
            'matched': isMatched('english', index),
            'correct': isCorrect(index),
            'incorrect': isIncorrect(index)
          }"
          @click="selectEnglish(index)"
          role="button"
          :aria-label="`English word: ${pair.english}`"
          :aria-pressed="selectedEnglish === index"
          tabindex="0"
          @keydown.enter="selectEnglish(index)"
          @keydown.space.prevent="selectEnglish(index)"
        >
          <span class="text-base font-medium">{{ pair.english }}</span>
        </div>
      </div>

      <!-- Mandarin Column -->
      <div class="space-y-3">
        <div
          v-for="(mandarin, index) in question.shuffledMandarin"
          :key="`mandarin-${index}`"
          :ref="el => setMandarinRef(index, el)"
          class="matching-item"
          :class="{
            'selected': selectedMandarin === index,
            'matched': isMatched('mandarin', index),
            'correct': isMandarinCorrect(index),
            'incorrect': isMandarinIncorrect(index)
          }"
          @click="selectMandarin(index)"
          role="button"
          :aria-label="`Mandarin translation: ${mandarin}`"
          :aria-pressed="selectedMandarin === index"
          tabindex="0"
          @keydown.enter="selectMandarin(index)"
          @keydown.space.prevent="selectMandarin(index)"
        >
          <span class="text-base font-medium">{{ mandarin }}</span>
        </div>
      </div>

      <!-- SVG Canvas for Connection Lines -->
      <svg
        ref="svgCanvas"
        class="connection-lines absolute inset-0 pointer-events-none"
        :style="{ width: '100%', height: '100%' }"
      >
        <line
          v-for="(connection, idx) in connections"
          :key="`line-${idx}`"
          :x1="connection.x1"
          :y1="connection.y1"
          :x2="connection.x2"
          :y2="connection.y2"
          :class="connection.className"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- Feedback Message -->
    <div v-if="showFeedback" class="mt-6">
      <div
        v-if="allCorrect"
        class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
      >
        <p class="text-green-800 dark:text-green-200 font-medium">
          Perfect! All matches are correct! 🎉
        </p>
      </div>
      <div
        v-else
        class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
      >
        <p class="text-amber-800 dark:text-amber-200 font-medium mb-2">
          Some matches are incorrect. Here are the correct pairings:
        </p>
        <ul class="space-y-1 text-sm text-amber-700 dark:text-amber-300">
          <li v-for="(pair, idx) in question.pairs" :key="`correct-${idx}`">
            <span class="font-medium">{{ pair.english }}</span> → {{ pair.mandarin }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { gsap } from 'gsap';
import type { MatchingQuestion as MatchingQuestionType, MatchingAnswer } from '@/types/practice';

interface Props {
  question: MatchingQuestionType;
  answer?: MatchingAnswer;
  showFeedback?: boolean;
  disabled?: boolean;
}

interface Emits {
  (e: 'answer', answer: MatchingAnswer): void;
}

const props = withDefaults(defineProps<Props>(), {
  showFeedback: false,
  disabled: false,
});

const emit = defineEmits<Emits>();

// Refs for DOM elements
const englishRefs = ref<Map<number, HTMLElement>>(new Map());
const mandarinRefs = ref<Map<number, HTMLElement>>(new Map());
const svgCanvas = ref<SVGSVGElement | null>(null);

// Selection state
const selectedEnglish = ref<number | null>(null);
const selectedMandarin = ref<number | null>(null);

// Matches state
const matches = ref<Map<number, number>>(new Map()); // english index -> mandarin index

// Connection lines for visualization
interface Connection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  className: string;
}

const connections = ref<Connection[]>([]);

// Set refs
const setEnglishRef = (index: number, el: any) => {
  if (el) englishRefs.value.set(index, el as HTMLElement);
};

const setMandarinRef = (index: number, el: any) => {
  if (el) mandarinRefs.value.set(index, el as HTMLElement);
};

// Check if item is matched
const isMatched = (type: 'english' | 'mandarin', index: number): boolean => {
  if (type === 'english') {
    return matches.value.has(index);
  } else {
    return Array.from(matches.value.values()).includes(index);
  }
};

// Check if match is correct (only when feedback is shown)
const isCorrect = (englishIndex: number): boolean => {
  if (!props.showFeedback) return false;
  const mandarinIndex = matches.value.get(englishIndex);
  if (mandarinIndex === undefined) return false;
  
  const correctMandarin = props.question.pairs[englishIndex].mandarin;
  const selectedMandarin = props.question.shuffledMandarin[mandarinIndex];
  return correctMandarin === selectedMandarin;
};

const isIncorrect = (englishIndex: number): boolean => {
  if (!props.showFeedback) return false;
  const mandarinIndex = matches.value.get(englishIndex);
  if (mandarinIndex === undefined) return false;
  return !isCorrect(englishIndex);
};

const isMandarinCorrect = (mandarinIndex: number): boolean => {
  if (!props.showFeedback) return false;
  for (const [engIdx, manIdx] of matches.value.entries()) {
    if (manIdx === mandarinIndex) {
      return isCorrect(engIdx);
    }
  }
  return false;
};

const isMandarinIncorrect = (mandarinIndex: number): boolean => {
  if (!props.showFeedback) return false;
  for (const [engIdx, manIdx] of matches.value.entries()) {
    if (manIdx === mandarinIndex) {
      return isIncorrect(engIdx);
    }
  }
  return false;
};

// Check if all matches are correct
const allCorrect = computed(() => {
  if (!props.showFeedback || matches.value.size !== props.question.pairs.length) {
    return false;
  }
  return Array.from(matches.value.keys()).every(idx => isCorrect(idx));
});

// Select English word
const selectEnglish = (index: number) => {
  if (props.disabled || props.showFeedback) return;
  
  // If already matched, deselect
  if (matches.value.has(index)) {
    matches.value.delete(index);
    updateConnections();
    emitAnswer();
    return;
  }
  
  selectedEnglish.value = index;
  
  // If mandarin is already selected, create match
  if (selectedMandarin.value !== null) {
    createMatch(index, selectedMandarin.value);
  }
};

// Select Mandarin word
const selectMandarin = (index: number) => {
  if (props.disabled || props.showFeedback) return;
  
  // If already matched, deselect
  const matchedEnglish = Array.from(matches.value.entries()).find(([_, manIdx]) => manIdx === index);
  if (matchedEnglish) {
    matches.value.delete(matchedEnglish[0]);
    updateConnections();
    emitAnswer();
    return;
  }
  
  selectedMandarin.value = index;
  
  // If english is already selected, create match
  if (selectedEnglish.value !== null) {
    createMatch(selectedEnglish.value, index);
  }
};

// Create a match between english and mandarin
const createMatch = (englishIndex: number, mandarinIndex: number) => {
  matches.value.set(englishIndex, mandarinIndex);
  
  // Animate the connection
  animateConnection(englishIndex, mandarinIndex);
  
  // Clear selections
  selectedEnglish.value = null;
  selectedMandarin.value = null;
  
  // Update connections
  updateConnections();
  
  // Emit answer
  emitAnswer();
};

// Animate connection line drawing
const animateConnection = (englishIndex: number, mandarinIndex: number) => {
  const englishEl = englishRefs.value.get(englishIndex);
  const mandarinEl = mandarinRefs.value.get(mandarinIndex);
  
  if (!englishEl || !mandarinEl || !svgCanvas.value) return;
  
  const svgRect = svgCanvas.value.getBoundingClientRect();
  const englishRect = englishEl.getBoundingClientRect();
  const mandarinRect = mandarinEl.getBoundingClientRect();
  
  const x1 = englishRect.right - svgRect.left;
  const y1 = englishRect.top + englishRect.height / 2 - svgRect.top;
  const x2 = mandarinRect.left - svgRect.left;
  const y2 = mandarinRect.top + mandarinRect.height / 2 - svgRect.top;
  
  // Create temporary line for animation
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1.toString());
  line.setAttribute('y1', y1.toString());
  line.setAttribute('x2', x1.toString());
  line.setAttribute('y2', y1.toString());
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-linecap', 'round');
  line.classList.add('connection-line');
  
  svgCanvas.value.appendChild(line);
  
  // Animate line drawing
  gsap.to(line, {
    attr: { x2, y2 },
    duration: 0.4,
    ease: 'power2.out',
  });
};

// Update all connection lines
const updateConnections = () => {
  connections.value = [];
  
  if (!svgCanvas.value) return;
  
  const svgRect = svgCanvas.value.getBoundingClientRect();
  
  matches.value.forEach((mandarinIndex, englishIndex) => {
    const englishEl = englishRefs.value.get(englishIndex);
    const mandarinEl = mandarinRefs.value.get(mandarinIndex);
    
    if (!englishEl || !mandarinEl) return;
    
    const englishRect = englishEl.getBoundingClientRect();
    const mandarinRect = mandarinEl.getBoundingClientRect();
    
    const x1 = englishRect.right - svgRect.left;
    const y1 = englishRect.top + englishRect.height / 2 - svgRect.top;
    const x2 = mandarinRect.left - svgRect.left;
    const y2 = mandarinRect.top + mandarinRect.height / 2 - svgRect.top;
    
    let className = 'connection-line';
    if (props.showFeedback) {
      className = isCorrect(englishIndex) ? 'connection-line-correct' : 'connection-line-incorrect';
    }
    
    connections.value.push({ x1, y1, x2, y2, className });
  });
};

// Emit answer to parent
const emitAnswer = () => {
  const answer: MatchingAnswer = {
    questionId: props.question.id,
    pairs: Array.from(matches.value.entries()).map(([englishIdx, mandarinIdx]) => ({
      english: props.question.pairs[englishIdx].english,
      selectedMandarin: props.question.shuffledMandarin[mandarinIdx],
    })),
  };
  
  emit('answer', answer);
};

// Load existing answer if provided
const loadAnswer = () => {
  if (!props.answer) return;
  
  matches.value.clear();
  
  props.answer.pairs.forEach(pair => {
    const englishIndex = props.question.pairs.findIndex(p => p.english === pair.english);
    const mandarinIndex = props.question.shuffledMandarin.findIndex(m => m === pair.selectedMandarin);
    
    if (englishIndex !== -1 && mandarinIndex !== -1) {
      matches.value.set(englishIndex, mandarinIndex);
    }
  });
  
  updateConnections();
};

// Handle window resize
const handleResize = () => {
  updateConnections();
};

onMounted(() => {
  loadAnswer();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Watch for answer changes
watch(() => props.answer, loadAnswer);
watch(() => props.showFeedback, () => {
  updateConnections();
});
</script>

<style scoped>
.matching-item {
  @apply px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200;
  min-height: 44px; /* WCAG touch target size */
  display: flex;
  align-items: center;
}

.matching-item:hover:not(.matched) {
  @apply border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20;
}

.matching-item.selected {
  @apply border-indigo-500 dark:border-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 shadow-md;
}

.matching-item.matched {
  @apply border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50;
}

.matching-item.correct {
  @apply border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20;
}

.matching-item.incorrect {
  @apply border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20;
}

.matching-item:focus-visible {
  @apply outline-none ring-2 ring-indigo-500 ring-offset-2;
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .matching-item {
    min-height: 48px;
    padding: 12px 16px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .matching-item:active {
    transform: scale(0.98);
  }

  /* Disable hover effects on touch */
  .matching-item:hover:not(.matched) {
    @apply border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800;
  }

  /* Enhance selected state for touch */
  .matching-item.selected {
    transform: scale(1.02);
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .matching-grid {
    gap: 16px;
  }

  .matching-item {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .matching-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .matching-item {
    padding: 14px 16px;
  }
}

.connection-line {
  @apply stroke-gray-400 dark:stroke-gray-500;
}

.connection-line-correct {
  @apply stroke-green-500 dark:stroke-green-400;
}

.connection-line-incorrect {
  @apply stroke-red-500 dark:stroke-red-400;
}
</style>
