# Practice Questions Integration - Quick Implementation Guide

## Problem
StudentPracticeView shows a placeholder but doesn't actually load or display practice questions.

## Solution Created

### 1. New Files Created

**`src/types/practice.ts`** - Type definitions for practice questions
**`src/composables/usePracticeQuestions.ts`** - Composable to load questions
**`src/components/practice/PracticeQuestion.vue`** - Component to display individual questions

### 2. Integration Steps

Update `StudentPracticeView.vue` to:

1. Import the new composable and component:
```typescript
import { usePracticeQuestions } from '@/composables/usePracticeQuestions'
import PracticeQuestion from '@/components/practice/PracticeQuestion.vue'
```

2. Add to script setup:
```typescript
const { questions, isLoading: isLoadingQuestions, loadQuestions } = usePracticeQuestions()
const currentQuestionIndex = ref(0)
const answeredQuestions = ref<boolean[]>([])

// After successful nickname submit, load questions:
async function handleNicknameSubmit(nickname: string) {
  // ... existing code ...
  if (response.success && response.wordlist) {
    wordlist.value = response.wordlist
    
    // Load practice questions
    await loadQuestions(response.wordlist.id)
    
    showNicknameModal.value = false
  }
}
```

3. Replace the placeholder section with:
```vue
<!-- Loading Questions -->
<div v-if="isLoadingQuestions" class="loading-container">
  <p>Generating practice questions...</p>
</div>

<!-- Practice Questions -->
<div v-else-if="questions && allQuestions.length > 0">
  <PracticeQuestion
    v-if="currentQuestionIndex < allQuestions.length"
    :question="allQuestions[currentQuestionIndex]"
    :wordlist-id="wordlist.id"
    @answered="handleQuestionAnswered"
  />
  
  <!-- Completion -->
  <Card v-else class="completion-card">
    <h3>Practice Complete! 🎉</h3>
    <p>You answered {{ correctCount }} out of {{ allQuestions.length }} correctly</p>
  </Card>
</div>
```

4. Add helper computed and methods:
```typescript
const allQuestions = computed(() => {
  if (!questions.value) return []
  return [
    ...questions.value.matching,
    ...questions.value.fillBlank,
    ...questions.value.multipleChoice
  ]
})

const correctCount = computed(() => 
  answeredQuestions.value.filter(Boolean).length
)

function handleQuestionAnswered(correct: boolean) {
  answeredQuestions.value.push(correct)
  currentQuestionIndex.value++
}
```

## Quick Test

1. Restart Supabase: `pnpm supabase stop && pnpm supabase start`
2. Start dev server: `pnpm dev`
3. Navigate to a shared wordlist
4. Enter nickname
5. Practice questions should now load and display

## Notes

- Questions are generated via `generate-practice-questions` edge function
- Mistakes are automatically recorded via `record-practice-mistake`
- Matching questions are simplified in this implementation
- Full interactive matching can be added later if needed
