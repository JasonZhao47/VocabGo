# Design Document: ElevenLabs-Inspired Animation System

## Overview

This design document outlines the technical architecture for implementing a comprehensive animation system in VocabGo, inspired by the smooth, polished animations observed in ElevenLabs.io. The system will provide a centralized, performant, and accessible animation framework that enhances user experience through purposeful micro-interactions and transitions.

### Design Goals

1. **Consistency**: Unified animation patterns across the entire application
2. **Performance**: GPU-accelerated animations maintaining 60fps
3. **Accessibility**: Respect user motion preferences and provide alternatives
4. **Developer Experience**: Simple, reusable animation utilities and composables
5. **Maintainability**: Centralized configuration for easy updates

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Vue Components using animation composables & utilities)    │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│              Animation Composables Layer                     │
│  • usePageTransition()    • useCardAnimation()              │
│  • useButtonAnimation()   • useModalAnimation()             │
│  • useLoadingState()      • useToastAnimation()             │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│              Animation Utilities Layer                       │
│  • Animation Config       • Timing Functions                │
│  • Transition Helpers     • Stagger Utilities               │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                   CSS Layer                                  │
│  • Tailwind Animation Classes                               │
│  • Custom CSS Animations                                     │
│  • Keyframe Definitions                                      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Animation Configuration

**File**: `src/config/animations.ts`

```typescript
export interface AnimationConfig {
  // Duration presets (in milliseconds)
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    slower: number;
  };
  
  // Easing functions
  easing: {
    easeInOut: string;
    easeOut: string;
    easeIn: string;
    spring: string;
    bounce: string;
  };
  
  // Stagger delays
  stagger: {
    fast: number;
    normal: number;
    slow: number;
  };
  
  // Scale values
  scale: {
    hover: number;
    active: number;
    enter: number;
  };
  
  // Slide distances
  slide: {
    small: number;
    medium: number;
    large: number;
  };
}

export const animationConfig: AnimationConfig = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  stagger: {
    fast: 50,
    normal: 100,
    slow: 150,
  },
  scale: {
    hover: 1.03,
    active: 0.98,
    enter: 0.95,
  },
  slide: {
    small: 10,
    medium: 20,
    large: 40,
  },
};
```

### 2. Motion Preference Detection

**File**: `src/composables/useMotionPreference.ts`

```typescript
export interface MotionPreference {
  prefersReducedMotion: Ref<boolean>;
  shouldAnimate: Ref<boolean>;
  getDuration: (duration: number) => number;
}

export function useMotionPreference(): MotionPreference {
  const prefersReducedMotion = ref(false);
  
  // Check media query
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
  
  const shouldAnimate = computed(() => !prefersReducedMotion.value);
  
  const getDuration = (duration: number) => {
    return prefersReducedMotion.value ? 0 : duration;
  };
  
  return {
    prefersReducedMotion,
    shouldAnimate,
    getDuration,
  };
}
```

### 3. Page Transition Composable

**File**: `src/composables/usePageTransition.ts`

```typescript
export interface PageTransitionOptions {
  duration?: number;
  slideDistance?: number;
  stagger?: boolean;
}

export function usePageTransition(options: PageTransitionOptions = {}) {
  const { shouldAnimate, getDuration } = useMotionPreference();
  const { duration = 300, slideDistance = 20, stagger = true } = options;
  
  const isEntering = ref(false);
  const isLeaving = ref(false);
  
  const enter = (el: Element, done: () => void) => {
    if (!shouldAnimate.value) {
      done();
      return;
    }
    
    isEntering.value = true;
    
    // Apply initial state
    gsap.set(el, {
      opacity: 0,
      y: slideDistance,
    });
    
    // Animate in
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: getDuration(duration) / 1000,
      ease: animationConfig.easing.easeOut,
      onComplete: () => {
        isEntering.value = false;
        done();
      },
    });
    
    // Stagger children if enabled
    if (stagger) {
      const children = el.querySelectorAll('[data-animate-child]');
      gsap.from(children, {
        opacity: 0,
        y: slideDistance / 2,
        duration: getDuration(duration * 0.8) / 1000,
        stagger: animationConfig.stagger.normal / 1000,
        ease: animationConfig.easing.easeOut,
      });
    }
  };
  
  const leave = (el: Element, done: () => void) => {
    if (!shouldAnimate.value) {
      done();
      return;
    }
    
    isLeaving.value = true;
    
    gsap.to(el, {
      opacity: 0,
      duration: getDuration(duration * 0.7) / 1000,
      ease: animationConfig.easing.easeIn,
      onComplete: () => {
        isLeaving.value = false;
        done();
      },
    });
  };
  
  return {
    enter,
    leave,
    isEntering,
    isLeaving,
  };
}
```

### 4. Interactive Element Animations

**File**: `src/composables/useInteractiveAnimation.ts`

