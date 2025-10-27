# Requirements Document - Adjustable Word Count Feature

## Introduction

The current AI wordlist extraction system has a hardcoded 40-word limit that is too restrictive for users who want more comprehensive wordlists or too generous for users who want focused vocabulary lists. This feature adds a user-configurable word count setting with a slider interface that persists across sessions.

## Glossary

- **Word Count Setting**: User-configurable parameter that determines the maximum number of words to extract from a document
- **Slider Control**: A draggable UI component that allows users to adjust the word count setting
- **localStorage**: Browser storage mechanism for persisting user preferences across sessions
- **Extractor Agent**: The AI agent responsible for extracting vocabulary words from documents
- **Process Document Function**: The backend edge function that orchestrates document processing

## Requirements

### Requirement 1: Implement Adjustable Word Count Slider UI

**User Story:** As a user, I want to control how many words are extracted from my document using a slider, so that I can get more or fewer words based on my needs.

#### Acceptance Criteria

1. WHEN the upload page loads, THE System SHALL display a slider control labeled "Words to extract" with the current value shown
2. WHEN the user drags the slider, THE System SHALL update the displayed value in real-time
3. WHEN the user adjusts the slider, THE System SHALL allow values between 10 and 200 words
4. WHEN no custom value is set, THE System SHALL default to 40 words
5. WHEN the slider is displayed, THE System SHALL show tick marks or labels at key intervals (10, 50, 100, 150, 200)

### Requirement 2: Persist User Word Count Preference

**User Story:** As a user, I want my word count preference to be remembered across sessions, so that I don't have to adjust it every time.

#### Acceptance Criteria

1. WHEN the user changes the word count slider, THE System SHALL save the value to browser localStorage
2. WHEN the upload page loads, THE System SHALL retrieve the saved word count preference from localStorage
3. WHEN no saved preference exists, THE System SHALL use the default value of 40 words
4. WHEN the user clears browser data, THE System SHALL revert to the default value of 40 words
5. WHEN the saved value is outside the valid range, THE System SHALL clamp it to the nearest valid value (10-200)

### Requirement 3: Update Backend to Accept Variable Word Count

**User Story:** As a system, I want to accept word count as a parameter in the document processing request, so that extraction can be customized per upload.

#### Acceptance Criteria

1. WHEN the process-document function receives a request, THE System SHALL accept an optional maxWords parameter
2. WHEN maxWords is not provided, THE System SHALL default to 40 words for backward compatibility
3. WHEN maxWords is provided, THE System SHALL validate it is between 10 and 200
4. WHEN maxWords is outside the valid range, THE System SHALL clamp it to the nearest valid value (10-200)
5. WHEN calling the extractor agent, THE System SHALL pass the validated maxWords value

### Requirement 4: Pass Word Count from Frontend to Backend

**User Story:** As a system, I want the frontend to send the user's word count preference to the backend, so that extraction uses the correct limit.

#### Acceptance Criteria

1. WHEN the user clicks "Process Document", THE Frontend SHALL include the current word count value in the API request
2. WHEN the upload service constructs the request, THE System SHALL add maxWords to the request body
3. WHEN the request is sent, THE System SHALL ensure maxWords is a valid integer
4. WHEN the backend responds, THE Frontend SHALL display the actual number of words extracted
5. WHEN extraction completes, THE System SHALL show if fewer words were extracted than requested

### Requirement 5: Provide User Guidance on Word Count Selection

**User Story:** As a user, I want to understand what different word count values mean, so that I can choose an appropriate setting.

#### Acceptance Criteria

1. WHEN the slider is displayed, THE System SHALL show helper text explaining the word count setting
2. WHEN the word count is below 30, THE System SHALL indicate this is suitable for "focused vocabulary"
3. WHEN the word count is between 30 and 80, THE System SHALL indicate this is suitable for "balanced learning"
4. WHEN the word count is above 80, THE System SHALL indicate this is suitable for "comprehensive coverage"
5. WHEN the slider is displayed, THE System SHALL note that higher word counts may increase processing time
