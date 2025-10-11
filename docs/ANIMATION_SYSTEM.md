# VocabGo Animation System Documentation

## Overview

VocabGo features a comprehensive, production-ready animation system inspired by ElevenLabs.io. The system provides smooth, performant animations with excellent accessibility support and automatic performance optimization.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [Animation Composables](#animation-composables)
4. [Performance Features](#performance-features)
5. [Accessibility](#accessibility)
6. [Common Patterns](#common-patterns)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)

## Quick Start

### Basic Page Transition

```vue
<script setup lang="ts">
import { usePageTransition } from '@/composables/usePageTransition';

const { enter, leave } = usePageTransition({
  duration: 300,
  stagger: true
});
</script>

<template>
  <Transition
    :css="false"
    @enter="enter"
    @leave="leave"
  >
    <div data-animate-child>
      <h1>Page Content</h1>
      <p data-animate-child>This will stagger in</p>
    </div>
  </Transition>
</template>
```

### Interactive Button Animation

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useInteractiveAnimation } from '@/composables/useInteractiveAnimation';

const buttonRef = ref<HTMLElement | null>(null);
useInteractiveAnimation(buttonRef);
</script>

<template>
  <button ref="buttonRef">
    Hover me!
  </button>
</template>
```

### Accessible Animation with Reduced Motion

```vue
<script setup lang="ts">
import { useAccessibleAnimation } from '@/composables/useAccessibleAnimation';

const { runAnimation } = useAccessibleAnimation();

const showSuccess = async () => {
  await runAnimation(
    async () => {
      // Animation code
      await gsap.to('.message', { opacity: 1 });
    },
    {
      animationType: 'feedback',
      announceOnComplete: 'Success message shown'
    }
  );
};
</script>
```

## Core Concepts

### Animation Types

The system categorizes animations into three types:

1. **Decorative**: Visual enhancements (disabled with reduced motion)
2. **Essential**: Core UI transitions (shortened with reduced motion)
3. **Feedback**: User interaction feedback (kept but shortened)

### Motion Preferences

The system automatically detects and respects `prefers-reduced-motion`:

```typescript
const { prefersReducedMotion, getDuration } = useMotionPreference();

// Automatically adjusts duration based on user preference
const duration = getDuration(300, 'feedback'); // 90ms with reduced motion
```

### GPU Acceleration

All animations use GPU-accelerated properties (transform, opacity) with automatic `will-change` management:

```typescript
import { applyWillChange, removeWillChange } from '@/utils/gpuAcceleration';

// Applied before animation
applyWillChange(element, ['transform', 'opacity']);

// Removed after animation
removeWillChange(element);
```

### Performance Monitoring

Real-time FPS tracking with automatic quality adjustment:

```typescript
import { getPerformanceMonitor } from '@/utils/performanceMonitor';

const monitor = getPerformanceMonitor({
  onLowPerformance: (metrics) => {
    console.warn('FPS dropped to', metrics.averageFps);
  }
});

monitor.start();
```

### Animation Queue

Prevents too many simultaneous animations:

```typescript
import { queueAnimation } from '@/utils/animationQueue';

// Queued with priority
queueAnimation(() => animate(), 'high');

// Deferred until after initial render
deferAnimation(() => decorativeAnimation());
```

## Animation Composables

### usePageTransition

Smooth page transitions with stagger support.

**Options:**
- `duration`: Transition duration (default: 300ms)
- `slideDistance`: Slide distance in pixels (default: 20px)
- `stagger`: Enable child stagger (default: true)
- `staggerDelay`: Delay between children (default: 100ms)

**Usage:**
```typescript
const { enter, leave, isEntering, isLeaving } = usePageTransition({
  duration: 300,
  stagger: true
});
```

### useInteractiveAnimation

Hover and active state animations for interactive elements.

**Options:**
- `hoverScale`: Scale on hover (default: 1.03)
- `activeScale`: Scale on click (default: 0.98)
- `duration`: Animation duration (default: 150ms)

**Usage:**
```typescript
const buttonRef = ref<HTMLElement | null>(null);
const { isHovered, isActive } = useInteractiveAnimation(buttonRef, {
  hoverScale: 1.05,
  duration: 200
});
```

### useMotionPreference

Detect and respect user motion preferences.

**Returns:**
- `prefersReducedMotion`: Boolean ref
- `shouldAnimate`: Computed boolean
- `getDuration(duration, type)`: Adjusted duration
- `shouldAnimateType(type)`: Check if type should animate
- `getScale(scale)`: Adjusted scale value
- `getStagger(stagger)`: Adjusted stagger delay

**Usage:**
```typescript
const {
  prefersReducedMotion,
  getDuration,
  shouldAnimateType
} = useMotionPreference();

if (shouldAnimateType('decorative')) {
  // Run decorative animation
}
```

### useAccessibleAnimation

Combines animations with accessibility announcements.

**Usage:**
```typescript
const { runAnimation, provideFeedback } = useAccessibleAnimation();

await runAnimation(
  async () => {
    await gsap.to('.element', { opacity: 1 });
  },
  {
    animationType: 'feedback',
    announceOnComplete: 'Action completed'
  }
);
```

### useAdaptiveAnimation

Automatically adjusts animation quality based on performance.

**Quality Levels:**
- `high`: Full animations (60+ FPS)
- `medium`: Reduced animations (45-60 FPS)
- `low`: Essential only (30-45 FPS)
- `minimal`: Instant transitions (<30 FPS)

**Usage:**
```typescript
const {
  quality,
  getDuration,
  shouldAnimate
} = useAdaptiveAnimation({
  autoAdjust: true,
  enableMonitoring: true
});
```

### useDeferredAnimation

Defer animations until after initial render.

**Usage:**
```typescript
const { run, hasRun } = useDeferredAnimation(
  async () => {
    await animateDecorativeElements();
  },
  {
    priority: 'low',
    delay: 500
  }
);
```

## Performance Features

### GPU Acceleration

All animations use GPU-accelerated properties:

```typescript
// Automatic with composables
usePageTransition(); // Handles GPU acceleration

// Manual control
import { withGPUAcceleration } from '@/utils/gpuAcceleration';

await withGPUAcceleration(
  element,
  ['transform', 'opacity'],
  async () => {
    await gsap.to(element, { x: 100, opacity: 0.5 });
  }
);
```

### Performance Monitoring

Track FPS and automatically reduce complexity:

```typescript
import { usePerformanceMonitor } from '@/utils/performanceMonitor';

const { start, stop, getMetrics } = usePerformanceMonitor({
  targetFps: 60,
  lowFpsThreshold: 30,
  onLowPerformance: (metrics) => {
    // Reduce animation complexity
  }
});
```

### Animation Queue

Limit concurrent animations:

```typescript
import { queueAnimation, runCriticalAnimation } from '@/utils/animationQueue';

// Normal priority (queued)
queueAnimation(() => animate(), 'normal');

// Critical (bypasses queue)
runCriticalAnimation(() => showFeedback());

// Deferred (after initial render)
deferAnimation(() => decorativeAnimation());
```

## Accessibility

### Reduced Motion Support

Automatically respects `prefers-reduced-motion`:

```typescript
const { getDuration, shouldAnimateType } = useMotionPreference();

// Decorative: Disabled with reduced motion
const decorativeDuration = getDuration(300, 'decorative'); // 0ms

// Essential: Shortened with reduced motion
const essentialDuration = getDuration(300, 'essential'); // 60ms

// Feedback: Kept but shortened
const feedbackDuration = getDuration(300, 'feedback'); // 90ms
```

### ARIA Announcements

Provide alternative feedback for screen readers:

```typescript
import {
  announce,
  announceSuccess,
  announceError,
  announceLoading
} from '@/utils/accessibilityAnnouncer';

// Basic announcement
announce('Content loaded', { priority: 'polite' });

// Specialized announcements
announceSuccess('Item added');
announceError('Failed to save');
announceLoading('Data');
```

### Accessible Loading States

```typescript
import { useAccessibleLoading } from '@/composables/useAccessibleAnimation';

const { announceLoading, announceLoaded } = useAccessibleLoading();

const loadData = async () => {
  announceLoading('Wordlists');
  const data = await fetchData();
  announceLoaded(`${data.length} items loaded`);
};
```

## Common Patterns

### Page Transition with Stagger

```vue
<script setup lang="ts">
import { usePageTransition } from '@/composables/usePageTransition';

const { enter, leave } = usePageTransition({
  duration: 300,
  stagger: true,
  staggerDelay: 100
});
</script>

<template>
  <Transition :css="false" @enter="enter" @leave="leave">
    <div>
      <h1 data-animate-child>Title</h1>
      <p data-animate-child>Paragraph 1</p>
      <p data-animate-child>Paragraph 2</p>
    </div>
  </Transition>
</template>
```

### Interactive Card

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useInteractiveAnimation } from '@/composables/useInteractiveAnimation';

const cardRef = ref<HTMLElement | null>(null);
useInteractiveAnimation(cardRef);
</script>

<template>
  <div ref="cardRef" class="card">
    Card content
  </div>
</template>
```

### Loading State with Skeleton

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAccessibleLoading } from '@/composables/useAccessibleAnimation';

const isLoading = ref(true);
const { announceLoading, announceLoaded } = useAccessibleLoading();

const loadData = async () => {
  announceLoading('Content');
  // Load data...
  isLoading.value = false;
  announceLoaded('Content loaded');
};
</script>

<template>
  <div v-if="isLoading" class="skeleton">
    <!-- Skeleton UI -->
  </div>
  <div v-else>
    <!-- Actual content -->
  </div>
</template>
```

### Modal with Accessibility

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { announceModalOpen, announceModalClose } from '@/utils/accessibilityAnnouncer';

const isOpen = ref(false);

const open = () => {
  isOpen.value = true;
  announceModalOpen('Settings');
};

const close = () => {
  isOpen.value = false;
  announceModalClose();
};
</script>
```

### Deferred Decorative Animation

```vue
<script setup lang="ts">
import { useAfterRender } from '@/composables/useDeferredAnimation';

// Runs after initial page render
useAfterRender(async () => {
  await gsap.to('.decoration', {
    opacity: 1,
    duration: 0.5,
    stagger: 0.1
  });
});
</script>
```

## API Reference

### Animation Configuration

```typescript
// src/config/animations.ts
export const animationConfig = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  stagger: {
    fast: 50,
    normal: 100,
    slow: 150
  },
  scale: {
    hover: 1.03,
    active: 0.98,
    enter: 0.95
  },
  slide: {
    small: 10,
    medium: 20,
    large: 40
  }
};
```

### CSS Utility Classes

```css
/* GPU Acceleration */
.gpu-accelerated
.will-change-transform
.will-change-opacity
.will-change-transform-opacity
.will-change-auto

/* Accessibility */
.sr-only
.sr-only-focusable

/* Animations */
.animate-fade-in
.animate-slide-up
.animate-scale-in
```

## Best Practices

### 1. Use Appropriate Animation Types

```typescript
// Good - Specifies type for reduced motion handling
getDuration(300, 'feedback');

// Avoid - Defaults to 'decorative' (disabled with reduced motion)
getDuration(300);
```

### 2. Always Provide Accessibility Feedback

```typescript
// Good - Announces for screen readers
await runAnimation(animateFn, {
  announceOnComplete: 'Content loaded'
});

// Avoid - No alternative feedback
await animateFn();
```

### 3. Defer Non-Essential Animations

```typescript
// Good - Defers until after render
useAfterRender(() => animateDecorations());

// Avoid - Blocks initial render
onMounted(() => animateDecorations());
```

### 4. Use GPU-Accelerated Properties

```typescript
// Good - GPU accelerated
gsap.to(el, { x: 100, opacity: 0.5 });

// Avoid - Triggers layout
gsap.to(el, { left: '100px', width: '200px' });
```

### 5. Limit Concurrent Animations

```typescript
// Good - Queued with priority
queueAnimation(() => animate(), 'normal');

// Avoid - All start simultaneously
animations.forEach(anim => anim());
```

### 6. Test with Reduced Motion

```typescript
// Always test animations with:
// - OS-level reduced motion enabled
// - Screen readers active
// - Keyboard-only navigation
```

## Troubleshooting

### Animations Not Running

1. Check if `prefers-reduced-motion` is enabled
2. Verify animation type is appropriate
3. Check if element ref is properly set
4. Ensure GSAP is imported

### Performance Issues

1. Enable performance monitoring
2. Check concurrent animation count
3. Verify GPU acceleration is working
4. Reduce animation complexity

### Accessibility Issues

1. Test with screen reader
2. Verify ARIA announcements
3. Check reduced motion behavior
4. Test keyboard navigation

## Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN: ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)

## Support

For issues or questions:
1. Check this documentation
2. Review completion documents in `.kiro/specs/elevenlabs-animation-system/`
3. Check component tests for usage examples
