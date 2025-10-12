# Practice Question Generator Design Document

## Overview

The Practice Question Generator extends VocabGo with AI-powered interactive learning capabilities. This feature transforms saved wordlists into engaging practice exercises through three question types: matching, fill-in-the-blank, and multiple choice. The system emphasizes user experience with timed sessions, progress tracking, and sharing capabilities while maintaining the existing ElevenLabs.io aesthetic.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Edge Functions  │    │   AI Service    │
│                 │    │                  │    │                 │
│ • Practice UI   │◄──►│ • Question Gen   │◄──►│ • GLM-Flash     │
│ • Timer System  │    │ • Session Mgmt   │    │ • Question AI   │
│ • Results View  │    │ • Share Handler  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  Local Storage  │    │   Supabase DB    │
│                 │    │                  │
│ • Session State │    │ • Practice Sets  │
│ • Timer State   │    │ • Session History│
│ • Progress      │    │ • Share URLs     │
└─────────────────┘    └──────────────────┘
```

### Component Architecture

```
PracticeQuestionGenerator/
├── PracticeSetup.vue          # Question type selection, timer setup
├── QuestionTypes/
│   ├── MatchingQuestion.vue   # Drag-drop or click-to-connect matching
│   ├── FillBlankQuestion.vue  # Text input with validation
│   └── MultipleChoice.vue     # Radio button selection
├── PracticeSession.vue        # Main practice interface with timer
├── ResultsView.vue           # Score display and review
├── SessionHistory.vue        # Past practice sessions
└── ShareModal.vue            # Generate and share practice sets
```

## Components and Interfaces

### 1. Question Generation Service

**Edge Function: `generate-practice-questions`**

```typescript
interface QuestionGenerationRequest {
  wordlistId: string;
  questionTypes: ('matching' | 'fill-blank' | 'multiple-choice')[];
  maxQuestions?: number; // Default: 10 per type
}

interface QuestionGenerationResponse {
  practiceSetId: string;
  questions: {
    matching: MatchingQuestion[];
    fillBlank: FillBlankQuestion[];
    multipleChoice: MultipleChoiceQuestion[];
  };
  estimatedTime: number; // in minutes
}
```

**AI Prompt Strategy:**
- **Matching**: Generate shuffled translation pairs
- **Fill-in-the-blank**: Create contextual sentences with vocabulary gaps
- **Multiple Choice**: Generate practice sentences with plausible distractors

### 2. Practice Session Management

**Composable: `usePracticeSession`**

```typescript
interface PracticeSession {
  id: string;
  wordlistId: string;
  startTime: Date;
  endTime?: Date;
  timerDuration?: number; // in minutes
  questions: Question[];
  answers: Answer[];
  score?: number;
  completed: boolean;
}

interface SessionState {
  currentSession: PracticeSession | null;
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  isPaused: boolean;
  answers: Map<string, any>;
}
```

### 3. Question Type Interfaces

```typescript
interface MatchingQuestion {
  id: string;
  type: 'matching';
  pairs: Array<{
    english: string;
    mandarin: string;
  }>;
  shuffledMandarin: string[];
}

interface FillBlankQuestion {
  id: string;
  type: 'fill-blank';
  sentence: string;
  correctAnswer: string;
  acceptableVariations: string[];
  hint?: string;
}

interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  sentence: string;
  targetWord: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}
```

## Data Models

### Database Schema Extensions

```sql
-- Practice Sets Table
CREATE TABLE practice_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wordlist_id UUID REFERENCES wordlists(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  share_url TEXT UNIQUE,
  is_shared BOOLEAN DEFAULT FALSE
);

