# Requirements Document

## Introduction

This feature adds AI-powered practice question generation to VocabGo, enabling English learners to actively practice vocabulary from their wordlists. The system will generate three types of interactive questions (matching, fill-in-the-blank, and multiple choice) based on saved wordlists, helping students reinforce their learning through varied practice exercises.

## Requirements

### Requirement 1: Question Generation from Wordlists

**User Story:** As an English learner, I want to generate practice questions from my saved wordlists, so that I can actively test my vocabulary knowledge beyond passive review.

#### Acceptance Criteria

1. WHEN a user views a saved wordlist THEN the system SHALL display a "Generate Practice Questions" action button
2. WHEN a user clicks "Generate Practice Questions" THEN the system SHALL invoke an AI agent to create questions for all three question types
3. WHEN question generation is in progress THEN the system SHALL display a loading indicator with estimated time
4. WHEN question generation completes THEN the system SHALL display the generated questions in an interactive practice interface
5. IF a wordlist contains fewer than 4 words THEN the system SHALL display a message indicating minimum word count requirements
6. WHEN question generation fails THEN the system SHALL display an error message and allow retry

### Requirement 2: Matching Question Type

**User Story:** As an English learner, I want to match English words with their Mandarin translations, so that I can practice word-translation associations.

#### Acceptance Criteria

1. WHEN matching questions are generated THEN the system SHALL create a set of English words in one column and shuffled Mandarin translations in another column
2. WHEN a user interacts with matching questions THEN the system SHALL use click-to-connect pairing (click first item, then click matching item)
3. WHEN a user completes a match THEN the system SHALL draw an animated visual line connecting the paired items
4. WHEN drawing connection lines THEN the system SHALL use animations consistent with ElevenLabs.io aesthetic (smooth, elegant transitions)
5. WHEN all matches are completed THEN the system SHALL display the total score and highlight incorrect matches with visual feedback
6. WHEN a user submits their matches THEN the system SHALL show the correct pairings for any mistakes
7. WHEN generating matching questions THEN the system SHALL limit each set to a maximum of 10 pairs

### Requirement 3: Fill-in-the-Blank Question Type

**User Story:** As an English learner, I want to complete sentences with vocabulary words, so that I can practice using words in context.

#### Acceptance Criteria

1. WHEN fill-in-the-blank questions are generated THEN the AI SHALL generate practice sentences specifically for this question type
2. WHEN a sentence is displayed THEN the system SHALL show a blank space where the vocabulary word should appear
3. WHEN a user types an answer THEN the system SHALL accept the answer and provide immediate feedback upon submission
4. WHEN checking answers THEN the system SHALL accept correct spelling variations and common typos with a similarity threshold
5. WHEN an answer is incorrect THEN the system SHALL display the correct word and the complete sentence
6. WHEN generating fill-in-the-blank questions THEN the system SHALL create a maximum of 10 questions per set
7. WHEN generating sentences THEN the AI SHALL create contextually appropriate sentences that demonstrate proper word usage

### Requirement 4: Multiple Choice Question Type

**User Story:** As an English learner, I want to select correct translations or definitions from multiple options, so that I can test my recognition of vocabulary meanings.

#### Acceptance Criteria

1. WHEN multiple choice questions are generated THEN the AI SHALL generate practice sentences with the vocabulary word used in context
2. WHEN a question is displayed THEN the system SHALL show the practice sentence and 4 answer options for the vocabulary word's meaning
3. WHEN a user selects an answer THEN the system SHALL provide immediate feedback indicating correct or incorrect
4. WHEN an answer is incorrect THEN the system SHALL highlight the correct answer
5. WHEN generating distractors THEN the AI SHALL create plausible but incorrect translations that are contextually similar
6. IF a wordlist has fewer than 4 unique translations THEN the system SHALL supplement with semantically related words as distractors
7. WHEN generating multiple choice questions THEN the system SHALL create a maximum of 10 questions per set

