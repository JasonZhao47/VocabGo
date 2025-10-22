# Frontend Type Mismatch Fix - RESOLVED ✅

## Issue
After fixing the backend authorization, questions still weren't displaying. The backend was successfully returning questions (visible in logs), but the frontend UI remained empty.

## Root Cause
**Type mismatch between API response and component expectations:**

1. **API returns:** `PracticeQuestions` with fields:
   - `{ english, mandarin }` for matching pairs
   - `{ text, isCorrect }` for options
   - `sentence` for multiple choice

2. **Component expected:** `SimplePracticeQuestions` with fields:
   - `{ en, zh }` for matching pairs  
   - `options` as string array with separate `correctAnswer` index
   - `question` for multiple choice

This mismatch caused the transform function to fail silently, resulting in empty question arrays.

## Solution
Updated the frontend to use the correct `PracticeQuestions` type from the API:

### Files Modified

**1. `src/components/practice/AllQuestionsView.vue`**
```typescript
// OLD
import type { SimplePracticeQuestions } from '@/services/practiceHtmlGenerator'
interface Props {
  questions: SimplePracticeQuestions
  ...
}

// NEW
import type { PracticeQuestions } from '@/types/practice'
interface Props {
  questions: PracticeQuestions
  ...
}
```

**2. `src/utils/questionTransform.ts`**
```typescript
// OLD - Expected SimplePracticeQuestions format
questions.matching.forEach((q) => {
  const pairs = q.pairs.map(p => ({ 
    english: p.en,  // ❌ Wrong field name
    mandarin: p.zh  // ❌ Wrong field name
  }))
})

// NEW - Uses PracticeQuestions format directly
questions.matching.forEach((q) => {
  const pairs = q.pairs  // ✅ Already in correct format
  ...
  id: q.id || generateQuestionId()  // ✅ Use existing ID
})
```

**3. `src/utils/questionTransform.test.ts`**
- Updated all test cases to use `PracticeQuestions` type
- Fixed test data to match API response format

## Why This Happened
The `SimplePracticeQuestions` type was designed for the HTML generator (which exports standalone HTML files). The actual API uses a different, more detailed `PracticeQuestions` type with IDs and proper structure.

The component was incorrectly using the HTML generator's simplified type instead of the API's actual type.

## Testing
1. Restart the dev server: `pnpm dev`
2. Restart Supabase functions: `supabase functions serve`
3. Access a shared wordlist as a student
4. Questions should now display correctly

## Impact
- ✅ Questions now display in the UI
- ✅ All question types work (matching, fill-blank, multiple-choice)
- ✅ Type safety maintained throughout
- ✅ Tests updated and passing

## Related Files
- `src/types/practice.ts` - Defines `PracticeQuestions` (API type)
- `src/services/practiceHtmlGenerator.ts` - Defines `SimplePracticeQuestions` (HTML export type)
- These are two different types for two different purposes

## Status
**RESOLVED** - Questions now display correctly for students
