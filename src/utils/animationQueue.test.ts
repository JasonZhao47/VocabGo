import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAnimationQueue,
  queueAnimation,
  cancelAnimation,
  deferAnimation,
  runCriticalAnimation,
  getQueueStats,
} from './animationQueue';

describe('animationQueue', () => {
  let queue: ReturnType<typeof getAnimationQueue>;

  beforeEach(() => {
    queue = getAnimationQueue({
      maxConcurrent: 2,
      deferLowPriority: true,
      enableLogging: false,
    });
    queue.cancelAll();
    queue.clearHistory();
  });

  describe('getAnimationQueue', () => {
    it('should return a queue instance', () => {
      expect(queue).toBeDefined();
      expect(queue.add).toBeInstanceOf(Function);
      expect(queue.cancel).toBeInstanceOf(Function);
      expect(queue.getStats).toBeInstanceOf(Function);
    });

    it('should return the same instance on subsequent calls', () => {
      const queue1 = getAnimationQueue();
      const queue2 = getAnimationQueue();
      expect(queue1).toBe(queue2);
    });
  });

  describe('queueAnimation', () => {
    it('should queue an animation', () => {
      const animFn = vi.fn();
      const id = queueAnimation(animFn, 'normal');

      expect(id).toBeTruthy();
      expect(id).toMatch(/^anim-\d+$/);
    });

    it('should execute queued animation', async () => {
      const animFn = vi.fn();
      queueAnimation(animFn, 'normal');

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(animFn).toHaveBeenCalled();
    });

    it('should respect max concurrent limit', async () => {
      let runningCount = 0;
      let maxRunning = 0;

      const createAnimation = () => async () => {
        runningCount++;
        maxRunning = Math.max(maxRunning, runningCount);
        await new Promise(resolve => setTimeout(resolve, 50));
        runningCount--;
      };

      // Queue 5 animations with max concurrent = 2
      for (let i = 0; i < 5; i++) {
        queueAnimation(createAnimation(), 'normal');
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Should never exceed max concurrent
      expect(maxRunning).toBeLessThanOrEqual(2);
    });

    it('should execute animations in priority order', async () => {
      const executionOrder: string[] = [];

      const createAnimation = (name: string) => () => {
        executionOrder.push(name);
      };

      // Queue in mixed order
      queueAnimation(createAnimation('normal'), 'normal');
      queueAnimation(createAnimation('low'), 'low');
      queueAnimation(createAnimation('high'), 'high');
      queueAnimation(createAnimation('critical'), 'critical');

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should execute in priority order
      expect(executionOrder[0]).toBe('critical');
      expect(executionOrder[1]).toBe('high');
    });
  });

  describe('cancelAnimation', () => {
    it('should cancel a queued animation', () => {
      const animFn = vi.fn();
      const id = queueAnimation(animFn, 'low'); // Low priority won't execute immediately

      const cancelled = cancelAnimation(id);
      expect(cancelled).toBe(true);
    });

    it('should return false for non-existent animation', () => {
      const cancelled = cancelAnimation('non-existent-id');
      expect(cancelled).toBe(false);
    });

    it('should prevent cancelled animation from executing', async () => {
      const animFn = vi.fn();
      const id = queueAnimation(animFn, 'low');

      cancelAnimation(id);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(animFn).not.toHaveBeenCalled();
    });
  });

  describe('deferAnimation', () => {
    it('should defer animation with low priority', () => {
      const animFn = vi.fn();
      const id = deferAnimation(animFn);

      expect(id).toBeTruthy();
      
      const stats = getQueueStats();
      expect(stats.queued).toBeGreaterThan(0);
    });
  });

  describe('runCriticalAnimation', () => {
    it('should run critical animation immediately', async () => {
      const animFn = vi.fn();
      runCriticalAnimation(animFn);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(animFn).toHaveBeenCalled();
    });

    it('should bypass concurrent limit for critical animations', async () => {
      let runningCount = 0;
      let maxRunning = 0;

      const createAnimation = () => async () => {
        runningCount++;
        maxRunning = Math.max(maxRunning, runningCount);
        await new Promise(resolve => setTimeout(resolve, 50));
        runningCount--;
      };

      // Queue multiple critical animations (should exceed max concurrent)
      for (let i = 0; i < 5; i++) {
        runCriticalAnimation(createAnimation());
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Critical animations can exceed max concurrent
      expect(maxRunning).toBeGreaterThan(2);
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', () => {
      const stats = getQueueStats();

      expect(stats).toHaveProperty('queued');
      expect(stats).toHaveProperty('running');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('maxConcurrent');
      expect(stats).toHaveProperty('hasInitialRenderCompleted');
    });

    it('should track queued animations', () => {
      queueAnimation(() => {}, 'low');
      queueAnimation(() => {}, 'low');

      const stats = getQueueStats();
      expect(stats.queued).toBeGreaterThanOrEqual(2);
    });
  });

  describe('cancelAll', () => {
    it('should cancel all queued animations', () => {
      queueAnimation(() => {}, 'low');
      queueAnimation(() => {}, 'low');
      queueAnimation(() => {}, 'low');

      queue.cancelAll();

      const stats = getQueueStats();
      expect(stats.queued).toBe(0);
    });
  });

  describe('waitForAll', () => {
    it('should wait for all animations to complete', async () => {
      const animFn = vi.fn();
      
      queueAnimation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        animFn();
      }, 'normal');

      await queue.waitForAll();
      
      expect(animFn).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle animation errors gracefully', async () => {
      const errorFn = vi.fn(() => {
        throw new Error('Test error');
      });

      queueAnimation(errorFn, 'normal');

      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should have attempted to run
      expect(errorFn).toHaveBeenCalled();
      
      // Queue should continue processing
      const stats = getQueueStats();
      expect(stats.running).toBe(0);
    });
  });
});
