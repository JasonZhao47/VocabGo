/**
 * Practice Question Generator Types
 * Defines interfaces for question types and question generation
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

// Practice Questions Structure
export interface PracticeQuestions {
  matching: MatchingQuestion[];
  fillBlank: FillBlankQuestion[];
  multipleChoice: MultipleChoiceQuestion[];
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