```typescript
export interface InteractiveAnimationOptions {
  hoverScale?: number;
  activeScale?: number;
  duration?: number;
}

export function useInteractiveAnimation(
  elementRef: Ref<HTMLElement | null>,
  options: InteractiveAnimationOptions = {}
) {
  const { shouldAnimate, getDuration } = useMotionPreference();
  const {
    hoverScale = animationConfig.scale.hover,
    activeScale = animationConfig.scale.active,
    duration = animationConfig.duration.fast,
  } = options;
  
  const isHovered = ref(false);
  const isActive = ref(false);
  
  const handleMouseEnter = () => {
    if (!shouldAnimate.value || !elementRef.value) return;
    
    isHovered.value = true;
    gsap.to(elementRef.value, {
      scale: hoverScale,
      duration: getDuration(duration) / 1000,
      ease: animationConfig.easing.easeOut,
    });
  };
  
  const handleMouseLeave = () => {
    if (!shouldAnimate.value || !elementRef.value) return;
    
    isHovered.value = false;
    gsap.to(elementRef.value, {
      scale: 1,
      duration: getDuration(duration) / 1000,
      ease: animationConfig.easing.easeOut,
    });
  };
  
  const handleMouseDown = () => {
    if (!shouldAnimate.value || !elementRef.value) return;
    
    isActive.value = true;
    gsap.to(elementRef.value, {
      scale: activeScale,
      duration: getDuration(duration * 0.5) / 1000,
      ease: animationConfig.easing.easeOut,
    });
  };
  
  const handleMouseUp = () => {
    if (!shouldAnimate.value || !elementRef.value) return;
    
    isActive.value = false;
    gsap.to(elementRef.value, {
      scale: isHovered.value ? hoverScale : 1,
      duration: getDuration(duration * 0.5) / 1000,
      ease: animationConfig.easing.easeOut,
    });
  };
  
  onMounted(() => {
    if (!elementRef.value) return;
    
    elementRef.value.addEventListener('mouseenter', handleMouseEnter);
    elementRef.value.addEventListener('mouseleave', handleMouseLeave);
    elementRef.value.addEventListener('mousedown', handleMouseDown);
    elementRef.value.addEventListener('mouseup', handleMouseUp);
  });
  
  onUnmounted(() => {
    if (!elementRef.value) return;
    
    elementRef.value.removeEventListener('mouseenter', handleMouseEnter);
    elementRef.value.removeEventListener('mouseleave', handleMouseLeave);
    elementRef.value.removeEventListener('mousedown', handleMouseDown);
    elementRef.value.removeEventListener('mouseup', handleMouseUp);
  });
  
  return {
    isHovered,
    isActive,
  };
}
```

### 5. Modal Animation Composable

**File**: `src/composables/useModalAnimation.ts`

```typescript
export interface ModalAnimationOptions {
  duration?: number;
  backdropBlur?: boolean;
}

export function useModalAnimation(options: ModalAnimationOptions = {}) {
  const { shouldAnimate, getDuration } = useMotionPreference();
  const { duration = 300, backdropBlur = true } = options;
  
  const isOpen = ref(false);
  
  const open = (modalEl: Element, backdropEl: Element) => {
    if (!shouldAnimate.value) {
      isOpen.value = true;
      return;
    }
    
    isOpen.value = true;
    
    // Animate backdrop
    gsap.fromTo(
      backdropEl,
      { opacity: 0 },
      {
        opacity: 1,
        duration: getDuration(duration * 0.7) / 1000,
        ease: animationConfig.easing.easeOut,
      }
    );
    
    // Animate modal
    gsap.fromTo(
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
      }
    );
  };
  
  const close = (modalEl: Element, backdropEl: Element, onComplete: () => void) => {
    if (!shouldAnimate.value) {
      isOpen.value = false;
      onComplete();
      return;
    }
    
    // Animate modal out
    gsap.to(modalEl, {
      opacity: 0,
      scale: animationConfig.scale.enter,
      y: 20,
      duration: getDuration(duration * 0.8) / 1000,
      ease: animationConfig.easing.easeIn,
    });
    
    // Animate backdrop out
    gsap.to(backdropEl, {
      opacity: 0,
      duration: getDuration(duration * 0.7) / 1000,
      ease: animationConfig.easing.easeIn,
      onComplete: () => {
        isOpen.value = false;
        onComplete();
      },
    });
  };
  
  return {
    isOpen,
    open,
    close,
  };
}
```

### 6. Loading State Composable

**File**: `src/composables/useLoadingAnimation.ts`

```typescript
export interface LoadingAnimationOptions {
  type?: 'spinner' | 'skeleton' | 'progress';
  duration?: number;
}

export function useLoadingAnimation(options: LoadingAnimationOptions = {}) {
  const { type = 'spinner', duration = 1500 } = options;
  const isLoading = ref(false);
  
  const startLoading = () => {
    isLoading.value = true;
  };
  
  const stopLoading = () => {
    isLoading.value = false;
  };
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    type,
  };
}
```

