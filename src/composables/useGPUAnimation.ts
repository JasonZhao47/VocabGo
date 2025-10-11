/**
 * GPU-Accelerated Animation Composable
 * 
 * Wraps GSAP animations with automatic GPU acceleration management.
 * Ensures all animations use transform and opacity for optimal performance.
 */

import gsap from 'gsap';
import { applyWillChange, removeWillChange, type GPUAcceleratedProperty } from '@/utils/gpuAcceleration';

export interface GPUAnimationOptions {
  /** Target element or selector */
  target: gsap.TweenTarget;
  /** Animation properties (should use transform/opacity) */
  vars: gsap.TweenVars;
  /** Properties to optimize with will-change */
  gpuProps?: GPUAcceleratedProperty[];
  /** Whether to automatically detect GPU properties */
  autoDetect?: boolean;
}

/**
 * Animates an element with automatic GPU acceleration
 * Applies will-change before animation, removes after completion
 * 
 * @param options - Animation configuration
 * @returns GSAP tween
 * 
 * @example
 * ```ts
 * const { animateTo } = useGPUAnimation();
 * 
 * animateTo({
 *   target: '.card',
 *   vars: { x: 100, opacity: 0.5, duration: 0.3 }
 * });
 * ```
 */
export function useGPUAnimation() {
  /**
   * Detects which GPU-accelerated properties are being animated
   */
  const detectGPUProps = (vars: gsap.TweenVars): GPUAcceleratedProperty[] => {
    const props: GPUAcceleratedProperty[] = [];
    
    // Check for transform properties
    if ('x' in vars || 'y' in vars || 'z' in vars || 
        'scale' in vars || 'scaleX' in vars || 'scaleY' in vars ||
        'rotation' in vars || 'rotationX' in vars || 'rotationY' in vars || 'rotationZ' in vars ||
        'skewX' in vars || 'skewY' in vars) {
      props.push('transform');
    }
    
    // Check for opacity
    if ('opacity' in vars) {
      props.push('opacity');
    }
    
    // Check for filter
    if ('filter' in vars || 'blur' in vars) {
      props.push('filter');
    }
    
    return props;
  };

  /**
   * Applies GPU acceleration and animates to target values
   */
  const animateTo = (options: GPUAnimationOptions): gsap.core.Tween => {
    const { target, vars, gpuProps, autoDetect = true } = options;
    
    // Determine which properties to optimize
    const propsToOptimize = gpuProps || (autoDetect ? detectGPUProps(vars) : []);
    
    // Get the actual element(s)
    const elements = gsap.utils.toArray(target);
    
    // Apply will-change to all target elements
    if (propsToOptimize.length > 0) {
      elements.forEach(el => {
        if (el instanceof Element) {
          applyWillChange(el, propsToOptimize);
        }
      });
    }
    
    // Create animation with cleanup callback
    const originalOnComplete = vars.onComplete;
    
    return gsap.to(target, {
      ...vars,
      onComplete: () => {
        // Remove will-change from all elements
        elements.forEach(el => {
          if (el instanceof Element) {
            removeWillChange(el);
          }
        });
        
        // Call original onComplete if it exists
        if (originalOnComplete) {
          originalOnComplete();
        }
      },
    });
  };

  /**
   * Applies GPU acceleration and animates from initial values
   */
  const animateFrom = (options: GPUAnimationOptions): gsap.core.Tween => {
    const { target, vars, gpuProps, autoDetect = true } = options;
    
    // Determine which properties to optimize
    const propsToOptimize = gpuProps || (autoDetect ? detectGPUProps(vars) : []);
    
    // Get the actual element(s)
    const elements = gsap.utils.toArray(target);
    
    // Apply will-change to all target elements
    if (propsToOptimize.length > 0) {
      elements.forEach(el => {
        if (el instanceof Element) {
          applyWillChange(el, propsToOptimize);
        }
      });
    }
    
    // Create animation with cleanup callback
    const originalOnComplete = vars.onComplete;
    
    return gsap.from(target, {
      ...vars,
      onComplete: () => {
        // Remove will-change from all elements
        elements.forEach(el => {
          if (el instanceof Element) {
            removeWillChange(el);
          }
        });
        
        // Call original onComplete if it exists
        if (originalOnComplete) {
          originalOnComplete();
        }
      },
    });
  };

  /**
   * Creates a timeline with automatic GPU acceleration for all tweens
   */
  const createTimeline = (vars?: gsap.TimelineVars): gsap.core.Timeline => {
    return gsap.timeline(vars);
  };

  return {
    animateTo,
    animateFrom,
    createTimeline,
    detectGPUProps,
  };
}
