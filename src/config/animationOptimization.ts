/**
 * Animation Optimization Configuration
 * 
 * Ensures all animations use GPU-accelerated properties (transform, opacity)
 * and proper will-change hints for optimal 60fps performance.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

/**
 * GPU-accelerated CSS properties
 * Only these properties should be animated for optimal performance
 */
export const GPU_ACCELERATED_PROPERTIES = [
  'transform',
  'opacity',
  'filter',
] as const;

/**
 * Properties that should NEVER be animated
 * These cause layout recalculation and paint, killing performance
 */
export const FORBIDDEN_ANIMATION_PROPERTIES = [
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'padding',
  'border-width',
] as const;

/**
 * Animation performance targets
 */
export const PERFORMANCE_TARGETS = {
  /** Target frame rate for all animations */
  targetFPS: 60,
  /** Maximum frame time in milliseconds (1000ms / 60fps = 16.67ms) */
  maxFrameTime: 16.67,
  /** Warning threshold for frame time */
  warningFrameTime: 14,
} as const;

/**
 * Will-change optimization rules
 * 
 * Best practices:
 * - Apply will-change BEFORE animation starts
 * - Remove will-change AFTER animation completes
 * - Don't apply to too many elements (max 4-6 simultaneously)
 * - Don't leave will-change applied permanently
 */
export const WILL_CHANGE_RULES = {
  /** Maximum number of elements that should have will-change at once */
  maxSimultaneous: 6,
  /** Delay before removing will-change after animation (ms) */
  removalDelay: 0,
  /** Properties to optimize for different animation types */
  presets: {
    fade: ['opacity'] as const,
    slide: ['transform'] as const,
    scale: ['transform'] as const,
    combined: ['transform', 'opacity'] as const,
    blur: ['filter'] as const,
  },
} as const;

/**
 * CSS class names for optimized animations
 * These classes ensure GPU acceleration and proper performance
 */
export const OPTIMIZED_ANIMATION_CLASSES = {
  /** Base class for all animated elements */
  base: 'will-change-auto',
  /** Class for elements currently animating */
  animating: 'will-change-transform-opacity',
  /** Class for transform-only animations */
  transformOnly: 'will-change-transform',
  /** Class for opacity-only animations */
  opacityOnly: 'will-change-opacity',
  /** Force GPU layer creation */
  gpuLayer: 'gpu-accelerated',
} as const;

/**
 * Animation timing optimized for 60fps
 */
export const OPTIMIZED_TIMINGS = {
  /** Ultra-fast animations (2-3 frames at 60fps) */
  instant: 50,
  /** Fast animations (9 frames at 60fps) */
  fast: 150,
  /** Normal animations (15 frames at 60fps) */
  normal: 250,
  /** Slow animations (24 frames at 60fps) */
  slow: 400,
  /** Very slow animations (36 frames at 60fps) */
  slower: 600,
} as const;

/**
 * Easing functions optimized for perceived smoothness
 */
export const OPTIMIZED_EASING = {
  /** Standard ease-in-out for most animations */
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Ease-out for enter animations */
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Ease-in for exit animations */
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Spring-like easing for interactive elements */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Sharp easing for quick transitions */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

/**
 * Validates if a property is safe to animate
 */
export function isGPUAcceleratedProperty(property: string): boolean {
  return GPU_ACCELERATED_PROPERTIES.includes(property as any);
}

/**
 * Validates if a property should never be animated
 */
export function isForbiddenProperty(property: string): boolean {
  return FORBIDDEN_ANIMATION_PROPERTIES.includes(property as any);
}

/**
 * Gets the appropriate will-change value for an animation type
 */
export function getWillChangeValue(animationType: keyof typeof WILL_CHANGE_RULES.presets): string {
  return WILL_CHANGE_RULES.presets[animationType].join(', ');
}

/**
 * Calculates the number of frames an animation will take at 60fps
 */
export function calculateFrameCount(durationMs: number): number {
  return Math.round((durationMs / 1000) * PERFORMANCE_TARGETS.targetFPS);
}

/**
 * Validates animation duration is appropriate for 60fps
 */
export function isOptimalDuration(durationMs: number): boolean {
  const frames = calculateFrameCount(durationMs);
  // Animations should be at least 2 frames and ideally multiples of frame time
  return frames >= 2 && durationMs % PERFORMANCE_TARGETS.maxFrameTime < 1;
}

/**
 * Performance monitoring helper
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private startTime = 0;
  private frameTimings: number[] = [];

  start(): void {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.frameTimings = [];
  }

  recordFrame(): void {
    const now = performance.now();
    if (this.frameCount > 0) {
      const frameTime = now - this.startTime;
      this.frameTimings.push(frameTime);
    }
    this.frameCount++;
    this.startTime = now;
  }

  getAverageFPS(): number {
    if (this.frameTimings.length === 0) return 0;
    const avgFrameTime = this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length;
    return 1000 / avgFrameTime;
  }

  isPerformant(): boolean {
    return this.getAverageFPS() >= PERFORMANCE_TARGETS.targetFPS * 0.9; // Allow 10% tolerance
  }

  getReport(): {
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    droppedFrames: number;
    isPerformant: boolean;
  } {
    if (this.frameTimings.length === 0) {
      return {
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        droppedFrames: 0,
        isPerformant: false,
      };
    }

    const fps = this.frameTimings.map(ft => 1000 / ft);
    const avgFPS = this.getAverageFPS();
    const minFPS = Math.min(...fps);
    const maxFPS = Math.max(...fps);
    const droppedFrames = fps.filter(f => f < PERFORMANCE_TARGETS.targetFPS * 0.9).length;

    return {
      averageFPS: avgFPS,
      minFPS,
      maxFPS,
      droppedFrames,
      isPerformant: this.isPerformant(),
    };
  }
}

/**
 * Export a singleton monitor for global use
 */
export const globalAnimationMonitor = new AnimationPerformanceMonitor();
