/**
 * Fetch Practice Stats Edge Function
 * 
 * Retrieves aggregated practice statistics and per-student breakdowns for a wordlist.
 * Supports anonymous mode and date range filtering. Optimized for <2s with 100 students.
 * 
 * Requirements: FR4, FR5, NFR1, NFR2
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSessionId, isHealthCheck, createUnauthorizedResponse, createHealthCheckResponse } from '../_shared/auth.ts'

interface TopMistake {
  word: string
  translation: string
  count: number
}

interface StudentStats {
  sessionId: string
  nickname: string
  lastActive: string
  totalMistakes: number
  topMistakes: TopMistake[]
}

interface AggregateMistake {
  word: string
  translation: string
  studentCount: number
  totalCount: number
  avgPerStudent: number
}

interface PracticeStatsResponse {
  success: boolean
  wordlistId?: string
  totalStudents?: number
  totalPractices?: number
  students?: StudentStats[]
  aggregateMistakes?: AggregateMistake[]
  error?: {
    code: string
    message: string
  }
}

/**
 * Parse date range parameter
 * Supports: 'all', 'today', 'week', 'month', or ISO date string
 */
function parseDateRange(dateRange?: string): Date | null {
  if (!dateRange || dateRange === 'all') {
    return null
  }

  const now = new Date()

  switch (dateRange) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return weekAgo
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return monthAgo
    default:
      // Try parsing as ISO date
      const parsed = new Date(dateRange)
      if (isNaN(parsed.getTime())) {
        return null
      }
      return parsed
  }
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
      },
    })
  }

  // Handle health checks gracefully
  if (isHealthCheck(req)) {
    return createHealthCheckResponse()
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get and validate session ID (authorization check)
    const auth = getSessionId(req)

    if (!auth.isValid || !auth.sessionId) {
      return createUnauthorizedResponse(auth.error)
    }

    const sessionId = auth.sessionId

    // Parse query parameters
    const url = new URL(req.url)
    const wordlistId = url.searchParams.get('wordlistId')
    const dateRangeParam = url.searchParams.get('dateRange')

    // Validate wordlist ID
    if (!wordlistId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required parameter: wordlistId',
          },
        } as PracticeStatsResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Verify ownership: Check that the wordlist belongs to this session
    const { data: wordlist, error: wordlistError } = await supabaseClient
      .from('wordlists')
      .select('id, session_id, share_settings')
      .eq('id', wordlistId)
      .single()

    if (wordlistError || !wordlist) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'WORDLIST_NOT_FOUND',
            message: 'Wordlist not found',
          },
        } as PracticeStatsResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Authorization check: Only owner can view stats
    if (wordlist.session_id !== sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to view stats for this wordlist',
          },
        } as PracticeStatsResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Parse date range
    const dateFilter = parseDateRange(dateRangeParam || undefined)

    // Check if anonymous mode is enabled
    const anonymousMode = wordlist.share_settings?.anonymous_mode ?? false

    // Query 1: Get aggregate mistakes by querying practice_mistakes directly
    // Note: This replaces the materialized view which was causing permission issues
    const { data: rawMistakes, error: rawError } = await supabaseClient
      .from('practice_mistakes')
      .select('word, translation, student_session_id')
      .eq('wordlist_id', wordlistId)
    
    if (rawError) {
      console.error('Raw mistakes query error:', rawError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to fetch mistakes: ${rawError.message}`,
          },
        } as PracticeStatsResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }
    
    // Aggregate mistakes in memory (replaces materialized view logic)
    const mistakeMap = new Map<string, {
      word: string
      translation: string
      student_count: number
      total_mistakes: number
      sessions: Set<string>
    }>()
    
    for (const mistake of rawMistakes || []) {
      const key = `${mistake.word}|${mistake.translation}`
      const existing = mistakeMap.get(key)
      
      if (existing) {
        existing.total_mistakes++
        existing.sessions.add(mistake.student_session_id)
        existing.student_count = existing.sessions.size
      } else {
        mistakeMap.set(key, {
          word: mistake.word,
          translation: mistake.translation,
          total_mistakes: 1,
          student_count: 1,
          sessions: new Set([mistake.student_session_id])
        })
      }
    }
    
    // Convert to array and calculate avg_mistakes_per_student
    const aggregateMistakes = Array.from(mistakeMap.values())
      .map(({ word, translation, student_count, total_mistakes }) => ({
        word,
        translation,
        student_count,
        total_mistakes,
        avg_mistakes_per_student: total_mistakes / student_count
      }))
      .sort((a, b) => b.total_mistakes - a.total_mistakes)
      .slice(0, 50) // Limit to top 50 most-missed words

    // aggregateMistakes is now computed above
    
    if (false) { // Remove this dead code block
      console.error('Aggregate mistakes query error:', null)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to fetch aggregate mistakes: error`,
          },
        } as PracticeStatsResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Query 2: Get student sessions with date filtering
    let sessionsQuery = supabaseClient
      .from('student_sessions')
      .select('id, nickname, last_active_at, created_at')
      .eq('wordlist_id', wordlistId)
      .order('last_active_at', { ascending: false })

    if (dateFilter) {
      sessionsQuery = sessionsQuery.gte('last_active_at', dateFilter.toISOString())
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery

    if (sessionsError) {
      console.error('Sessions query error:', sessionsError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to fetch student sessions: ${sessionsError.message}`,
          },
        } as PracticeStatsResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Query 3: Get per-student mistakes with date filtering
    let mistakesQuery = supabaseClient
      .from('practice_mistakes')
      .select('student_session_id, word, translation, mistake_count, last_mistake_at')
      .eq('wordlist_id', wordlistId)

    if (dateFilter) {
      mistakesQuery = mistakesQuery.gte('last_mistake_at', dateFilter.toISOString())
    }

    const { data: mistakes, error: mistakesError } = await mistakesQuery

    if (mistakesError) {
      console.error('Mistakes query error:', mistakesError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to fetch practice mistakes: ${mistakesError.message}`,
          },
        } as PracticeStatsResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Build per-student statistics
    const studentStatsMap = new Map<string, StudentStats>()

    // Initialize student stats from sessions
    sessions?.forEach((session, index) => {
      studentStatsMap.set(session.id, {
        sessionId: session.id,
        nickname: anonymousMode ? `Student ${index + 1}` : session.nickname,
        lastActive: session.last_active_at,
        totalMistakes: 0,
        topMistakes: [],
      })
    })

    // Aggregate mistakes per student
    const studentMistakesMap = new Map<string, Map<string, TopMistake>>()

    mistakes?.forEach((mistake) => {
      const sessionId = mistake.student_session_id

      if (!studentMistakesMap.has(sessionId)) {
        studentMistakesMap.set(sessionId, new Map())
      }

      const mistakeKey = `${mistake.word}|${mistake.translation}`
      const existingMistake = studentMistakesMap.get(sessionId)!.get(mistakeKey)

      if (existingMistake) {
        existingMistake.count += mistake.mistake_count
      } else {
        studentMistakesMap.get(sessionId)!.set(mistakeKey, {
          word: mistake.word,
          translation: mistake.translation,
          count: mistake.mistake_count,
        })
      }
    })

    // Populate student stats with top mistakes
    studentMistakesMap.forEach((mistakesMap, sessionId) => {
      const studentStats = studentStatsMap.get(sessionId)
      if (!studentStats) return

      const mistakesArray = Array.from(mistakesMap.values())
      studentStats.totalMistakes = mistakesArray.reduce((sum, m) => sum + m.count, 0)
      studentStats.topMistakes = mistakesArray
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 mistakes per student
    })

    // Convert to array and sort by total mistakes
    const studentsArray = Array.from(studentStatsMap.values())
      .sort((a, b) => b.totalMistakes - a.totalMistakes)

    // Calculate total practices (sum of all mistake counts)
    const totalPractices = mistakes?.reduce((sum, m) => sum + m.mistake_count, 0) || 0

    // Format aggregate mistakes
    const formattedAggregateMistakes: AggregateMistake[] = (aggregateMistakes || []).map((m) => ({
      word: m.word,
      translation: m.translation,
      studentCount: m.student_count,
      totalCount: m.total_mistakes,
      avgPerStudent: Math.round(m.avg_mistakes_per_student * 10) / 10, // Round to 1 decimal
    }))

    // Return stats
    return new Response(
      JSON.stringify({
        success: true,
        wordlistId,
        totalStudents: sessions?.length || 0,
        totalPractices,
        students: studentsArray,
        aggregateMistakes: formattedAggregateMistakes,
      } as PracticeStatsResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      } as PracticeStatsResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
