/**
 * Animation Performance Monitor Tests
 * 
 * Tests the animation performance monitoring utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  monitorAnimationPerformance,
  isGPUAccelerated,
  getOptimizationRecommendations,
  createFPSMonitor,
  batchTestAnimations,
  generatePerformanceReport,
  type AnimationPerformanceMetrics,
} from './animationPerformanceMonitor';

describe('animationPerformanceMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('monitorAnimationPerformance', () => {
    it('should monitor animation performance and return metrics', async () => {
      const callback = vi.fn();
      
      // Mock performance.now()
      let time = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        time += 16.67; // ~60fps
        return time;
      });

      const metricsPromise = monitorAnimationPerformance(callback, { duration: 100 });
      
      // Fast-forward time
      await vi.advanceTimersByTimeAsync(150);
      
      const metrics = await metricsPromise;

      expect(metrics).toBeDefined();
      expect(metrics.averageFPS).toBeGreaterThan(0);
      expect(metrics.totalFrames).toBeGreaterThan(0);
      expect(metrics.grade).toMatch(/[A-F]/);
      expect(callback).toHaveBeenCalled();
    });

    it('should calculate correct performance grade', async () => {
      const callback = vi.fn();
      
      // Mock high FPS
      let time = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        time += 16; // ~62fps
        return time;
      });

      const metricsPromise = monitorAnimationPerformance(callback, { duration: 100 });
      await vi.advanceTimersByTimeAsync(150);
      const metrics = await metricsPromise;

      expect(metrics.grade).toBe('A');
      expect(metrics.meetsTarget).toBe(true);
    });

    it('should detect dropped frames', async () => {
      const callback = vi.fn();
      
      // Mock variable FPS with some drops
      let time = 0;
      let frameCount = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        frameCount++;
        // Every 3rd frame is slow
        time += frameCount % 3 === 0 ? 30 : 16;
        return time;
      });

      const metricsPromise = monitorAnimationPerformance(callback, { duration: 100 });
      await vi.advanceTimersByTimeAsync(150);
      const metrics = await metricsPromise;

      expect(metrics.droppedFrames).toBeGreaterThan(0);
    });

    it('should call onUpdate callback with FPS readings', async () => {
      const callback = vi.fn();
      const onUpdate = vi.fn();
      
      let time = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        time += 16.67;
        return time;
      });

      const metricsPromise = monitorAnimationPerformance(callback, {
        duration: 100,
        onUpdate,
      });
      
      await vi.advanceTimersByTimeAsync(150);
      await metricsPromise;

      expect(onUpdate).toHaveBeenCalled();
      expect(onUpdate.mock.calls[0][0]).toBeGreaterThan(0);
    });
  });

  describe('isGPUAccelerated', () => {
    it('should detect GPU acceleration from will-change', () => {
      const element = document.createElement('div');
      element.style.willChange = 'transform';
      document.body.appendChild(element);

      const result = isGPUAccelerated(element);

      expect(result).toBe(true);
      element.remove();
    });

    it('should detect GPU acceleration from transform', () => {
      const element = document.createElement('div');
      element.style.transform = 'translateZ(0)';
      document.body.appendChild(element);

      const result = isGPUAccelerated(element);

      expect(result).toBe(true);
      element.remove();
    });

    it('should return false for non-accelerated elements', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const result = isGPUAccelerated(element);

      expect(result).toBe(false);
      element.remove();
    });
  });

  describe('getOptimizationRecommendations', () => {
    it('should recommend specific properties over "all"', () => {
      const element = document.createElement('div');
      element.style.transitionProperty = 'all';
      document.body.appendChild(element);

      const recommendations = getOptimizationRecommendations(element);

      expect(recommendations).toContain(
        expect.stringContaining('specific transition properties')
      );
      element.remove();
    });

    it('should warn about expensive property animations', () => {
      const element = document.createElement('div');
      element.style.transitionProperty = 'width, height';
      document.body.appendChild(element);

      const recommendations = getOptimizationRecommendations(element);

      expect(recommendations).toContain(
        expect.stringContaining('layout properties')
      );
      element.remove();
    });

    it('should recommend GPU acceleration when missing', () => {
      const element = document.createElement('div');
      element.style.transitionProperty = 'opacity';
      document.body.appendChild(element);

      const recommendations = getOptimizationRecommendations(element);

      expect(recommendations).toContain(
        expect.stringContaining('will-change')
      );
      element.remove();
    });

    it('should warn about long animation durations', () => {
      const element = document.createElement('div');
      element.style.transitionDuration = '1s';
      document.body.appendChild(element);

      const recommendations = getOptimizationRecommendations(element);

      expect(recommendations).toContain(
        expect.stringContaining('shorter animation durations')
      );
      element.remove();
    });

    it('should warn about box-shadow animations', () => {
      const element = document.createElement('div');
      element.style.transitionProperty = 'box-shadow';
      document.body.appendChild(element);

      const recommendations = getOptimizationRecommendations(element);

      expect(recommendations).toContain(
        expect.stringContaining('box-shadow')
      );
      element.remove();
    });
  });

  describe('createFPSMonitor', () => {
    it('should create FPS monitor element', () => {
      const cleanup = createFPSMonitor();

      const monitor = document.getElementById('fps-monitor');
      expect(monitor).toBeTruthy();
      expect(monitor?.style.position).toBe('fixed');

      cleanup();
      expect(document.getElementById('fps-monitor')).toBeNull();
    });

    it('should remove monitor on cleanup', () => {
      const cleanup = createFPSMonitor();
      expect(document.getElementById('fps-monitor')).toBeTruthy();

      cleanup();
      expect(document.getElementById('fps-monitor')).toBeNull();
    });
  });

  describe('batchTestAnimations', () => {
    it('should run multiple animation tests', async () => {
      const test1 = vi.fn();
      const test2 = vi.fn();
      
      let time = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        time += 16.67;
        return time;
      });

      const resultsPromise = batchTestAnimations([
        { name: 'Test 1', callback: test1, options: { duration: 50 } },
        { name: 'Test 2', callback: test2, options: { duration: 50 } },
      ]);

      await vi.advanceTimersByTimeAsync(1000);
      const results = await resultsPromise;

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Test 1');
      expect(results[1].name).toBe('Test 2');
      expect(test1).toHaveBeenCalled();
      expect(test2).toHaveBeenCalled();
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate formatted report', () => {
      const results = [
        {
          name: 'Test Animation',
          metrics: {
            averageFPS: 59.5,
            minFPS: 55,
            maxFPS: 62,
            droppedFrames: 2,
            totalFrames: 100,
            duration: 1000,
            meetsTarget: true,
            grade: 'A',
          } as AnimationPerformanceMetrics,
        },
      ];

      const report = generatePerformanceReport(results);

      expect(report).toContain('Test Animation');
      expect(report).toContain('59.5');
      expect(report).toContain('Grade: A');
      expect(report).toContain('✓ Yes');
    });

    it('should handle multiple test results', () => {
      const results = [
        {
          name: 'Test 1',
          metrics: {
            averageFPS: 60,
            minFPS: 58,
            maxFPS: 62,
            droppedFrames: 0,
            totalFrames: 100,
            duration: 1000,
            meetsTarget: true,
            grade: 'A',
          } as AnimationPerformanceMetrics,
        },
        {
          name: 'Test 2',
          metrics: {
            averageFPS: 45,
            minFPS: 40,
            maxFPS: 50,
            droppedFrames: 30,
            totalFrames: 100,
            duration: 1000,
            meetsTarget: false,
            grade: 'D',
          } as AnimationPerformanceMetrics,
        },
      ];

      const report = generatePerformanceReport(results);

      expect(report).toContain('Test 1');
      expect(report).toContain('Test 2');
      expect(report).toContain('Grade: A');
      expect(report).toContain('Grade: D');
    });
  });
});
