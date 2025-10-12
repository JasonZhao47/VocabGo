# Requirements Document

## Introduction

Users are experiencing a "Failed to Load Practice Session" error when attempting to create practice questions from wordlists. The error occurs because the `PracticePage.vue` component incorrectly initializes the practice session composable with empty questions before the questions are generated, and never properly updates the composable with the actual generated questions.

## Requirements

### Requirement 1: Fix Practice Session Initialization

**User Story:** As a user, I want to successfully start a practice session from my wordlist, so that I can practice my vocabulary.

#### Acceptance Criteria

1. WHEN a user navigates to the practice page with a wordlist ID THEN the system SHALL generate practice questions before initializing the session
2. WHEN practice questions are successfully generated THEN the system SHALL create a complete PracticeSet object with all questions
3. WHEN the PracticeSet is created THEN the system SHALL initialize usePracticeSession with the complete question data
4. WHEN the session is initialized THEN the user SHALL see the first practice question
5. IF question generation fails THEN the system SHALL display a clear error message with retry option

### Requirement 2: Proper State Management

**User Story:** As a user, I want the practice session to maintain proper state throughout my practice, so that my progress is tracked correctly.

#### Acceptance Criteria

1. WHEN the practice session is initialized THEN all session state SHALL be properly managed by usePracticeSession
2. WHEN a user answers a question THEN the answer SHALL be recorded in the session state
3. WHEN a user navigates between questions THEN the navigation SHALL update the session state
4. WHEN a user completes the session THEN the results SHALL be calculated from the session state
5. WHEN a user pauses/resumes THEN the timer state SHALL be properly managed

### Requirement 3: Error Handling and Recovery

**User Story:** As a user, I want clear feedback when something goes wrong, so that I know how to proceed.

#### Acceptance Criteria

1. WHEN question generation fails THEN the system SHALL display the specific error message
2. WHEN an error occurs THEN the user SHALL have the option to retry
3. WHEN the user clicks retry THEN the system SHALL attempt to regenerate questions
4. WHEN the user clicks "Back to Wordlists" THEN the system SHALL navigate back without errors
5. IF the wordlist has insufficient words THEN the system SHALL display a helpful message explaining the minimum requirement
