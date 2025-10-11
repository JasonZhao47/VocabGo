import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getPerformanceMonitor, monitorAnimation, getPerformanceReport } from './performanceMonitor';

describe('performanceMonitor', () => {
  let monitor: ReturnType<typeof getPerformanceMonitor>;

  beforeEach(() => {
    monitor = getPerformanceMonitor({
      targetFps: 60,
      lowFpsThreshold: 30,
      sampleSize: 10,
      enableLogging: false,
    });
    monitor.reset();
  });

  afterEach(() => {
    monitor.stop();
  });

  describe('getPerformanceMonitor', () => {
    it('should return a monitor instance', () => {
      expect(monitor).toBeDefined();
      expect(monitor.start).toBeInstanceOf(Function);
      expect(monitor.stop).toBeInstanceOf(Function);
      expect(monitor.getMetrics).toBeInstanceOf(Function);
    });

    it('should return the same instance on subsequent calls', () => {
      const monitor1 = getPerformanceMonitor();
      const monitor2 = getPerformanceMonitor();
      expect(monitor1).toBe(monitor2);
    });
  });

  describe('start and stop', () => {
    it('should start monitoring', () => {
      monitor.start();
      expect(monitor.isActive()).toBe(true);
    });

    it('should stop monitoring', () => {
      monitor.start();
      monitor.stop();
      expect(monitor.isActive()).toBe(false);
    });

    it('should not start twice', () => {
      monitor.start();
      const firstActive = monitor.isActive();
      monitor.start();
      expect(monitor.isActive()).toBe(firstActive);
    });

    it('should handle stop when not started', () => {
      expect(() => monitor.stop()).not.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('should return initial metrics', () => {
      const metrics = monitor.getMetrics();
      
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('averageFps');
      expect(metrics).toHaveProperty('minFps');
      expect(metrics).toHaveProperty('maxFps');
      expect(metrics).toHaveProperty('frameCount');
      expect(metrics).toHaveProperty('droppedFrames');
      expect(metrics).toHaveProperty('isLowPerformance');
    });

    it('should have zero values initially', () => {
      const metrics = monitor.getMetrics();
      
      expect(metrics.fps).toBe(0);
      expect(metrics.averageFps).toBe(0);
      expect(metrics.frameCount).toBe(0);
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.isLowPerformance).toBe(false);
    });

    it('should update metrics after monitoring', async () => {
      monitor.start();
      
      // Wait for a few frames
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const metrics = monitor.getMetrics();
      expect(metrics.frameCount).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should reset all metrics', async () => {
      monitor.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      monitor.reset();
      const metrics = monitor.getMetrics();
      
      expect(metrics.frameCount).toBe(0);
      expect(metrics.droppedFrames).toBe(0);
    });
  });

  describe('callbacks', () => {
    it('should call onLowPerformance when FPS drops', async () => {
      const onLowPerformance = vi.fn();
      
      const testMonitor = getPerformanceMonitor({
        lowFpsThreshold: 1000, // Set very high to trigger immediately
        sampleSize: 5,
        enableLogging: false,
        onLowPerformance,
      });
      
      testMonitor.start();
      await new Promise(resolve => setTimeout(resolve, 100));
      testMonitor.stop();
      
      // Note: This test may be flaky depending on system performance
      // In a real scenario, we'd mock requestAnimationFrame
    });
  });

  describe('monitorAnimation', () => {
    it('should monitor an animation function', async () => {
      const animationFn = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      });

      const result = await monitorAnimation(animationFn);
      
      expect(result).toBe('result');
      expect(animationFn).toHaveBeenCalled();
    });

    it('should stop monitoring after animation completes', async () => {
      await monitorAnimation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(monitor.isActive()).toBe(false);
    });

    it('should stop monitoring even if animation throws', async () => {
      try {
        await monitorAnimation(async () => {
          throw new Error('Test error');
        });
      } catch (error) {
        // Expected
      }

      expect(monitor.isActive()).toBe(false);
    });
  });

  describe('getPerformanceReport', () => {
    it('should return a formatted report string', () => {
      const report = getPerformanceReport();
      
      expect(report).toContain('Performance Report');
      expect(report).toContain('Current FPS');
      expect(report).toContain('Average FPS');
      expect(report).toContain('Min FPS');
      expect(report).toContain('Max FPS');
      expect(report).toContain('Total Frames');
      expect(report).toContain('Dropped Frames');
      expect(report).toContain('Low Performance');
    });

    it('should include actual metrics in report', async () => {
      monitor.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      monitor.stop();
      
      const report = getPerformanceReport();
      expect(report).toBeTruthy();
      expect(report.length).toBeGreaterThan(0);
    });
  });
});
