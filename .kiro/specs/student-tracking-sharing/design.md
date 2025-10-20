# Student Tracking & Sharing System - Design Document

## Architecture Overview

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                      Teacher Interface                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Wordlist Mgmt│  │   Dashboard  │  │ Question Gen │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Edge Functions Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ share-wordlist│  │fetch-practice│  │generate-from │      │
│  │              │  │   -stats     │  │  -mistakes   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Database                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  wordlists   │  │student_sessions│ │practice_mistakes│   │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
          ▲                  ▲                  ▲
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────────┐
│         │                  │                  │              │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐      │
│  │Student Entry │  │Practice View │  │Results View  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                      Student Interface                       │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### New Tables

```sql
-- Student sessions (lightweight identity)
CREATE TABLE student_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wordlist_id UUID NOT NULL REFERENCES wordlists(id) ON DELETE CASCADE,
  nickname VARCHAR(20) NOT NULL,
  session_token VARCHAR(64) NOT NULL UNIQUE, -- browser fingerprint
  device_info JSONB, -- {userAgent, screen, timezone}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_wordlist_sessions ON student_sessions(wordlist_id, created_at DESC),
  INDEX idx_session_token ON student_sessions(session_token),
  UNIQUE INDEX idx_wordlist_nickname_token ON student_sessions(wordlist_id, nickname, session_token)
);

-- Practice mistakes tracking
CREATE TABLE practice_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_session_id UUID NOT NULL REFERENCES student_sessions(id) ON DELETE CASCADE,
  wordlist_id UUID NOT NULL REFERENCES wordlists(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  translation VARCHAR(100) NOT NULL,
  question_type VARCHAR(20) NOT NULL, -- 'multiple_choice', 'fill_blank', 'matching'
  mistake_count INTEGER DEFAULT 1,
  first_mistake_at TIMESTAMPTZ DEFAULT NOW(),
  last_mistake_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_session_mistakes ON practice_mistakes(student_session_id, last_mistake_at DESC),
  INDEX idx_wordlist_mistakes ON practice_mistakes(wordlist_id, mistake_count DESC),
  INDEX idx_word_mistakes ON practice_mistakes(wordlist_id, word)
);

-- Materialized view for fast aggregation
CREATE MATERIALIZED VIEW wordlist_mistake_summary AS
SELECT 
  wordlist_id,
  word,
  translation,
  COUNT(DISTINCT student_session_id) as student_count,
  SUM(mistake_count) as total_mistakes,
  AVG(mistake_count) as avg_mistakes_per_student,
  MAX(last_mistake_at) as last_occurred
FROM practice_mistakes
GROUP BY wordlist_id, word, translation
ORDER BY total_mistakes DESC;

-- Refresh trigger
CREATE OR REPLACE FUNCTION refresh_mistake_summary()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY wordlist_mistake_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_mistake_summary_trigger
AFTER INSERT OR UPDATE ON practice_mistakes
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_mistake_summary();
```

### Modified Tables

```sql
-- Add sharing fields to wordlists
ALTER TABLE wordlists ADD COLUMN IF NOT EXISTS share_token VARCHAR(32) UNIQUE;
ALTER TABLE wordlists ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;
ALTER TABLE wordlists ADD COLUMN IF NOT EXISTS share_settings JSONB DEFAULT '{"anonymous_mode": false, "allow_practice": true}';
ALTER TABLE wordlists ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ;

-- Index for share token lookup
CREATE INDEX IF NOT EXISTS idx_wordlists_share_token ON wordlists(share_token) WHERE is_shared = TRUE;
```

## API Design

### Edge Functions

#### 1. `share-wordlist`
**Purpose:** Enable/disable sharing for a wordlist

```typescript
// POST /share-wordlist
interface ShareWordlistRequest {
  wordlistId: string;
  enable: boolean;
  settings?: {
    anonymousMode?: boolean;
    allowPractice?: boolean;
  };
}

interface ShareWordlistResponse {
  success: boolean;
  shareToken?: string;
  shareUrl?: string;
  error?: string;
}
```

#### 2. `register-student-session`
**Purpose:** Create or retrieve student session

```typescript
// POST /register-student-session
interface RegisterStudentRequest {
  shareToken: string;
  nickname: string;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    timezone: string;
  };
}

interface RegisterStudentResponse {
  success: boolean;
  sessionId: string;
  sessionToken: string;
  wordlist: {
    id: string;
    title: string;
    words: WordPair[];
  };
  error?: string;
}
```

#### 3. `record-practice-mistake`
**Purpose:** Track student mistakes

