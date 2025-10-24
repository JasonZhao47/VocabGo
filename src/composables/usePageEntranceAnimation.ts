/**
 * Page Entrance Animation Composable
 * Provides utilities for staggered entrance animations on page load
 */

import { ref, onMounted } from 'vue'
import { useMotionPreference } from './useMotionPreference'

export interface PageEntranceOptions {
  /** Base delay before first element animates (ms) */
  baseDelay?: number
  /** Delay between each element (ms) */
  staggerDelay?: number
  /** Maximum number of stagger classes to generate */
  maxElements?: number
}

/**
 * Composable for page entrance animations with stagger support
 * Respects prefers-reduced-motion preference
 * 
 * @param options - Configuration options for entrance animations
 * @returns Object with animation state and helper functions
 */
export function usePageEntranceAnimation(options: PageEntranceOptions = {}) {
  const {
    baseDelay = 0,
    staggerDelay = 50,
    maxElements = 6,
  } = options

  const { shouldAnimate, getStagger } = useMotionPreference()
  const isReady = ref(false)

  onMounted(() => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      isReady.value = true
    }, baseDelay)
  })

  /**
   * Get the stagger class name for an element at a given index
   * Returns empty string if animations are disabled
   * 
   * @param index - Zero-based index of the element
   * @returns CSS class name for stagger animation
   */
  const getStaggerClass = (index: number): string => {
    if (!shouldAnimate.value) {
      return ''
    }

    const staggerIndex = Math.min(index + 1, maxElements)
    return `page-enter-stagger page-enter-stagger-${staggerIndex}`
  }

  /**
   * Get inline style for custom stagger delay
   * Useful for dynamic lists with many items
   * 
   * @param index - Zero-based index of the element
   * @returns Style object with animation delay
   */
  const getStaggerStyle = (index: number) => {
    const delay = getStagger(index * staggerDelay)
    
    if (delay === 0) {
      return {}
    }

    return {
      animationDelay: `${delay}ms`,
    }
  }

  /**
   * Calculate delay for a specific index
   * 
   * @param index - Zero-based index of the element
   * @returns Delay in milliseconds
   */
  const getDelay = (index: number): number => {
    return getStagger(index * staggerDelay)
  }

  return {
    isReady,
    shouldAnimate,
    getStaggerClass,
    getStaggerStyle,
    getDelay,
  }
}
