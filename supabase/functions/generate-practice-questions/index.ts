/**
 * Generate Practice Questions Edge Function
 * 
 * Generates AI-powered practice questions from wordlists:
 * - Matching questions (English-Mandarin pairs)
 * - Fill-in-the-blank questions (contextual sentences)
 * - Multiple choice questions (translation selection)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSessionId, isHealthCheck, createUnauthorizedResponse, createHealthCheckResponse } from '../_shared/auth.ts'
import {
  generatePracticeQuestions,
  type WordPair,
  type QuestionSet,
} from '../_shared/agents/practice-questions.ts'

// Types
interface GenerateQuestionsRequest {
  wordlistId: string
  questionTypes?: ('matching' | 'fill-blank' | 'multiple-choice')[]
  maxQuestionsPerType?: number
}

interface GenerateQuestionsResponse {
  success: boolean
  practiceSetId?: string
  questions?: QuestionSet
  estimatedTimeMinutes?: number
  error?: {
    code: string
    message: string
  }
  metadata?: {
    generationTimeMs: number
    wordCount: number
    questionCounts: {
      matching: number
      fillBlank: number
      multipleChoice: number
    }
    cached?: boolean
  }
}

// Constants
const MIN_WORDS_FOR_QUESTIONS = 4
const DEFAULT_QUESTION_TYPES: ('matching' | 'fill-blank' | 'multiple-choice')[] = [
  'matching',
  'fill-blank',
  'multiple-choice',
]
const MAX_TOTAL_QUESTIONS = 10 // Maximum total questions across all types
const CACHE_DURATION_HOURS = 24 // Cache questions for 24 hours

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

    // Get and validate session ID
    const auth = getSessionId(req)
    if (!auth.isValid || !auth.sessionId) {
      return createUnauthorizedResponse(auth.error)
    }

    const sessionId = auth.sessionId

    // Parse request
    const body: GenerateQuestionsRequest = await req.json()

    if (!body.wordlistId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: wordlistId',
          },
        } as GenerateQuestionsResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    const questionTypes = body.questionTypes || DEFAULT_QUESTION_TYPES
    
    // Calculate questions per type to stay within total limit of ~10 questions
    // Note: Matching always generates 1 exercise (with 4-5 pairs inside)
    // Strategy for all 3 types:
    // - 1 matching exercise (with 5 pairs) + 4 fill-blank + 4 multiple-choice = ~10 total
    let maxQuestionsPerType: number
    if (body.maxQuestionsPerType) {
      maxQuestionsPerType = body.maxQuestionsPerType
    } else if (questionTypes.includes('matching')) {
      // When matching is included, allocate remaining questions to other types
      // Matching always gets 1 exercise, so distribute ~8-9 questions among others
      const nonMatchingTypes = questionTypes.filter(t => t !== 'matching').length
      maxQuestionsPerType = nonMatchingTypes > 0 ? Math.floor(8 / nonMatchingTypes) : 10
    } else {
      // No matching - distribute evenly
      const questionsPerType = Math.floor(MAX_TOTAL_QUESTIONS / questionTypes.length)
      maxQuestionsPerType = questionsPerType
    }

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
          } as GenerateQuestionsResponse),
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

    // Fetch wordlist
    const { data: wordlist, error: fetchError } = await supabase
      .from('wordlists')
      .select('id, words, filename, session_id, is_shared')
      .eq('id', body.wordlistId)
      .single()

    if (fetchError || !wordlist) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'WORDLIST_NOT_FOUND',
            message: 'Wordlist not found',
          },
        } as GenerateQuestionsResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Verify ownership or shared access
    const isOwner = wordlist.session_id === sessionId
    const isShared = wordlist.is_shared === true
    
    if (!isOwner && !isShared) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You do not have access to this wordlist',
          },
        } as GenerateQuestionsResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    const words: WordPair[] = wordlist.words

    // Validate minimum word count
    if (words.length < MIN_WORDS_FOR_QUESTIONS) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INSUFFICIENT_WORDS',
            message: `Minimum ${MIN_WORDS_FOR_QUESTIONS} words required. This wordlist has ${words.length} words.`,
          },
        } as GenerateQuestionsResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Check for cached practice set
    const cacheThreshold = new Date(Date.now() - CACHE_DURATION_HOURS * 60 * 60 * 1000)
    const { data: cachedSet, error: cacheError } = await supabase
      .from('practice_sets')
      .select('id, questions, created_at')
      .eq('wordlist_id', body.wordlistId)
      .eq('is_shared', false)
      .gte('created_at', cacheThreshold.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cachedSet && !cacheError) {
      console.log(`Using cached practice set ${cachedSet.id} for wordlist ${body.wordlistId}`)
      
      const generationTime = Date.now() - startTime
      const questions = cachedSet.questions as QuestionSet
      
      return new Response(
        JSON.stringify({
          success: true,
          practiceSetId: cachedSet.id,
          questions,
          estimatedTimeMinutes: calculateEstimatedTime(questions),
          metadata: {
            generationTimeMs: generationTime,
            wordCount: words.length,
            questionCounts: {
              matching: questions.matching.length,
              fillBlank: questions.fillBlank.length,
              multipleChoice: questions.multipleChoice.length,
            },
            cached: true,
          },
        } as GenerateQuestionsResponse),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    console.log(`Generating questions for wordlist ${body.wordlistId} (${words.length} words)`)

    // Generate questions
    let result
    try {
      result = await generatePracticeQuestions({
        words,
        questionTypes,
        maxQuestionsPerType,
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
        } as GenerateQuestionsResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Save practice set to database
    const { data: practiceSet, error: saveError } = await supabase
      .from('practice_sets')
      .insert({
        wordlist_id: body.wordlistId,
        questions: result.questions,
      })
      .select('id')
      .single()

    if (saveError || !practiceSet) {
      console.error('Failed to save practice set:', saveError)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'SAVE_FAILED',
            message: 'Failed to save practice set',
          },
        } as GenerateQuestionsResponse),
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
        practiceSetId: practiceSet.id,
        questions: result.questions,
        estimatedTimeMinutes: result.estimatedTimeMinutes,
        metadata: {
          generationTimeMs: generationTime,
          wordCount: words.length,
          questionCounts: {
            matching: result.questions.matching.length,
            fillBlank: result.questions.fillBlank.length,
            multipleChoice: result.questions.multipleChoice.length,
          },
          cached: false,
        },
      } as GenerateQuestionsResponse),
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
      } as GenerateQuestionsResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    )
  }
})

// Helper function to calculate estimated time
function calculateEstimatedTime(questions: QuestionSet): number {
  const matchingTime = questions.matching.length * 0.5 // 30 seconds per matching question
  const fillBlankTime = questions.fillBlank.length * 0.75 // 45 seconds per fill-blank
  const multipleChoiceTime = questions.multipleChoice.length * 0.5 // 30 seconds per multiple choice
  
  return Math.ceil(matchingTime + fillBlankTime + multipleChoiceTime)
}
