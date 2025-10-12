/**
 * Swipe Gesture Composable
 * Provides touch-based swipe gesture detection for mobile devices
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export interface SwipeOptions {
  threshold?: number; // Minimum distance for swipe (px)
  timeout?: number; // Maximum time for swipe (ms)
  passive?: boolean; // Use passive event listeners
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface SwipeState {
  isSwiping: Ref<boolean>;
  direction: Ref<'left' | 'right' | 'up' | 'down' | null>;
  distance: Ref<number>;
}

export function useSwipeGesture(
  target: Ref<HTMLElement | null>,
  options: SwipeOptions = {}
): SwipeState {
  const {
    threshold = 50,
    timeout = 500,
    passive = true,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = options;

  const isSwiping = ref(false);
  const direction = ref<'left' | 'right' | 'up' | 'down' | null>(null);
  const distance = ref(0);

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isSwiping.value = true;
    direction.value = null;
    distance.value = 0;
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isSwiping.value) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // Determine primary direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction.value = deltaX > 0 ? 'right' : 'left';
      distance.value = Math.abs(deltaX);
    } else {
      direction.value = deltaY > 0 ? 'down' : 'up';
      distance.value = Math.abs(deltaY);
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (!isSwiping.value) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const deltaTime = Date.now() - startTime;

    // Check if swipe meets threshold requirements
    if (deltaTime <= timeout) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > threshold && absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else if (absY > threshold && absY > absX) {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    // Reset state
    isSwiping.value = false;
    direction.value = null;
    distance.value = 0;
  }

  function handleTouchCancel() {
    isSwiping.value = false;
    direction.value = null;
    distance.value = 0;
  }

  onMounted(() => {
    const element = target.value;
    if (!element) return;

    const eventOptions = passive ? { passive: true } : false;

    element.addEventListener('touchstart', handleTouchStart, eventOptions);
    element.addEventListener('touchmove', handleTouchMove, eventOptions);
    element.addEventListener('touchend', handleTouchEnd, eventOptions);
    element.addEventListener('touchcancel', handleTouchCancel, eventOptions);
  });

  onUnmounted(() => {
    const element = target.value;
    if (!element) return;

    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchcancel', handleTouchCancel);
  });

  return {
    isSwiping,
    direction,
    distance,
  };
}

/**
 * Detect if device supports touch
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - msMaxTouchPoints is IE specific
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get optimal touch target size
 */
export function getTouchTargetSize(): number {
  // WCAG recommends minimum 44x44px for touch targets
  return 44;
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get device viewport size
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Check if device is in portrait mode
 */
export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

/**
 * Check if device is in landscape mode
 */
export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight;
}
