import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyticsService } from './practiceAnalyticsService';

describe('PracticeAnalyticsService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    analyticsService.clearAnalytics();
  });

  describe('trackSession', () => {
    it('should track a practice session', () => {
      const metrics = {
        sessionId: 'test-session-1',
        wordlistId: 'wordlist-1',
        wordlistSize: 20,
        questionTypes: ['matching', 'fill-blank'],
        totalQuestions: 15,
        score: 85.5,
        duration: 300,
        timerDuration: 10,
        completedAt: new Date(),
        deviceType: 'desktop' as const,
        userAgent: 'test-agent',
      };

      analyticsService.trackSession(metrics);

      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.totalSessions).toBe(1);
      expect(summary.averageScore).toBe(85.5);
    });

    it('should calculate average score across multiple sessions', () => {
      analyticsService.trackSession({
        sessionId: 'session-1',
        wordlistId: 'wordlist-1',
        wordlistSize: 20,
        questionTypes: ['matching'],
        totalQuestions: 10,
        score: 80,
        duration: 300,
        completedAt: new Date(),
        deviceType: 'desktop',
        userAgent: 'test',
      });

      analyticsService.trackSession({
        sessionId: 'session-2',
        wordlistId: 'wordlist-1',
        wordlistSize: 20,
        questionTypes: ['matching'],
        totalQuestions: 10,
        score: 90,
        duration: 300,
        completedAt: new Date(),
        deviceType: 'desktop',
        userAgent: 'test',
      });

      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.totalSessions).toBe(2);
      expect(summary.averageScore).toBe(85);
    });
  });

  describe('trackGeneration', () => {
    it('should track successful question generation', () => {
      const metrics = {
        wordlistId: 'wordlist-1',
        wordlistSize: 40,
        questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
        generationTime: 8000,
        success: true,
        cacheHit: false,
        timestamp: new Date(),
      };

      analyticsService.trackGeneration(metrics);

      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.totalGenerations).toBe(1);
      expect(summary.averageGenerationTime).toBe(8000);
      expect(summary.cacheHitRate).toBe(0);
    });

    it('should track cache hit rate', () => {
      analyticsService.trackGeneration({
        wordlistId: 'wordlist-1',
        wordlistSize: 40,
        questionTypes: ['matching'],
        generationTime: 8000,
        success: true,
        cacheHit: true,
        timestamp: new Date(),
      });

      analyticsService.trackGeneration({
        wordlistId: 'wordlist-2',
        wordlistSize: 40,
        questionTypes: ['matching'],
        generationTime: 9000,
        success: true,
        cacheHit: false,
        timestamp: new Date(),
      });

      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.totalGenerations).toBe(2);
      expect(summary.cacheHitRate).toBe(0.5);
    });

    it('should log error for slow generation', () => {
      const logErrorSpy = vi.spyOn(analyticsService, 'logError');

      analyticsService.trackGeneration({
        wordlistId: 'wordlist-1',
        wordlistSize: 40,
        questionTypes: ['matching'],
        generationTime: 20000, // Very slow
        success: true,
        cacheHit: false,
        timestamp: new Date(),
      });

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'generation',
          severity: 'medium',
        })
      );
    });
  });

  describe('trackPerformance', () => {
    it('should track performance metrics', () => {
      analyticsService.trackPerformance('page_load', 1500, 'ms', {
        page: 'practice',
      });

      // Performance metrics are queued but not directly accessible
      // We can verify they don't throw errors
      expect(() => analyticsService.trackPerformance('test', 100, 'ms')).not.toThrow();
    });
  });

  describe('logError', () => {
    it('should log errors with context', () => {
      const error = {
        type: 'generation' as const,
        severity: 'high' as const,
        message: 'Test error',
        context: { test: 'data' },
        timestamp: new Date(),
        userAgent: 'test-agent',
        url: 'http://test.com',
      };

      analyticsService.logError(error);

      // Need to flush to ensure error is stored
      analyticsService['flush']();

      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.errorCount).toBe(1);

      const recentErrors = analyticsService.getRecentErrors();
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].message).toBe('Test error');
    });

    it('should store critical errors separately', () => {
      const criticalError = {
        type: 'generation' as const,
        severity: 'critical' as const,
        message: 'Critical error',
        timestamp: new Date(),
        userAgent: 'test',
        url: 'http://test.com',
      };

      analyticsService.logError(criticalError);

      const stored = localStorage.getItem('vocabgo_analytics_critical');
      expect(stored).toBeTruthy();
      const errors = JSON.parse(stored!);
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('critical');
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should return empty summary when no data', () => {
      const summary = analyticsService.getAnalyticsSummary();

      expect(summary).toEqual({
        totalSessions: 0,
        averageScore: 0,
        totalGenerations: 0,
        averageGenerationTime: 0,
        errorCount: 0,
        cacheHitRate: 0,
      });
    });

    it('should calculate summary correctly', () => {
      // Track some sessions
      analyticsService.trackSession({
        sessionId: 'session-1',
        wordlistId: 'wordlist-1',
        wordlistSize: 20,
        questionTypes: ['matching'],
        totalQuestions: 10,
        score: 80,
        duration: 300,
        completedAt: new Date(),
        deviceType: 'desktop',
        userAgent: 'test',
      });

      // Track some generations
      analyticsService.trackGeneration({
        wordlistId: 'wordlist-1',
        wordlistSize: 40,
        questionTypes: ['matching'],
        generationTime: 8000,
        success: true,
        cacheHit: true,
        timestamp: new Date(),
      });

      // Log an error
      analyticsService.logError({
        type: 'generation',
        severity: 'medium',
        message: 'Test error',
        timestamp: new Date(),
        userAgent: 'test',
        url: 'http://test.com',
      });

      // Flush to ensure error is stored
      analyticsService['flush']();

      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.totalSessions).toBe(1);
      expect(summary.averageScore).toBe(80);
      expect(summary.totalGenerations).toBe(1);
      expect(summary.averageGenerationTime).toBe(8000);
      expect(summary.cacheHitRate).toBe(1);
      expect(summary.errorCount).toBe(1);
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors with limit', () => {
      // Log multiple errors
      for (let i = 0; i < 15; i++) {
        analyticsService.logError({
          type: 'generation',
          severity: 'low',
          message: `Error ${i}`,
          timestamp: new Date(),
          userAgent: 'test',
          url: 'http://test.com',
        });
      }

      // Flush to ensure errors are stored
      analyticsService['flush']();

      const recentErrors = analyticsService.getRecentErrors(5);
      expect(recentErrors).toHaveLength(5);
    });
  });

  describe('clearAnalytics', () => {
    it('should clear all analytics data', () => {
      analyticsService.trackSession({
        sessionId: 'session-1',
        wordlistId: 'wordlist-1',
        wordlistSize: 20,
        questionTypes: ['matching'],
        totalQuestions: 10,
        score: 80,
        duration: 300,
        completedAt: new Date(),
        deviceType: 'desktop',
        userAgent: 'test',
      });

      analyticsService.clearAnalytics();

      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.totalSessions).toBe(0);
      expect(localStorage.getItem('vocabgo_analytics')).toBeNull();
    });
  });

  describe('exportAnalytics', () => {
    it('should export analytics data as JSON', () => {
      analyticsService.trackSession({
        sessionId: 'session-1',
        wordlistId: 'wordlist-1',
        wordlistSize: 20,
        questionTypes: ['matching'],
        totalQuestions: 10,
        score: 80,
        duration: 300,
        completedAt: new Date(),
        deviceType: 'desktop',
        userAgent: 'test',
      });

      const exported = analyticsService.exportAnalytics();
      expect(exported).toBeTruthy();
      
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });
  });
});