### Requirement 5: Practice Session Management with Timer

**User Story:** As an English learner, I want to save and review my practice session results with timed challenges, so that I can track my progress and improve my speed.

#### Acceptance Criteria

1. WHEN starting a practice session THEN the system SHALL allow users to set a timer (optional, with presets: 5, 10, 15, 20 minutes or custom)
2. WHEN a timer is active THEN the system SHALL display a countdown timer prominently on the practice interface
3. WHEN the timer expires THEN the system SHALL automatically submit all answers and display results
4. WHEN a practice session is completed THEN the system SHALL save the session results including score, time taken, question types, and timestamp
5. WHEN viewing a wordlist THEN the system SHALL display previous practice session history with dates, scores, and completion times
6. WHEN a user wants to practice again THEN the system SHALL offer options to "Generate New Questions" or "Retry Previous Questions"
7. WHEN practice results are saved THEN the system SHALL associate them with the specific wordlist and session ID
8. IF a user has not saved the wordlist THEN the system SHALL prompt them to save before generating questions
9. WHEN viewing practice history THEN the system SHALL display trends showing improvement over multiple sessions

### Requirement 6: Practice Set Sharing and Distribution

**User Story:** As an English learner, I want to share practice question sets via links, so that I can practice offline or share with classmates.

#### Acceptance Criteria

1. WHEN a practice set is generated THEN the system SHALL create a static HTML page with all questions
2. WHEN a user wants to share THEN the system SHALL generate a unique, secure URL for the practice set
3. WHEN accessing a shared practice URL THEN the system SHALL serve the static HTML page without requiring authentication
4. WHEN viewing a shared practice set THEN the system SHALL display all questions in a clean, standalone format
5. WHEN a user clicks "Share" THEN the system SHALL provide options to copy the URL or copy the entire HTML content
6. WHEN managing practice sets THEN the system SHALL store and track all generated practice URLs in the database
7. WHEN a practice set is deleted THEN the system SHALL invalidate the associated sharing URL
8. WHEN generating the HTML page THEN the system SHALL include all interactive functionality (timer, scoring) as self-contained JavaScript

### Requirement 7: AI Question Quality and Performance

**User Story:** As a user, I want questions to be generated quickly and accurately, so that I can start practicing without delays.

#### Acceptance Criteria

1. WHEN generating questions for a 40-word wordlist THEN the system SHALL complete generation within 10 seconds
2. WHEN the AI generates questions THEN the system SHALL ensure grammatically correct sentences and contextually appropriate usage
3. WHEN generating multiple choice distractors THEN the AI SHALL avoid using words from the same wordlist as distractors
4. WHEN generating fill-in-the-blank sentences THEN the AI SHALL create sentences at an appropriate difficulty level for English learners
5. IF AI generation takes longer than 15 seconds THEN the system SHALL display a progress message
6. WHEN generation fails THEN the system SHALL retry up to 2 times before showing an error
7. WHEN questions are generated THEN the system SHALL validate that all three question types have been successfully created

### Requirement 8: Accessibility and User Experience

**User Story:** As an English learner, I want an intuitive and accessible practice interface, so that I can focus on learning rather than navigating the interface.

#### Acceptance Criteria

1. WHEN practicing questions THEN the system SHALL support keyboard navigation for all interactions
2. WHEN displaying questions THEN the system SHALL use clear visual hierarchy and readable typography
3. WHEN providing feedback THEN the system SHALL use color-blind friendly indicators (not relying solely on color)
4. WHEN a user is on mobile THEN the system SHALL provide a responsive interface optimized for touch interactions
5. WHEN questions are displayed THEN the system SHALL show progress indicators (e.g., "Question 5 of 15")
6. WHEN a user wants to pause THEN the system SHALL allow saving progress and resuming later
7. WHEN displaying Mandarin characters THEN the system SHALL use appropriate font sizes for readability
