/**
 * Adaptive Animation Composable
 * 
 * Automatically adjusts animation complexity based on performance.
 * Reduces animations when FPS drops below threshold.
 */

import { ref, readonly, onMounted, onUnmounted } from 'vue';
import { getPerformanceMonitor, type PerformanceMetrics } from '@/utils/performanceMonitor';
import { animationConfig } from '@/config/animations';

export type AnimationQuality = 'high' | 'medium' | 'low' | 'minimal';

export interface AdaptiveAnimationOptions {
  /** Enable automatic quality adjustment (default: true) */
  autoAdjust?: boolean;
  /** Initial animation quality (default: 'high') */
  initialQuality?: AnimationQuality;
  /** Enable performance monitoring (default: true in dev) */
  enableMonitoring?: boolean;
}

export interface AdaptiveAnimationState {
  /** Current animation quality level */
  quality: Readonly<typeof quality>;
  /** Whether animations should be reduced */
  shouldReduceAnimations: Readonly<typeof shouldReduceAnimations>;
  /** Whether to disable decorative animations */
  disableDecorativeAnimations: Readonly<typeof disableDecorativeAnimations>;
  /** Current performance metrics */
  metrics: Readonly<typeof metrics>;
  /** Manually set animation quality */
  setQuality: (quality: AnimationQuality) => void;
  /** Get duration adjusted for current quality */
  getDuration: (baseDuration: number) => number;
  /** Get stagger delay adjusted for current quality */
  getStagger: (baseStagger: number) => number;
  /** Check if a specific animation type should run */
  shouldAnimate: (type: 'essential' | 'decorative' | 'micro') => boolean;
}

const quality = ref<AnimationQuality>('high');
const shouldReduceAnimations = ref(false);
const disableDecorativeAnimations = ref(false);
const metrics = ref<PerformanceMetrics>({
  fps: 60,
  averageFps: 60,
  minFps: 60,
  maxFps: 60,
  frameCount: 0,
  droppedFrames: 0,
  isLowPerformance: false,
});

/**
 * Composable for adaptive animations that adjust based on performance
 */
export function useAdaptiveAnimation(
  options: AdaptiveAnimationOptions = {}
): AdaptiveAnimationState {
  const {
    autoAdjust = true,
    initialQuality = 'high',
    enableMonitoring = import.meta.env.DEV ?? false,
  } = options;

  // Set initial quality
  if (quality.value === 'high' && initialQuality !== 'high') {
    quality.value = initialQuality;
    updateAnimationFlags();
  }

  /**
   * Update animation flags based on quality
   */
  function updateAnimationFlags() {
    switch (quality.value) {
      case 'high':
        shouldReduceAnimations.value = false;
        disableDecorativeAnimations.value = false;
        break;
      case 'medium':
        shouldReduceAnimations.value = true;
        disableDecorativeAnimations.value = false;
        break;
      case 'low':
        shouldReduceAnimations.value = true;
        disableDecorativeAnimations.value = true;
        break;
      case 'minimal':
        shouldReduceAnimations.value = true;
        disableDecorativeAnimations.value = true;
        break;
    }
  }

  /**
   * Handle low performance detection
   */
  function handleLowPerformance(performanceMetrics: PerformanceMetrics) {
    metrics.value = performanceMetrics;

    if (!autoAdjust) return;

    // Reduce quality based on how bad performance is
    if (performanceMetrics.averageFps < 20) {
      setQuality('minimal');
    } else if (performanceMetrics.averageFps < 30) {
      setQuality('low');
    } else if (performanceMetrics.averageFps < 45) {
      setQuality('medium');
    }
  }

  /**
   * Handle performance recovery
   */
  function handlePerformanceRecover(performanceMetrics: PerformanceMetrics) {
    metrics.value = performanceMetrics;

    if (!autoAdjust) return;

    // Gradually increase quality when performance improves
    if (performanceMetrics.averageFps >= 55 && quality.value !== 'high') {
      setQuality('high');
    } else if (performanceMetrics.averageFps >= 45 && quality.value === 'low') {
      setQuality('medium');
    }
  }

  /**
   * Manually set animation quality
   */
  function setQuality(newQuality: AnimationQuality) {
    if (quality.value === newQuality) return;

    quality.value = newQuality;
    updateAnimationFlags();

    if (enableMonitoring) {
      console.log(`[AdaptiveAnimation] Quality changed to: ${newQuality}`);
    }
  }

  /**
   * Get duration adjusted for current quality
   */
  function getDuration(baseDuration: number): number {
    switch (quality.value) {
      case 'high':
        return baseDuration;
      case 'medium':
        return baseDuration * 0.7;
      case 'low':
        return baseDuration * 0.5;
      case 'minimal':
        return baseDuration * 0.3;
      default:
        return baseDuration;
    }
  }

  /**
   * Get stagger delay adjusted for current quality
   */
  function getStagger(baseStagger: number): number {
    switch (quality.value) {
      case 'high':
        return baseStagger;
      case 'medium':
        return baseStagger * 0.7;
      case 'low':
        return baseStagger * 0.5;
      case 'minimal':
        return 0; // No stagger in minimal mode
      default:
        return baseStagger;
    }
  }

  /**
   * Check if a specific animation type should run
   */
  function shouldAnimate(type: 'essential' | 'decorative' | 'micro'): boolean {
    switch (quality.value) {
      case 'high':
        return true;
      case 'medium':
        return type === 'essential' || type === 'decorative';
      case 'low':
        return type === 'essential';
      case 'minimal':
        return type === 'essential';
      default:
        return true;
    }
  }

  // Set up performance monitoring
  onMounted(() => {
    if (autoAdjust && enableMonitoring) {
      const monitor = getPerformanceMonitor({
        onLowPerformance: handleLowPerformance,
        onPerformanceRecover: handlePerformanceRecover,
        enableLogging: enableMonitoring,
      });

      monitor.start();
    }
  });

  onUnmounted(() => {
    if (autoAdjust && enableMonitoring) {
      const monitor = getPerformanceMonitor();
      monitor.stop();
    }
  });

  return {
    quality: readonly(quality),
    shouldReduceAnimations: readonly(shouldReduceAnimations),
    disableDecorativeAnimations: readonly(disableDecorativeAnimations),
    metrics: readonly(metrics),
    setQuality,
    getDuration,
    getStagger,
    shouldAnimate,
  };
}

/**
 * Get animation configuration adjusted for current quality
 */
export function getAdaptiveAnimationConfig() {
  const { getDuration, getStagger } = useAdaptiveAnimation();

  return {
    duration: {
      instant: 0,
      fast: getDuration(animationConfig.duration.fast),
      normal: getDuration(animationConfig.duration.normal),
      slow: getDuration(animationConfig.duration.slow),
      slower: getDuration(animationConfig.duration.slower),
    },
    stagger: {
      fast: getStagger(animationConfig.stagger.fast),
      normal: getStagger(animationConfig.stagger.normal),
      slow: getStagger(animationConfig.stagger.slow),
    },
    easing: animationConfig.easing,
    scale: animationConfig.scale,
    slide: animationConfig.slide,
  };
}
