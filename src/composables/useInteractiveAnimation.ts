import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import gsap from 'gsap';
import { animationConfig } from '@/config/animations';
import { useMotionPreference } from './useMotionPreference';
import { applyWillChange, removeWillChange } from '@/utils/gpuAcceleration';

export interface InteractiveAnimationOptions {
  hoverScale?: number;
  activeScale?: number;
  duration?: number;
}

export interface InteractiveAnimationState {
  isHovered: Ref<boolean>;
  isActive: Ref<boolean>;
}

/**
 * Composable for adding interactive animations to elements
 * Provides hover and active state animations with scale transforms
 * 
 * @param {Ref<HTMLElement | null>} elementRef - Reference to the element to animate
 * @param {InteractiveAnimationOptions} options - Animation configuration options
 * @returns {InteractiveAnimationState} Animation state
 */
export function useInteractiveAnimation(
  elementRef: Ref<HTMLElement | null>,
  options: InteractiveAnimationOptions = {}
): InteractiveAnimationState {
  const { shouldAnimate, getDuration } = useMotionPreference();
  const {
    hoverScale = animationConfig.scale.hover,
    activeScale = animationConfig.scale.active,
    duration = animationConfig.duration.fast,
  } = options;

  const isHovered = ref(false);
  const isActive = ref(false);

  /**
   * Handle mouse enter - scale up on hover
   */
  const handleMouseEnter = () => {
    if (!shouldAnimate.value || !elementRef.value) return;

    isHovered.value = true;
    applyWillChange(elementRef.value, ['transform']);
    
    gsap.to(elementRef.value, {
      scale: hoverScale,
      duration: getDuration(duration) / 1000,
      ease: animationConfig.easing.easeOut,
    });
  };

  /**
   * Handle mouse leave - scale back to normal
   */
  const handleMouseLeave = () => {
    if (!shouldAnimate.value || !elementRef.value) return;

    isHovered.value = false;
    
    gsap.to(elementRef.value, {
      scale: 1,
      duration: getDuration(duration) / 1000,
      ease: animationConfig.easing.easeOut,
      onComplete: () => {
        // Remove will-change when back to rest state
        removeWillChange(elementRef.value);
      },
    });
  };

  /**
   * Handle mouse down - scale down on click
   */
  const handleMouseDown = () => {
    if (!shouldAnimate.value || !elementRef.value) return;

    isActive.value = true;
    
    gsap.to(elementRef.value, {
      scale: activeScale,
      duration: getDuration(duration * 0.5) / 1000,
      ease: animationConfig.easing.easeOut,
    });
  };

  /**
   * Handle mouse up - return to hover or normal scale
   */
  const handleMouseUp = () => {
    if (!shouldAnimate.value || !elementRef.value) return;

    isActive.value = false;
    
    gsap.to(elementRef.value, {
      scale: isHovered.value ? hoverScale : 1,
      duration: getDuration(duration * 0.5) / 1000,
      ease: animationConfig.easing.easeOut,
      onComplete: () => {
        // Remove will-change if returning to rest state
        if (!isHovered.value) {
          removeWillChange(elementRef.value);
        }
      },
    });
  };

  // Set up event listeners on mount
  onMounted(() => {
    if (!elementRef.value) return;

    const element = elementRef.value;
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
  });

  // Clean up event listeners on unmount
  onUnmounted(() => {
    if (!elementRef.value) return;

    const element = elementRef.value;
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('mouseup', handleMouseUp);
  });

  return {
    isHovered,
    isActive,
  };
}
