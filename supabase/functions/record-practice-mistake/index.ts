/**
 * Record Practice Mistake Edge Function
 * 
 * Tracks student mistakes during practice sessions. Inserts new mistakes or
 * increments existing mistake counts. Implements rate limiting to prevent abuse.
 * 
 * Requirements: FR3, NFR1, NFR3
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RecordMistakeRequest {
  sessionToken: string
  wordlistId: string
  word: string
  translation: string
  questionType: 'multiple_choice' | 'fill_blank' | 'matching'
}

interface RecordMistakeResponse {
  success: boolean
  mistakeCount?: number
  error?: {
    code: string
    message: string
  }
}

// Rate limiting: Track requests per session token
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // Allow 60 requests per minute (1 per second average)

/**
 * Check if request should be rate limited
 */
function checkRateLimit(sessionToken: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const existing = rateLimitMap.get(sessionToken)

  if (!existing || now > existing.resetAt) {
    // New window or expired window
    rateLimitMap.set(sessionToken, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return { allowed: true }
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  // Increment count
  existing.count++
  return { allowed: true }
}

/**
 * Validate question type
 */
function validateQuestionType(questionType: string): boolean {
  return ['multiple_choice', 'fill_blank', 'matching'].includes(questionType)
}

/**
 * Validate session token format (64 hex chars)
 */
function validateSessionToken(token: string): boolean {
  return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token)
}

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

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request
    const { sessionToken, wordlistId, word, translation, questionType }: RecordMistakeRequest = await req.json()

    // Validate session token format
    if (!validateSessionToken(sessionToken)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_SESSION_TOKEN',
            message: 'Invalid session token format',
          },
        } as RecordMistakeResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(sessionToken)
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Please try again in ${rateLimit.retryAfter} seconds.`,
          },
        } as RecordMistakeResponse),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Retry-After': String(rateLimit.retryAfter),
          },
        }
      )
    }

    // Validate required fields
    if (!wordlistId || !word || !translation || !questionType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: sessionToken, wordlistId, word, translation, questionType',
          },
        } as RecordMistakeResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Validate question type
    if (!validateQuestionType(questionType)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_QUESTION_TYPE',
            message: 'Question type must be one of: multiple_choice, fill_blank, matching',
          },
        } as RecordMistakeResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Look up student session by session token and wordlist
    // Use wordlist_id to ensure we get the correct session if multiple exist
    const { data: session, error: sessionError } = await supabaseClient
      .from('student_sessions')
      .select('id, wordlist_id')
      .eq('session_token', sessionToken)
      .eq('wordlist_id', wordlistId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessionError || !session) {
      console.error('Session lookup error:', sessionError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Student session not found. Please register first.',
          },
        } as RecordMistakeResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Verify wordlist matches session
    if (session.wordlist_id !== wordlistId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'WORDLIST_MISMATCH',
            message: 'Wordlist does not match student session',
          },
        } as RecordMistakeResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Check for existing mistake record
    const { data: existingMistake, error: mistakeLookupError } = await supabaseClient
      .from('practice_mistakes')
      .select('id, mistake_count')
      .eq('student_session_id', session.id)
      .eq('word', word)
      .eq('translation', translation)
      .eq('question_type', questionType)
      .maybeSingle()

    if (mistakeLookupError) {
      console.error('Mistake lookup error:', mistakeLookupError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to check existing mistake: ${mistakeLookupError.message}`,
          },
        } as RecordMistakeResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    let mistakeCount: number

    if (existingMistake) {
      // Increment existing mistake count
      mistakeCount = existingMistake.mistake_count + 1

      const { error: updateError } = await supabaseClient
        .from('practice_mistakes')
        .update({
          mistake_count: mistakeCount,
          last_mistake_at: new Date().toISOString(),
        })
        .eq('id', existingMistake.id)

      if (updateError) {
        console.error('Mistake update error:', updateError)
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: `Failed to update mistake: ${updateError.message}`,
            },
          } as RecordMistakeResponse),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      console.log(`Incremented mistake count to ${mistakeCount} for word "${word}"`)
    } else {
      // Insert new mistake record
      mistakeCount = 1

      const { error: insertError } = await supabaseClient
        .from('practice_mistakes')
        .insert({
          student_session_id: session.id,
          wordlist_id: wordlistId,
          word,
          translation,
          question_type: questionType,
          mistake_count: mistakeCount,
        })

      if (insertError) {
        console.error('Mistake insert error:', insertError)
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: `Failed to record mistake: ${insertError.message}`,
            },
          } as RecordMistakeResponse),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        )
      }

      console.log(`Recorded new mistake for word "${word}"`)
    }

    // Update student session last_active_at
    const { error: sessionUpdateError } = await supabaseClient
      .from('student_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', session.id)

    if (sessionUpdateError) {
      console.error('Session update error:', sessionUpdateError)
      // Non-fatal - continue with success response
    }

    // Return success with mistake count
    return new Response(
      JSON.stringify({
        success: true,
        mistakeCount,
      } as RecordMistakeResponse),
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
      } as RecordMistakeResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})
