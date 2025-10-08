# Requirements Document

## Introduction

This feature enables English learners to upload documents in various formats (PDF, TXT, DOCX, XLSX) and automatically generate bilingual English-Mandarin wordlists using a hybrid processing pipeline. The system employs a three-stage pipeline: a traditional text cleaning service removes noise using regex patterns and heuristics, an AI "Extractor" agent identifies up to 40 key English words, and an AI "Translator" agent provides Mandarin translations. Users can preview and export their wordlists in multiple formats.

The feature targets English learners who want to efficiently build structured vocabulary lists from their reading materials without manual word selection and translation.

## Requirements

### Requirement 1: Document Upload and Validation

**User Story:** As an English learner, I want to upload documents in multiple formats, so that I can generate wordlists from any of my reading materials.

#### Acceptance Criteria

1. WHEN a user selects a file to upload THEN the system SHALL accept PDF, TXT, DOCX, and XLSX file formats
2. WHEN a user attempts to upload an unsupported file format THEN the system SHALL display an error message indicating supported formats
3. WHEN a file is successfully uploaded THEN the system SHALL validate the file size and reject files exceeding the maximum limit
4. WHEN multiple files are selected THEN the system SHALL queue them for sequential processing
5. IF the global concurrent upload limit (5 uploads) is reached THEN the system SHALL queue additional uploads and notify the user of their position

### Requirement 2: Document Preprocessing and Text Cleaning

**User Story:** As a user, I want the system to automatically filter out irrelevant content from my documents, so that I receive only meaningful vocabulary words.

#### Acceptance Criteria

1. WHEN a document is uploaded THEN the text cleaning service SHALL analyze the document structure using regex patterns and heuristics
2. WHEN the cleaning service processes a document THEN it SHALL identify and remove headers, footers, page numbers, indexes, captions, and formatting artifacts
3. WHEN the cleaning service completes processing THEN it SHALL filter out at least 90% of unrelated content
4. WHEN the cleaning service generates a cleanliness score THEN the system SHALL use this score internally for monitoring without displaying it to the user
5. WHEN the cleaning service produces cleaned text THEN it SHALL preserve the meaningful content for word extraction

### Requirement 3: English Word Extraction

**User Story:** As an English learner, I want the system to identify key English words from my document, so that I can focus on learning relevant vocabulary.

#### Acceptance Criteria

1. WHEN cleaned text is available THEN the LLM "Extractor" agent SHALL identify valid English words
2. WHEN the Extractor agent processes text THEN it SHALL filter out non-word content, duplicates, and high-frequency stop words
3. WHEN the Extractor agent completes extraction THEN it SHALL return a maximum of 40 words per document
4. WHEN the Extractor agent identifies words THEN at least 95% SHALL be valid English vocabulary words
5. IF a document contains fewer than 40 extractable words THEN the system SHALL return all valid words found
6. WHEN word extraction is complete THEN the system SHALL validate that the word count does not exceed 40 words

### Requirement 4: Mandarin Translation Generation

**User Story:** As an English learner studying Mandarin, I want each English word translated to Mandarin, so that I can understand the meanings and build bilingual vocabulary.

#### Acceptance Criteria

1. WHEN English words are extracted THEN the LLM "Translator" agent SHALL generate Mandarin translations for each word
2. WHEN the Translator agent processes common vocabulary THEN it SHALL achieve at least 95% translation accuracy
3. WHEN the Translator agent encounters rare or specialized words THEN it SHALL provide a fallback translation with appropriate context
4. WHEN translations are generated THEN the system SHALL pair each English word with its corresponding Mandarin translation
5. IF a word has multiple meanings THEN the Translator agent SHALL provide the most contextually appropriate translation based on document content

### Requirement 5: Wordlist Preview and Export

**User Story:** As a user, I want to preview and export my generated wordlist, so that I can review the vocabulary and use it for studying.

#### Acceptance Criteria

