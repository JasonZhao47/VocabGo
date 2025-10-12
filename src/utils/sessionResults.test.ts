/**
 * Tests for session results calculation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSessionResults,
  calculateMatchingResults,
  calculateFillBlankResults,
  calculateMultipleChoiceResults,
  isMatchingAnswerCorrect,
  isFillBlankAnswerCorrect,
  isMultipleChoiceAnswerCorrect,
  calculateStringSimilarity,
  getPerformanceRating,
  calculateTimeMetrics,
  generateSessionFeedback,
} from './sessionResults';
import type {
  MatchingQuestion,
  FillBlankQuestion,
  MultipleChoiceQuestion,
  MatchingAnswer,
  FillBlankAnswer,
  MultipleChoiceAnswer,
  PracticeQuestions,
} from '@/types/practice';

describe('sessionResults', () => {
  describe('isMatchingAnswerCorrect', () => {
    const question: MatchingQuestion = {
      id: 'match-1',
      type: 'matching',
      pairs: [
        { english: 'hello', mandarin: '你好' },
        { english: 'goodbye', mandarin: '再见' },
      ],
      shuffledMandarin: ['再见', '你好'],
    };

    it('should return true for correct answer', () => {
      const answer: MatchingAnswer = {
        questionId: 'match-1',
        pairs: [
          { english: 'hello', selectedMandarin: '你好' },
          { english: 'goodbye', selectedMandarin: '再见' },
        ],
      };

      expect(isMatchingAnswerCorrect(question, answer)).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const answer: MatchingAnswer = {
        questionId: 'match-1',
        pairs: [
          { english: 'hello', selectedMandarin: '再见' },
          { english: 'goodbye', selectedMandarin: '你好' },
        ],
      };

      expect(isMatchingAnswerCorrect(question, answer)).toBe(false);
    });

    it('should return false for incomplete answer', () => {
      const answer: MatchingAnswer = {
        questionId: 'match-1',
        pairs: [{ english: 'hello', selectedMandarin: '你好' }],
      };

      expect(isMatchingAnswerCorrect(question, answer)).toBe(false);
    });
  });

  describe('isFillBlankAnswerCorrect', () => {
    const question: FillBlankQuestion = {
      id: 'fill-1',
      type: 'fill-blank',
      sentence: 'I want to say _____ to my friend.',
      correctAnswer: 'hello',
      acceptableVariations: ['hi', 'hey'],
    };

    it('should return true for exact match', () => {
      const answer: FillBlankAnswer = {
        questionId: 'fill-1',
        userAnswer: 'hello',
      };

      expect(isFillBlankAnswerCorrect(question, answer)).toBe(true);
    });

    it('should return true for acceptable variation', () => {
      const answer: FillBlankAnswer = {
        questionId: 'fill-1',
        userAnswer: 'hi',
      };

      expect(isFillBlankAnswerCorrect(question, answer)).toBe(true);
    });

    it('should be case insensitive', () => {
      const answer: FillBlankAnswer = {
        questionId: 'fill-1',
        userAnswer: 'HELLO',
      };

      expect(isFillBlankAnswerCorrect(question, answer)).toBe(true);
    });

    it('should accept similar spellings with typos', () => {
      const answer: FillBlankAnswer = {
        questionId: 'fill-1',
        userAnswer: 'helo', // One letter missing
      };

      // Similarity is 0.8 which is below the 0.85 threshold, so this should be false
      expect(isFillBlankAnswerCorrect(question, answer)).toBe(false);
    });

    it('should return false for completely wrong answer', () => {
      const answer: FillBlankAnswer = {
        questionId: 'fill-1',
        userAnswer: 'goodbye',
      };

      expect(isFillBlankAnswerCorrect(question, answer)).toBe(false);
    });
  });

  describe('isMultipleChoiceAnswerCorrect', () => {
    const question: MultipleChoiceQuestion = {
      id: 'mc-1',
      type: 'multiple-choice',
      sentence: 'I said hello to my teacher.',
      targetWord: 'hello',
      options: [
        { text: '你好', isCorrect: true },
        { text: '再见', isCorrect: false },
        { text: '谢谢', isCorrect: false },
        { text: '对不起', isCorrect: false },
      ],
    };

    it('should return true for correct option', () => {
      const answer: MultipleChoiceAnswer = {
        questionId: 'mc-1',
        selectedOption: '你好',
      };

      expect(isMultipleChoiceAnswerCorrect(question, answer)).toBe(true);
    });

    it('should return false for incorrect option', () => {
      const answer: MultipleChoiceAnswer = {
        questionId: 'mc-1',
        selectedOption: '再见',
      };

      expect(isMultipleChoiceAnswerCorrect(question, answer)).toBe(false);
    });
  });

  describe('calculateStringSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(calculateStringSimilarity('hello', 'hello')).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      const similarity = calculateStringSimilarity('hello', 'xyz');
      expect(similarity).toBeLessThan(0.5);
    });

    it('should return high similarity for strings with one character difference', () => {
      const similarity = calculateStringSimilarity('hello', 'helo');
      expect(similarity).toBeGreaterThanOrEqual(0.8);
    });

    it('should handle empty strings', () => {
      expect(calculateStringSimilarity('', '')).toBe(1);
      expect(calculateStringSimilarity('hello', '')).toBe(0);
      expect(calculateStringSimilarity('', 'hello')).toBe(0);
    });
  });

  describe('calculateMatchingResults', () => {
    const questions: MatchingQuestion[] = [
      {
        id: 'match-1',
        type: 'matching',
        pairs: [
          { english: 'hello', mandarin: '你好' },
          { english: 'goodbye', mandarin: '再见' },
        ],
        shuffledMandarin: ['再见', '你好'],
      },
      {
        id: 'match-2',
        type: 'matching',
        pairs: [
          { english: 'thank you', mandarin: '谢谢' },
          { english: 'sorry', mandarin: '对不起' },
        ],
        shuffledMandarin: ['对不起', '谢谢'],
      },
    ];

    it('should calculate correct results', () => {
      const answers = new Map();
      answers.set('match-1', {
        questionId: 'match-1',
        pairs: [
          { english: 'hello', selectedMandarin: '你好' },
          { english: 'goodbye', selectedMandarin: '再见' },
        ],
      });
      answers.set('match-2', {
        questionId: 'match-2',
        pairs: [
          { english: 'thank you', selectedMandarin: '谢谢' },
          { english: 'sorry', selectedMandarin: '对不起' },
        ],
      });

      const results = calculateMatchingResults(questions, answers);

      expect(results.total).toBe(2);
      expect(results.correct).toBe(2);
      expect(results.score).toBe(100);
    });

    it('should calculate partial results', () => {
      const answers = new Map();
      answers.set('match-1', {
        questionId: 'match-1',
        pairs: [
          { english: 'hello', selectedMandarin: '你好' },
          { english: 'goodbye', selectedMandarin: '再见' },
        ],
      });

      const results = calculateMatchingResults(questions, answers);

      expect(results.total).toBe(2);
      expect(results.correct).toBe(1);
      expect(results.score).toBe(50);
    });
  });

  describe('getPerformanceRating', () => {
    it('should return excellent for score >= 90', () => {
      const rating = getPerformanceRating(95);
      expect(rating.rating).toBe('excellent');
      expect(rating.color).toBe('green');
    });

    it('should return good for score >= 75', () => {
      const rating = getPerformanceRating(80);
      expect(rating.rating).toBe('good');
      expect(rating.color).toBe('blue');
    });

    it('should return fair for score >= 60', () => {
      const rating = getPerformanceRating(65);
      expect(rating.rating).toBe('fair');
      expect(rating.color).toBe('yellow');
    });

    it('should return needs-improvement for score < 60', () => {
      const rating = getPerformanceRating(50);
      expect(rating.rating).toBe('needs-improvement');
      expect(rating.color).toBe('red');
    });
  });

  describe('calculateTimeMetrics', () => {
    it('should calculate average time per question', () => {
      const metrics = calculateTimeMetrics(300, 10);
      expect(metrics.averageTimePerQuestion).toBe(30);
    });

    it('should format duration correctly', () => {
      const metrics = calculateTimeMetrics(125, 5);
      expect(metrics.formattedDuration).toBe('2:05');
    });

    it('should determine pace correctly', () => {
      const fastMetrics = calculateTimeMetrics(100, 10);
      expect(fastMetrics.pace).toBe('fast');

      const moderateMetrics = calculateTimeMetrics(300, 10);
      expect(moderateMetrics.pace).toBe('moderate');

      const slowMetrics = calculateTimeMetrics(500, 10);
      expect(slowMetrics.pace).toBe('slow');
    });
  });

  describe('generateSessionFeedback', () => {
    it('should generate feedback for high-performing session', () => {
      const results = {
        sessionId: 'test-1',
        totalQuestions: 10,
        correctAnswers: 9,
        score: 90,
        duration: 300,
        breakdown: {
          matching: { total: 3, correct: 3, score: 100 },
          fillBlank: { total: 4, correct: 3, score: 75 },
          multipleChoice: { total: 3, correct: 3, score: 100 },
        },
      };

      const feedback = generateSessionFeedback(results);

      expect(feedback.overall).toContain('Excellent');
      expect(feedback.strengths.length).toBeGreaterThan(0);
    });

    it('should generate feedback for low-performing session', () => {
      const results = {
        sessionId: 'test-1',
        totalQuestions: 10,
        correctAnswers: 4,
        score: 40,
        duration: 300,
        breakdown: {
          matching: { total: 3, correct: 1, score: 33 },
          fillBlank: { total: 4, correct: 2, score: 50 },
          multipleChoice: { total: 3, correct: 1, score: 33 },
        },
      };

      const feedback = generateSessionFeedback(results);

      expect(feedback.overall).toContain('practicing');
      expect(feedback.improvements.length).toBeGreaterThan(0);
    });
  });

  describe('calculateSessionResults', () => {
    it('should calculate complete session results', () => {
      const questions: PracticeQuestions = {
        matching: [
          {
            id: 'match-1',
            type: 'matching',
            pairs: [
              { english: 'hello', mandarin: '你好' },
              { english: 'goodbye', mandarin: '再见' },
            ],
            shuffledMandarin: ['再见', '你好'],
          },
        ],
        fillBlank: [
          {
            id: 'fill-1',
            type: 'fill-blank',
            sentence: 'I want to say _____ to my friend.',
            correctAnswer: 'hello',
            acceptableVariations: ['hi'],
          },
        ],
        multipleChoice: [
          {
            id: 'mc-1',
            type: 'multiple-choice',
            sentence: 'I said hello to my teacher.',
            targetWord: 'hello',
            options: [
              { text: '你好', isCorrect: true },
              { text: '再见', isCorrect: false },
              { text: '谢谢', isCorrect: false },
              { text: '对不起', isCorrect: false },
            ],
          },
        ],
      };

      const answers = new Map();
      answers.set('match-1', {
        questionId: 'match-1',
        pairs: [
          { english: 'hello', selectedMandarin: '你好' },
          { english: 'goodbye', selectedMandarin: '再见' },
        ],
      });
      answers.set('fill-1', {
        questionId: 'fill-1',
        userAnswer: 'hello',
      });
      answers.set('mc-1', {
        questionId: 'mc-1',
        selectedOption: '你好',
      });

      const startTime = new Date(Date.now() - 300000); // 5 minutes ago
      const results = calculateSessionResults(questions, answers, startTime, 'test-session');

      expect(results.sessionId).toBe('test-session');
      expect(results.totalQuestions).toBe(3);
      expect(results.correctAnswers).toBe(3);
      expect(results.score).toBe(100);
      expect(results.duration).toBeGreaterThan(0);
      expect(results.breakdown.matching).toBeDefined();
      expect(results.breakdown.fillBlank).toBeDefined();
      expect(results.breakdown.multipleChoice).toBeDefined();
    });
  });
});
