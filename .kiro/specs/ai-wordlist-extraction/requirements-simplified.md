# Requirements Document - Simplified MVP

## Introduction

VocabGo is an AI-powered bilingual wordlist generator that helps English learners extract vocabulary from documents. This simplified version focuses on core functionality without overengineering.

## Requirements

### Requirement 1: Document Upload

**User Story:** As an English learner, I want to upload a document, so that I can extract vocabulary from it.

#### Acceptance Criteria

1. WHEN user selects a file THEN system SHALL accept PDF, TXT, DOCX, or XLSX formats
2. WHEN user uploads an invalid file type THEN system SHALL display an error message
3. WHEN file size exceeds 50MB THEN system SHALL reject the upload with an error message
4. WHEN upload is successful THEN system SHALL start processing immediately

### Requirement 2: Document Processing

**User Story:** As a user, I want my document to be processed automatically, so that I can get a wordlist without manual work.

#### Acceptance Criteria

1. WHEN document is uploaded THEN system SHALL parse the document to extract text
2. WHEN text is extracted THEN system SHALL clean the text using regex patterns to remove headers, footers, and page numbers
3. WHEN text is cleaned THEN system SHALL use AI to extract up to 40 English words
4. WHEN words are extracted THEN system SHALL use AI to generate Mandarin translations
5. WHEN processing completes THEN system SHALL display the wordlist to the user

### Requirement 3: Word Extraction

**User Story:** As a user, I want the system to identify key vocabulary words, so that I can focus on the most important terms.

#### Acceptance Criteria

1. WHEN extracting words THEN system SHALL identify up to 40 English words per document
2. WHEN extracting words THEN system SHALL filter out duplicates
3. WHEN extracting words THEN system SHALL prioritize content words over function words

### Requirement 4: Translation

**User Story:** As an English learner, I want Mandarin translations for each word, so that I can understand the meanings.

#### Acceptance Criteria

1. WHEN translating words THEN system SHALL generate Mandarin translation for each English word
2. WHEN translating words THEN system SHALL provide contextually appropriate translations
3. WHEN translation completes THEN system SHALL return word pairs (English, Mandarin)

### Requirement 5: Display Results

**User Story:** As a user, I want to see my wordlist clearly, so that I can review and use it.

#### Acceptance Criteria

1. WHEN processing completes THEN system SHALL display wordlist in a table with English and Mandarin columns
2. WHEN displaying wordlist THEN system SHALL show the word count
3. WHEN displaying wordlist THEN system SHALL show the document filename

### Requirement 6: Save Wordlists

**User Story:** As a user, I want to save my wordlists, so that I can access them later.

#### Acceptance Criteria

1. WHEN user clicks save THEN system SHALL store the wordlist in the database
2. WHEN wordlist is saved THEN system SHALL associate it with the user
3. WHEN user navigates to saved wordlists page THEN system SHALL display all saved wordlists

### Requirement 7: View Saved Wordlists

**User Story:** As a user, I want to view my saved wordlists, so that I can review vocabulary from previous documents.

#### Acceptance Criteria

1. WHEN user opens saved wordlists page THEN system SHALL display list of saved wordlists
2. WHEN user clicks on a wordlist THEN system SHALL display the full word pairs
3. WHEN user clicks delete THEN system SHALL remove the wordlist after confirmation

### Requirement 8: Error Handling

**User Story:** As a user, I want clear error messages, so that I know what went wrong and what to do.

#### Acceptance Criteria

1. WHEN an error occurs THEN system SHALL display a user-friendly error message
2. WHEN LLM call fails THEN system SHALL retry up to 3 times
3. WHEN processing fails after retries THEN system SHALL show an error with the document name

### Requirement 9: Basic Storage Management

**User Story:** As a system administrator, I want uploaded files to be cleaned up, so that storage costs don't accumulate.

#### Acceptance Criteria

1. WHEN file is uploaded THEN system SHALL store it temporarily
2. WHEN file is older than 24 hours THEN system SHALL delete it automatically