```typescript
// POST /record-practice-mistake
interface RecordMistakeRequest {
  sessionToken: string;
  wordlistId: string;
  word: string;
  translation: string;
  questionType: 'multiple_choice' | 'fill_blank' | 'matching';
}

interface RecordMistakeResponse {
  success: boolean;
  mistakeCount: number;
  error?: string;
}
```

#### 4. `fetch-practice-stats`
**Purpose:** Get teacher dashboard data

```typescript
// GET /fetch-practice-stats?wordlistId={id}&dateRange={range}
interface PracticeStatsResponse {
  wordlistId: string;
  totalStudents: number;
  totalPractices: number;
  students: Array<{
    sessionId: string;
    nickname: string; // or "Student N" if anonymous
    lastActive: string;
    totalMistakes: number;
    topMistakes: Array<{
      word: string;
      translation: string;
      count: number;
    }>;
  }>;
  aggregateMistakes: Array<{
    word: string;
    translation: string;
    studentCount: number;
    totalCount: number;
    avgPerStudent: number;
  }>;
}
```

#### 5. `generate-questions-from-mistakes`
**Purpose:** Generate targeted questions

```typescript
// POST /generate-questions-from-mistakes
interface GenerateFromMistakesRequest {
  wordlistId: string;
  topN?: number; // default 10
  questionTypes?: string[];
  studentSessionIds?: string[]; // optional: target specific students
}

interface GenerateFromMistakesResponse {
  success: boolean;
  questions: PracticeQuestion[];
  targetWords: string[];
  error?: string;
}
```

## Frontend Components

### Teacher Components

#### 1. `ShareWordlistButton.vue`
**Location:** `src/components/sharing/ShareWordlistButton.vue`

```vue
<template>
  <div class="share-wordlist-container">
    <Button
      v-if="!isShared"
      @click="enableSharing"
      variant="primary"
      :loading="loading"
    >
      <ShareIcon class="w-4 h-4 mr-2" />
      Enable Sharing
    </Button>
    
    <div v-else class="share-active-state">
      <div class="share-url-display">
        <Input
          :value="shareUrl"
          readonly
          class="share-url-input"
        />
        <Button
          @click="copyShareUrl"
          variant="secondary"
          size="sm"
        >
          <CopyIcon class="w-4 h-4" />
        </Button>
      </div>
      
      <div class="share-actions">
        <Button
          @click="viewDashboard"
          variant="ghost"
        >
          View Stats
        </Button>
        <Button
          @click="disableSharing"
          variant="destructive"
          size="sm"
        >
          Disable
        </Button>
      </div>
    </div>
  </div>
</template>
```

**Styling:** ElevenLabs aesthetic
- Gradient border on active share URL
- Smooth copy animation
- Subtle hover states
- Clean, minimal layout

#### 2. `PracticeDashboard.vue`
**Location:** `src/pages/PracticeDashboard.vue`

```vue
<template>
  <Container class="practice-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="text-3xl font-semibold">{{ wordlist.title }}</h1>
      <div class="header-actions">
        <Button @click="generateFromMistakes" variant="primary">
          <SparklesIcon class="w-4 h-4 mr-2" />
          Generate Questions
        </Button>
        <Button @click="exportData" variant="secondary">
          <DownloadIcon class="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <Card class="stat-card">
        <div class="stat-value">{{ stats.totalStudents }}</div>
        <div class="stat-label">Students</div>
      </Card>
      <Card class="stat-card">
        <div class="stat-value">{{ stats.totalPractices }}</div>
        <div class="stat-label">Practice Sessions</div>
      </Card>
      <Card class="stat-card">
        <div class="stat-value">{{ stats.avgMistakes }}</div>
        <div class="stat-label">Avg Mistakes</div>
      </Card>
    </div>

    <!-- Top Mistakes (Aggregate) -->
    <Card class="mistakes-aggregate">
      <h2 class="text-xl font-medium mb-4">Most Challenging Words</h2>
      <DataTable
        :columns="mistakeColumns"
        :data="stats.aggregateMistakes"
        :sortable="true"
      >
        <template #word="{ row }">
          <div class="word-cell">
            <span class="english">{{ row.word }}</span>
            <span class="chinese">{{ row.translation }}</span>
          </div>
        </template>
        <template #difficulty="{ row }">
          <div class="difficulty-bar">
            <div
              class="difficulty-fill"
              :style="{ width: `${(row.totalCount / maxMistakes) * 100}%` }"
            />
            <span class="difficulty-count">{{ row.totalCount }}</span>
          </div>
        </template>
      </DataTable>
    </Card>

    <!-- Student List -->
    <Card class="students-list">
      <h2 class="text-xl font-medium mb-4">Individual Students</h2>
      <Accordion>
        <AccordionItem
          v-for="student in stats.students"
          :key="student.sessionId"
          :title="student.nickname"
        >
          <template #trigger>
            <div class="student-summary">
              <span class="student-name">{{ student.nickname }}</span>
              <span class="student-mistakes">
                {{ student.totalMistakes }} mistakes
              </span>
              <span class="student-last-active">
                {{ formatRelativeTime(student.lastActive) }}
              </span>
            </div>
          </template>
          
          <div class="student-details">
            <DataTable
              :columns="studentMistakeColumns"
              :data="student.topMistakes"
              compact
            />
          </div>
        </AccordionItem>
      </Accordion>
    </Card>
  </Container>
</template>
```

