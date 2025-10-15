# Design Document: Remove Practice Session

## Overview

This design outlines the approach for removing the practice session functionality from VocabGo while preserving the practice question generation buttons in the wordlist interface. The goal is to simplify the application by removing interactive practice sessions, setup modals, results views, and related UI components, while maintaining the ability to generate practice questions through existing buttons styled with ElevenLabs aesthetics.

## Architecture

### High-Level Approach

1. **Remove Practice Page and Route**: Delete the `/practice` route and PracticePage.vue component
2. **Remove Practice Session Components**: Delete all components related to practice sessions (setup, session, results, history)
3. **Simplify SavedWordlistsPage**: Remove practice setup modal and navigation logic
4. **Preserve Practice Buttons**: Keep the "Practice Questions" button in wordlist cards with ElevenLabs styling
5. **Clean Up Dependencies**: Remove unused composables, services, and utilities related to practice sessions
6. **Update Tests**: Remove tests for deleted components

### Component Removal Strategy

The removal will follow a dependency-first approach:
1. Remove leaf components (question types, modals)
2. Remove container components (session, setup, results)
3. Remove page component (PracticePage)
4. Remove supporting code (composables, services, utilities)
5. Update parent components (SavedWordlistsPage)

## Components and Interfaces

### Components to Remove

#### Practice Page
- **File**: `src/pages/PracticePage.vue`
- **Reason**: Main practice session page - no longer needed
- **Dependencies**: Uses PracticeSetup, PracticeSession, ResultsView, ShareModal

#### Practice Session Components
- **Files**:
  - `src/components/practice/PracticeSession.vue` - Active practice session UI
  - `src/components/practice/PracticeSetup.vue` - Practice configuration modal
  - `src/components/practice/ResultsView.vue` - Session results display
  - `src/components/practice/SessionHistory.vue` - Historical session data
  - `src/components/practice/AnalyticsDashboard.vue` - Analytics visualization
- **Reason**: All related to interactive practice sessions

#### Question Type Components
- **Files**:
  - `src/components/practice/MultipleChoiceQuestion.vue`
  - `src/components/practice/FillBlankQuestion.vue`
  - `src/components/practice/MatchingQuestion.vue`
- **Reason**: Only used within practice sessions

#### Supporting Components
- **Files**:
  - `src/components/practice/ShareModal.vue` - Share practice sets
  - `src/components/practice/ErrorDisplay.vue` - Practice-specific errors (check if used elsewhere)
  - `src/components/practice/index.ts` - Component exports
- **Reason**: Practice session specific functionality

### Components to Modify

#### SavedWordlistsPage.vue
**Current State**:
- Has practice setup modal (`showPracticeSetup`, `practiceWordlist`)
- Imports PracticeSetup component
- Has `startPractice()` method that opens modal
- Has `handleGenerateQuestions()` that navigates to practice page
- Has `closePracticeSetup()` method

**Changes Required**:
1. Remove PracticeSetup import
2. Remove practice modal state variables
3. Remove practice setup modal from template
4. Modify "Practice Questions" button to be disabled or show tooltip
5. Remove `startPractice()`, `handleGenerateQuestions()`, `closePracticeSetup()` methods
6. Keep button styling (ElevenLabs aesthetic)

**Updated Button Behavior**:
```vue
<!-- Keep the button but make it informational -->
<button
  @click.stop="showPracticeInfo"
  :disabled="wordlist.wordCount < 4"
  class="w-full h-10 px-4 text-[14px] font-semibold text-black bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  :title="wordlist.wordCount < 4 ? 'Minimum 4 words required' : 'Practice questions feature'"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
  Practice Questions
</button>
```

## Data Models

### No Changes Required

The practice question generation backend (Edge Functions, database tables) will remain intact. Only the frontend practice session UI is being removed.

### State Management

#### Remove from SavedWordlistsPage:
```typescript
// Remove these state variables
const showPracticeSetup = ref(false)
const practiceWordlist = ref<WordlistRecord | null>(null)
const isGeneratingQuestions = ref(false)
```

## Services and Utilities to Remove

### Composables
- `src/composables/usePracticeSession.ts` - Session state management
- `src/composables/useSessionHistory.ts` - Historical session data
- Check if these are used elsewhere before removing

### Services
- `src/services/practiceSessionService.ts` - Session persistence
- `src/services/practiceAnalyticsService.ts` - Analytics tracking
- `src/services/practiceShareService.ts` - Share functionality
- `src/services/practiceHtmlGenerator.ts` - HTML export (check if needed)
- `src/services/htmlGenerationService.ts` - HTML generation (check if needed)

**Note**: Keep `src/services/practiceQuestionService.ts` if it's used for question generation API calls.

### Utilities
- `src/utils/sessionPersistence.ts` - Local storage for sessions
- `src/utils/sessionResults.ts` - Results calculation
- `src/utils/practiceErrorHandler.ts` - Error handling (check if used elsewhere)

### Types
Review `src/types/practice.ts` and remove types only used by practice sessions:
- Keep: `Question`, `QuestionType`, `Answer` (if used by question generation)
- Remove: `PracticeSession`, `SessionResults`, `PracticeSet` (if only used by UI)

## Router Changes

### Remove Practice Route

**File**: `src/router/index.ts`

**Change**:
```typescript
// Remove this route
{ 
  path: '/practice', 
  name: 'practice', 
  component: () => import('@/pages/PracticePage.vue')
}
```

**Optional**: Add a redirect to handle old bookmarks:
```typescript
{ 
  path: '/practice', 
  redirect: '/wordlists'
}
```

## Test Files to Remove

