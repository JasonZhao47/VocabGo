/**
 * Tests for Practice Session Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  savePracticeSession,
  fetchPracticeHistory,
  cleanupPracticeSessions,
} from './practiceSessionService';

// Mock fetch
global.fetch = vi.fn();

// Mock session module
vi.mock('@/lib/session', () => ({
  getSessionId: () => 'test-session-id',
}));

describe('Practice Session Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('savePracticeSession', () => {
    it('should save a practice session successfully', async () => {
      const mockResponse = {
        success: true,
        sessionId: 'session-123',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const startTime = new Date('2025-01-10T10:00:00Z');
      const endTime = new Date('2025-01-10T10:15:00Z');
      const answers = { q1: { questionId: 'q1', userAnswer: 'test' } };

      const result = await savePracticeSession(
        'practice-set-123',
        startTime,
        endTime,
        answers,
        85,
        15
      );

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('session-123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/save-practice-session'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-session-id': 'test-session-id',
          }),
        })
      );
    });

    it('should handle save errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Save failed' }),
      });

      const result = await savePracticeSession(
        'practice-set-123',
        new Date(),
        new Date(),
        {},
        85
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await savePracticeSession(
        'practice-set-123',
        new Date(),
        new Date(),
        {},
        85
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('fetchPracticeHistory', () => {
    it('should fetch practice history successfully', async () => {
      const mockHistory = [
        {
          id: 'session-1',
          practiceSetId: 'set-1',
          wordlistId: 'wordlist-1',
          wordlistName: 'Test Wordlist',
          startTime: '2025-01-10T10:00:00Z',
          endTime: '2025-01-10T10:15:00Z',
          score: 85,
          completed: true,
          questionTypes: ['matching', 'fill-blank'],
          createdAt: '2025-01-10T10:15:00Z',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, history: mockHistory }),
      });

      const result = await fetchPracticeHistory();

      expect(result.success).toBe(true);
      expect(result.history).toHaveLength(1);
      expect(result.history![0].id).toBe('session-1');
    });

    it('should fetch history with wordlist filter', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, history: [] }),
      });

      await fetchPracticeHistory('wordlist-123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('wordlistId=wordlist-123'),
        expect.any(Object)
      );
    });

    it('should fetch history with pagination', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, history: [] }),
      });

      await fetchPracticeHistory(undefined, 10, 20);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=20'),
        expect.any(Object)
      );
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Fetch failed' }),
      });

      const result = await fetchPracticeHistory();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('cleanupPracticeSessions', () => {
    it('should cleanup sessions successfully', async () => {
      const mockResponse = {
        success: true,
        deletedSessions: 5,
        deletedPracticeSets: 2,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await cleanupPracticeSessions();

      expect(result.success).toBe(true);
      expect(result.deletedSessions).toBe(5);
      expect(result.deletedPracticeSets).toBe(2);
    });

    it('should handle cleanup errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Cleanup failed' }),
      });

      const result = await cleanupPracticeSessions();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
