/**
 * Practice Question Generator Types
 * Defines interfaces for question types, sessions, and practice management
 */

// Question Type Enums
export type QuestionType = 'matching' | 'fill-blank' | 'multiple-choice';

// Base Question Interface
export interface BaseQuestion {
  id: string;
  type: QuestionType;
}

// Matching Question Type
export interface MatchingPair {
  english: string;
  mandarin: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
  shuffledMandarin: string[];
}

// Fill-in-the-Blank Question Type
export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  sentence: string;
  correctAnswer: string;
  acceptableVariations: string[];
  hint?: string;
}

// Multiple Choice Question Type
export interface MultipleChoiceOption {
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  sentence: string;
  targetWord: string;
  options: MultipleChoiceOption[];
}

// Union type for all question types
export type Question = MatchingQuestion | FillBlankQuestion | MultipleChoiceQuestion;

// Practice Set Structure
export interface PracticeQuestions {
  matching: MatchingQuestion[];
  fillBlank: FillBlankQuestion[];
  multipleChoice: MultipleChoiceQuestion[];
}

export interface PracticeSet {
  id: string;
  wordlistId: string;
  questions: PracticeQuestions;
  createdAt: Date;
  shareUrl?: string;
  isShared: boolean;
}

// Answer Types
export interface MatchingAnswer {
  questionId: string;
  pairs: Array<{
    english: string;
    selectedMandarin: string;
  }>;
}

export interface FillBlankAnswer {
  questionId: string;
  userAnswer: string;
}

export interface MultipleChoiceAnswer {
  questionId: string;
  selectedOption: string;
}

export type Answer = MatchingAnswer | FillBlankAnswer | MultipleChoiceAnswer;

// Practice Session Management
export interface PracticeSession {
  id: string;
  practiceSetId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  timerDuration?: number; // in minutes
  answers: Record<string, Answer>;
  score?: number;
  completed: boolean;
  createdAt: Date;
}

// Session State (for composable)
export interface SessionState {
  currentSession: PracticeSession | null;
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  isPaused: boolean;
  answers: Map<string, Answer>;
}

// Question Generation Request/Response
export interface QuestionGenerationRequest {
  wordlistId: string;
  questionTypes: QuestionType[];
  maxQuestions?: number; // Default: 10 per type
}

export interface QuestionGenerationResponse {
  practiceSetId: string;
  questions: PracticeQuestions;
  estimatedTime: number; // in minutes
}

// Local Storage Schema
export interface LocalPracticeState {
  currentSession?: {
    practiceSetId: string;
    startTime: number;
    timerDuration?: number;
    answers: Record<string, Answer>;
    currentQuestionIndex: number;
  };
  sessionHistory: Array<{
    practiceSetId: string;
    wordlistName: string;
    score: number;
    completedAt: number;
    duration: number;
  }>;
}

// Session Results
export interface SessionResults {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  duration: number; // in seconds
  breakdown: {
    matching?: {
      total: number;
      correct: number;
      score: number;
    };
    fillBlank?: {
      total: number;
      correct: number;
      score: number;
    };
    multipleChoice?: {
      total: number;
      correct: number;
      score: number;
    };
  };
}

// Error Types
export enum QuestionGenerationError {
  INSUFFICIENT_WORDS = 'INSUFFICIENT_WORDS',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface QuestionGenerationErrorResponse {
  error: QuestionGenerationError;
  message: string;
  retryable: boolean;
}

// Share Practice Set
export interface SharePracticeSetRequest {
  practiceSetId: string;
}

export interface SharePracticeSetResponse {
  shareUrl: string;
  htmlContent: string;
}

// Practice History
export interface PracticeHistoryItem {
  sessionId: string;
  practiceSetId: string;
  wordlistName: string;
  score: number;
  completedAt: Date;
  duration: number;
  questionTypes: QuestionType[];
}

export interface PracticeHistoryFilter {
  questionType?: QuestionType;
  startDate?: Date;
  endDate?: Date;
}