### Component Tests
- `src/pages/PracticePage.test.ts`
- `src/components/practice/SessionHistory.test.ts`
- `src/components/practice/ShareModal.test.ts`
- `src/composables/usePracticeSession.test.ts`
- `src/composables/useSessionHistory.test.ts`
- `src/services/practiceSessionService.test.ts`
- `src/services/practiceAnalyticsService.test.ts`
- `src/services/practiceShareService.test.ts`
- `src/services/practiceHtmlGenerator.test.ts`
- `src/utils/sessionPersistence.test.ts`
- `src/utils/sessionResults.test.ts`

### Integration Tests
- `tests/integration/practice-flow.test.ts`
- `tests/integration/practice-sharing.test.ts`
- `tests/integration/practice-sharing-api.test.ts`

### E2E Tests
- `tests/e2e/practice-questions.e2e.test.ts`
- `tests/e2e/PRACTICE_E2E_TESTING_GUIDE.md`

### Accessibility/Performance Tests
- `tests/accessibility/practice-accessibility.test.ts`
- `tests/responsive/practice-responsive.test.ts`
- `tests/performance/practice-question-performance.test.ts`
- `tests/cross-browser/practice-html-compatibility.test.ts`

## Edge Functions to Preserve

### Keep These Functions
These are related to question generation, not practice sessions:
- `supabase/functions/generate-practice-questions/index.ts`
- `supabase/functions/_shared/agents/practice-questions.ts`
- `supabase/functions/_shared/agents/practice-questions.test.ts`

### Remove These Functions
These are practice session specific:
- `supabase/functions/save-practice-session/index.ts`
- `supabase/functions/save-practice-session/index.test.ts`
- `supabase/functions/fetch-practice-history/index.ts`
- `supabase/functions/cleanup-practice-sessions/index.ts`
- `supabase/functions/cleanup-practice-cache/index.ts`
- `supabase/functions/share-practice-set/index.ts`
- `supabase/functions/get-shared-practice/index.ts`
- `supabase/functions/get-shared-practice/index.test.ts`

## Database Migrations

### No Changes Required

The practice questions table can remain in the database as it stores generated questions that may be useful for future features. The practice sessions table can be left as-is or marked for future cleanup.

## ElevenLabs Design Preservation

### Button Styling Standards

All remaining buttons in SavedWordlistsPage must maintain ElevenLabs aesthetics:

**Primary Button** (View):
```css
class="w-full h-10 px-4 text-[14px] font-semibold text-white bg-black rounded-full hover:bg-gray-800 transition-colors duration-150"
```

**Secondary Button** (Practice, Export):
```css
class="w-full h-10 px-4 text-[14px] font-semibold text-black bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors duration-150"
```

**Destructive Button** (Delete):
```css
class="flex-1 h-10 px-4 text-[14px] font-semibold text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors duration-150"
```

### Design Tokens
- Border radius: `rounded-full` for buttons, `rounded-2xl` for cards
- Spacing: 8px grid system (gap-2, gap-4, p-6, etc.)
- Typography: [14px], [15px], [18px], [20px] with font-semibold/font-medium
- Transitions: `transition-colors duration-150`
- Shadows: `shadow-sm hover:shadow-md`

## Error Handling

### Remove Practice-Specific Errors

Remove error handling related to:
- Practice session initialization failures
- Question generation timeouts (keep if used by question generation API)
- Session save failures
- Share link generation failures

### Keep General Errors

Preserve error handling for:
- Wordlist loading failures
- Export failures
- Delete failures

## Implementation Phases

### Phase 1: Remove Practice Page and Route
1. Remove `/practice` route from router
2. Delete `src/pages/PracticePage.vue`
3. Delete `src/pages/PracticePage.test.ts`

### Phase 2: Remove Practice Components
1. Delete all files in `src/components/practice/`
2. Delete related component tests

### Phase 3: Update SavedWordlistsPage
1. Remove PracticeSetup import
2. Remove practice modal state
3. Remove practice modal from template
4. Update "Practice Questions" button behavior
5. Remove practice-related methods

### Phase 4: Clean Up Services and Utilities
1. Remove practice session services
2. Remove practice session composables
3. Remove practice session utilities
4. Update type definitions

### Phase 5: Remove Tests
1. Delete integration tests
2. Delete E2E tests
3. Delete accessibility/performance tests

### Phase 6: Remove Edge Functions
1. Delete practice session Edge Functions
2. Keep question generation Edge Functions

### Phase 7: Verification
1. Run remaining tests
2. Check for broken imports
3. Verify SavedWordlistsPage renders correctly
4. Verify button styling matches ElevenLabs aesthetic
5. Test navigation doesn't break

## Risk Mitigation

### Potential Issues

1. **Shared Utilities**: Some utilities might be used by other features
   - **Mitigation**: Check all imports before deleting

2. **Type Definitions**: Removing types might break other code
   - **Mitigation**: Search for type usage across codebase

3. **Edge Function Dependencies**: Question generation might depend on session functions
   - **Mitigation**: Review Edge Function dependencies carefully

4. **Broken Links**: External links or bookmarks to `/practice`
   - **Mitigation**: Add redirect from `/practice` to `/wordlists`

## Success Criteria

1. Practice page route is removed or redirects to wordlists
2. All practice session components are deleted
3. SavedWordlistsPage renders without errors
4. "Practice Questions" button maintains ElevenLabs styling
5. No broken imports or type errors
6. All remaining tests pass
7. Application builds successfully
8. No console errors when viewing wordlists

## Future Considerations

If practice sessions need to be re-added in the future:
1. Question generation API and database tables remain intact
2. ElevenLabs design system is well-documented
3. Git history preserves all removed code
4. This spec documents what was removed and why