**Styling:** ElevenLabs aesthetic
- Gradient stat cards with subtle animations
- Clean data tables with hover effects
- Smooth accordion transitions
- Difficulty bars with gradient fills
- Responsive grid layout

### Student Components

#### 3. `StudentNicknameEntry.vue`
**Location:** `src/components/practice/StudentNicknameEntry.vue`

```vue
<template>
  <Modal :open="showModal" @close="() => {}">
    <div class="nickname-entry-modal">
      <div class="modal-header">
        <h2 class="text-2xl font-semibold">Welcome!</h2>
        <p class="text-neutral-600">Enter your name to start practicing</p>
      </div>

      <form @submit.prevent="submitNickname" class="nickname-form">
        <Input
          v-model="nickname"
          placeholder="Your name (e.g., 小明, Amy)"
          :maxlength="20"
          :error="error"
          autofocus
          class="nickname-input"
        />
        
        <div class="form-hint">
          Your name will be visible to your teacher
        </div>

        <Button
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="!nickname.trim()"
          class="submit-button"
        >
          Start Practicing
        </Button>
      </form>

      <div class="privacy-note">
        <LockIcon class="w-4 h-4" />
        <span>Your practice data is private and secure</span>
      </div>
    </div>
  </Modal>
</template>
```

**Styling:** ElevenLabs aesthetic
- Centered modal with gradient border
- Large, friendly input field
- Smooth focus states
- Subtle privacy reassurance
- Mobile-optimized

#### 4. `StudentPracticeView.vue`
**Location:** `src/pages/StudentPracticeView.vue`

```vue
<template>
  <div class="student-practice-view">
    <!-- Header -->
    <div class="practice-header">
      <div class="student-info">
        <span class="greeting">Hi, {{ nickname }}!</span>
        <span class="wordlist-title">{{ wordlist.title }}</span>
      </div>
      <div class="progress-indicator">
        <span>{{ answeredCount }} / {{ totalQuestions }}</span>
      </div>
    </div>

    <!-- Practice Area -->
    <div class="practice-content">
      <!-- Existing practice question components -->
      <PracticeQuestionDisplay
        :question="currentQuestion"
        @answer="handleAnswer"
      />
    </div>

    <!-- Personal Stats (Collapsible) -->
    <Accordion class="personal-stats">
      <AccordionItem title="Your Mistakes">
        <div class="mistake-list">
          <div
            v-for="mistake in personalMistakes"
            :key="mistake.word"
            class="mistake-item"
          >
            <span class="mistake-word">{{ mistake.word }}</span>
            <span class="mistake-count">×{{ mistake.count }}</span>
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  </div>
</template>
```

**Styling:** ElevenLabs aesthetic
- Clean, distraction-free layout
- Friendly greeting with gradient text
- Minimal progress indicator
- Collapsible stats to avoid clutter
- Mobile-first design

## State Management

### New Composables

#### `useStudentSession.ts`
```typescript
export function useStudentSession() {
  const sessionToken = ref<string | null>(null);
  const nickname = ref<string | null>(null);
  const sessionId = ref<string | null>(null);

  // Load from localStorage
  onMounted(() => {
    sessionToken.value = localStorage.getItem('student_session_token');
    nickname.value = localStorage.getItem('student_nickname');
    sessionId.value = localStorage.getItem('student_session_id');
  });

  async function registerSession(shareToken: string, nick: string) {
    const deviceInfo = getDeviceFingerprint();
    const response = await fetch('/register-student-session', {
      method: 'POST',
      body: JSON.stringify({ shareToken, nickname: nick, deviceInfo })
    });
    
    const data = await response.json();
    if (data.success) {
      sessionToken.value = data.sessionToken;
      nickname.value = nick;
      sessionId.value = data.sessionId;
      
      localStorage.setItem('student_session_token', data.sessionToken);
      localStorage.setItem('student_nickname', nick);
      localStorage.setItem('student_session_id', data.sessionId);
    }
    
    return data;
  }

  async function recordMistake(wordlistId: string, word: string, translation: string, questionType: string) {
    if (!sessionToken.value) return;
    
    await fetch('/record-practice-mistake', {
      method: 'POST',
      body: JSON.stringify({
        sessionToken: sessionToken.value,
        wordlistId,
        word,
        translation,
        questionType
      })
    });
  }

  return {
    sessionToken,
    nickname,
    sessionId,
    registerSession,
    recordMistake
  };
}
```

