/**
 * Save Practice Session Edge Function
 * Saves completed practice session results to the database
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getSessionId, isHealthCheck, createUnauthorizedResponse, createHealthCheckResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
};

interface SaveSessionRequest {
  practiceSetId: string;
  startTime: string;
  endTime: string;
  timerDuration?: number;
  answers: Record<string, any>;
  score: number;
  completed: boolean;
}

interface SaveSessionResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle health checks gracefully
  if (isHealthCheck(req)) {
    return createHealthCheckResponse();
  }

  try {
    // Get and validate session ID
    const auth = getSessionId(req);
    if (!auth.isValid || !auth.sessionId) {
      return createUnauthorizedResponse(auth.error);
    }

    const sessionId = auth.sessionId;

    // Parse request body
    const body: SaveSessionRequest = await req.json();
    const { practiceSetId, startTime, endTime, timerDuration, answers, score, completed } = body;

    // Validate required fields
    if (!practiceSetId || !startTime || !endTime || !answers || score === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate score range
    if (score < 0 || score > 100) {
      return new Response(
        JSON.stringify({ error: 'Score must be between 0 and 100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify practice set exists and belongs to user's wordlist
    const { data: practiceSet, error: practiceSetError } = await supabase
      .from('practice_sets')
      .select('id, wordlist_id')
      .eq('id', practiceSetId)
      .single();

    if (practiceSetError || !practiceSet) {
      return new Response(
        JSON.stringify({ error: 'Practice set not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify wordlist belongs to user
    const { data: wordlist, error: wordlistError } = await supabase
      .from('wordlists')
      .select('id')
      .eq('id', practiceSet.wordlist_id)
      .eq('session_id', sessionId)
      .single();

    if (wordlistError || !wordlist) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to practice set' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert practice session
    const { data: session, error: insertError } = await supabase
      .from('practice_sessions')
      .insert({
        practice_set_id: practiceSetId,
        session_id: sessionId,
        start_time: startTime,
        end_time: endTime,
        timer_duration: timerDuration || null,
        answers: answers,
        score: score,
        completed: completed ?? true,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting practice session:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save practice session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: SaveSessionResponse = {
      success: true,
      sessionId: session.id,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in save-practice-session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
