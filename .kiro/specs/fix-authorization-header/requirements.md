# Requirements Document

## Introduction

This feature addresses a critical bug where edge function calls from the frontend are failing due to missing Authorization headers. Supabase Edge Functions require both the `apikey` header and the `Authorization: Bearer <token>` header for successful requests. Currently, the frontend wordlist service only sends the `apikey` header, causing all wordlist operations (fetch, save, delete) to fail with "Missing authorization header" errors.

This fix ensures that all edge function calls include the proper authorization headers required by Supabase's infrastructure.

## Requirements

### Requirement 1: Add Authorization Header to Fetch Wordlists

**User Story:** As a user, I want to view my saved wordlists, so that I can access my previously generated vocabulary lists.

#### Acceptance Criteria

1. WHEN the frontend calls the fetch-wordlists edge function THEN it SHALL include an `Authorization: Bearer <anon_key>` header
2. WHEN the fetch-wordlists request is made with proper headers THEN it SHALL successfully return the user's wordlists
3. WHEN the authorization header is missing THEN the system SHALL NOT fail silently but provide clear error messaging

### Requirement 2: Add Authorization Header to Save Wordlist

**User Story:** As a user, I want to save my generated wordlists, so that I can access them later for study purposes.

#### Acceptance Criteria

1. WHEN the frontend calls the save-wordlist edge function THEN it SHALL include an `Authorization: Bearer <anon_key>` header
2. WHEN the save-wordlist request is made with proper headers THEN it SHALL successfully save the wordlist to the database
3. WHEN a wordlist is saved THEN the system SHALL return the wordlist ID for reference

### Requirement 3: Add Authorization Header to Delete Wordlist

**User Story:** As a user, I want to delete unwanted wordlists, so that I can manage my saved vocabulary lists effectively.

#### Acceptance Criteria

1. WHEN the frontend calls the delete-wordlist edge function THEN it SHALL include an `Authorization: Bearer <anon_key>` header
2. WHEN the delete-wordlist request is made with proper headers THEN it SHALL successfully remove the wordlist from the database
3. WHEN a wordlist is deleted THEN the system SHALL confirm successful deletion

### Requirement 4: Verify Upload Service Authorization

**User Story:** As a developer, I want to ensure all edge function calls use consistent authorization patterns, so that the application functions reliably.

#### Acceptance Criteria

1. WHEN reviewing the upload service THEN it SHALL be verified whether it includes proper Authorization headers
2. IF the upload service is missing Authorization headers THEN they SHALL be added
3. WHEN all services are updated THEN they SHALL follow a consistent pattern for edge function authentication

### Requirement 5: Update Tests for Authorization Headers

**User Story:** As a developer, I want tests to verify authorization headers are included, so that regressions are caught early.

#### Acceptance Criteria

1. WHEN unit tests call edge functions THEN they SHALL include Authorization headers in mock requests
2. WHEN integration tests verify edge function calls THEN they SHALL assert that Authorization headers are present
3. WHEN tests run THEN they SHALL pass with the updated authorization implementation
