/**
 * Stagger Animation Utility
 * Provides utilities for creating staggered animations using GSAP
 */

import gsap from 'gsap';
import { animationConfig } from '@/config/animations';
import { applyWillChangeToMultiple, removeWillChangeFromMultiple, type GPUAcceleratedProperty } from './gpuAcceleration';

export interface StaggerOptions {
  /** Delay between each element animation (in milliseconds) */
  delay?: number;
  /** Duration of each element animation (in milliseconds) */
  duration?: number;
  /** Origin point for stagger effect */
  from?: 'start' | 'center' | 'end';
  /** Easing function for the animation */
  ease?: string;
}

/**
 * Creates a staggered animation for multiple elements
 * 
 * @param elements - Array of DOM elements to animate
 * @param animation - GSAP animation properties
 * @param options - Stagger configuration options
 * @returns GSAP timeline or tween
 * 
 * @example
 * ```typescript
 * const cards = document.querySelectorAll('.card');
 * staggerAnimation(
 *   Array.from(cards),
 *   { opacity: 1, y: 0 },
 *   { delay: 100, from: 'start' }
 * );
 * ```
 */
export function staggerAnimation(
  elements: Element[],
  animation: gsap.TweenVars,
  options: StaggerOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  const {
    delay = animationConfig.stagger.normal,
    duration = animationConfig.duration.normal,
    from = 'start',
    ease = animationConfig.easing.easeOut,
  } = options;

  // Determine which properties will be animated for GPU acceleration
  const gpuProps: GPUAcceleratedProperty[] = [];
  if ('opacity' in animation) gpuProps.push('opacity');
  if ('y' in animation || 'x' in animation || 'scale' in animation) gpuProps.push('transform');
  if ('filter' in animation) gpuProps.push('filter');
  
  // Apply GPU acceleration hints to all elements
  if (gpuProps.length > 0) {
    applyWillChangeToMultiple(elements, gpuProps);
  }

  // Convert milliseconds to seconds for GSAP
  const durationInSeconds = duration / 1000;
  const totalStaggerTime = (delay * elements.length) / 1000;

  return gsap.from(elements, {
    ...animation,
    duration: durationInSeconds,
    ease,
    stagger: {
      amount: totalStaggerTime,
      from,
    },
    onComplete: () => {
      // Remove will-change after all animations complete
      removeWillChangeFromMultiple(elements);
    },
  });
}

/**
 * Creates a staggered fade-in and slide-up animation
 * Common pattern for list items and cards
 * 
 * @param elements - Array of DOM elements to animate
 * @param options - Stagger configuration options
 * @returns GSAP timeline or tween
 */
export function staggerFadeInUp(
  elements: Element[],
  options: StaggerOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  return staggerAnimation(
    elements,
    {
      opacity: 0,
      y: animationConfig.slide.medium,
    },
    options
  );
}

/**
 * Creates a staggered scale-in animation
 * Useful for grid layouts and card reveals
 * 
 * @param elements - Array of DOM elements to animate
 * @param options - Stagger configuration options
 * @returns GSAP timeline or tween
 */
export function staggerScaleIn(
  elements: Element[],
  options: StaggerOptions = {}
): gsap.core.Tween | gsap.core.Timeline {
  return staggerAnimation(
    elements,
    {
      opacity: 0,
      scale: animationConfig.scale.enter,
    },
    options
  );
}