-- Practice Sessions Table
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_set_id UUID REFERENCES practice_sets(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Client-generated for anonymous users
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  timer_duration INTEGER, -- in minutes
  answers JSONB NOT NULL,
  score DECIMAL(5,2),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_practice_sets_wordlist ON practice_sets(wordlist_id);
CREATE INDEX idx_practice_sessions_set ON practice_sessions(practice_set_id);
CREATE INDEX idx_practice_sessions_session_id ON practice_sessions(session_id);
```

### Local Storage Schema

```typescript
interface LocalPracticeState {
  currentSession?: {
    practiceSetId: string;
    startTime: number;
    timerDuration?: number;
    answers: Record<string, any>;
    currentQuestionIndex: number;
  };
  sessionHistory: Array<{
    practiceSetId: string;
    wordlistName: string;
    score: number;
    completedAt: number;
    duration: number;
  }>;
}
```

## User Interface Design

### 1. Practice Setup Interface

**Location**: Integrated into `SavedWordlistsPage.vue`

```vue
<!-- Added to wordlist card actions -->
<div class="flex gap-2 mt-4">
  <Button variant="outline" @click="exportWordlist">Export</Button>
  <Button variant="primary" @click="startPractice">
    <PlayIcon class="w-4 h-4 mr-2" />
    Practice Questions
  </Button>
</div>
```

**Practice Setup Modal**:
- Question type selection (checkboxes for matching, fill-blank, multiple choice)
- Timer options (None, 5min, 10min, 15min, 20min, Custom)
- Estimated completion time display
- "Generate Questions" button with loading state

### 2. Practice Session Interface

**Design Rationale**: Clean, focused interface that minimizes distractions during practice.

**Layout Components**:
- **Header**: Progress indicator (Question X of Y), timer display, pause button
- **Main Area**: Current question with type-specific interface
- **Footer**: Navigation buttons (Previous, Next/Submit), progress bar

**Timer Design**:
- Prominent but non-intrusive countdown display
- Color transitions: Green → Yellow (5min left) → Red (1min left)
- Auto-submit when timer expires with clear notification

### 3. Question Type Interfaces

#### Matching Questions
**Interaction Pattern**: Click-to-connect (mobile-friendly)
- Two columns: English words (left), Mandarin translations (right)
- Click first item → highlight → click matching item → draw connection line
- Animated connection lines using GSAP (consistent with ElevenLabs aesthetic)
- Visual feedback for correct/incorrect matches

#### Fill-in-the-Blank Questions
**Interface Elements**:
- Sentence display with highlighted blank space
- Text input with auto-focus and enter-to-submit
- Real-time validation with fuzzy matching for typos
- Hint button (optional) that reveals first letter

#### Multiple Choice Questions
**Layout**:
- Practice sentence at top with target word highlighted
- Four radio button options in clean card layout
- Immediate feedback on selection with color coding
- Explanation of correct answer for incorrect choices

### 4. Results and History Interface

**Results View**:
- Overall score with celebratory animation for high scores
- Breakdown by question type
- Review incorrect answers with explanations
- Options: "Practice Again", "Try New Questions", "Share Results"

**Session History**:
- Integrated into wordlist detail view
- Timeline of practice sessions with scores and dates
- Progress trend visualization (simple line chart)
- Filter by question type and date range

## Error Handling

### Question Generation Errors

```typescript
enum QuestionGenerationError {
  INSUFFICIENT_WORDS = 'INSUFFICIENT_WORDS', // < 4 words
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR', // > 15 seconds
  VALIDATION_ERROR = 'VALIDATION_ERROR' // Generated questions don't meet quality standards
}
```

**Error Recovery Strategy**:
1. **Insufficient Words**: Show helpful message with minimum requirements
2. **AI Service Error**: Retry up to 2 times, then show error with manual retry option
3. **Timeout**: Show progress message, allow user to wait or cancel
4. **Validation Error**: Regenerate questions automatically, log for monitoring

### Session Management Errors

**Local Storage Failures**:
- Graceful degradation: Continue session in memory only
- Show warning about potential progress loss
- Offer to save session data as JSON download

**Network Connectivity Issues**:
- Offline mode: Continue practice session locally
- Queue session results for upload when connection restored
- Clear visual indicator of offline status

## Testing Strategy

### Unit Testing Focus Areas

1. **Question Generation Logic**
   - AI prompt construction and validation
   - Question type generation algorithms
   - Answer validation and scoring

2. **Session Management**
   - Timer functionality and state persistence
   - Answer collection and validation
   - Score calculation accuracy

3. **User Interface Components**
   - Question type interactions (matching, fill-blank, multiple choice)
   - Timer display and countdown logic
   - Results calculation and display

### Integration Testing

1. **End-to-End Practice Flow**
   - Complete practice session from setup to results
   - Timer expiration handling
   - Session persistence across page refreshes

2. **Sharing Functionality**
   - Static HTML generation and serving
   - URL generation and access control
   - Offline practice set functionality

### Performance Testing

1. **Question Generation Performance**
   - Target: < 10 seconds for 40-word wordlist
   - Load testing with concurrent generation requests
   - AI service response time monitoring

2. **UI Responsiveness**
   - Smooth animations during question transitions
   - Timer accuracy under different system loads
   - Mobile device performance optimization

## Performance Considerations

### Question Generation Optimization

**Caching Strategy**:
- Cache generated questions for 24 hours
- Reuse questions for same wordlist if generated within cache window
- Background regeneration for expired cache entries

**AI Service Optimization**:
- Batch question generation for all types in single API call
- Implement request queuing to prevent rate limiting
- Use streaming responses for real-time progress updates

### Frontend Performance

**Lazy Loading**:
- Load question types on-demand
- Preload next question while user answers current one
- Lazy load session history and results data

**Animation Performance**:
- Use CSS transforms and opacity for animations
- Implement GPU acceleration for connection line drawing
- Debounce timer updates to prevent excessive re-renders

### Mobile Optimization

**Touch Interactions**:
- Larger touch targets for matching questions (minimum 44px)
- Swipe gestures for question navigation
- Haptic feedback for correct/incorrect answers (where supported)

**Responsive Design**:
- Single-column layout for mobile devices
- Collapsible timer display to maximize question space
- Optimized keyboard handling for fill-in-the-blank questions

## Security and Privacy

### Data Protection

**Session Data**:
- No personal information stored in practice sessions
- Anonymous session IDs for tracking without identification
- Automatic cleanup of session data after 30 days

**Sharing Security**:
- Generate cryptographically secure share URLs
- Rate limiting on share URL generation
- Automatic expiration of shared practice sets after 7 days

### Content Security

**AI-Generated Content Validation**:
- Filter inappropriate content in generated sentences
- Validate translation accuracy against known dictionaries
- Monitor and flag low-quality question generation

## Implementation Phases

### Phase 1: Core Question Generation (MVP)
- Basic question generation for all three types
- Simple practice interface without timer
- Local session management and scoring

### Phase 2: Enhanced User Experience
- Timer functionality and session persistence
- Results tracking and history
- Improved UI with animations and feedback

### Phase 3: Sharing and Advanced Features
- Static HTML generation and sharing
- Performance optimizations and caching
- Advanced analytics and progress tracking

## Design Decisions and Rationales

### 1. Click-to-Connect vs Drag-and-Drop for Matching
**Decision**: Implement click-to-connect as primary interaction
**Rationale**: Better mobile accessibility, clearer visual feedback, easier to implement with consistent animations

### 2. Local Storage for Session State
**Decision**: Use local storage with database backup for session persistence
**Rationale**: Enables offline practice, reduces server load, provides instant responsiveness

### 3. Static HTML for Sharing
**Decision**: Generate self-contained HTML files for shared practice sets
**Rationale**: Works offline, no authentication required, reduces server dependencies for shared content

### 4. Single API Call for Question Generation
**Decision**: Generate all question types in one API request
**Rationale**: Reduces latency, ensures consistency across question types, simplifies error handling

### 5. Anonymous Session Tracking
**Decision**: Use client-generated session IDs instead of user accounts
**Rationale**: Maintains privacy, works with existing anonymous architecture, simplifies implementation