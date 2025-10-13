/**
 * Cleanup Practice Sessions Edge Function
 * Removes old incomplete sessions and expired practice sets
 * This function should be called periodically (e.g., via cron job)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { isHealthCheck, createHealthCheckResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResponse {
  success: boolean;
  deletedSessions?: number;
  deletedPracticeSets?: number;
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
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate cutoff dates
    const now = new Date();
    const incompleteCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const completedCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Delete incomplete sessions older than 24 hours
    const { data: incompleteSessions, error: incompleteError } = await supabase
      .from('practice_sessions')
      .delete()
      .eq('completed', false)
      .lt('created_at', incompleteCutoff.toISOString())
      .select('id');

    if (incompleteError) {
      console.error('Error deleting incomplete sessions:', incompleteError);
    }

    // Delete completed sessions older than 90 days
    const { data: oldSessions, error: oldError } = await supabase
      .from('practice_sessions')
      .delete()
      .eq('completed', true)
      .lt('created_at', completedCutoff.toISOString())
      .select('id');

    if (oldError) {
      console.error('Error deleting old sessions:', oldError);
    }

    // Find practice sets with no associated sessions
    const { data: orphanedSets, error: orphanedError } = await supabase
      .from('practice_sets')
      .select('id')
      .not('id', 'in', `(SELECT DISTINCT practice_set_id FROM practice_sessions)`);

    let deletedPracticeSets = 0;
    if (!orphanedError && orphanedSets && orphanedSets.length > 0) {
      // Delete orphaned practice sets older than 7 days
      const practiceSetCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: deletedSets, error: deleteError } = await supabase
        .from('practice_sets')
        .delete()
        .in('id', orphanedSets.map(s => s.id))
        .lt('created_at', practiceSetCutoff.toISOString())
        .select('id');

      if (!deleteError && deletedSets) {
        deletedPracticeSets = deletedSets.length;
      }
    }

    // Delete unshared practice sets older than 30 days
    const practiceSetCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { data: oldPracticeSets, error: oldPracticeError } = await supabase
      .from('practice_sets')
      .delete()
      .eq('is_shared', false)
      .lt('created_at', practiceSetCutoff.toISOString())
      .select('id');

    if (!oldPracticeError && oldPracticeSets) {
      deletedPracticeSets += oldPracticeSets.length;
    }

    const deletedSessions = 
      (incompleteSessions?.length || 0) + 
      (oldSessions?.length || 0);

    const response: CleanupResponse = {
      success: true,
      deletedSessions,
      deletedPracticeSets,
    };

    console.log(`Cleanup completed: ${deletedSessions} sessions, ${deletedPracticeSets} practice sets deleted`);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-practice-sessions:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
