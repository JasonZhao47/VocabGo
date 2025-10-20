# Student Tracking & Sharing System - Requirements

## Overview
Enable teachers to share wordlists with students, track individual student mistakes, and generate targeted practice questions based on mistake patterns - all without requiring student accounts or complex class management.

## Core User Stories

### Teacher Stories
1. As a teacher, I want to share a wordlist via a simple link so students can practice
2. As a teacher, I want to see which students practiced and their individual mistake patterns
3. As a teacher, I want to generate practice questions targeting the most commonly missed words
4. As a teacher, I want to optionally enable anonymous mode for privacy
5. As a teacher, I want to copy/share the practice link easily

### Student Stories
1. As a student, I want to enter my name once and have it remembered
2. As a student, I want to practice without creating an account
3. As a student, I want to see my own progress and mistakes
4. As a student, I want the interface to be clean and distraction-free

## Functional Requirements

### FR1: Wordlist Sharing
- Teachers can enable "sharing" on any saved wordlist
- System generates unique shareable link (e.g., `vocabgo.app/practice/abc123xyz`)
- Share link includes one-click copy functionality
- Teachers can disable sharing at any time
- Shared wordlists remain accessible even if original is deleted (soft delete)

### FR2: Student Identity (Nickname System)
- First-time students prompted to enter nickname (2-20 characters)
- Nickname stored in localStorage for persistence
- System generates session token (browser fingerprint + timestamp)
- No password, email, or authentication required
- Students can change nickname anytime
- Support for Unicode characters (Chinese, emoji, etc.)

### FR3: Mistake Tracking
- Track every incorrect answer per student session
- Store: word, mistake count, timestamp, question type
- Aggregate mistakes across all practice attempts
- Real-time updates to teacher dashboard
- Data retention: 90 days from last practice

### FR4: Teacher Dashboard
- View list of all students who practiced (by nickname)
- See per-student mistake breakdown
- View aggregate "most missed words" across all students
- Filter by date range, student, or word
- Export data as CSV
- Generate targeted questions from top mistakes (1-click)

### FR5: Privacy Controls
- Anonymous mode: Shows "Student 1", "Student 2" instead of nicknames
- Teachers can clear all practice data for a wordlist
- Students can request data deletion (via teacher)
- No PII collected beyond self-provided nicknames

### FR6: Student Practice View
- Clean, focused interface for practicing
- Show personal mistake history
- Display progress indicators
- Mobile-optimized for phone/tablet use

## Non-Functional Requirements

### NFR1: Performance
- Share link generation: < 100ms
- Dashboard load time: < 2s for 100 students
- Real-time updates: < 500ms latency

### NFR2: Scalability
- Support 1000+ students per wordlist
- Handle 10,000+ practice sessions per day
- Efficient querying for mistake aggregation

### NFR3: Security
- Share tokens: cryptographically secure (32+ chars)
- Rate limiting on practice endpoints
- No sensitive data in URLs
- CORS protection on API endpoints

### NFR4: Usability
- Mobile-first design for student view
- Desktop-optimized for teacher dashboard
- Accessible (WCAG AA)
- Support for slow networks (< 3G)

### NFR5: Data Integrity
- Prevent duplicate student sessions (same nickname + device)
- Handle concurrent practice sessions
- Graceful degradation if localStorage unavailable

## Out of Scope (V1)
- ❌ Student accounts/authentication
- ❌ Class roster management
- ❌ Parent/admin roles
- ❌ Real-time collaboration
- ❌ Video/audio content
- ❌ Gamification/leaderboards
- ❌ Direct student-teacher messaging
- ❌ Grade book integration
- ❌ Bulk student import

## Success Metrics
- 80%+ of students successfully enter nickname on first try
- < 5% duplicate session creation rate
- 90%+ teacher satisfaction with dashboard clarity
- < 2 clicks to generate targeted questions
- Zero data breaches or privacy incidents

## Dependencies
- Existing practice question system
- Supabase database
- Anonymous session management
- Existing wordlist infrastructure

## Constraints
- Must work without authentication
- Must respect existing anonymous architecture
- Must not require student email/phone
- Must be GDPR/COPPA friendly