#### `usePracticeStats.ts`
```typescript
export function usePracticeStats(wordlistId: string) {
  const stats = ref<PracticeStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchStats(dateRange?: string) {
    loading.value = true;
    try {
      const response = await fetch(
        `/fetch-practice-stats?wordlistId=${wordlistId}&dateRange=${dateRange || 'all'}`
      );
      stats.value = await response.json();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function generateFromMistakes(topN = 10) {
    const response = await fetch('/generate-questions-from-mistakes', {
      method: 'POST',
      body: JSON.stringify({ wordlistId, topN })
    });
    return response.json();
  }

  return {
    stats,
    loading,
    error,
    fetchStats,
    generateFromMistakes
  };
}
```

## Routing

### New Routes

```typescript
// src/router/index.ts
const routes = [
  // ... existing routes
  
  // Student practice entry point
  {
    path: '/practice/:shareToken',
    name: 'StudentPractice',
    component: () => import('@/pages/StudentPracticeView.vue'),
    meta: { requiresSession: false }
  },
  
  // Teacher dashboard
  {
    path: '/dashboard/:wordlistId',
    name: 'PracticeDashboard',
    component: () => import('@/pages/PracticeDashboard.vue'),
    meta: { requiresSession: true }
  }
];
```

## Security Considerations

### 1. Share Token Generation
```typescript
function generateShareToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
```

### 2. Rate Limiting
- 10 requests/minute per session token for mistake recording
- 100 requests/hour per IP for session registration
- 50 requests/hour per wordlist for stats fetching

### 3. Data Validation
- Nickname: 2-20 chars, Unicode allowed, no special chars
- Session token: 64 chars hex
- Share token: 32 chars hex

### 4. Privacy
- No PII beyond self-provided nickname
- 90-day auto-deletion of inactive sessions
- Teacher can bulk-delete all practice data
- No cross-wordlist data leakage

## Performance Optimizations

### 1. Database Indexes
- Composite index on (wordlist_id, nickname, session_token)
- Covering index on practice_mistakes for aggregation queries
- Materialized view for top mistakes (refreshed every 5 minutes)

### 2. Caching Strategy
- Cache practice stats for 30 seconds (Redis)
- Cache wordlist data for shared links (5 minutes)
- LocalStorage for student session persistence

### 3. Query Optimization
- Use materialized view for aggregate queries
- Limit student list to 100 most recent
- Paginate mistake history (20 per page)

## ElevenLabs Aesthetic Integration

### Design Tokens
```typescript
// src/config/sharingDesignTokens.ts
export const sharingTokens = {
  colors: {
    shareActive: 'from-purple-500 to-pink-500',
    mistakeHigh: 'from-red-500 to-orange-500',
    mistakeMedium: 'from-yellow-500 to-amber-500',
    mistakeLow: 'from-green-500 to-emerald-500',
  },
  animations: {
    copySuccess: 'scale-105 duration-200',
    statUpdate: 'pulse duration-300',
    accordionExpand: 'ease-out duration-300',
  },
  spacing: {
    dashboardGap: '24px',
    cardPadding: '20px',
    statCardHeight: '120px',
  }
};
```

### Component Styling Patterns
- Gradient borders on active/shared states
- Smooth hover transitions (150ms ease-out)
- Subtle shadows with blur
- Clean typography hierarchy
- Generous white space
- Mobile-first responsive breakpoints

## Testing Strategy

### Unit Tests
- Session token generation
- Nickname validation
- Mistake aggregation logic
- Share URL generation

### Integration Tests
- Student registration flow
- Mistake recording pipeline
- Stats fetching accuracy
- Question generation from mistakes

### E2E Tests
- Complete teacher sharing workflow
- Student practice session
- Dashboard data accuracy
- Privacy mode verification

## Migration Plan

### Phase 1: Database Setup
1. Run migration to add new tables
2. Add sharing columns to wordlists
3. Create indexes and materialized views

### Phase 2: Backend Implementation
1. Implement edge functions
2. Add rate limiting
3. Set up caching layer

### Phase 3: Frontend Components
1. Build teacher sharing UI
2. Create student entry flow
3. Implement dashboard

### Phase 4: Integration
1. Connect mistake tracking to existing practice
2. Wire up question generation
3. Add analytics

### Phase 5: Testing & Launch
1. Run full test suite
2. Performance testing
3. Security audit
4. Soft launch with beta users
