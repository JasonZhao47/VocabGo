/**
 * Tests for sessionPersistence utility
 * Tests timer functionality, state persistence, session cleanup and expiration logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveSession,
  restoreSession,
  clearSession,
  isSessionExpired,
  saveToHistory,
  getHistory,
  getHistoryForWordlist,
  clearHistory,
  deleteHistoryItem,
  cleanupExpiredSessions,
  getStorageStats,
  exportSessionData,
  importSessionData,
  initializeSessionPersistence,
  type StoredSessionData,
  type SessionHistoryItem,
} from './sessionPersistence';
import type { MatchingAnswer, FillBlankAnswer, MultipleChoiceAnswer } from '@/types/practice';

describe('sessionPersistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Session State Persistence', () => {
    it('should save session to localStorage', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timerDuration: 10,
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      const result = saveSession(sessionData);

      expect(result).toBe(true);
      expect(localStorage.getItem('vocabgo_practice_session')).toBeDefined();
    });

    it('should restore session from localStorage', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timerDuration: 10,
        timeRemaining: 600,
        currentQuestionIndex: 2,
        answers: {
          'q1': { questionId: 'q1', userAnswer: 'test' },
        },
        isPaused: false,
      };

      saveSession(sessionData);
      const restored = restoreSession();

      expect(restored).toBeDefined();
      expect(restored?.practiceSetId).toBe('set-1');
      expect(restored?.sessionId).toBe('session-1');
      expect(restored?.currentQuestionIndex).toBe(2);
      expect(restored?.answers).toHaveProperty('q1');
    });

    it('should return null when no session exists', () => {
      const restored = restoreSession();
      expect(restored).toBeNull();
    });

    it('should clear session from localStorage', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      saveSession(sessionData);
      expect(localStorage.getItem('vocabgo_practice_session')).toBeDefined();

      const result = clearSession();

      expect(result).toBe(true);
      expect(localStorage.getItem('vocabgo_practice_session')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      const result = saveSession(sessionData);

      expect(result).toBe(false);

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('Session Expiration Logic', () => {
    it('should detect expired sessions', () => {
      const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
      expect(isSessionExpired(twentyFiveHoursAgo)).toBe(true);
    });

    it('should detect non-expired sessions', () => {
      const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
      expect(isSessionExpired(oneHourAgo)).toBe(false);
    });

    it('should detect sessions at expiration boundary', () => {
      const exactlyTwentyFourHours = Date.now() - (24 * 60 * 60 * 1000);
      expect(isSessionExpired(exactlyTwentyFourHours)).toBe(false);

      const justOverTwentyFourHours = Date.now() - (24 * 60 * 60 * 1000 + 1000);
      expect(isSessionExpired(justOverTwentyFourHours)).toBe(true);
    });

    it('should return null when restoring expired session', () => {
      const expiredSessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      saveSession(expiredSessionData);
      const restored = restoreSession();

      expect(restored).toBeNull();
      expect(localStorage.getItem('vocabgo_practice_session')).toBeNull();
    });

    it('should cleanup expired sessions automatically', () => {
      const expiredSessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now() - (25 * 60 * 60 * 1000),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      saveSession(expiredSessionData);
      cleanupExpiredSessions();

      expect(localStorage.getItem('vocabgo_practice_session')).toBeNull();
    });

    it('should not cleanup non-expired sessions', () => {
      const validSessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now() - (1 * 60 * 60 * 1000), // 1 hour ago
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      saveSession(validSessionData);
      cleanupExpiredSessions();

      expect(localStorage.getItem('vocabgo_practice_session')).toBeDefined();
    });
  });

  describe('Session History Management', () => {
    it('should save session to history', () => {
      const historyItem: SessionHistoryItem = {
        practiceSetId: 'set-1',
        wordlistId: 'wordlist-1',
        wordlistName: 'Test Wordlist',
        score: 85.5,
        completedAt: Date.now(),
        duration: 300,
        questionTypes: ['matching', 'fill-blank'],
      };

      const result = saveToHistory(historyItem);

      expect(result).toBe(true);
      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].score).toBe(85.5);
    });

    it('should retrieve session history', () => {
      const historyItems: SessionHistoryItem[] = [
        {
          practiceSetId: 'set-1',
          wordlistId: 'wordlist-1',
          wordlistName: 'Test Wordlist 1',
          score: 85,
          completedAt: Date.now(),
          duration: 300,
          questionTypes: ['matching'],
        },
        {
          practiceSetId: 'set-2',
          wordlistId: 'wordlist-2',
          wordlistName: 'Test Wordlist 2',
          score: 90,
          completedAt: Date.now(),
          duration: 400,
          questionTypes: ['fill-blank'],
        },
      ];

      historyItems.forEach(item => saveToHistory(item));
      const history = getHistory();

      expect(history).toHaveLength(2);
      expect(history[0].wordlistName).toBe('Test Wordlist 1');
      expect(history[1].wordlistName).toBe('Test Wordlist 2');
    });

    it('should limit history to 50 sessions', () => {
      // Add 55 sessions
      for (let i = 0; i < 55; i++) {
        const historyItem: SessionHistoryItem = {
          practiceSetId: `set-${i}`,
          wordlistId: `wordlist-${i}`,
          wordlistName: `Test Wordlist ${i}`,
          score: 80 + i,
          completedAt: Date.now() + i,
          duration: 300,
          questionTypes: ['matching'],
        };
        saveToHistory(historyItem);
      }

      const history = getHistory();
      expect(history).toHaveLength(50);
      // Should keep the most recent 50
      expect(history[0].wordlistName).toBe('Test Wordlist 5');
      expect(history[49].wordlistName).toBe('Test Wordlist 54');
    });

    it('should filter history by wordlist', () => {
      const historyItems: SessionHistoryItem[] = [
        {
          practiceSetId: 'set-1',
          wordlistId: 'wordlist-1',
          wordlistName: 'Wordlist 1',
          score: 85,
          completedAt: Date.now(),
          duration: 300,
          questionTypes: ['matching'],
        },
        {
          practiceSetId: 'set-2',
          wordlistId: 'wordlist-2',
          wordlistName: 'Wordlist 2',
          score: 90,
          completedAt: Date.now(),
          duration: 400,
          questionTypes: ['fill-blank'],
        },
        {
          practiceSetId: 'set-3',
          wordlistId: 'wordlist-1',
          wordlistName: 'Wordlist 1',
          score: 95,
          completedAt: Date.now(),
          duration: 350,
          questionTypes: ['multiple-choice'],
        },
      ];

      historyItems.forEach(item => saveToHistory(item));
      const filtered = getHistoryForWordlist('wordlist-1');

      expect(filtered).toHaveLength(2);
      expect(filtered[0].score).toBe(85);
      expect(filtered[1].score).toBe(95);
    });

    it('should clear all history', () => {
      const historyItem: SessionHistoryItem = {
        practiceSetId: 'set-1',
        wordlistId: 'wordlist-1',
        wordlistName: 'Test Wordlist',
        score: 85,
        completedAt: Date.now(),
        duration: 300,
        questionTypes: ['matching'],
      };

      saveToHistory(historyItem);
      expect(getHistory()).toHaveLength(1);

      const result = clearHistory();

      expect(result).toBe(true);
      expect(getHistory()).toHaveLength(0);
    });

    it('should delete specific history item', () => {
      const completedAt1 = Date.now();
      const completedAt2 = Date.now() + 1000;

      const historyItems: SessionHistoryItem[] = [
        {
          practiceSetId: 'set-1',
          wordlistId: 'wordlist-1',
          wordlistName: 'Wordlist 1',
          score: 85,
          completedAt: completedAt1,
          duration: 300,
          questionTypes: ['matching'],
        },
        {
          practiceSetId: 'set-2',
          wordlistId: 'wordlist-2',
          wordlistName: 'Wordlist 2',
          score: 90,
          completedAt: completedAt2,
          duration: 400,
          questionTypes: ['fill-blank'],
        },
      ];

      historyItems.forEach(item => saveToHistory(item));
      expect(getHistory()).toHaveLength(2);

      const result = deleteHistoryItem(completedAt1);

      expect(result).toBe(true);
      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].completedAt).toBe(completedAt2);
    });

    it('should cleanup old history items (>90 days)', () => {
      const ninetyOneDaysAgo = Date.now() - (91 * 24 * 60 * 60 * 1000);
      const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000);

      const historyItems: SessionHistoryItem[] = [
        {
          practiceSetId: 'set-1',
          wordlistId: 'wordlist-1',
          wordlistName: 'Old Wordlist',
          score: 85,
          completedAt: ninetyOneDaysAgo,
          duration: 300,
          questionTypes: ['matching'],
        },
        {
          practiceSetId: 'set-2',
          wordlistId: 'wordlist-2',
          wordlistName: 'Recent Wordlist',
          score: 90,
          completedAt: oneDayAgo,
          duration: 400,
          questionTypes: ['fill-blank'],
        },
      ];

      historyItems.forEach(item => saveToHistory(item));
      
      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].wordlistName).toBe('Recent Wordlist');
    });
  });

  describe('Storage Statistics', () => {
    it('should return storage stats with no data', () => {
      const stats = getStorageStats();

      expect(stats.hasCurrentSession).toBe(false);
      expect(stats.historyCount).toBe(0);
      expect(stats.estimatedSize).toBe(0);
    });

    it('should return storage stats with session data', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      saveSession(sessionData);

      const historyItem: SessionHistoryItem = {
        practiceSetId: 'set-1',
        wordlistId: 'wordlist-1',
        wordlistName: 'Test Wordlist',
        score: 85,
        completedAt: Date.now(),
        duration: 300,
        questionTypes: ['matching'],
      };

      saveToHistory(historyItem);

      const stats = getStorageStats();

      expect(stats.hasCurrentSession).toBe(true);
      expect(stats.historyCount).toBe(1);
      expect(stats.estimatedSize).toBeGreaterThan(0);
    });
  });

  describe('Data Export and Import', () => {
    it('should export session data as JSON', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      saveSession(sessionData);

      const historyItem: SessionHistoryItem = {
        practiceSetId: 'set-1',
        wordlistId: 'wordlist-1',
        wordlistName: 'Test Wordlist',
        score: 85,
        completedAt: Date.now(),
        duration: 300,
        questionTypes: ['matching'],
      };

      saveToHistory(historyItem);

      const exported = exportSessionData();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('currentSession');
      expect(parsed).toHaveProperty('history');
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed.currentSession.practiceSetId).toBe('set-1');
      expect(parsed.history).toHaveLength(1);
    });

    it('should import session data from JSON', () => {
      const exportData = {
        currentSession: {
          practiceSetId: 'set-1',
          sessionId: 'session-1',
          startTime: Date.now(),
          timeRemaining: 600,
          currentQuestionIndex: 0,
          answers: {},
          isPaused: false,
        },
        history: [
          {
            practiceSetId: 'set-1',
            wordlistId: 'wordlist-1',
            wordlistName: 'Test Wordlist',
            score: 85,
            completedAt: Date.now(),
            duration: 300,
            questionTypes: ['matching'],
          },
        ],
        exportedAt: Date.now(),
      };

      const result = importSessionData(JSON.stringify(exportData));

      expect(result).toBe(true);
      
      const restored = restoreSession();
      expect(restored?.practiceSetId).toBe('set-1');
      
      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].score).toBe(85);
    });

    it('should handle invalid JSON during import', () => {
      const result = importSessionData('invalid json');
      expect(result).toBe(false);
    });

    it('should handle export with no data', () => {
      const exported = exportSessionData();
      const parsed = JSON.parse(exported);

      expect(parsed.currentSession).toBeNull();
      expect(parsed.history).toHaveLength(0);
    });
  });

  describe('Session Initialization', () => {
    it('should initialize session persistence', () => {
      // Add expired session
      const expiredSessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now() - (25 * 60 * 60 * 1000),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {},
        isPaused: false,
      };

      saveSession(expiredSessionData);

      // Initialize should cleanup expired sessions
      initializeSessionPersistence();

      expect(localStorage.getItem('vocabgo_practice_session')).toBeNull();
    });
  });

  describe('Timer State Persistence', () => {
    it('should persist timer state correctly', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timerDuration: 10,
        timeRemaining: 450, // 7.5 minutes remaining
        currentQuestionIndex: 2,
        answers: {},
        isPaused: false,
      };

      saveSession(sessionData);
      const restored = restoreSession();

      expect(restored?.timerDuration).toBe(10);
      expect(restored?.timeRemaining).toBe(450);
    });

    it('should persist paused timer state', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timerDuration: 10,
        timeRemaining: 450,
        currentQuestionIndex: 2,
        answers: {},
        isPaused: true,
      };

      saveSession(sessionData);
      const restored = restoreSession();

      expect(restored?.isPaused).toBe(true);
      expect(restored?.timeRemaining).toBe(450);
    });

    it('should handle sessions without timer', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 0,
        currentQuestionIndex: 2,
        answers: {},
        isPaused: false,
      };

      saveSession(sessionData);
      const restored = restoreSession();

      expect(restored?.timerDuration).toBeUndefined();
      expect(restored?.timeRemaining).toBe(0);
    });
  });

  describe('Answer Collection Persistence', () => {
    it('should persist matching answers', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {
          'match-1': {
            questionId: 'match-1',
            pairs: [
              { english: 'hello', selectedMandarin: '你好' },
              { english: 'goodbye', selectedMandarin: '再见' },
            ],
          },
        },
        isPaused: false,
      };

      saveSession(sessionData);
      const restored = restoreSession();

      expect(restored?.answers['match-1']).toBeDefined();
      expect((restored?.answers['match-1'] as MatchingAnswer).pairs).toHaveLength(2);
    });

    it('should persist fill-blank answers', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {
          'fill-1': {
            questionId: 'fill-1',
            userAnswer: 'hello',
          },
        },
        isPaused: false,
      };

      saveSession(sessionData);
      const restored = restoreSession();

      expect(restored?.answers['fill-1']).toBeDefined();
      expect((restored?.answers['fill-1'] as FillBlankAnswer).userAnswer).toBe('hello');
    });

    it('should persist multiple choice answers', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 600,
        currentQuestionIndex: 0,
        answers: {
          'mc-1': {
            questionId: 'mc-1',
            selectedOption: '你好',
          },
        },
        isPaused: false,
      };

      saveSession(sessionData);
      const restored = restoreSession();

      expect(restored?.answers['mc-1']).toBeDefined();
      expect((restored?.answers['mc-1'] as MultipleChoiceAnswer).selectedOption).toBe('你好');
    });

    it('should persist multiple answers of different types', () => {
      const sessionData: StoredSessionData = {
        practiceSetId: 'set-1',
        sessionId: 'session-1',
        startTime: Date.now(),
        timeRemaining: 600,
        currentQuestionIndex: 2,
        answers: {
          'match-1': {
            questionId: 'match-1',
            pairs: [{ english: 'hello', selectedMandarin: '你好' }],
          },
          'fill-1': {
            questionId: 'fill-1',
            userAnswer: 'goodbye',
          },
          'mc-1': {
            questionId: 'mc-1',
            selectedOption: '再见',
          },
        },
        isPaused: false,
      };

      saveSession(sessionData);
      const restored = restoreSession();

      expect(Object.keys(restored?.answers || {})).toHaveLength(3);
      expect(restored?.answers['match-1']).toBeDefined();
      expect(restored?.answers['fill-1']).toBeDefined();
      expect(restored?.answers['mc-1']).toBeDefined();
    });
  });
});
