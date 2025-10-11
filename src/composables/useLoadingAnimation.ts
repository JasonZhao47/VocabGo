/**
 * Loading Animation Composable
 * Provides loading state management with different animation types
 * Supports spinner, skeleton, and progress bar animations
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';
import { animationConfig } from '@/config/animations';
import { useMotionPreference } from './useMotionPreference';

export type LoadingType = 'spinner' | 'skeleton' | 'progress';

export interface LoadingAnimationOptions {
  type?: LoadingType;
  duration?: number;
  autoStart?: boolean;
}

export interface LoadingAnimationReturn {
  isLoading: Ref<boolean>;
  progress: Ref<number>;
  type: LoadingType;
  startLoading: () => void;
  stopLoading: () => void;
  setProgress: (value: number) => void;
  animateSpinner: (element: HTMLElement) => gsap.core.Tween | null;
  animateProgress: (element: HTMLElement, targetProgress: number) => gsap.core.Tween | null;
}

/**
 * Composable for managing loading animations
 * @param options - Configuration options for the loading animation
 * @returns Loading animation state and control functions
 */
export function useLoadingAnimation(
  options: LoadingAnimationOptions = {}
): LoadingAnimationReturn {
  const { shouldAnimate, getDuration } = useMotionPreference();
  const {
    type = 'spinner',
    duration = 1500,
    autoStart = false,
  } = options;

  const isLoading = ref(autoStart);
  const progress = ref(0);
  let spinnerAnimation: gsap.core.Tween | null = null;

  /**
   * Start the loading state
   */
  const startLoading = () => {
    isLoading.value = true;
    progress.value = 0;
  };

  /**
   * Stop the loading state
   */
  const stopLoading = () => {
    isLoading.value = false;
    if (spinnerAnimation) {
      spinnerAnimation.kill();
      spinnerAnimation = null;
    }
  };

  /**
   * Set progress value (0-100)
   */
  const setProgress = (value: number) => {
    progress.value = Math.max(0, Math.min(100, value));
  };

  /**
   * Animate a spinner element with smooth rotation
   * @param element - The spinner element to animate
   * @returns GSAP animation instance or null if animations disabled
   */
  const animateSpinner = (element: HTMLElement): gsap.core.Tween | null => {
    if (!shouldAnimate.value) {
      return null;
    }

    // Kill existing animation if any
    if (spinnerAnimation) {
      spinnerAnimation.kill();
    }

    // Create infinite rotation animation
    spinnerAnimation = gsap.to(element, {
      rotation: 360,
      duration: getDuration(duration) / 1000,
      ease: 'linear',
      repeat: -1,
    });

    return spinnerAnimation;
  };

  /**
   * Animate a progress bar to a target value
   * @param element - The progress bar element to animate
   * @param targetProgress - Target progress value (0-100)
   * @returns GSAP animation instance or null if animations disabled
   */
  const animateProgress = (
    element: HTMLElement,
    targetProgress: number
  ): gsap.core.Tween | null => {
    if (!shouldAnimate.value) {
      // Set immediately without animation
      gsap.set(element, { scaleX: targetProgress / 100 });
      return null;
    }

    const normalizedProgress = Math.max(0, Math.min(100, targetProgress)) / 100;

    return gsap.to(element, {
      scaleX: normalizedProgress,
      duration: getDuration(animationConfig.duration.normal) / 1000,
      ease: animationConfig.easing.easeOut,
    });
  };

  // Cleanup on unmount
  onUnmounted(() => {
    if (spinnerAnimation) {
      spinnerAnimation.kill();
      spinnerAnimation = null;
    }
  });

  return {
    isLoading,
    progress,
    type,
    startLoading,
    stopLoading,
    setProgress,
    animateSpinner,
    animateProgress,
  };
}
