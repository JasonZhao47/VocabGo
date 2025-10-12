/**
 * Session Results Calculation Utility
 * Implements scoring algorithms for each question type
 */

import type {
  Question,
  Answer,
  SessionResults,
  MatchingQuestion,
  FillBlankQuestion,
  MultipleChoiceQuestion,
  MatchingAnswer,
  FillBlankAnswer,
  MultipleChoiceAnswer,
  PracticeQuestions,
} from '@/types/practice';

/**
 * Calculate complete session results
 */
export function calculateSessionResults(
  questions: PracticeQuestions,
  answers: Map<string, Answer>,
  startTime: Date,
  sessionId: string
): SessionResults {
  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

  let totalCorrect = 0;
  const breakdown: SessionResults['breakdown'] = {};

  // Calculate matching questions
  if (questions.matching.length > 0) {
    const matchingResult = calculateMatchingResults(questions.matching, answers);
    breakdown.matching = matchingResult;
    totalCorrect += matchingResult.correct;
  }

  // Calculate fill-blank questions
  if (questions.fillBlank.length > 0) {
    const fillBlankResult = calculateFillBlankResults(questions.fillBlank, answers);
    breakdown.fillBlank = fillBlankResult;
    totalCorrect += fillBlankResult.correct;
  }

  // Calculate multiple choice questions
  if (questions.multipleChoice.length > 0) {
    const multipleChoiceResult = calculateMultipleChoiceResults(
      questions.multipleChoice,
      answers
    );
    breakdown.multipleChoice = multipleChoiceResult;
    totalCorrect += multipleChoiceResult.correct;
  }

  const totalQuestions =
    questions.matching.length +
    questions.fillBlank.length +
    questions.multipleChoice.length;

  const score = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  return {
    sessionId,
    totalQuestions,
    correctAnswers: totalCorrect,
    score: Math.round(score * 100) / 100,
    duration,
    breakdown,
  };
}

/**
 * Calculate results for matching questions
 */
export function calculateMatchingResults(
  questions: MatchingQuestion[],
  answers: Map<string, Answer>
): { total: number; correct: number; score: number } {
  let correct = 0;

  questions.forEach((question) => {
    const answer = answers.get(question.id) as MatchingAnswer | undefined;
    if (answer && isMatchingAnswerCorrect(question, answer)) {
      correct++;
    }
  });

  const total = questions.length;
  const score = total > 0 ? (correct / total) * 100 : 0;

  return {
    total,
    correct,
    score: Math.round(score * 100) / 100,
  };
}

/**
 * Calculate results for fill-blank questions
 */
export function calculateFillBlankResults(
  questions: FillBlankQuestion[],
  answers: Map<string, Answer>
): { total: number; correct: number; score: number } {
  let correct = 0;

  questions.forEach((question) => {
    const answer = answers.get(question.id) as FillBlankAnswer | undefined;
    if (answer && isFillBlankAnswerCorrect(question, answer)) {
      correct++;
    }
  });

  const total = questions.length;
  const score = total > 0 ? (correct / total) * 100 : 0;

  return {
    total,
    correct,
    score: Math.round(score * 100) / 100,
  };
}

/**
 * Calculate results for multiple choice questions
 */
export function calculateMultipleChoiceResults(
  questions: MultipleChoiceQuestion[],
  answers: Map<string, Answer>
): { total: number; correct: number; score: number } {
  let correct = 0;

  questions.forEach((question) => {
    const answer = answers.get(question.id) as MultipleChoiceAnswer | undefined;
    if (answer && isMultipleChoiceAnswerCorrect(question, answer)) {
      correct++;
    }
  });

  const total = questions.length;
  const score = total > 0 ? (correct / total) * 100 : 0;

  return {
    total,
    correct,
    score: Math.round(score * 100) / 100,
  };
}

/**
 * Validate matching question answer
 */
export function isMatchingAnswerCorrect(
  question: MatchingQuestion,
  answer: MatchingAnswer
): boolean {
  if (!answer.pairs || answer.pairs.length !== question.pairs.length) {
    return false;
  }

  // Check if all pairs are correctly matched
  return answer.pairs.every((pair) => {
    const correctPair = question.pairs.find((p) => p.english === pair.english);
    return correctPair && correctPair.mandarin === pair.selectedMandarin;
  });
}

/**
 * Calculate partial score for matching question (for detailed feedback)
 */
export function calculateMatchingPartialScore(
  question: MatchingQuestion,
  answer: MatchingAnswer
): { correct: number; total: number; percentage: number } {
  if (!answer.pairs) {
    return { correct: 0, total: question.pairs.length, percentage: 0 };
  }

  let correct = 0;
  answer.pairs.forEach((pair) => {
    const correctPair = question.pairs.find((p) => p.english === pair.english);
    if (correctPair && correctPair.mandarin === pair.selectedMandarin) {
      correct++;
    }
  });

  const total = question.pairs.length;
  const percentage = total > 0 ? (correct / total) * 100 : 0;

  return {
    correct,
    total,
    percentage: Math.round(percentage * 100) / 100,
  };
}

/**
 * Validate fill-blank question answer
 */
export function isFillBlankAnswerCorrect(
  question: FillBlankQuestion,
  answer: FillBlankAnswer
): boolean {
  if (!answer.userAnswer) return false;

  const userAnswer = answer.userAnswer.trim().toLowerCase();
  const correctAnswer = question.correctAnswer.trim().toLowerCase();

  // Exact match
  if (userAnswer === correctAnswer) return true;

  // Check acceptable variations
  if (question.acceptableVariations && question.acceptableVariations.length > 0) {
    const isAcceptable = question.acceptableVariations.some(
      (variation) => variation.trim().toLowerCase() === userAnswer
    );
    if (isAcceptable) return true;
  }

  // Fuzzy matching with similarity threshold (85%)
  return calculateStringSimilarity(userAnswer, correctAnswer) >= 0.85;
}