1. WHEN word extraction and translation are complete THEN the system SHALL display a preview of the bilingual wordlist
2. WHEN the user views the wordlist preview THEN it SHALL show English words paired with their Mandarin translations
3. WHEN the user chooses to export THEN the system SHALL offer CSV and XLSX format options
4. WHEN the user exports to CSV or XLSX THEN the file SHALL be generated without encoding errors
5. WHEN the user exports a wordlist THEN the system SHALL include both English and Mandarin columns with proper headers

### Requirement 6: Processing Performance and Reliability

**User Story:** As a user, I want my documents processed quickly and reliably, so that I can get my wordlists without long waits or failures.

#### Acceptance Criteria

1. WHEN a 30-page PDF is uploaded THEN the system SHALL complete processing within 30 seconds
2. WHEN an LLM agent call times out or fails THEN the system SHALL automatically retry up to 3 times with exponential backoff
3. WHEN processing fails after all retries THEN the system SHALL notify the user with a clear error message
4. WHEN multiple documents are being processed THEN the system SHALL enforce a global limit of 5 concurrent uploads
5. WHEN LLM agents process large documents THEN the system SHALL use chunked streaming for documents exceeding 30,000 tokens

### Requirement 7: File Storage and Security

**User Story:** As a user, I want my uploaded documents handled securely and not stored permanently, so that my privacy is protected.

#### Acceptance Criteria

1. WHEN a file is uploaded THEN the system SHALL store it temporarily in secure storage
2. WHEN 24 hours have elapsed since upload THEN the system SHALL automatically delete the file unless the user has saved the wordlist
3. WHEN a user saves a wordlist THEN the system SHALL retain only the wordlist data, not the original document
4. WHEN a file is being processed THEN the system SHALL ensure it is not accessible to other users
5. IF a user explicitly deletes an upload THEN the system SHALL immediately remove the file from storage

### Requirement 8: Upload Rate Limiting and Anti-Abuse

**User Story:** As a system administrator, I want to prevent users from circumventing the 40-word limit by rapidly uploading multiple documents, so that the system remains fair and performant.

#### Acceptance Criteria

1. WHEN a user completes an upload THEN the system SHALL enforce a cooldown period before allowing another upload from the same session
2. WHEN a user attempts to upload during the cooldown period THEN the system SHALL display the remaining wait time
3. WHEN the system detects rapid successive uploads from the same user THEN it SHALL apply rate limiting based on session or token
4. WHEN the global concurrent upload limit is reached THEN new uploads SHALL be queued with visible queue position
5. IF a user refreshes the page during processing THEN the system SHALL maintain the upload state and prevent duplicate submissions

### Requirement 9: System Observability and Cost Control

**User Story:** As a system administrator, I want to monitor LLM usage and text processing effectiveness, so that I can optimize performance and control expenses.

#### Acceptance Criteria

1. WHEN an LLM agent makes a call THEN the system SHALL log the prompt, token count, latency, and confidence metrics
2. WHEN processing completes THEN the system SHALL record total tokens used by each AI agent (Extractor, Translator)
3. WHEN text cleaning completes THEN the system SHALL log cleaning metrics (patterns removed, cleanliness score, processing time)
4. WHEN a document exceeds the token limit THEN the system SHALL apply chunking strategies to stay within limits
5. WHEN system metrics are collected THEN they SHALL be accessible for analysis and cost tracking
6. IF token usage approaches budget limits THEN the system SHALL alert administrators

### Requirement 10: Saved Wordlists Management

**User Story:** As a user, I want to save and manage my generated wordlists, so that I can access them later for studying.

#### Acceptance Criteria

1. WHEN a wordlist is generated THEN the user SHALL have the option to save it to their account
2. WHEN a user saves a wordlist THEN it SHALL be stored persistently in the database
3. WHEN a user views their saved wordlists THEN the system SHALL display a list with document names and creation dates
4. WHEN a user selects a saved wordlist THEN the system SHALL display the full bilingual word pairs
5. WHEN a user deletes a saved wordlist THEN the system SHALL remove it from their account permanently
