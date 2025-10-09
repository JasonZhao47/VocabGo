# Requirements Document

## Introduction

VocabGo is currently requiring user authentication when uploading files and managing wordlists, but the product is designed to work as a simple, anonymous tool without requiring users to sign in. This creates a poor user experience and blocks the core functionality. We need to remove authentication requirements and enable anonymous access while maintaining data isolation and security.

## Requirements

### Requirement 1: Anonymous File Upload

**User Story:** As a user, I want to upload documents without signing in, so that I can quickly generate wordlists without creating an account.

#### Acceptance Criteria

1. WHEN a user uploads a file THEN the system SHALL process it without requiring authentication
2. WHEN a user uploads a file THEN the system SHALL use anonymous access with the Supabase anon key
3. WHEN a file is uploaded anonymously THEN the system SHALL NOT check for auth.uid() or session tokens
4. WHEN processing completes THEN the system SHALL return results to the user without requiring authentication

### Requirement 2: Anonymous Wordlist Management

**User Story:** As a user, I want to save and manage wordlists without signing in, so that I can organize my vocabulary without account overhead.

#### Acceptance Criteria

1. WHEN a user saves a wordlist THEN the system SHALL store it without requiring authentication
2. WHEN a user fetches saved wordlists THEN the system SHALL return them without requiring authentication
3. WHEN a user deletes a wordlist THEN the system SHALL remove it without requiring authentication
4. WHEN wordlists are stored anonymously THEN the system SHALL use browser-based session identification for data isolation

### Requirement 3: Database Access Without Authentication

**User Story:** As the system, I want to allow anonymous database operations, so that users can interact with the app without authentication.

#### Acceptance Criteria

1. WHEN the database receives an anonymous request THEN RLS policies SHALL allow the operation
2. WHEN RLS policies are configured THEN they SHALL NOT require auth.uid() for basic operations
3. WHEN anonymous users access data THEN the system SHALL use alternative identification methods (session IDs, temporary tokens)
4. WHEN RLS is configured THEN it SHALL still prevent unauthorized access to other users' data

### Requirement 4: Remove Authentication Code

**User Story:** As a developer, I want to remove authentication checks from the codebase, so that the app works as designed without auth barriers.

#### Acceptance Criteria

1. WHEN services call Supabase functions THEN they SHALL NOT check for auth sessions
2. WHEN services make API calls THEN they SHALL NOT include Authorization headers with session tokens
3. WHEN services encounter missing sessions THEN they SHALL NOT throw "Authentication required" errors
4. WHEN the codebase is reviewed THEN there SHALL be no auth.getSession() calls in upload or wordlist services

### Requirement 5: Maintain Data Security

**User Story:** As a system administrator, I want to maintain data security even without authentication, so that users' data remains isolated and protected.

#### Acceptance Criteria

1. WHEN anonymous access is enabled THEN the system SHALL still enforce data isolation
2. WHEN RLS policies are updated THEN they SHALL prevent cross-user data access
3. WHEN files are stored THEN they SHALL have appropriate access controls
4. WHEN the system is tested THEN security audits SHALL confirm no data leakage between anonymous sessions
