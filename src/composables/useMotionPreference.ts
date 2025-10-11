import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';

export type AnimationType = 'decorative' | 'essential' | 'feedback';

export interface MotionPreference {
  prefersReducedMotion: Ref<boolean>;
  shouldAnimate: Ref<boolean>;
  getDuration: (duration: number, type?: AnimationType) => number;
  shouldAnimateType: (type: AnimationType) => boolean;
  getScale: (scale: number) => number;
  getStagger: (stagger: number) => number;
}

/**
 * Composable for detecting and respecting user motion preferences
 * Implements prefers-reduced-motion media query detection with granular control
 * 
 * Behavior with reduced motion:
 * - Decorative animations: Disabled completely
 * - Essential animations: Reduced duration (instant or very fast)
 * - Feedback animations: Kept but shortened for accessibility
 * 
 * @returns {MotionPreference} Motion preference state and helpers
 */
export function useMotionPreference(): MotionPreference {
  const prefersReducedMotion = ref(false);
  
  // Check media query and update preference
  const updatePreference = () => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = mediaQuery.matches;
  };
  
  onMounted(() => {
    updatePreference();
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', updatePreference);
    
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', updatePreference);
    });
  });
  
  // Computed property to determine if animations should run
  const shouldAnimate = computed(() => !prefersReducedMotion.value);
  
  /**
   * Get animation duration respecting user preferences
   * 
   * @param {number} duration - Original animation duration in milliseconds
   * @param {AnimationType} type - Type of animation (decorative, essential, feedback)
   * @returns {number} Adjusted duration based on user preference
   */
  const getDuration = (duration: number, type: AnimationType = 'decorative'): number => {
    if (!prefersReducedMotion.value) {
      return duration;
    }
    
    // With reduced motion preference:
    switch (type) {
      case 'decorative':
        return 0; // Disable decorative animations completely
      case 'essential':
        return Math.min(duration * 0.2, 100); // Very fast, max 100ms
      case 'feedback':
        return Math.min(duration * 0.3, 150); // Fast but visible, max 150ms
      default:
        return 0;
    }
  };
  
  /**
   * Check if a specific animation type should run
   * 
   * @param {AnimationType} type - Type of animation
   * @returns {boolean} Whether this animation type should run
   */
  const shouldAnimateType = (type: AnimationType): boolean => {
    if (!prefersReducedMotion.value) {
      return true;
    }
    
    // With reduced motion, only essential and feedback animations run
    return type === 'essential' || type === 'feedback';
  };
  
  /**
   * Get scale value respecting user preferences
   * Reduces scale transforms when reduced motion is preferred
   * 
   * @param {number} scale - Original scale value
   * @returns {number} Adjusted scale value
   */
  const getScale = (scale: number): number => {
    if (!prefersReducedMotion.value) {
      return scale;
    }
    
    // Reduce scale intensity (closer to 1.0)
    const diff = scale - 1.0;
    return 1.0 + (diff * 0.3); // 30% of original scale change
  };
  
  /**
   * Get stagger delay respecting user preferences
   * Reduces or eliminates stagger when reduced motion is preferred
   * 
   * @param {number} stagger - Original stagger delay in milliseconds
   * @returns {number} Adjusted stagger delay
   */
  const getStagger = (stagger: number): number => {
    return prefersReducedMotion.value ? 0 : stagger;
  };
  
  return {
    prefersReducedMotion,
    shouldAnimate,
    getDuration,
    shouldAnimateType,
    getScale,
    getStagger,
  };
}
