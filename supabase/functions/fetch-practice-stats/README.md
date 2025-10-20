# Fetch Practice Stats Edge Function

Retrieves aggregated practice statistics and per-student breakdowns for a wordlist.

## Features

- **Aggregate Statistics**: Top most-missed words across all students
- **Per-Student Breakdown**: Individual student performance with top mistakes
- **Anonymous Mode**: Optionally hide student nicknames (show "Student N")
- **Date Range Filtering**: Filter by 'today', 'week', 'month', or custom date
- **Performance Optimized**: Uses materialized view for <2s response with 100 students

## API

### Request

```
GET /fetch-practice-stats?wordlistId={id}&dateRange={range}
Headers:
  x-session-id: {teacher-session-id}
```

**Query Parameters:**
- `wordlistId` (required): UUID of the wordlist
- `dateRange` (optional): Filter by date
  - `all` (default): All time
  - `today`: Last 24 hours
  - `week`: Last 7 days
  - `month`: Last 30 days
  - ISO date string: Custom start date

### Response

```json
{
  "success": true,
  "wordlistId": "uuid",
  "totalStudents": 25,
  "totalPractices": 150,
  "students": [
    {
      "sessionId": "uuid",
      "nickname": "Student 1",
      "lastActive": "2025-01-17T10:30:00Z",
      "totalMistakes": 12,
      "topMistakes": [
        {
          "word": "apple",
          "translation": "苹果",
          "count": 5
        }
      ]
    }
  ],
  "aggregateMistakes": [
    {
      "word": "apple",
      "translation": "苹果",
      "studentCount": 8,
      "totalCount": 45,
      "avgPerStudent": 5.6
    }
  ]
}
```

## Authorization

- Requires valid `x-session-id` header
- Only the wordlist owner can view stats
- Returns 403 if session doesn't own the wordlist

## Performance

- Uses materialized view `wordlist_mistake_summary` for aggregate queries
- Optimized indexes on `wordlist_id` and `student_session_id`
- Target: <2s response time with 100 students and 1000+ practice sessions

## Testing

Tests require a running Supabase instance:

```bash
# Start Supabase locally
supabase start

# Run tests
deno test --allow-all fetch-practice-stats/index.test.ts
```

## Requirements

- FR4: Teacher Dashboard
- FR5: Privacy Controls (anonymous mode)
- NFR1: Performance (<2s with 100 students)
- NFR2: Scalability (1000+ students per wordlist)
