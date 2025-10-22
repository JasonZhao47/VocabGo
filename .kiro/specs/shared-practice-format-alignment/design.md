# Design Document: Shared Practice Format Alignment

## Overview

This design transforms the StudentPracticeView from a single-question-at-a-time interface to an all-questions-at-once format that matches the downloaded HTML template. The key change is replacing the PracticeQuestion component with a new AllQuestionsView component that renders all questions simultaneously with the same styling and behavior as the standalone HTML files.

## Architecture

### Current Architecture
```
StudentPracticeView.vue
├── StudentNicknameEntry (modal)
├── PracticeQuestion (single question, one-at-a-time)
│   ├── MatchingQuestion
│   ├── FillBlankQuestion
│   └── MultipleChoiceQuestion
└── Progress tracking (currentQuestionIndex)
```

### New Architecture
```
StudentPracticeView.vue
├── StudentNicknameEntry (modal)
└── AllQuestionsView (all questions at once)
    ├── Question rendering loop
    │   ├── Matching questions (inline)
    │   ├── Fill-blank questions (inline)
    │   └── Multiple-choice questions (inline)
    ├── Submit button
    └── Results display
```

## Components and Interfaces

### 1. AllQuestionsView Component

**Purpose**: Render all practice questions in a single scrollable page with the same format as downloaded HTML.

**Props**:
```typescript
interface AllQuestionsViewProps {
  questions: SimplePracticeQuestions
  wordlistId: string
  wordlistName: string
}
```

**Emits**:
```typescript
interface AllQuestionsViewEmits {
  (e: 'complete', score: number, correct: number, total: number): void
}
```

**State**:
```typescript
interface QuestionState {
  // For matching questions
  matches: Array<{ english: string; mandarin: string }>
  selectedEnglish: string | null
  selectedMandarin: string | null
  
  // For fill-blank questions
  textAnswer: string
  
  // For multiple-choice questions
  selectedOption: string | null
}

const answers = ref<Record<number, QuestionState>>({})
const showResults = ref(false)
const score = ref(0)
const correctCount = ref(0)
```

### 2. Question Rendering Logic

**Matching Questions**:
- Display English words in left column, shuffled Mandarin in right column
- Click to select, click again to match
- Immediate feedback: green for correct, red shake for incorrect
- Matched pairs become disabled with green styling

**Fill-in-the-Blank Questions**:
- Replace `___` with hint (first letter + spaced underscores)
- Single text input field
- No immediate validation, checked on submit

**Multiple-Choice Questions**:
- Display sentence with four options
- Click to select (black border highlight)
- No immediate validation, checked on submit

### 3. Submission and Scoring

**Scoring Logic**:
```typescript
function calculateScore() {
  let correct = 0
  const total = getTotalQuestionCount()
  
  questions.forEach((question, index) => {
    const answer = answers.value[index]
    
    if (question.type === 'matching') {
      // Correct only if all pairs matched
      if (answer.matches.length === question.pairs.length) {
        correct++
      }
    } else if (question.type === 'fill-blank') {
      // Case-insensitive comparison
      if (answer.textAnswer?.toLowerCase() === question.correctAnswer.toLowerCase()) {
        correct++
      }
    } else if (question.type === 'multiple-choice') {
      // Check if selected option is correct
      const correctOption = question.options[question.correctAnswer]
      if (answer.selectedOption === correctOption) {
        correct++
      }
    }
  })
  
  return { correct, total, percentage: Math.round((correct / total) * 100) }
}
```

## Data Models

### Question Format Transformation

The existing `SimplePracticeQuestions` format needs to be transformed to match the HTML template format:

```typescript
// Input format (from usePracticeQuestions)
interface SimplePracticeQuestions {
  matching: Array<{ pairs: Array<{ en: string; zh: string }> }>
  fillBlank: Array<{ sentence: string; correctAnswer: string }>
  multipleChoice: Array<{ question: string; options: string[]; correctAnswer: number }>
}

// Transformed format (for rendering)
interface TransformedQuestion {
  id: string
  type: 'matching' | 'fill-blank' | 'multiple-choice'
  
  // Matching
  pairs?: Array<{ english: string; mandarin: string }>
  shuffledMandarin?: string[]
  
  // Fill-blank
  sentence?: string
  correctAnswer?: string
  hint?: string
  
  // Multiple-choice
  question?: string
  options?: Array<{ text: string; isCorrect: boolean }>
}
```

### Mistake Recording

