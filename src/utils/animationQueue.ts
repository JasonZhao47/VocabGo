/**
 * Animation Queue System
 * 
 * Manages animation execution to prevent too many simultaneous animations.
 * Defers non-critical animations until after initial render.
 * Implements priority-based queuing for smooth performance.
 */

export type AnimationPriority = 'critical' | 'high' | 'normal' | 'low';

export interface QueuedAnimation {
  id: string;
  priority: AnimationPriority;
  execute: () => Promise<void> | void;
  defer: boolean;
  timestamp: number;
}

export interface AnimationQueueOptions {
  /** Maximum concurrent animations (default: 3) */
  maxConcurrent?: number;
  /** Defer low priority animations until idle (default: true) */
  deferLowPriority?: boolean;
  /** Enable logging in development (default: true in dev) */
  enableLogging?: boolean;
}

class AnimationQueue {
  private maxConcurrent: number;
  private deferLowPriority: boolean;
  private enableLogging: boolean;
  
  private queue: QueuedAnimation[] = [];
  private running: Set<string> = new Set();
  private completed: Set<string> = new Set();
  private idCounter = 0;
  private isProcessing = false;
  private hasInitialRenderCompleted = false;

  constructor(options: AnimationQueueOptions = {}) {
    this.maxConcurrent = options.maxConcurrent ?? 3;
    this.deferLowPriority = options.deferLowPriority ?? true;
    this.enableLogging = options.enableLogging ?? (import.meta.env.DEV ?? false);

    // Mark initial render as complete after a short delay
    if (typeof window !== 'undefined') {
      requestIdleCallback(() => {
        this.hasInitialRenderCompleted = true;
        this.processQueue();
      }, { timeout: 1000 });
    }
  }

  /**
   * Add an animation to the queue
   */
  add(
    execute: () => Promise<void> | void,
    priority: AnimationPriority = 'normal'
  ): string {
    const id = `anim-${++this.idCounter}`;
    const defer = this.shouldDefer(priority);

    const animation: QueuedAnimation = {
      id,
      priority,
      execute,
      defer,
      timestamp: Date.now(),
    };

    this.queue.push(animation);

    if (this.enableLogging) {
      console.log(`[AnimationQueue] Added: ${id} (priority: ${priority}, defer: ${defer})`);
    }

    // Process queue immediately for critical animations
    if (priority === 'critical') {
      this.processQueue();
    } else if (!defer) {
      // Process queue after a microtask for non-critical
      Promise.resolve().then(() => this.processQueue());
    }

    return id;
  }

  /**
   * Determine if animation should be deferred
   */
  private shouldDefer(priority: AnimationPriority): boolean {
    if (!this.deferLowPriority) return false;
    if (this.hasInitialRenderCompleted) return false;
    
    // Defer low priority animations until after initial render
    return priority === 'low';
  }

  /**
   * Process the animation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        // Check if we can run more animations
        if (this.running.size >= this.maxConcurrent) {
          break;
        }

        // Get next animation to run
        const animation = this.getNextAnimation();
        if (!animation) break;

        // Remove from queue
        const index = this.queue.indexOf(animation);
        if (index > -1) {
          this.queue.splice(index, 1);
        }

        // Execute animation
        this.executeAnimation(animation);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get the next animation to execute based on priority
   */
  private getNextAnimation(): QueuedAnimation | null {
    // Filter out deferred animations if initial render not complete
    const available = this.queue.filter(anim => 
      !anim.defer || this.hasInitialRenderCompleted
    );

    if (available.length === 0) return null;

    // Sort by priority (critical > high > normal > low) and timestamp
    const priorityOrder: Record<AnimationPriority, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    available.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp; // FIFO for same priority
    });

    return available[0];
  }

  /**
   * Execute a single animation
   */
  private async executeAnimation(animation: QueuedAnimation): Promise<void> {
    this.running.add(animation.id);

    if (this.enableLogging) {
      console.log(`[AnimationQueue] Executing: ${animation.id} (running: ${this.running.size})`);
    }

    try {
      await animation.execute();
      this.completed.add(animation.id);
    } catch (error) {
      console.error(`[AnimationQueue] Error executing ${animation.id}:`, error);
    } finally {
      this.running.delete(animation.id);

      if (this.enableLogging) {
        console.log(`[AnimationQueue] Completed: ${animation.id} (running: ${this.running.size})`);
      }

      // Process next animations
      this.processQueue();
    }
  }

  /**
   * Cancel a queued animation
   */
  cancel(id: string): boolean {
    const index = this.queue.findIndex(anim => anim.id === id);
    if (index > -1) {
      this.queue.splice(index, 1);
      
      if (this.enableLogging) {
        console.log(`[AnimationQueue] Cancelled: ${id}`);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Cancel all queued animations
   */
  cancelAll(): void {
    const count = this.queue.length;
    this.queue = [];
    
    if (this.enableLogging && count > 0) {
      console.log(`[AnimationQueue] Cancelled all (${count} animations)`);
    }
  }

  /**
   * Wait for all animations to complete
   */
  async waitForAll(): Promise<void> {
    while (this.queue.length > 0 || this.running.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 16)); // ~1 frame
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queued: this.queue.length,
      running: this.running.size,
      completed: this.completed.size,
      maxConcurrent: this.maxConcurrent,
      hasInitialRenderCompleted: this.hasInitialRenderCompleted,
    };
  }

  /**
   * Clear completed animation history
   */
  clearHistory(): void {
    this.completed.clear();
  }
}

// Singleton instance
let queueInstance: AnimationQueue | null = null;

/**
 * Get or create the animation queue instance
 */
export function getAnimationQueue(options?: AnimationQueueOptions): AnimationQueue {
  if (!queueInstance) {
    queueInstance = new AnimationQueue(options);
  }
  return queueInstance;
}

/**
 * Queue an animation with priority
 */
export function queueAnimation(
  execute: () => Promise<void> | void,
  priority: AnimationPriority = 'normal'
): string {
  const queue = getAnimationQueue();
  return queue.add(execute, priority);
}

/**
 * Cancel a queued animation
 */
export function cancelAnimation(id: string): boolean {
  const queue = getAnimationQueue();
  return queue.cancel(id);
}

/**
 * Defer an animation until after initial render
 */
export function deferAnimation(
  execute: () => Promise<void> | void
): string {
  return queueAnimation(execute, 'low');
}

/**
 * Run a critical animation immediately (bypasses queue limits)
 */
export function runCriticalAnimation(
  execute: () => Promise<void> | void
): string {
  return queueAnimation(execute, 'critical');
}

/**
 * Wait for all queued animations to complete
 */
export async function waitForAnimations(): Promise<void> {
  const queue = getAnimationQueue();
  await queue.waitForAll();
}

/**
 * Get animation queue statistics
 */
export function getQueueStats() {
  const queue = getAnimationQueue();
  return queue.getStats();
}

/**
 * Polyfill for requestIdleCallback
 */
function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback for browsers without requestIdleCallback
  const timeout = options?.timeout ?? 1000;
  return setTimeout(callback, timeout) as unknown as number;
}
