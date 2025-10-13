# Design Document

## Overview

The practice session initialization flow needs to be redesigned to properly sequence question generation and session initialization. The current implementation creates a composable with empty data and never updates it, causing the "Failed to Load Practice Session" error.

## Architecture

### Current Flow (Broken)
```
1. PracticePage mounts
2. usePracticeSession initialized with empty mockPracticeSet
3. Questions generated asynchronously
4. startSession() called (but it's a mock function that does nothing)
5. Composable still has empty questions → Error
```

### New Flow (Fixed)
```
1. PracticePage mounts
2. Show loading state
3. Generate questions via API
4. Create complete PracticeSet object with generated questions
5. Initialize usePracticeSession with complete PracticeSet
6. Show active practice session
```

## Components and Interfaces

### PracticePage.vue Refactor

The component needs to be restructured to:

1. **Delay composable initialization** until questions are generated
2. **Use conditional rendering** to only render PracticeSession when data is ready
3. **Properly pass data** from API response to composable

#### State Management

```typescript
// Loading states
type PracticeState = 'loading' | 'ready' | 'active' | 'completed' | 'error'

// Data states
const practiceSet = ref<PracticeSet | null>(null)
const sessionComposable = ref<ReturnType<typeof usePracticeSession> | null>(null)
```

#### Initialization Flow

```typescript
async function initializePractice() {
  practiceState.value = 'loading'
  
  try {
    // 1. Generate questions
    const response = await generatePracticeQuestions(...)
    
    // 2. Create complete PracticeSet
    practiceSet.value = {
      id: response.practiceSetId,
      wordlistId: wordlistId.value,
      questions: response.questions,
      createdAt: new Date(),
      isShared: false
    }
    
    // 3. Initialize composable with complete data
    sessionComposable.value = usePracticeSession({
      practiceSet: practiceSet.value,
      timerDuration: timerDurationParam.value,
      onTimerExpire: handleTimerExpire,
      onSessionComplete: handleSessionComplete
    })
    
    // 4. Transition to active state
    practiceState.value = 'active'
    
  } catch (error) {
    practiceState.value = 'error'
    errorMessage.value = error.message
  }
}
```

### Template Structure

```vue
<template>
  <div class="practice-page">
    <!-- Loading State -->
    <LoadingView v-if="practiceState === 'loading'" />
    
    <!-- Active Session -->
    <template v-else-if="practiceState === 'active' && sessionComposable">
      <PracticeSession
        :questions="sessionComposable.allQuestions.value"
        :current-question-index="sessionComposable.currentQuestionIndex.value"
        :answers="sessionComposable.answers.value"
        :time-remaining="sessionComposable.timeRemaining.value"
        :timer-duration="timerDurationParam"
        :is-paused="sessionComposable.isPaused.value"
        @answer="sessionComposable.submitAnswer"
        @navigate="sessionComposable.goToQuestion"
        @submit="handleSubmit"
        @toggle-pause="togglePause"
      />
    </template>
    
    <!-- Results View -->
    <ResultsView v-else-if="practiceState === 'completed'" />
    
    <!-- Error State -->
    <ErrorView v-else-if="practiceState === 'error'" />
  </div>
</template>
```

## Data Models

### PracticeSet Type

```typescript
interface PracticeSet {
  id: string
  wordlistId: string
  questions: PracticeQuestions
  createdAt: Date
  isShared: boolean
}

interface PracticeQuestions {
  matching: MatchingQuestion[]
  fillBlank: FillBlankQuestion[]
  multipleChoice: MultipleChoiceQuestion[]
}
```

### Session Composable Return Type

The composable returns reactive refs and methods that should be accessed via `.value` for refs:

```typescript
interface SessionComposableReturn {
  // Reactive state (accessed via .value)
  sessionId: ComputedRef<string>
  currentQuestionIndex: ComputedRef<number>
  currentQuestion: ComputedRef<Question | null>
  answers: ComputedRef<Map<string, Answer>>
  isPaused: ComputedRef<boolean>
  isCompleted: ComputedRef<boolean>
  timeRemaining: ComputedRef<number>
  allQuestions: ComputedRef<Question[]>
  
  // Methods (called directly)
  submitAnswer: (questionId: string, answer: Answer) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeSession: () => SessionResults
  pauseTimer: () => void
  resumeTimer: () => void
  resetSession: () => void
}
```

## Error Handling

### Error Types

1. **Generation Errors**: API fails to generate questions
   - Display error message from API
   - Provide retry button
   - Provide back button

2. **Insufficient Words**: Wordlist has < 4 words
   - Display minimum requirement message
   - Provide back button (no retry)

3. **Network Errors**: Request timeout or network failure
   - Display generic network error
   - Provide retry button

### Error Display Component

Use existing `ErrorDisplay` component with appropriate props:

```vue
<ErrorDisplay
  title="Failed to Load Practice Session"
  :message="errorMessage"
  severity="error"
  :retryable="isRetryable"
  @retry="handleRetry"
/>
```

## Testing Strategy

### Unit Tests

1. **Test question generation flow**
   - Mock API response
   - Verify PracticeSet creation
   - Verify composable initialization

2. **Test error handling**
   - Mock API errors
   - Verify error state transitions
   - Verify retry functionality

3. **Test state transitions**
   - loading → active
   - loading → error
   - active → completed
   - error → loading (retry)

### Integration Tests

1. **Test full practice flow**
   - Navigate to practice page
   - Verify questions load
   - Answer questions
   - Complete session
   - View results

2. **Test error recovery**
   - Trigger generation error
   - Click retry
   - Verify successful recovery

### Manual Testing

1. **Test with valid wordlist**
   - Navigate from wordlist page
   - Verify questions load
   - Verify session works correctly

2. **Test with insufficient words**
   - Create wordlist with < 4 words
   - Attempt to generate questions
   - Verify appropriate error message

3. **Test network failure**
   - Disconnect network
   - Attempt to generate questions
   - Verify error handling
   - Reconnect and retry

## Implementation Notes

### Key Changes

1. **Remove mock functions**: Delete `startSession`, `answerQuestion`, etc. - use composable methods directly
2. **Conditional composable initialization**: Only call `usePracticeSession` after questions are generated
3. **Proper ref access**: Access composable refs via `.value` in template bindings
4. **Clean state management**: Use single `practiceState` enum for all states

### Backward Compatibility

This change is internal to `PracticePage.vue` and doesn't affect:
- The `usePracticeSession` composable API
- The `PracticeSession` component props
- The question generation API
- Any other components

### Performance Considerations

- Questions are cached by the API (24 hours)
- Composable initialization is lightweight
- No unnecessary re-renders due to proper reactive state management