Mistakes are recorded during:
1. **Matching**: Each incorrect match attempt
2. **Submission**: All incorrect fill-blank and multiple-choice answers
3. **Submission**: All unmatched pairs in matching questions

```typescript
interface MistakeRecord {
  word: string
  translation: string
  questionType: 'matching' | 'fill_blank' | 'multiple_choice'
}
```

## Styling Strategy

### CSS Approach

Use scoped styles that exactly match the HTML template:

```css
/* Container */
.all-questions-container {
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Question card */
.question {
  margin-bottom: 32px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

/* Matching items */
.matching-item {
  padding: 12px 16px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
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
}

.matching-item.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

### Responsive Design

```css
@media (max-width: 640px) {
  .all-questions-container {
    padding: 20px;
  }
  
  .matching-pairs {
    grid-template-columns: 1fr; /* Stack columns */
  }
}
```

## Error Handling

### Mistake Recording Failures

Mistake recording is fire-and-forget to avoid blocking the user experience:

```typescript
async function recordMistake(word: string, translation: string, type: string) {
  try {
    await recordPracticeMistakeAPI(wordlistId, word, translation, type)
  } catch (error) {
    // Log but don't block user
    console.warn('Failed to record mistake:', error)
  }
}
```

### Missing Questions

If questions fail to load:
```typescript
if (!questions || allQuestions.length === 0) {
  return (
    <div class="no-questions">
      <p>No questions available. Please try again later.</p>
    </div>
  )
}
```

## Testing Strategy

### Unit Tests

1. **Question Rendering**
   - Test each question type renders correctly
   - Test question transformation logic
   - Test hint generation for fill-blank questions

2. **Interaction Logic**
   - Test matching selection and validation
   - Test multiple-choice selection
   - Test fill-blank input handling

3. **Scoring Logic**
   - Test score calculation for all question types
   - Test edge cases (no answers, partial answers)
   - Test percentage calculation

### Integration Tests

1. **Full Practice Flow**
   - Load questions → Answer all → Submit → View results
   - Test mistake recording integration
   - Test session token handling

2. **Responsive Behavior**
   - Test layout at different viewport sizes
   - Test touch interactions on mobile

### Visual Regression Tests

Compare screenshots of:
- Downloaded HTML template
- Shared practice view
- Ensure pixel-perfect alignment

## Implementation Notes

### Key Differences from Current Implementation

1. **Remove**: PracticeQuestion component (single-question view)
2. **Remove**: currentQuestionIndex, answeredQuestions tracking
3. **Remove**: Progress bar (questions answered / total)
4. **Add**: AllQuestionsView component (all-questions view)
5. **Add**: Submit button and results display
6. **Modify**: StudentPracticeView to use new component

### Reusable Code

The following logic from PracticeHtmlGenerator can be reused:
- Question transformation (`transformQuestionsToOriginalFormat`)
- Hint generation for fill-blank questions
- Mandarin shuffling for matching questions

### Migration Path

1. Create AllQuestionsView component
2. Update StudentPracticeView to conditionally use new component
3. Test both implementations side-by-side
4. Remove old PracticeQuestion component once verified
5. Clean up unused composables and state

## Performance Considerations

### Rendering Optimization

- Use `v-for` with `:key` for question lists
- Avoid unnecessary re-renders with `v-memo` for static content
- Lazy load results display (only render after submission)

### Memory Management

- Clear answer state on component unmount
- Debounce text input for fill-blank questions (if needed)
- Limit DOM nodes by using virtual scrolling for very long question lists (future enhancement)

## Accessibility

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order: questions → options → submit button
- Enter key submits form
- Arrow keys navigate between options (optional enhancement)

### Screen Reader Support

```html
<div role="group" aria-labelledby="question-1-header">
  <div id="question-1-header">Question 1 of 20 - Matching</div>
  <!-- Question content -->
</div>
```

### Focus Management

- Clear focus indicators for all interactive elements
- Focus submit button after last question is answered
- Focus results heading after submission

## Security Considerations

### Input Validation

- Sanitize all user text input for fill-blank questions
- Prevent XSS through proper escaping
- Validate question data structure before rendering

### Session Management

- Verify session token before recording mistakes
- Handle expired sessions gracefully
- Don't expose wordlist data to unauthorized users

## Future Enhancements

1. **Timer Option**: Add optional timer display (already in HTML template)
2. **Dark Mode**: Support dark mode styling
3. **Question Shuffle**: Randomize question order
4. **Partial Save**: Save progress and resume later
5. **Detailed Feedback**: Show correct answers after submission
6. **Export Results**: Download practice results as PDF
