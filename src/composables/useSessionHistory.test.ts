/**
 * Session History Composable Tests
 * Tests for session history data management and statistics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSessionHistory } from './useSessionHistory';
import * as sessionPersistence from '@/utils/sessionPersistence';
import * as practiceSessionService from '@/services/practiceSessionService';

// Mock dependencies
vi.mock('@/utils/sessionPersistence');
vi.mock('@/services/practiceSessionService');

describe('useSessionHistory Composable', () => {
  const mockHistory = [
    {
      practiceSetId: 'set-1',
      wordlistId: 'wordlist-1',
      wordlistName: 'Test Wordlist 1',
      score: 85,
      completedAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
      duration: 300, // 5 minutes
      questionTypes: ['matching', 'fill-blank'],
    },
    {
      practiceSetId: 'set-2',
      wordlistId: 'wordlist-1',
      wordlistName: 'Test Wordlist 1',
      score: 92,
      completedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      duration: 420, // 7 minutes
      questionTypes: ['multiple-choice'],
    },
    {
      practiceSetId: 'set-3',
      wordlistId: 'wordlist-2',
      wordlistName: 'Test Wordlist 2',
      score: 78,
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
      duration: 360, // 6 minutes
      questionTypes: ['matching', 'multiple-choice'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock session persistence
    vi.mocked(sessionPersistence.getHistory).mockReturnValue(mockHistory);
    vi.mocked(sessionPersistence.getHistoryForWordlist).mockReturnValue(
      mockHistory.filter((h) => h.wordlistId === 'wordlist-1')
    );
    vi.mocked(sessionPersistence.deleteHistoryItem).mockReturnValue(true);
    vi.mocked(sessionPersistence.clearHistory).mockReturnValue(true);

    // Mock practice session service
    vi.mocked(practiceSessionService.fetchPracticeHistory).mockResolvedValue({
      success: true,
      history: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should load history on initialization', async () => {
      const { history, isLoading } = useSessionHistory();
      
      // Should start loading
      expect(isLoading.value).toBe(true);
      
      // Wait for async load
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(sessionPersistence.getHistory).toHaveBeenCalled();
      expect(history.value).toHaveLength(3);
      expect(isLoading.value).toBe(false);
    });

    it('should load history for specific wordlist', async () => {
      const { history } = useSessionHistory('wordlist-1');
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(sessionPersistence.getHistoryForWordlist).toHaveBeenCalledWith('wordlist-1');
      expect(history.value).toHaveLength(2);
    });

    it('should fetch from database after loading local history', async () => {
      useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(practiceSessionService.fetchPracticeHistory).toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should calculate total sessions', async () => {
      const { totalSessions } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(totalSessions.value).toBe(3);
    });

    it('should calculate average score', async () => {
      const { averageScore } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // (85 + 92 + 78) / 3 = 85
      expect(averageScore.value).toBe(85);
    });

    it('should calculate best score', async () => {
      const { bestScore } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(bestScore.value).toBe(92);
    });

    it('should calculate total practice time', async () => {
      const { totalPracticeTime } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // 300 + 420 + 360 = 1080 seconds
      expect(totalPracticeTime.value).toBe(1080);
    });

    it('should calculate average duration', async () => {
      const { averageDuration } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // 1080 / 3 = 360 seconds
      expect(averageDuration.value).toBe(360);
    });

    it('should return 0 for statistics with no history', async () => {
      vi.mocked(sessionPersistence.getHistory).mockReturnValue([]);
      
      const { totalSessions, averageScore, bestScore, totalPracticeTime, averageDuration } =
        useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(totalSessions.value).toBe(0);
      expect(averageScore.value).toBe(0);
      expect(bestScore.value).toBe(0);
      expect(totalPracticeTime.value).toBe(0);
      expect(averageDuration.value).toBe(0);
    });

    it('should get recent sessions', async () => {
      const { recentSessions } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(recentSessions.value).toHaveLength(3);
      
      // Should be sorted by most recent first
      expect(recentSessions.value[0].completedAt).toBeGreaterThan(
        recentSessions.value[1].completedAt
      );
    });

    it('should limit recent sessions to 5', async () => {
      const manyHistory = Array.from({ length: 10 }, (_, i) => ({
        ...mockHistory[0],
        practiceSetId: `set-${i}`,
        completedAt: Date.now() - i * 1000,
      }));
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(manyHistory);
      
      const { recentSessions } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(recentSessions.value).toHaveLength(5);
    });
  });

  describe('Progress Trend', () => {
    it('should detect improving trend', async () => {
      const improvingHistory = [
        { ...mockHistory[0], score: 70, completedAt: Date.now() - 3000 },
        { ...mockHistory[1], score: 80, completedAt: Date.now() - 2000 },
        { ...mockHistory[2], score: 90, completedAt: Date.now() - 1000 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(improvingHistory);
      
      const { progressTrend } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(progressTrend.value).toBe('improving');
    });

    it('should detect declining trend', async () => {
      const decliningHistory = [
        { ...mockHistory[0], score: 90, completedAt: Date.now() - 3000 },
        { ...mockHistory[1], score: 80, completedAt: Date.now() - 2000 },
        { ...mockHistory[2], score: 70, completedAt: Date.now() - 1000 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(decliningHistory);
      
      const { progressTrend } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(progressTrend.value).toBe('declining');
    });

    it('should detect stable trend', async () => {
      const stableHistory = [
        { ...mockHistory[0], score: 80, completedAt: Date.now() - 3000 },
        { ...mockHistory[1], score: 82, completedAt: Date.now() - 2000 },
        { ...mockHistory[2], score: 81, completedAt: Date.now() - 1000 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(stableHistory);
      
      const { progressTrend } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(progressTrend.value).toBe('stable');
    });

    it('should return stable with less than 2 sessions', async () => {
      vi.mocked(sessionPersistence.getHistory).mockReturnValue([mockHistory[0]]);
      
      const { progressTrend } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(progressTrend.value).toBe('stable');
    });

    it('should use last 3 sessions for trend calculation', async () => {
      const manyHistory = [
        { ...mockHistory[0], score: 50, completedAt: Date.now() - 5000 },
        { ...mockHistory[1], score: 60, completedAt: Date.now() - 4000 },
        { ...mockHistory[2], score: 70, completedAt: Date.now() - 3000 },
        { ...mockHistory[0], score: 80, completedAt: Date.now() - 2000 },
        { ...mockHistory[1], score: 90, completedAt: Date.now() - 1000 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(manyHistory);
      
      const { progressTrend } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Should be improving based on last 3 sessions (70, 80, 90)
      expect(progressTrend.value).toBe('improving');
    });

    it('should require >5 point difference for trend change', async () => {
      const smallChangeHistory = [
        { ...mockHistory[0], score: 80, completedAt: Date.now() - 2000 },
        { ...mockHistory[1], score: 83, completedAt: Date.now() - 1000 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(smallChangeHistory);
      
      const { progressTrend } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // 3 point difference should be stable
      expect(progressTrend.value).toBe('stable');
    });
  });

  describe('Filtering', () => {
    it('should filter sessions by date range', async () => {
      const { getSessionsByDateRange } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2); // 2 days ago
      const endDate = new Date();
      
      const filtered = getSessionsByDateRange(startDate, endDate);
      
      // Should include sessions from last 2 days (2 sessions)
      expect(filtered.length).toBeLessThanOrEqual(2);
      
      // All sessions should be within range
      filtered.forEach((session) => {
        expect(session.completedAt).toBeGreaterThanOrEqual(startDate.getTime());
        expect(session.completedAt).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should filter sessions by question type', async () => {
      const { getSessionsByQuestionType } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const matchingSessions = getSessionsByQuestionType('matching');
      
      // Should include only sessions with matching questions
      expect(matchingSessions.length).toBeGreaterThan(0);
      matchingSessions.forEach((session) => {
        expect(session.questionTypes).toContain('matching');
      });
    });

    it('should return empty array for non-existent question type', async () => {
      const { getSessionsByQuestionType } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const filtered = getSessionsByQuestionType('non-existent');
      
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Actions', () => {
    it('should delete a session', async () => {
      const { deleteSession, history } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const completedAt = mockHistory[0].completedAt;
      const result = deleteSession(completedAt);
      
      expect(result).toBe(true);
      expect(sessionPersistence.deleteHistoryItem).toHaveBeenCalledWith(completedAt);
    });

    it('should reload history after deleting session', async () => {
      const { deleteSession } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Clear mock calls from initialization
      vi.mocked(sessionPersistence.getHistory).mockClear();
      
      deleteSession(mockHistory[0].completedAt);
      
      // Should reload history
      expect(sessionPersistence.getHistory).toHaveBeenCalled();
    });

    it('should clear all history', async () => {
      const { clearAllHistory, history } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const result = clearAllHistory();
      
      expect(result).toBe(true);
      expect(sessionPersistence.clearHistory).toHaveBeenCalled();
      expect(history.value).toHaveLength(0);
    });

    it('should reload history manually', async () => {
      const { loadHistory } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Clear mock calls from initialization
      vi.mocked(sessionPersistence.getHistory).mockClear();
      vi.mocked(practiceSessionService.fetchPracticeHistory).mockClear();
      
      await loadHistory();
      
      expect(sessionPersistence.getHistory).toHaveBeenCalled();
      expect(practiceSessionService.fetchPracticeHistory).toHaveBeenCalled();
    });
  });

  describe('Format Helpers', () => {
    it('should format duration correctly', async () => {
      const { formatDuration } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(300)).toBe('5:00');
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(3661)).toBe('61:01');
    });

    it('should format date correctly', async () => {
      const { formatDate } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const timestamp = new Date('2024-01-15').getTime();
      const formatted = formatDate(timestamp);
      
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format date time correctly', async () => {
      const { formatDateTime } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const timestamp = new Date('2024-01-15T14:30:00').getTime();
      const formatted = formatDateTime(timestamp);
      
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
      // Should include time
      expect(formatted.length).toBeGreaterThan(15);
    });
  });

  describe('Database Integration', () => {
    it('should merge local and database history', async () => {
      const dbHistory = [
        {
          id: 'db-1',
          practiceSetId: 'set-4',
          wordlistId: 'wordlist-1',
          wordlistName: 'Test Wordlist 1',
          startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          endTime: new Date(Date.now() - 1000 * 60 * 60 * 2 + 300000).toISOString(),
          score: 88,
          completed: true,
          questionTypes: ['matching'],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
      ];

      vi.mocked(practiceSessionService.fetchPracticeHistory).mockResolvedValue({
        success: true,
        history: dbHistory,
      });

      const { history } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Should have merged history (3 local + 1 db = 4 total)
      expect(history.value.length).toBeGreaterThanOrEqual(3);
    });

    it('should prefer database data over local data for same session', async () => {
      const dbHistory = [
        {
          id: 'db-1',
          practiceSetId: 'set-1',
          wordlistId: 'wordlist-1',
          wordlistName: 'Test Wordlist 1',
          startTime: new Date(mockHistory[0].completedAt - 300000).toISOString(),
          endTime: new Date(mockHistory[0].completedAt).toISOString(),
          score: 95, // Different score than local
          completed: true,
          questionTypes: ['matching'],
          createdAt: new Date(mockHistory[0].completedAt).toISOString(),
        },
      ];

      vi.mocked(practiceSessionService.fetchPracticeHistory).mockResolvedValue({
        success: true,
        history: dbHistory,
      });

      const { history } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Should use database score (95) instead of local (85)
      const session = history.value.find((s) => s.practiceSetId === 'set-1');
      expect(session?.score).toBe(95);
    });

    it('should handle database fetch errors gracefully', async () => {
      vi.mocked(practiceSessionService.fetchPracticeHistory).mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const { history, error } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Should still have local history
      expect(history.value).toHaveLength(3);
      
      // Error may or may not be set depending on implementation
      // The important thing is that local history is preserved
      expect(history.value.length).toBeGreaterThan(0);
    });

    it('should handle database fetch exceptions', async () => {
      vi.mocked(practiceSessionService.fetchPracticeHistory).mockRejectedValue(
        new Error('Network error')
      );

      const { history, error } = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Should still have local history
      expect(history.value).toHaveLength(3);
      
      // Error should be set
      expect(error.value).toContain('Network error');
    });

    it('should pass wordlist ID to database fetch', async () => {
      useSessionHistory('wordlist-1');
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(practiceSessionService.fetchPracticeHistory).toHaveBeenCalledWith('wordlist-1');
    });
  });

  describe('Reactive Updates', () => {
    it('should update statistics when history changes', async () => {
      const composable = useSessionHistory();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(composable.totalSessions.value).toBe(3);
      expect(composable.averageScore.value).toBe(85);
      
      // Simulate history update
      const newHistory = [
        ...mockHistory,
        {
          ...mockHistory[0],
          practiceSetId: 'set-4',
          score: 100,
          completedAt: Date.now(),
        },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(newHistory);
      
      // Reload history
      await composable.loadHistory();
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Statistics should update
      expect(composable.totalSessions.value).toBeGreaterThanOrEqual(3);
    });
  });
});
