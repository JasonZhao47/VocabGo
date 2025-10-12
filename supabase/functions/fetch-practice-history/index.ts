/**
 * Fetch Practice History Edge Function
 * Retrieves practice session history for a user or specific wordlist
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
};

interface PracticeHistoryItem {
  id: string;
  practiceSetId: string;
  wordlistId: string;
  wordlistName: string;
  startTime: string;
  endTime: string;
  timerDuration?: number;
  score: number;
  completed: boolean;
  questionTypes: string[];
  createdAt: string;
}

interface FetchHistoryResponse {
  success: boolean;
  history?: PracticeHistoryItem[];
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get session ID from headers
    const sessionId = req.headers.get('x-session-id');
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const wordlistId = url.searchParams.get('wordlistId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from('practice_sessions')
      .select(`
        id,
        practice_set_id,
        start_time,
        end_time,
        timer_duration,
        score,
        completed,
        created_at,
        practice_sets!inner (
          id,
          wordlist_id,
          questions,
          wordlists!inner (
            id,
            name
          )
        )
      `)
      .eq('session_id', sessionId)
      .eq('completed', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by wordlist if specified
    if (wordlistId) {
      query = query.eq('practice_sets.wordlist_id', wordlistId);
    }

    const { data: sessions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching practice history:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch practice history' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform data to match expected format
    const history: PracticeHistoryItem[] = (sessions || []).map((session: any) => {
      const practiceSet = session.practice_sets;
      const wordlist = practiceSet.wordlists;
      const questions = practiceSet.questions;

      // Extract question types from questions object
      const questionTypes: string[] = [];
      if (questions.matching && questions.matching.length > 0) {
        questionTypes.push('matching');
      }
      if (questions.fillBlank && questions.fillBlank.length > 0) {
        questionTypes.push('fill-blank');
      }
      if (questions.multipleChoice && questions.multipleChoice.length > 0) {
        questionTypes.push('multiple-choice');
      }

      return {
        id: session.id,
        practiceSetId: session.practice_set_id,
        wordlistId: practiceSet.wordlist_id,
        wordlistName: wordlist.name,
        startTime: session.start_time,
        endTime: session.end_time,
        timerDuration: session.timer_duration,
        score: parseFloat(session.score),
        completed: session.completed,
        questionTypes,
        createdAt: session.created_at,
      };
    });

    const response: FetchHistoryResponse = {
      success: true,
      history,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-practice-history:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
