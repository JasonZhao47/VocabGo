/**
 * Generate Questions from Mistakes Edge Function
 * 
 * Generates targeted practice questions based on the most commonly missed words
 * from student practice sessions. Supports filtering by specific students and
 * question type selection.
 * 
 * Requirements: FR4
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSessionId, isHealthCheck, createUnauthorizedResponse, createHealthCheckResponse } from '../_shared/auth.ts'
import {
  generatePracticeQuestions,
  type WordPair,
  type QuestionSet,
} from '../_shared/agents/practice-questions.ts'

interface GenerateFromMistakesRequest {
  wordlistId: string
  topN?: number
  questionTypes?: ('matching' | 'fill-blank' | 'multiple-choice')[]
  studentSessionIds?: string[]
}

interface GenerateFromMistakesResponse {
  success: boolean
  questions?: QuestionSet
  targetWords?: string[]
  metadata?: {
    generationTimeMs: number
    wordCount: number
    questionCounts: {
      matching: number
      fillBlank: number
      multipleChoice: number
    }
    filteredByStudents: boolean
    mistakeStats: {
      totalMistakes: number
      studentCount: number
    }
  }
  error?: {
    code: string
    message: string
  }
}

const DEFAULT_TOP_N = 10
const DEFAULT_QUESTION_TYPES: ('matching' | 'fill-blank' | 'multiple-choice')[] = [
  'matching',
  'fill-blank',
  'multiple-choice',
]

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
      },
    })
  }

  // Handle health checks gracefully
  if (isHealthCheck(req)) {
    return createHealthCheckResponse()
  }

  try {
    const startTime = Date.now()

    // Get and validate session ID (authorization check)
    const auth = getSessionId(req)
    if (!auth.isValid || !auth.sessionId) {
      return createUnauthorizedResponse(auth.error)
    }

    const sessionId = auth.sessionId

    // Parse request body
    const body: GenerateFromMistakesRequest = await req.json()

    if (!body.wordlistId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: wordlistId',
          },
        } as GenerateFromMistakesResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    const topN = body.topN || DEFAULT_TOP_N
    const questionTypes = body.questionTypes || DEFAULT_QUESTION_TYPES
    const studentSessionIds = body.studentSessionIds

    // Validate question types
    const validTypes = ['matching', 'fill-blank', 'multiple-choice']
    for (const type of questionTypes) {
      if (!validTypes.includes(type)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_QUESTION_TYPE',
              message: `Invalid question type: ${type}. Valid types: ${validTypes.join(', ')}`,
            },
          } as GenerateFromMistakesResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify ownership: Check that the wordlist belongs to this session
    const { data: wordlist, error: wordlistError } = await supabase
      .from('wordlists')
      .select('id, session_id, words')
      .eq('id', body.wordlistId)
      .single()

    if (wordlistError || !wordlist) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'WORDLIST_NOT_FOUND',
            message: 'Wordlist not found',
          },
        } as GenerateFromMistakesResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Authorization check: Only owner can generate questions
    if (wordlist.session_id !== sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to generate questions for this wordlist',
          },
        } as GenerateFromMistakesResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Fetch top N most-missed words
    let mistakesQuery = supabase
      .from('practice_mistakes')
      .select('word, translation, mistake_count, student_session_id')
      .eq('wordlist_id', body.wordlistId)

    // Filter by specific students if provided
    if (studentSessionIds && studentSessionIds.length > 0) {
      mistakesQuery = mistakesQuery.in('student_session_id', studentSessionIds)
    }

    const { data: mistakes, error: mistakesError } = await mistakesQuery

    if (mistakesError) {
      console.error('Failed to fetch mistakes:', mistakesError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to fetch mistakes: ${mistakesError.message}`,
          },
        } as GenerateFromMistakesResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Check if there are any mistakes
    if (!mistakes || mistakes.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'NO_MISTAKES_FOUND',
            message: 'No practice mistakes found for this wordlist',
          },
        } as GenerateFromMistakesResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Calculate total mistakes and unique students
    const totalMistakes = mistakes.reduce((sum, m) => sum + m.mistake_count, 0)
    const uniqueStudents = new Set(mistakes.map((m) => m.student_session_id)).size

    // Aggregate mistakes by word
    const mistakeMap = new Map<string, { word: string; translation: string; totalCount: number }>()

    mistakes.forEach((mistake) => {
      const key = `${mistake.word}|${mistake.translation}`
      const existing = mistakeMap.get(key)

      if (existing) {
        existing.totalCount += mistake.mistake_count
      } else {
        mistakeMap.set(key, {
          word: mistake.word,
          translation: mistake.translation,
          totalCount: mistake.mistake_count,
        })
      }
    })

    // Sort by total count and take top N
    const topMistakes = Array.from(mistakeMap.values())
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, topN)

    // Convert to WordPair format
    const targetWords: WordPair[] = topMistakes.map((m) => ({
      en: m.word,
      zh: m.translation,
    }))

    console.log(`Generating questions for top ${targetWords.length} most-missed words`)

    // Generate practice questions using existing agent
    let result
    try {
      result = await generatePracticeQuestions({
        words: targetWords,
        questionTypes,
        maxQuestionsPerType: topN,
      })
    } catch (error) {
      console.error('Question generation error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: `Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        } as GenerateFromMistakesResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    const generationTime = Date.now() - startTime

    console.log(`Generated questions in ${generationTime}ms`)
    console.log(`- Matching: ${result.questions.matching.length}`)
    console.log(`- Fill-blank: ${result.questions.fillBlank.length}`)
    console.log(`- Multiple choice: ${result.questions.multipleChoice.length}`)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        questions: result.questions,
        targetWords: targetWords.map((w) => w.en),
        metadata: {
          generationTimeMs: generationTime,
          wordCount: targetWords.length,
          questionCounts: {
            matching: result.questions.matching.length,
            fillBlank: result.questions.fillBlank.length,
            multipleChoice: result.questions.multipleChoice.length,
          },
          filteredByStudents: !!(studentSessionIds && studentSessionIds.length > 0),
          mistakeStats: {
            totalMistakes,
            studentCount: uniqueStudents,
          },
        },
      } as GenerateFromMistakesResponse),
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
      } as GenerateFromMistakesResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