/**
 * Get similarity score for fill-blank answer (for feedback)
 */
export function getFillBlankSimilarity(
  question: FillBlankQuestion,
  answer: FillBlankAnswer
): number {
  if (!answer.userAnswer) return 0;

  const userAnswer = answer.userAnswer.trim().toLowerCase();
  const correctAnswer = question.correctAnswer.trim().toLowerCase();

  return calculateStringSimilarity(userAnswer, correctAnswer);
}

/**
 * Validate multiple choice question answer
 */
export function isMultipleChoiceAnswerCorrect(
  question: MultipleChoiceQuestion,
  answer: MultipleChoiceAnswer
): boolean {
  if (!answer.selectedOption) return false;

  const selectedOption = question.options.find(
    (opt) => opt.text === answer.selectedOption
  );

  return selectedOption?.isCorrect || false;
}

/**
 * Get correct option for multiple choice question
 */
export function getCorrectMultipleChoiceOption(
  question: MultipleChoiceQuestion
): string | null {
  const correctOption = question.options.find((opt) => opt.isCorrect);
  return correctOption?.text || null;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Handle edge cases
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  // Create distance matrix
  const matrix: number[][] = [];

  // Initialize first column
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  // Initialize first row
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  // Calculate similarity as percentage
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

/**
 * Get performance rating based on score
 */
export function getPerformanceRating(score: number): {
  rating: 'excellent' | 'good' | 'fair' | 'needs-improvement';
  message: string;
  color: string;
} {
  if (score >= 90) {
    return {
      rating: 'excellent',
      message: 'Excellent work! You have mastered this vocabulary.',
      color: 'green',
    };
  } else if (score >= 75) {
    return {
      rating: 'good',
      message: 'Good job! Keep practicing to improve further.',
      color: 'blue',
    };
  } else if (score >= 60) {
    return {
      rating: 'fair',
      message: 'Fair performance. Review the material and try again.',
      color: 'yellow',
    };
  } else {
    return {
      rating: 'needs-improvement',
      message: 'Keep practicing! Review the vocabulary and try again.',
      color: 'red',
    };
  }
}

/**
 * Calculate time-based performance metrics
 */
export function calculateTimeMetrics(
  duration: number,
  totalQuestions: number
): {
  averageTimePerQuestion: number;
  formattedDuration: string;
  pace: 'fast' | 'moderate' | 'slow';
} {
  const averageTimePerQuestion = totalQuestions > 0 ? duration / totalQuestions : 0;

  // Format duration as MM:SS
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Determine pace (assuming ~30 seconds per question is moderate)
  let pace: 'fast' | 'moderate' | 'slow';
  if (averageTimePerQuestion < 20) {
    pace = 'fast';
  } else if (averageTimePerQuestion < 40) {
    pace = 'moderate';
  } else {
    pace = 'slow';
  }

  return {
    averageTimePerQuestion: Math.round(averageTimePerQuestion),
    formattedDuration,
    pace,
  };
}

/**
 * Generate detailed feedback for session results
 */
export function generateSessionFeedback(results: SessionResults): {
  overall: string;
  strengths: string[];
  improvements: string[];
} {
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Analyze breakdown
  if (results.breakdown.matching) {
    const { score } = results.breakdown.matching;
    if (score >= 80) {
      strengths.push('Strong performance on matching questions');
    } else if (score < 60) {
      improvements.push('Practice word-translation associations more');
    }
  }

  if (results.breakdown.fillBlank) {
    const { score } = results.breakdown.fillBlank;
    if (score >= 80) {
      strengths.push('Excellent contextual understanding');
    } else if (score < 60) {
      improvements.push('Focus on using words in context');
    }
  }

  if (results.breakdown.multipleChoice) {
    const { score } = results.breakdown.multipleChoice;
    if (score >= 80) {
      strengths.push('Good recognition of word meanings');
    } else if (score < 60) {
      improvements.push('Review word definitions and meanings');
    }
  }

  const performanceRating = getPerformanceRating(results.score);

  return {
    overall: performanceRating.message,
    strengths,
    improvements,
  };
}

/**
 * Compare session results with previous attempts
 */
export function compareWithPrevious(
  currentResults: SessionResults,
  previousResults: SessionResults[]
): {
  improvement: number;
  trend: 'improving' | 'stable' | 'declining';
  message: string;
} {
  if (previousResults.length === 0) {
    return {
      improvement: 0,
      trend: 'stable',
      message: 'This is your first attempt!',
    };
  }

  const previousScore = previousResults[previousResults.length - 1].score;
  const improvement = currentResults.score - previousScore;

  let trend: 'improving' | 'stable' | 'declining';
  if (improvement > 5) {
    trend = 'improving';
  } else if (improvement < -5) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  let message: string;
  if (trend === 'improving') {
    message = `Great progress! You improved by ${Math.abs(improvement).toFixed(1)}%`;
  } else if (trend === 'declining') {
    message = `Score decreased by ${Math.abs(improvement).toFixed(1)}%. Keep practicing!`;
  } else {
    message = 'Your performance is consistent. Keep it up!';
  }

  return {
    improvement: Math.round(improvement * 100) / 100,
    trend,
    message,
  };
}
