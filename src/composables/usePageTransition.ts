/**
 * Page Transition Composable
 * Provides smooth page transition animations with fade and slide effects
 * Supports staggered child element animations
 */

import { ref, type Ref } from 'vue';
import gsap from 'gsap';
import { animationConfig } from '@/config/animations';
import { useMotionPreference } from './useMotionPreference';
import { applyWillChange, removeWillChange, applyWillChangeToMultiple, removeWillChangeFromMultiple } from '@/utils/gpuAcceleration';

export interface PageTransitionOptions {
  /** Duration of the transition in milliseconds */
  duration?: number;
  /** Distance to slide elements (in pixels) */
  slideDistance?: number;
  /** Enable stagger animation for child elements */
  stagger?: boolean;
  /** Stagger delay between child elements (in milliseconds) */
  staggerDelay?: number;
}

export interface PageTransition {
  /** Whether the page is currently entering */
  isEntering: Readonly<Ref<boolean>>;
  /** Whether the page is currently leaving */
  isLeaving: Readonly<Ref<boolean>>;
  /** Enter transition handler for Vue Router */
  enter: (el: Element, done: () => void) => void;
  /** Leave transition handler for Vue Router */
  leave: (el: Element, done: () => void) => void;
}

/**
 * Composable for page transition animations
 * Implements fade and slide-up enter transitions, fade-out leave transitions
 * with optional stagger support for child elements
 * 
 * @param options - Configuration options for the transition
 * @returns Page transition handlers and state
 * 
 * @example
 * ```vue
 * <script setup>
 * import { usePageTransition } from '@/composables/usePageTransition';
 * 
 * const { enter, leave } = usePageTransition({
 *   duration: 300,
 *   stagger: true
 * });
 * </script>
 * 
 * <template>
 *   <Transition
 *     :css="false"
 *     @enter="enter"
 *     @leave="leave"
 *   >
 *     <div data-animate-child>Content</div>
 *   </Transition>
 * </template>
 * ```
 */
export function usePageTransition(options: PageTransitionOptions = {}): PageTransition {
  const { shouldAnimate, getDuration } = useMotionPreference();
  
  const {
    duration = 300,
    slideDistance = animationConfig.slide.medium,
    stagger = true,
    staggerDelay = animationConfig.stagger.normal,
  } = options;
  
  const isEntering = ref(false);
  const isLeaving = ref(false);
  
  /**
   * Enter transition: fade in with slide-up effect
   * Optionally staggers child elements marked with data-animate-child
   */
  const enter = (el: Element, done: () => void) => {
    if (!shouldAnimate.value) {
      done();
      return;
    }
    
    isEntering.value = true;
    
    // Apply GPU acceleration hints
    applyWillChange(el, ['transform', 'opacity']);
    
    // Set initial state
    gsap.set(el, {
      opacity: 0,
      y: slideDistance,
    });
    
    // Animate main element in
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: getDuration(duration) / 1000,
      ease: animationConfig.easing.easeOut,
      onComplete: () => {
        isEntering.value = false;
        // Remove will-change after animation completes
        removeWillChange(el);
        done();
      },
    });
    
    // Stagger child elements if enabled
    if (stagger) {
      const children = el.querySelectorAll('[data-animate-child]');
      if (children.length > 0) {
        // Apply GPU acceleration to all children
        applyWillChangeToMultiple(children, ['transform', 'opacity']);
        
        gsap.set(children, {
          opacity: 0,
          y: slideDistance / 2,
        });
        
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: getDuration(duration * 0.8) / 1000,
          stagger: getDuration(staggerDelay) / 1000,
          ease: animationConfig.easing.easeOut,
          onComplete: () => {
            // Remove will-change from all children after stagger completes
            removeWillChangeFromMultiple(children);
          },
        });
      }
    }
  };
  
  /**
   * Leave transition: fade out
   * Faster than enter transition for snappier navigation
   */
  const leave = (el: Element, done: () => void) => {
    if (!shouldAnimate.value) {
      done();
      return;
    }
    
    isLeaving.value = true;
    
    // Apply GPU acceleration hint
    applyWillChange(el, ['opacity']);
    
    gsap.to(el, {
      opacity: 0,
      duration: getDuration(duration * 0.7) / 1000,
      ease: animationConfig.easing.easeIn,
      onComplete: () => {
        isLeaving.value = false;
        // Remove will-change after animation completes
        removeWillChange(el);
        done();
      },
    });
  };
  
  return {
    isEntering,
    isLeaving,
    enter,
    leave,
  };
}
