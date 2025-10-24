/**
 * Scroll Animation Composable
 * Provides utilities for scroll-based animations and effects
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { useMotionPreference } from './useMotionPreference'

export interface ScrollAnimationOptions {
  /** Threshold for when element is considered "in view" (0-1) */
  threshold?: number
  /** Root margin for intersection observer */
  rootMargin?: string
  /** Whether to animate only once or every time element enters viewport */
  once?: boolean
}

/**
 * Composable for scroll-based fade-in animations
 * Uses Intersection Observer API for performance
 * Respects prefers-reduced-motion preference
 * 
 * @param elementRef - Reference to the element to animate
 * @param options - Configuration options
 * @returns Object with visibility state
 */
export function useScrollFadeIn(
  elementRef: Ref<HTMLElement | null>,
  options: ScrollAnimationOptions = {}
) {
  const {
    threshold = 0.2,
    rootMargin = '0px',
    once = true,
  } = options

  const { shouldAnimate } = useMotionPreference()
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elementRef.value || !shouldAnimate.value) {
      // If animations are disabled, make element visible immediately
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            
            // If once is true, stop observing after first intersection
            if (once && observer) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            // If not once, reset visibility when element leaves viewport
            isVisible.value = false
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    isVisible,
  }
}

/**
 * Composable for smooth scroll behavior
 * Adds smooth scrolling to the entire page
 */
export function useSmoothScroll() {
  onMounted(() => {
    // Enable smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'
  })

  onUnmounted(() => {
    // Reset scroll behavior
    document.documentElement.style.scrollBehavior = 'auto'
  })

  /**
   * Scroll to a specific element
   * @param elementId - ID of the element to scroll to
   */
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  /**
   * Scroll to top of page
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return {
    scrollToElement,
    scrollToTop,
  }
}

/**
 * Composable for parallax scroll effects
 * Creates subtle parallax movement on scroll
 * 
 * @param elementRef - Reference to the element to animate
 * @param speed - Parallax speed multiplier (0-1, lower is slower)
 * @returns Object with parallax transform value
 */
export function useParallax(
  elementRef: Ref<HTMLElement | null>,
  speed: number = 0.5
) {
  const { shouldAnimate } = useMotionPreference()
  const translateY = ref(0)

  const handleScroll = () => {
    if (!elementRef.value || !shouldAnimate.value) return

    const rect = elementRef.value.getBoundingClientRect()
    const scrolled = window.scrollY
    const elementTop = rect.top + scrolled
    const windowHeight = window.innerHeight

    // Calculate parallax offset
    if (rect.top < windowHeight && rect.bottom > 0) {
      const offset = (scrolled - elementTop) * speed
      translateY.value = offset
    }
  }

  onMounted(() => {
    if (!shouldAnimate.value) return

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    translateY,
  }
}

/**
 * Composable for scroll progress indicator
 * Tracks scroll progress as a percentage
 * 
 * @returns Object with scroll progress value (0-100)
 */
export function useScrollProgress() {
  const progress = ref(0)

  const handleScroll = () => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY

    const totalScroll = documentHeight - windowHeight
    const currentProgress = (scrollTop / totalScroll) * 100

    progress.value = Math.min(Math.max(currentProgress, 0), 100)
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    progress,
  }
}
