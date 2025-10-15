# Requirements Document

## Introduction

This feature involves removing the practice session functionality from VocabGo while preserving the practice question generation buttons in the wordlist interface. The goal is to simplify the user experience by removing the preview questions, estimated results, and active practice session components, while maintaining the ability to generate and access practice questions through the existing buttons. The design should follow ElevenLabs aesthetics.

## Requirements

### Requirement 1: Remove Practice Session UI Components

**User Story:** As a user, I should not see practice session interfaces when working with wordlists, so that the interface is simpler and more focused on wordlist management.

#### Acceptance Criteria

1. WHEN viewing the saved wordlists page THEN the practice setup modal SHALL NOT be displayed
2. WHEN clicking the "Practice Questions" button THEN the system SHALL NOT navigate to a practice session page
3. WHEN viewing wordlists THEN preview questions, estimated results, and timer configurations SHALL NOT be visible
4. WHEN the practice session page is accessed directly THEN it SHALL display a "feature removed" message or redirect to wordlists

### Requirement 2: Preserve Practice Question Buttons

**User Story:** As a user, I want to see practice question buttons when editing wordlists that have question sets, so that I can still access the practice question generation functionality.

#### Acceptance Criteria

1. WHEN viewing a wordlist with an existing question set THEN practice-related action buttons SHALL be visible
2. WHEN viewing a wordlist without a question set THEN the "Practice Questions" button SHALL remain visible for generation
3. WHEN clicking practice buttons THEN they SHALL maintain ElevenLabs aesthetic styling (rounded-full, proper spacing, hover states)
4. IF a wordlist has fewer than 4 words THEN the practice button SHALL be disabled with appropriate tooltip

### Requirement 3: Update Navigation and Routing

**User Story:** As a user, I should not be able to navigate to practice session pages, so that the application reflects the simplified feature set.

#### Acceptance Criteria

1. WHEN the application loads THEN the `/practice` route SHALL be removed or disabled
2. WHEN attempting to access practice URLs directly THEN the system SHALL redirect to the wordlists page
3. WHEN navigating through the application THEN no links or buttons SHALL point to practice session pages
4. WHEN viewing the navigation menu THEN practice session options SHALL NOT be present

### Requirement 4: Clean Up Practice Session Code

**User Story:** As a developer, I want unused practice session code removed, so that the codebase is maintainable and doesn't contain dead code.

#### Acceptance Criteria

1. WHEN reviewing the codebase THEN practice session components (PracticeSession.vue, PracticeSetup.vue, ResultsView.vue) SHALL be removed
2. WHEN reviewing composables THEN practice session composables (usePracticeSession.ts) SHALL be removed
3. WHEN reviewing services THEN practice session services SHALL be removed
4. IF practice question generation services are still needed THEN they SHALL be preserved
5. WHEN reviewing tests THEN tests for removed components SHALL be deleted

### Requirement 5: Maintain ElevenLabs Design Aesthetics

**User Story:** As a user, I want the wordlist interface to maintain the ElevenLabs design style, so that the application has a consistent, modern appearance.

#### Acceptance Criteria

1. WHEN viewing wordlist cards THEN they SHALL use rounded-2xl borders and proper shadow effects
2. WHEN interacting with buttons THEN they SHALL use rounded-full styling with smooth transitions
3. WHEN viewing the interface THEN spacing SHALL follow the 8px grid system
4. WHEN hovering over interactive elements THEN they SHALL provide subtle visual feedback (hover:bg-gray-50, transition-colors duration-150)
5. WHEN viewing typography THEN it SHALL use the established font sizes ([14px], [15px], [18px], [20px]) and weights (font-semibold, font-medium)
