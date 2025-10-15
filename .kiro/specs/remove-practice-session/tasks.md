# Implementation Plan

- [x] 1. Remove practice page and router configuration
  - Remove `/practice` route from `src/router/index.ts`
  - Add redirect from `/practice` to `/wordlists` for old bookmarks
  - Delete `src/pages/PracticePage.vue`
  - Delete `src/pages/PracticePage.test.ts`
  - _Requirements: 1.4, 3.1, 3.2_

- [x] 2. Remove practice component files
  - [x] 2.1 Delete question type components
    - Delete `src/components/practice/MultipleChoiceQuestion.vue`
    - Delete `src/components/practice/FillBlankQuestion.vue`
    - Delete `src/components/practice/MatchingQuestion.vue`
    - _Requirements: 1.2, 4.1_
  
  - [x] 2.2 Delete session components
    - Delete `src/components/practice/PracticeSession.vue`
    - Delete `src/components/practice/PracticeSetup.vue`
    - Delete `src/components/practice/ResultsView.vue`
    - Delete `src/components/practice/SessionHistory.vue`
    - Delete `src/components/practice/AnalyticsDashboard.vue`
    - _Requirements: 1.1, 1.2, 4.1_
  
  - [x] 2.3 Delete supporting components
    - Delete `src/components/practice/ShareModal.vue`
    - Check if `src/components/practice/ErrorDisplay.vue` is used elsewhere before deleting
    - Delete `src/components/practice/index.ts`
    - _Requirements: 1.2, 4.1_

- [x] 3. Update SavedWordlistsPage component
  - [x] 3.1 Remove practice imports and state
    - Remove PracticeSetup component import
    - Remove practice modal state variables (`showPracticeSetup`, `practiceWordlist`, `isGeneratingQuestions`)
    - Remove QuestionType import if not needed elsewhere
    - _Requirements: 1.1, 2.1_
  
  - [x] 3.2 Remove practice modal from template
    - Remove practice setup modal div and PracticeSetup component from template
    - _Requirements: 1.1, 2.1_
  
  - [x] 3.3 Update practice button behavior
    - Remove `startPractice()` method
    - Remove `handleGenerateQuestions()` method
    - Remove `closePracticeSetup()` method
    - Keep "Practice Questions" button with disabled state and tooltip
    - Ensure button maintains ElevenLabs styling (rounded-full, proper spacing, hover states)
    - _Requirements: 1.2, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Remove practice composables
  - Check if `src/composables/usePracticeSession.ts` is used elsewhere, then delete
  - Check if `src/composables/useSessionHistory.ts` is used elsewhere, then delete
  - _Requirements: 4.2_

- [x] 5. Remove practice services
  - Delete `src/services/practiceSessionService.ts`
  - Delete `src/services/practiceAnalyticsService.ts`
  - Delete `src/services/practiceShareService.ts`
  - Check if `src/services/practiceHtmlGenerator.ts` is needed, then delete if not
  - Check if `src/services/htmlGenerationService.ts` is needed, then delete if not
  - Verify `src/services/practiceQuestionService.ts` is preserved (needed for question generation API)
  - _Requirements: 4.2_

- [x] 6. Remove practice utilities
  - Delete `src/utils/sessionPersistence.ts`
  - Delete `src/utils/sessionResults.ts`
  - Check if `src/utils/practiceErrorHandler.ts` is used elsewhere before deleting
  - _Requirements: 4.2_

- [x] 7. Clean up type definitions
  - Review `src/types/practice.ts`
  - Keep types used by question generation (`Question`, `QuestionType`, `Answer`)
  - Remove session-specific types (`PracticeSession`, `SessionResults`, `PracticeSet`)
  - _Requirements: 4.2_

- [x] 8. Remove component test files
  - Delete `src/components/practice/SessionHistory.test.ts`
  - Delete `src/components/practice/ShareModal.test.ts`
  - Delete `src/composables/usePracticeSession.test.ts`
  - Delete `src/composables/useSessionHistory.test.ts`
  - Delete `src/services/practiceSessionService.test.ts`
  - Delete `src/services/practiceAnalyticsService.test.ts`
  - Delete `src/services/practiceShareService.test.ts`
  - Delete `src/services/practiceHtmlGenerator.test.ts`
  - Delete `src/utils/sessionPersistence.test.ts`
  - Delete `src/utils/sessionResults.test.ts`
  - _Requirements: 4.5_

- [x] 9. Remove integration and E2E tests
  - Delete `tests/integration/practice-flow.test.ts`
  - Delete `tests/integration/practice-sharing.test.ts`
  - Delete `tests/integration/practice-sharing-api.test.ts`
  - Delete `tests/e2e/practice-questions.e2e.test.ts`
  - Delete `tests/e2e/PRACTICE_E2E_TESTING_GUIDE.md`
  - _Requirements: 4.5_

- [x] 10. Remove accessibility and performance tests
  - Delete `tests/accessibility/practice-accessibility.test.ts`
  - Delete `tests/responsive/practice-responsive.test.ts`
  - Delete `tests/performance/practice-question-performance.test.ts`
  - Delete `tests/cross-browser/practice-html-compatibility.test.ts`
  - _Requirements: 4.5_

- [x] 11. Remove practice session Edge Functions
  - Delete `supabase/functions/save-practice-session/index.ts`
  - Delete `supabase/functions/save-practice-session/index.test.ts`
  - Delete `supabase/functions/fetch-practice-history/index.ts`
  - Delete `supabase/functions/cleanup-practice-sessions/index.ts`
  - Delete `supabase/functions/cleanup-practice-cache/index.ts`
  - Delete `supabase/functions/share-practice-set/index.ts`
  - Delete `supabase/functions/get-shared-practice/index.ts`
  - Delete `supabase/functions/get-shared-practice/index.test.ts`
  - Verify question generation functions are preserved (`generate-practice-questions`, `_shared/agents/practice-questions.ts`)
  - _Requirements: 4.2_

- [x] 12. Verify and test changes
  - [x] 12.1 Run type checking
    - Execute `pnpm type-check` to verify no TypeScript errors
    - Fix any broken imports or type references
    - _Requirements: 3.3_
  
  - [x] 12.2 Run remaining tests
    - Execute `pnpm test` to ensure all remaining tests pass
    - Fix any test failures related to removed code
    - _Requirements: 4.5_
  
  - [x] 12.3 Build verification
    - Execute `pnpm build` to ensure application builds successfully
    - Verify no build errors or warnings related to removed code
    - _Requirements: 3.3_
  
  - [x] 12.4 Manual testing
    - Start dev server with `pnpm dev`
    - Navigate to `/wordlists` page
    - Verify SavedWordlistsPage renders without errors
    - Verify "Practice Questions" button is visible and styled correctly
    - Verify button is disabled for wordlists with < 4 words
    - Verify tooltip shows appropriate message
    - Attempt to navigate to `/practice` and verify redirect to `/wordlists`
    - Check browser console for any errors
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4, 3.2, 5.1, 5.2, 5.3, 5.4, 5.5_
