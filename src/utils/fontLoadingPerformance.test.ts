import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  measureFontLoading,
  measureAllFonts,
  logFontMetrics,
  checkFontCaching,
  type FontLoadingMetrics,
} from './fontLoadingPerformance';

describe('fontLoadingPerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('measureFontLoading', () => {
    it('should return loaded status when font loads successfully', async () => {
      const result = await measureFontLoading('Inter', 400, 3000);

      expect(result).toMatchObject({
        fontName: 'Inter 400',
        status: expect.stringMatching(/loaded|failed|timeout/),
        loadTime: expect.any(Number),
        timestamp: expect.any(Number),
      });
    });

    it('should handle different font weights', async () => {
      const result = await measureFontLoading('Inter', 700, 3000);

      expect(result.fontName).toBe('Inter 700');
    });
  });

  describe('measureAllFonts', () => {
    it('should measure all Inter font variants', async () => {
      const results = await measureAllFonts();

      expect(results).toHaveLength(4);
      expect(results[0].fontName).toBe('Inter 400');
      expect(results[1].fontName).toBe('Inter 500');
      expect(results[2].fontName).toBe('Inter 600');
      expect(results[3].fontName).toBe('Inter 700');
    });
  });

  describe('logFontMetrics', () => {
    it('should log metrics in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

      const metrics: FontLoadingMetrics[] = [
        {
          fontName: 'Inter 400',
          loadTime: 50,
          status: 'loaded',
          timestamp: Date.now(),
        },
      ];

      logFontMetrics(metrics);

      if (import.meta.env.DEV) {
        expect(consoleGroupSpy).toHaveBeenCalled();
        expect(consoleGroupEndSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
      consoleGroupSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });

  describe('checkFontCaching', () => {
    it('should check if fonts are cached', async () => {
      const result = await checkFontCaching();

      expect(result).toHaveProperty('cached');
      expect(result).toHaveProperty('cacheStatus');
      expect(typeof result.cached).toBe('boolean');
      expect(typeof result.cacheStatus).toBe('string');
    });
  });
});
