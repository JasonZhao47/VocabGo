/**
 * Practice Question Service
 * Handles API calls for practice question generation
 */

import { getSessionId } from '@/lib/session';
import {
  retryWithBackoff,
  withTimeout,
  parsePracticeError,
  PracticeErrorCode,
  type PracticeError,
} from '@/utils/practiceErrorHandler';
import type { PracticeQuestions } from '@/types/practice';
import { analyticsService } from './practiceAnalyticsService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface GenerateQuestionsRequest {
  wordlistId: string;
  questionTypes?: ('matching' | 'fill-blank' | 'multiple-choice')[];
  maxQuestionsPerType?: number;
}

interface GenerateQuestionsResponse {
  success: boolean;
  practiceSetId?: string;
  questions?: PracticeQuestions;
  estimatedTimeMinutes?: number;
  metadata?: {
    generationTimeMs: number;
    wordCount: number;
    questionCounts: {
      matching: number;
      fillBlank: number;
      multipleChoice: number;
    };
    cached?: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Generate practice questions from a wordlist
 */
export async function generatePracticeQuestions(
  wordlistId: string,
  questionTypes?: ('matching' | 'fill-blank' | 'multiple-choice')[],
  maxQuestionsPerType?: number,
  onProgress?: (message: string) => void
): Promise<GenerateQuestionsResponse> {
  const startTime = performance.now();
  
  try {
    const result = await retryWithBackoff(
      async () => {
        const sessionId = getSessionId();
        
        const request: GenerateQuestionsRequest = {
          wordlistId,
          questionTypes,
          maxQuestionsPerType,
        };

        onProgress?.('Generating practice questions...');

        const response = await withTimeout(
          fetch(
            `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
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
          30000, // 30 second timeout (AI generation can take time)
          'Question generation timed out'
        );

        if (!response.ok) {
          const error = await response.json();
          throw error;
        }

        const result = await response.json();
        
        if (result.metadata?.cached) {
          onProgress?.('Loaded cached questions');
        } else {
          onProgress?.('Questions generated successfully');
        }

        return result;
      },
      {
        maxRetries: 2,
        retryDelay: 2000,
        backoffMultiplier: 2,
        onRetry: (attempt, error) => {
          console.log(`Retrying question generation (attempt ${attempt}):`, error.message);
          onProgress?.(`Retrying... (attempt ${attempt})`);
        },
      }
    );

    // Track successful generation
    const endTime = performance.now();
    const generationTime = endTime - startTime;

    analyticsService.trackGeneration({
      wordlistId,
      wordlistSize: result.metadata?.wordCount || 0,
      questionTypes: questionTypes || ['matching', 'fill-blank', 'multiple-choice'],
      generationTime,
      success: true,
      cacheHit: result.metadata?.cached || false,
      timestamp: new Date(),
    });

    return result;
  } catch (error) {
    const practiceError = parsePracticeError(error);
    console.error('Error generating practice questions:', practiceError);
    
    // Track failed generation
    const endTime = performance.now();
    const generationTime = endTime - startTime;

    analyticsService.trackGeneration({
      wordlistId,
      wordlistSize: 0,
      questionTypes: questionTypes || ['matching', 'fill-blank', 'multiple-choice'],
      generationTime,
      success: false,
      errorType: practiceError.code,
      cacheHit: false,
      timestamp: new Date(),
    });

    analyticsService.logError({
      type: 'generation',
      severity: practiceError.code === PracticeErrorCode.TIMEOUT ? 'high' : 'medium',
      message: practiceError.userMessage,
      context: {
        wordlistId,
        questionTypes,
        error: practiceError,
      },
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
    
    // Return error response
    return {
      success: false,
      error: {
        code: practiceError.code,
        message: practiceError.userMessage,
      },
    };
  }
}

/**
 * Validate if a wordlist can generate practice questions
 */
export function canGenerateQuestions(wordCount: number): {
  canGenerate: boolean;
  reason?: string;
} {
  const MIN_WORDS = 4;
  
  if (wordCount < MIN_WORDS) {
    return {
      canGenerate: false,
      reason: `At least ${MIN_WORDS} words are required to generate practice questions. This wordlist has ${wordCount} word${wordCount === 1 ? '' : 's'}.`,
    };
  }
  
  return { canGenerate: true };
}

/**
 * Get recommended question types based on word count
 */
export function getRecommendedQuestionTypes(
  wordCount: number
): ('matching' | 'fill-blank' | 'multiple-choice')[] {
  const types: ('matching' | 'fill-blank' | 'multiple-choice')[] = [];
  
  // Matching requires at least 4 words
  if (wordCount >= 4) {
    types.push('matching');
  }
  
  // Fill-blank works with any number of words
  types.push('fill-blank');
  
  // Multiple choice requires at least 4 words for good distractors
  if (wordCount >= 4) {
    types.push('multiple-choice');
  }
  
  return types;
}

/**
 * Estimate generation time based on word count
 */
export function estimateGenerationTime(wordCount: number): number {
  // Rough estimate: 0.2 seconds per word
  const baseTime = wordCount * 0.2;
  
  // Add overhead for AI processing
  const overhead = 2;
  
  return Math.ceil(baseTime + overhead);
}
