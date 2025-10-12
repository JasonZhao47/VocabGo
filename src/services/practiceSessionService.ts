/**
 * Practice Session Service
 * Handles API calls for practice session management
 */

import { getSessionId } from '@/lib/session';
import {
  retryWithBackoff,
  withTimeout,
  withGracefulDegradation,
  parsePracticeError,
  type PracticeError,
} from '@/utils/practiceErrorHandler';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

/**
 * Save a completed practice session to the database
 */
export async function savePracticeSession(
  practiceSetId: string,
  startTime: Date,
  endTime: Date,
  answers: Record<string, any>,
  score: number,
  timerDuration?: number
): Promise<SaveSessionResponse> {
  try {
    // Use graceful degradation - if save fails, data is still in local storage
    return await withGracefulDegradation(
      async () => {
        return await retryWithBackoff(
          async () => {
            const sessionId = getSessionId();
            
            const request: SaveSessionRequest = {
              practiceSetId,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              timerDuration,
              answers,
              score,
              completed: true,
            };

            const response = await withTimeout(
              fetch(
                `${SUPABASE_URL}/functions/v1/save-practice-session`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'x-session-id': sessionId,
                  },
                  body: JSON.stringify(request),
                }
              ),
              10000, // 10 second timeout
              'Save session request timed out'
            );

            if (!response.ok) {
              const error = await response.json();
              throw error;
            }

            return await response.json();
          },
          {
            maxRetries: 2,
            retryDelay: 1000,
            onRetry: (attempt, error) => {
              console.log(`Retrying save session (attempt ${attempt}):`, error.message);
            },
          }
        );
      },
      {
        offlineMode: true,
        fallbackData: {
          success: true,
          sessionId: 'offline',
        },
      }
    );
  } catch (error) {
    const practiceError = parsePracticeError(error);
    console.error('Error saving practice session:', practiceError);
    return {
      success: false,
      error: practiceError.userMessage,
    };
  }
}

/**
 * Fetch practice session history
 */
export async function fetchPracticeHistory(
  wordlistId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<FetchHistoryResponse> {
  try {
    return await retryWithBackoff(
      async () => {
        const sessionId = getSessionId();
        
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });
        
        if (wordlistId) {
          params.append('wordlistId', wordlistId);
        }

        const response = await withTimeout(
          fetch(
            `${SUPABASE_URL}/functions/v1/fetch-practice-history?${params}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'x-session-id': sessionId,
              },
            }
          ),
          10000, // 10 second timeout
          'Fetch history request timed out'
        );

        if (!response.ok) {
          const error = await response.json();
          throw error;
        }

        return await response.json();
      },
      {
        maxRetries: 2,
        retryDelay: 1000,
        onRetry: (attempt, error) => {
          console.log(`Retrying fetch history (attempt ${attempt}):`, error.message);
        },
      }
    );
  } catch (error) {
    const practiceError = parsePracticeError(error);
    console.error('Error fetching practice history:', practiceError);
    return {
      success: false,
      error: practiceError.userMessage,
    };
  }
}

/**
 * Trigger cleanup of old practice sessions
 * This is typically called by a cron job, but can be manually triggered
 */
export async function cleanupPracticeSessions(): Promise<{
  success: boolean;
  deletedSessions?: number;
  deletedPracticeSets?: number;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/cleanup-practice-sessions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cleanup practice sessions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cleaning up practice sessions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
