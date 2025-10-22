# Requirements Document

## Introduction

This feature ensures that shared practice questions accessed via share links display in the same format as downloaded HTML practice files. Currently, shared practice sessions show questions one at a time (single-question view), while downloaded HTML files show all questions at once (all-questions view). This inconsistency creates a confusing user experience where students expect the same format regardless of how they access the practice questions.

## Glossary

- **Shared Practice Session**: Practice questions accessed through a share link (e.g., `/practice/{shareToken}`)
- **Downloaded Practice HTML**: Standalone HTML file generated for offline practice
- **StudentPracticeView**: Vue component that renders shared practice sessions
- **PracticeHtmlGenerator**: Service that generates standalone HTML files
- **All-Questions Format**: Display format where all questions are visible simultaneously on a single page
- **Single-Question Format**: Display format where questions are shown one at a time with navigation
- **Question Types**: Matching, Fill-in-the-Blank, and Multiple Choice question formats

## Requirements

### Requirement 1: Unified Question Display Format

**User Story:** As a student accessing shared practice questions, I want to see all questions displayed at once in the same format as downloaded HTML files, so that I have a consistent practice experience regardless of access method.

#### Acceptance Criteria

1. WHEN THE StudentPracticeView loads practice questions, THE System SHALL display all questions simultaneously on a single scrollable page
2. WHEN THE StudentPracticeView renders questions, THE System SHALL use the same visual styling as the downloaded HTML template
3. WHEN THE StudentPracticeView displays matching questions, THE System SHALL show English words in the left column and shuffled Mandarin translations in the right column
4. WHEN THE StudentPracticeView displays fill-in-the-blank questions, THE System SHALL show the sentence with a hint (first letter + underscores) and an input field
5. WHEN THE StudentPracticeView displays multiple-choice questions, THE System SHALL show the sentence with four option buttons

### Requirement 2: Interactive Question Behavior

**User Story:** As a student practicing vocabulary, I want interactive feedback on my answers that matches the downloaded HTML behavior, so that I can learn from my mistakes immediately.

#### Acceptance Criteria

1. WHEN THE student selects a matching pair, THE System SHALL provide immediate visual feedback (green for correct, red shake animation for incorrect)
2. WHEN THE student makes an incorrect match, THE System SHALL record the mistake and clear the selection after the animation
3. WHEN THE student makes a correct match, THE System SHALL mark both items as matched and prevent further interaction with them
4. WHEN THE student selects a multiple-choice option, THE System SHALL highlight the selected option with a black border
5. WHEN THE student types in a fill-in-the-blank field, THE System SHALL accept the input without immediate validation

### Requirement 3: Submission and Results

**User Story:** As a student completing practice questions, I want to submit all my answers at once and see my overall score, so that I can assess my vocabulary knowledge comprehensively.

#### Acceptance Criteria

1. WHEN THE student has answered questions, THE System SHALL display a "Submit Answers" button at the bottom of the page
2. WHEN THE student clicks "Submit Answers", THE System SHALL calculate the score based on all question responses
3. WHEN THE System calculates the score, THE System SHALL count matching questions as correct only if all pairs are matched
4. WHEN THE System displays results, THE System SHALL show the percentage score and the number of correct answers out of total questions
5. WHEN THE System displays results, THE System SHALL provide a "Try Again" button to reload the practice session

### Requirement 4: Mistake Tracking Integration

**User Story:** As a teacher monitoring student progress, I want mistakes to be recorded during shared practice sessions, so that I can identify which words students struggle with.

#### Acceptance Criteria

1. WHEN THE student makes an incorrect match in a matching question, THE System SHALL record the mistake with the word, translation, and question type
2. WHEN THE student submits answers with incorrect multiple-choice selections, THE System SHALL record each incorrect answer as a mistake
3. WHEN THE student submits answers with incorrect fill-in-the-blank responses, THE System SHALL record each incorrect answer as a mistake
4. WHEN THE student completes a matching question with unmatched pairs, THE System SHALL record each unmatched pair as a mistake
5. WHERE THE student session token is available, THE System SHALL associate recorded mistakes with the student's session

### Requirement 5: Visual Consistency

**User Story:** As a student switching between downloaded and shared practice, I want the visual appearance to be identical, so that I don't need to learn different interfaces.

#### Acceptance Criteria

1. THE System SHALL use the same color scheme for both shared and downloaded practice (white background, gray borders, black text)
2. THE System SHALL use the same typography (system fonts, 15px body text, 28px title)
3. THE System SHALL use the same spacing and layout (800px max width, 32px padding, 16px gaps)
4. THE System SHALL use the same border radius values (16px for container, 12px for questions, 8px for options)
5. THE System SHALL use the same transition animations (150ms ease-out for hovers, 300ms for shake animation)

### Requirement 6: Responsive Behavior

**User Story:** As a student using a mobile device, I want the shared practice questions to adapt to my screen size, so that I can practice vocabulary on any device.

#### Acceptance Criteria

1. WHEN THE viewport width is below 640px, THE System SHALL reduce container padding to 20px
2. WHEN THE viewport width is below 640px, THE System SHALL stack matching columns vertically instead of side-by-side
3. WHEN THE viewport width is below 640px, THE System SHALL maintain readable font sizes and touch-friendly button sizes
4. THE System SHALL ensure all interactive elements have sufficient touch target sizes (minimum 44px height)
5. THE System SHALL maintain visual hierarchy and readability across all screen sizes