### 7. Stagger Animation Utility

**File**: `src/utils/staggerAnimation.ts`

```typescript
export interface StaggerOptions {
  delay?: number;
  duration?: number;
  from?: 'start' | 'center' | 'end';
}

export function staggerAnimation(
  elements: Element[],
  animation: gsap.TweenVars,
  options: StaggerOptions = {}
) {
  const { delay = animationConfig.stagger.normal, from = 'start' } = options;
  
  return gsap.from(elements, {
    ...animation,
    stagger: {
      amount: (delay * elements.length) / 1000,
      from,
    },
  });
}
```

## Data Models

### Animation State

```typescript
export interface AnimationState {
  isAnimating: boolean;
  currentAnimation: string | null;
  queuedAnimations: string[];
}

export interface TransitionState {
  isEntering: boolean;
  isLeaving: boolean;
  progress: number;
}
```

## Error Handling

### Animation Error Handling

1. **GSAP Initialization Errors**
   - Fallback to CSS transitions if GSAP fails to load
   - Log errors to console in development mode
   - Gracefully degrade to instant transitions

2. **Element Reference Errors**
   - Check for null/undefined element refs before animating
   - Use optional chaining for DOM queries
   - Provide fallback behavior when elements don't exist

3. **Performance Issues**
   - Monitor frame rate and automatically reduce animation complexity
   - Disable animations on low-end devices if performance drops below 30fps
   - Provide manual override for users to disable animations

## Testing Strategy

### Unit Tests

1. **Animation Configuration Tests**
   - Test that all duration values are positive numbers
   - Verify easing functions are valid CSS values
   - Ensure scale values are reasonable (0.5 - 2.0 range)

2. **Composable Tests**
   - Test motion preference detection
   - Verify animation callbacks are called correctly
   - Test cleanup on component unmount

3. **Utility Function Tests**
   - Test stagger calculations
   - Verify timing function conversions
   - Test animation queue management

### Integration Tests

1. **Page Transition Tests**
   - Verify smooth transitions between routes
   - Test stagger effects on child elements
   - Ensure animations complete before navigation

2. **Interactive Element Tests**
   - Test hover state animations
   - Verify click feedback animations
   - Test focus state animations on inputs

3. **Modal Animation Tests**
   - Test open/close animations
   - Verify backdrop blur effects
   - Test animation interruption handling

### Performance Tests

1. **Frame Rate Tests**
   - Monitor FPS during animations
   - Test with multiple simultaneous animations
   - Verify GPU acceleration is working

2. **Memory Tests**
   - Check for memory leaks in animation loops
   - Verify proper cleanup of animation instances
   - Test with long-running animations

### Accessibility Tests

1. **Reduced Motion Tests**
   - Verify animations are disabled when prefers-reduced-motion is set
   - Test that essential feedback is still provided
   - Ensure keyboard navigation works without animations

2. **Screen Reader Tests**
   - Verify animations don't interfere with screen readers
   - Test that loading states are announced
   - Ensure focus management during transitions

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up animation configuration
- Implement motion preference detection
- Create base animation utilities
- Add GSAP library integration

### Phase 2: Core Animations (Week 2)
- Implement page transitions
- Create button and card animations
- Add input focus animations
- Implement loading states

### Phase 3: Advanced Animations (Week 3)
- Add modal animations
- Implement toast notifications
- Create list stagger animations
- Add gradient transitions

### Phase 4: Polish and Optimization (Week 4)
- Performance optimization
- Accessibility improvements
- Cross-browser testing
- Documentation and examples

## Technical Decisions

### Why GSAP?

1. **Performance**: Industry-leading animation performance with GPU acceleration
2. **Features**: Advanced easing, timeline control, and plugin ecosystem
3. **Browser Support**: Excellent cross-browser compatibility
4. **Developer Experience**: Intuitive API and excellent documentation

### Why Composables?

1. **Reusability**: Share animation logic across components
2. **Testability**: Easy to unit test in isolation
3. **Composition**: Combine multiple animation behaviors
4. **Vue 3 Best Practice**: Aligns with Vue 3 Composition API patterns

### CSS vs JavaScript Animations

**Use CSS for:**
- Simple transitions (opacity, color, transform)
- Hover states
- Loading spinners
- Skeleton shimmer effects

**Use JavaScript (GSAP) for:**
- Complex sequences
- Timeline-based animations
- Dynamic animations based on user input
- Stagger effects
- Scroll-triggered animations

## Dependencies

### Required Libraries

```json
{
  "gsap": "^3.12.0",
  "@vueuse/core": "^10.0.0"
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
};
```

## Browser Compatibility

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile Safari: 14+
- Chrome Android: 90+

## Performance Targets

- Page transitions: < 300ms
- Interactive feedback: < 150ms
- Modal animations: < 400ms
- Maintain 60fps during all animations
- No layout thrashing or reflows during animations
