/**
 * Animation utilities composable
 * Provides reusable animation helpers and timing functions
 */

import { ref, onMounted } from 'vue'

/**
 * Fade in animation on mount
 * Returns a ref that controls visibility for fade-in effect
 */
export function useFadeIn(delay = 0) {
  const isVisible = ref(false)

  onMounted(() => {
    setTimeout(() => {
      isVisible.value = true
    }, delay)
  })

  return { isVisible }
}

/**
 * Staggered fade in for lists
 * Returns a function to calculate delay for each item
 */
export function useStaggeredFadeIn(baseDelay = 50) {
  return (index: number) => index * baseDelay
}

/**
 * Animation timing functions
 */
export const animations = {
  // Durations
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Easing functions
  easing: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Common transitions
  transition: {
    fast: 'all 150ms cubic-bezier(0, 0, 0.2, 1)',
    normal: 'all 250ms cubic-bezier(0, 0, 0.2, 1)',
    slow: 'all 350ms cubic-bezier(0, 0, 0.2, 1)',
  },
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
