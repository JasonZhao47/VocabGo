/**
 * Deferred Animation Composable
 * 
 * Defers non-critical animations until after initial page render.
 * Improves perceived performance by prioritizing content display.
 */

import { onMounted, ref } from 'vue';
import { queueAnimation, deferAnimation, runCriticalAnimation, type AnimationPriority } from '@/utils/animationQueue';

export interface DeferredAnimationOptions {
  /** Priority level for the animation */
  priority?: AnimationPriority;
  /** Delay before running animation (in ms) */
  delay?: number;
  /** Run on mount (default: true) */
  runOnMount?: boolean;
}

/**
 * Composable for deferring animations until after initial render
 */
export function useDeferredAnimation(
  animationFn: () => Promise<void> | void,
  options: DeferredAnimationOptions = {}
) {
  const {
    priority = 'normal',
    delay = 0,
    runOnMount = true,
  } = options;

  const animationId = ref<string | null>(null);
  const hasRun = ref(false);
  const isRunning = ref(false);

  /**
   * Run the animation
   */
  const run = async () => {
    if (hasRun.value || isRunning.value) return;

    isRunning.value = true;

    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const id = queueAnimation(async () => {
        await animationFn();
        hasRun.value = true;
        isRunning.value = false;
      }, priority);

      animationId.value = id;
    } catch (error) {
      console.error('[useDeferredAnimation] Error:', error);
      isRunning.value = false;
    }
  };

  /**
   * Reset the animation state
   */
  const reset = () => {
    hasRun.value = false;
    isRunning.value = false;
    animationId.value = null;
  };

  // Auto-run on mount if enabled
  if (runOnMount) {
    onMounted(() => {
      run();
    });
  }

  return {
    run,
    reset,
    hasRun,
    isRunning,
    animationId,
  };
}

/**
 * Defer animation until after initial render
 */
export function useAfterRender(animationFn: () => Promise<void> | void) {
  return useDeferredAnimation(animationFn, {
    priority: 'low',
    runOnMount: true,
  });
}

/**
 * Run animation with delay
 */
export function useDelayedAnimation(
  animationFn: () => Promise<void> | void,
  delay: number
) {
  return useDeferredAnimation(animationFn, {
    priority: 'normal',
    delay,
    runOnMount: true,
  });
}

/**
 * Run critical animation immediately
 */
export function useCriticalAnimation(animationFn: () => Promise<void> | void) {
  const hasRun = ref(false);
  const isRunning = ref(false);

  const run = async () => {
    if (hasRun.value || isRunning.value) return;

    isRunning.value = true;

    try {
      runCriticalAnimation(async () => {
        await animationFn();
        hasRun.value = true;
        isRunning.value = false;
      });
    } catch (error) {
      console.error('[useCriticalAnimation] Error:', error);
      isRunning.value = false;
    }
  };

  onMounted(() => {
    run();
  });

  return {
    run,
    hasRun,
    isRunning,
  };
}
