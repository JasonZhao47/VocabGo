/**
 * Tests for usePracticeSession composable
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePracticeSession } from './usePracticeSession';
import type { PracticeSet } from '@/types/practice';

describe('usePracticeSession', () => {
  let mockPracticeSet: PracticeSet;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.useFakeTimers();

    mockPracticeSet = {
      id: 'test-set-1',
      wordlistId: 'wordlist-1',
      questions: {
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
      },
      createdAt: new Date(),
      isShared: false,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Session Initialization', () => {
    it('should initialize session with correct state', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      expect(session.sessionId.value).toBeDefined();
      expect(session.currentQuestionIndex.value).toBe(0);
      expect(session.totalQuestions.value).toBe(3);
      expect(session.answeredCount.value).toBe(0);
      expect(session.isCompleted.value).toBe(false);
    });

    it('should initialize with timer when duration is provided', () => {
      const session = usePracticeSession({
        practiceSet: mockPracticeSet,
        timerDuration: 10,
      });

      expect(session.hasTimer.value).toBe(true);
      expect(session.timeRemaining.value).toBe(600); // 10 minutes = 600 seconds
    });

    it('should initialize without timer when duration is not provided', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      expect(session.hasTimer.value).toBe(false);
      expect(session.timeRemaining.value).toBe(0);
    });
  });

  describe('Question Navigation', () => {
    it('should navigate to next question', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      expect(session.currentQuestionIndex.value).toBe(0);
      session.nextQuestion();
      expect(session.currentQuestionIndex.value).toBe(1);
    });

    it('should navigate to previous question', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      session.nextQuestion();
      expect(session.currentQuestionIndex.value).toBe(1);
      session.previousQuestion();
      expect(session.currentQuestionIndex.value).toBe(0);
    });

    it('should not go beyond last question', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      session.goToQuestion(2);
      expect(session.currentQuestionIndex.value).toBe(2);
      session.nextQuestion();
      expect(session.currentQuestionIndex.value).toBe(2);
    });

    it('should not go before first question', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      expect(session.currentQuestionIndex.value).toBe(0);
      session.previousQuestion();
      expect(session.currentQuestionIndex.value).toBe(0);
    });

    it('should jump to specific question', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      session.goToQuestion(2);
      expect(session.currentQuestionIndex.value).toBe(2);
    });
  });

  describe('Answer Management', () => {
    it('should submit and retrieve matching answer', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      const answer = {
        questionId: 'match-1',
        pairs: [
          { english: 'hello', selectedMandarin: '你好' },
          { english: 'goodbye', selectedMandarin: '再见' },
        ],
      };

      session.submitAnswer('match-1', answer);
      expect(session.hasAnswer('match-1')).toBe(true);
      expect(session.getAnswer('match-1')).toEqual(answer);
      expect(session.answeredCount.value).toBe(1);
    });

    it('should submit and retrieve fill-blank answer', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      const answer = {
        questionId: 'fill-1',
        userAnswer: 'hello',
      };

      session.submitAnswer('fill-1', answer);
      expect(session.hasAnswer('fill-1')).toBe(true);
      expect(session.getAnswer('fill-1')).toEqual(answer);
    });

    it('should submit and retrieve multiple choice answer', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      const answer = {
        questionId: 'mc-1',
        selectedOption: '你好',
      };

      session.submitAnswer('mc-1', answer);
      expect(session.hasAnswer('mc-1')).toBe(true);
      expect(session.getAnswer('mc-1')).toEqual(answer);
    });
  });

  describe('Timer Functionality', () => {
    it('should countdown timer', () => {
      const session = usePracticeSession({
        practiceSet: mockPracticeSet,
        timerDuration: 1,
      });

      expect(session.timeRemaining.value).toBe(60);
      
      vi.advanceTimersByTime(1000);
      expect(session.timeRemaining.value).toBe(59);
      
      vi.advanceTimersByTime(5000);
      expect(session.timeRemaining.value).toBe(54);
    });

    it('should pause and resume timer', () => {
      const session = usePracticeSession({
        practiceSet: mockPracticeSet,
        timerDuration: 1,
      });

      expect(session.timeRemaining.value).toBe(60);
      
      vi.advanceTimersByTime(5000);
      expect(session.timeRemaining.value).toBe(55);
      
      session.pauseTimer();
      expect(session.isPaused.value).toBe(true);
      
      vi.advanceTimersByTime(5000);
      expect(session.timeRemaining.value).toBe(55); // Should not change
      
      session.resumeTimer();
      expect(session.isPaused.value).toBe(false);
      
      vi.advanceTimersByTime(5000);
      expect(session.timeRemaining.value).toBe(50);
    });

    it('should call onTimerExpire when timer reaches zero', () => {
      const onTimerExpire = vi.fn();
      const session = usePracticeSession({
        practiceSet: mockPracticeSet,
        timerDuration: 1,
        onTimerExpire,
      });

      vi.advanceTimersByTime(60000); // Advance 60 seconds
      
      expect(onTimerExpire).toHaveBeenCalled();
      expect(session.isCompleted.value).toBe(true);
    });
  });

  describe('Session Completion', () => {
    it('should calculate results correctly', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      // Submit correct answers
      session.submitAnswer('match-1', {
        questionId: 'match-1',
        pairs: [
          { english: 'hello', selectedMandarin: '你好' },
          { english: 'goodbye', selectedMandarin: '再见' },
        ],
      });

      session.submitAnswer('fill-1', {
        questionId: 'fill-1',
        userAnswer: 'hello',
      });

      session.submitAnswer('mc-1', {
        questionId: 'mc-1',
        selectedOption: '你好',
      });

      const results = session.completeSession();

      expect(results.totalQuestions).toBe(3);
      expect(results.correctAnswers).toBe(3);
      expect(results.score).toBe(100);
      expect(session.isCompleted.value).toBe(true);
    });

    it('should calculate partial scores correctly', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      // Submit one correct and two incorrect answers
      session.submitAnswer('match-1', {
        questionId: 'match-1',
        pairs: [
          { english: 'hello', selectedMandarin: '再见' }, // Wrong
          { english: 'goodbye', selectedMandarin: '你好' }, // Wrong
        ],
      });

      session.submitAnswer('fill-1', {
        questionId: 'fill-1',
        userAnswer: 'hello',
      });

      session.submitAnswer('mc-1', {
        questionId: 'mc-1',
        selectedOption: '再见', // Wrong
      });

      const results = session.completeSession();

      expect(results.totalQuestions).toBe(3);
      expect(results.correctAnswers).toBe(1);
      expect(results.score).toBeCloseTo(33.33, 1);
    });

    it('should call onSessionComplete callback', () => {
      const onSessionComplete = vi.fn();
      const session = usePracticeSession({
        practiceSet: mockPracticeSet,
        onSessionComplete,
      });

      session.completeSession();

      expect(onSessionComplete).toHaveBeenCalled();
      expect(onSessionComplete.mock.calls[0][0]).toHaveProperty('score');
    });
  });

  describe('Session Persistence', () => {
    it('should save session to localStorage', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      session.submitAnswer('fill-1', {
        questionId: 'fill-1',
        userAnswer: 'hello',
      });

      const stored = localStorage.getItem('vocabgo_practice_session');
      expect(stored).toBeDefined();
      
      const data = JSON.parse(stored!);
      expect(data.practiceSetId).toBe('test-set-1');
      expect(data.answers).toHaveProperty('fill-1');
    });

    it('should restore session from localStorage', () => {
      // Create and save a session
      const session1 = usePracticeSession({ practiceSet: mockPracticeSet });
      session1.submitAnswer('fill-1', {
        questionId: 'fill-1',
        userAnswer: 'hello',
      });
      session1.nextQuestion();

      // Create new session with same practice set
      const session2 = usePracticeSession({ practiceSet: mockPracticeSet });

      // Should restore previous state
      expect(session2.currentQuestionIndex.value).toBe(1);
      expect(session2.hasAnswer('fill-1')).toBe(true);
    });

    it('should clear session from localStorage on completion', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      session.submitAnswer('fill-1', {
        questionId: 'fill-1',
        userAnswer: 'hello',
      });

      expect(localStorage.getItem('vocabgo_practice_session')).toBeDefined();

      session.completeSession();

      expect(localStorage.getItem('vocabgo_practice_session')).toBeNull();
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress percentage', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      expect(session.progress.value).toBe(0);

      session.nextQuestion();
      expect(session.progress.value).toBeCloseTo(33.33, 1);

      session.nextQuestion();
      expect(session.progress.value).toBeCloseTo(66.67, 1);
    });

    it('should track answered count', () => {
      const session = usePracticeSession({ practiceSet: mockPracticeSet });

      expect(session.answeredCount.value).toBe(0);

      session.submitAnswer('fill-1', {
        questionId: 'fill-1',
        userAnswer: 'hello',
      });

      expect(session.answeredCount.value).toBe(1);

      session.submitAnswer('mc-1', {
        questionId: 'mc-1',
        selectedOption: '你好',
      });

      expect(session.answeredCount.value).toBe(2);
    });
  });

  describe('Session Reset', () => {
    it('should reset session state', () => {
      const session = usePracticeSession({
        practiceSet: mockPracticeSet,
        timerDuration: 10,
      });

      // Make some progress
      session.submitAnswer('fill-1', {
        questionId: 'fill-1',
        userAnswer: 'hello',
      });
      session.nextQuestion();
      vi.advanceTimersByTime(5000);

      // Reset
      session.resetSession();

      expect(session.currentQuestionIndex.value).toBe(0);
      expect(session.answeredCount.value).toBe(0);
      expect(session.timeRemaining.value).toBe(600);
      expect(session.isCompleted.value).toBe(false);
    });
  });
});
