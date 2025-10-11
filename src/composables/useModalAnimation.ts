import { ref, type Ref } from 'vue';
import gsap from 'gsap';
import { animationConfig } from '@/config/animations';
import { useMotionPreference } from './useMotionPreference';

export interface ModalAnimationOptions {
  duration?: number;
  backdropBlur?: boolean;
}

export interface ModalAnimationReturn {
  isOpen: Ref<boolean>;
  open: (modalEl: Element, backdropEl: Element) => void;
  close: (modalEl: Element, backdropEl: Element, onComplete: () => void) => void;
}

/**
 * Composable for modal and dialog animations
 * Provides smooth open/close animations with backdrop fade and modal scale
 * 
 * @param {ModalAnimationOptions} options - Animation configuration options
 * @returns {ModalAnimationReturn} Modal animation state and control functions
 */
export function useModalAnimation(options: ModalAnimationOptions = {}): ModalAnimationReturn {
  const { shouldAnimate, getDuration } = useMotionPreference();
  const { duration = 300, backdropBlur = true } = options;
  
  const isOpen = ref(false);
  let currentAnimation: gsap.core.Tween | gsap.core.Timeline | null = null;

  /**
   * Open modal with animation
   * Animates backdrop fade-in and modal scale-up with slide
   */
  const open = (modalEl: Element, backdropEl: Element) => {
    // Kill any existing animation to handle interruption
    if (currentAnimation) {
      currentAnimation.kill();
      currentAnimation = null;
    }

    if (!shouldAnimate.value) {
      isOpen.value = true;
      gsap.set(backdropEl, { opacity: 1 });
      gsap.set(modalEl, { opacity: 1, scale: 1, y: 0 });
      return;
    }
    
    isOpen.value = true;
    
    // Create timeline for coordinated animations
    const timeline = gsap.timeline();
    currentAnimation = timeline;

    // Animate backdrop fade-in
    timeline.fromTo(
      backdropEl,
      { opacity: 0 },
      {
        opacity: 1,
        duration: getDuration(duration * 0.7) / 1000,
        ease: animationConfig.easing.easeOut,
      },
      0 // Start at beginning
    );
    
    // Animate modal scale and slide
    timeline.fromTo(
      modalEl,
      {
        opacity: 0,
        scale: animationConfig.scale.enter,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: getDuration(duration) / 1000,
        ease: animationConfig.easing.spring,
        onComplete: () => {
          currentAnimation = null;
        }
      },
      0.05 // Slight delay for better visual flow
    );
  };
  
  /**
   * Close modal with animation
   * Animates modal scale-down with slide and backdrop fade-out
   */
  const close = (modalEl: Element, backdropEl: Element, onComplete: () => void) => {
    // Kill any existing animation to handle interruption
    if (currentAnimation) {
      currentAnimation.kill();
      currentAnimation = null;
    }

    if (!shouldAnimate.value) {
      isOpen.value = false;
      onComplete();
      return;
    }
    
    // Create timeline for coordinated animations
    const timeline = gsap.timeline();
    currentAnimation = timeline;

    // Animate modal scale-down and slide
    timeline.to(
      modalEl,
      {
        opacity: 0,
        scale: animationConfig.scale.enter,
        y: 20,
        duration: getDuration(duration * 0.8) / 1000,
        ease: animationConfig.easing.easeIn,
      },
      0 // Start at beginning
    );
    
    // Animate backdrop fade-out
    timeline.to(
      backdropEl,
      {
        opacity: 0,
        duration: getDuration(duration * 0.7) / 1000,
        ease: animationConfig.easing.easeIn,
        onComplete: () => {
          isOpen.value = false;
          currentAnimation = null;
          onComplete();
        },
      },
      0.1 // Slight delay so modal animates out first
    );
  };
  
  return {
    isOpen,
    open,
    close,
  };
}
