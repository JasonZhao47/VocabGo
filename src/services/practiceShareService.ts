import { supabase } from '@/lib/supabase';

export interface SharePracticeSetResponse {
  shareUrl: string;
  fullUrl: string;
}

export interface SharedPracticeSet {
  id: string;
  questions: {
    matching: any[];
    fillBlank: any[];
    multipleChoice: any[];
  };
  wordlistName: string;
  createdAt: string;
}

/**
 * Generate a shareable URL for a practice set
 */
export async function sharePracticeSet(practiceSetId: string): Promise<SharePracticeSetResponse> {
  const sessionId = localStorage.getItem('session_id');
  
  if (!sessionId) {
    throw new Error('Session ID not found');
  }

  const { data, error } = await supabase.functions.invoke('share-practice-set', {
    body: { practiceSetId },
    headers: {
      'x-session-id': sessionId,
    },
  });

  if (error) {
    console.error('Error sharing practice set:', error);
    throw new Error(error.message || 'Failed to generate share URL');
  }

  return data as SharePracticeSetResponse;
}

/**
 * Retrieve a shared practice set by its URL slug
 */
export async function getSharedPracticeSet(shareUrl: string): Promise<SharedPracticeSet> {
  const { data, error } = await supabase.functions.invoke(`get-shared-practice/${shareUrl}`, {
    method: 'GET',
  });

  if (error) {
    console.error('Error fetching shared practice set:', error);
    throw new Error(error.message || 'Failed to load shared practice set');
  }

  return data as SharedPracticeSet;
}

/**
 * Unshare a practice set (remove public access)
 */
export async function unsharePracticeSet(practiceSetId: string): Promise<void> {
  const sessionId = localStorage.getItem('session_id');
  
  if (!sessionId) {
    throw new Error('Session ID not found');
  }

  const { error } = await supabase
    .from('practice_sets')
    .update({
      is_shared: false,
      share_url: null,
    })
    .eq('id', practiceSetId);

  if (error) {
    console.error('Error unsharing practice set:', error);
    throw new Error('Failed to unshare practice set');
  }
}

/**
 * Delete a shared practice set
 */
export async function deleteSharedPracticeSet(practiceSetId: string): Promise<void> {
  const sessionId = localStorage.getItem('session_id');
  
  if (!sessionId) {
    throw new Error('Session ID not found');
  }

  const { error } = await supabase
    .from('practice_sets')
    .delete()
    .eq('id', practiceSetId);

  if (error) {
    console.error('Error deleting practice set:', error);
    throw new Error('Failed to delete practice set');
  }
}

/**
 * Validate a share URL format
 */
export function isValidShareUrl(shareUrl: string): boolean {
  // Share URLs should be 32 character hex strings
  return /^[0-9a-f]{32}$/i.test(shareUrl);
}
