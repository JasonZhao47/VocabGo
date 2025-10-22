# Implementation Plan

- [x] 1. Create question transformation utility
  - Create utility function to transform SimplePracticeQuestions to HTML template format
  - Add ID generation for each question
  - Add Mandarin shuffling for matching questions
  - Add hint generation for fill-blank questions
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 2. Create AllQuestionsView component
  - [x] 2.1 Create component file and basic structure
    - Create `src/components/practice/AllQuestionsView.vue`
    - Define props interface (questions, wordlistId, wordlistName)
    - Define emits interface (complete event)
    - Set up reactive state for answers and results
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.2 Implement question rendering logic
    - Create question loop with v-for
    - Implement matching question rendering (two columns)
    - Implement fill-blank question rendering (hint + input)
    - Implement multiple-choice question rendering (sentence + options)
    - Add question header with number and type
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [x] 2.3 Implement matching question interactions
    - Add click handlers for English and Mandarin items
    - Implement selection state management
    - Implement match validation logic
    - Add correct match styling (green border, disabled)
    - Add incorrect match animation (red shake)
    - Integrate mistake recording for incorrect matches
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 2.4 Implement multiple-choice and fill-blank interactions
    - Add click handler for multiple-choice options
    - Add selection highlighting (black border)
    - Add v-model binding for fill-blank inputs
    - _Requirements: 2.4, 2.5_
  
  - [x] 2.5 Implement submission and scoring logic
    - Add "Submit Answers" button at bottom
    - Implement score calculation for all question types
    - Implement mistake recording on submission
    - Display results screen with percentage and count
    - Add "Try Again" button to reload
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [x] 3. Add component styling
  - [x] 3.1 Create scoped styles matching HTML template
    - Add container styles (800px max-width, white background, rounded corners)
    - Add question card styles (gray background, padding, borders)
    - Add matching item styles (white background, hover effects)
    - Add option styles for multiple-choice
    - Add input styles for fill-blank
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 3.2 Add interaction state styles
    - Add selected state (black border, gray background)
    - Add matched state (green border, green background, opacity)
    - Add incorrect state (red border, red background)
    - Add shake animation keyframes
    - Add hover transitions (150ms ease-out)
    - _Requirements: 5.5_
  
  - [x] 3.3 Add responsive styles
    - Add mobile breakpoint (@media max-width: 640px)
    - Stack matching columns vertically on mobile
    - Reduce container padding on mobile
    - Ensure touch-friendly button sizes
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. Update StudentPracticeView to use new component
  - [x] 4.1 Replace PracticeQuestion with AllQuestionsView
    - Import AllQuestionsView component
    - Remove PracticeQuestion import and usage
    - Pass questions, wordlistId, and wordlistName as props
    - Handle complete event to show results
    - _Requirements: 1.1_
  
  - [x] 4.2 Remove single-question state management
    - Remove currentQuestionIndex ref
    - Remove answeredQuestions ref
    - Remove handleQuestionAnswered function
    - Remove progress indicator UI
    - _Requirements: 1.1_
  
  - [x] 4.3 Update completion handling
    - Update completion card to use emitted score data
    - Keep personal mistakes accordion (unchanged)
    - Maintain student info header (unchanged)
    - _Requirements: 3.4, 3.5_

- [x] 5. Manual testing and verification
  - Test all three question types render correctly
  - Test matching question interactions (select, match, incorrect shake)
  - Test multiple-choice selection
  - Test fill-blank input
  - Test submission and score calculation
  - Test results display
  - Test mistake recording integration
  - Test responsive behavior on mobile
  - Compare visual appearance with downloaded HTML template
  - _Requirements: All_
