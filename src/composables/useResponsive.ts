/**
 * Responsive Utilities Composable
 * Provides reactive breakpoint detection and device information
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive(customBreakpoints?: Partial<Breakpoints>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0);
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 0);

  // Breakpoint checks
  const isXs = computed(() => windowWidth.value >= breakpoints.xs && windowWidth.value < breakpoints.sm);
  const isSm = computed(() => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md);
  const isMd = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg);
  const isLg = computed(() => windowWidth.value >= breakpoints.lg && windowWidth.value < breakpoints.xl);
  const isXl = computed(() => windowWidth.value >= breakpoints.xl && windowWidth.value < breakpoints['2xl']);
  const is2Xl = computed(() => windowWidth.value >= breakpoints['2xl']);

  // Convenience checks
  const isMobile = computed(() => windowWidth.value < breakpoints.md);
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg);
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg);

  // Orientation
  const isPortrait = computed(() => windowHeight.value > windowWidth.value);
  const isLandscape = computed(() => windowWidth.value > windowHeight.value);

  // Current breakpoint name
  const currentBreakpoint = computed(() => {
    if (is2Xl.value) return '2xl';
    if (isXl.value) return 'xl';
    if (isLg.value) return 'lg';
    if (isMd.value) return 'md';
    if (isSm.value) return 'sm';
    return 'xs';
  });

  // Device capabilities
  const isTouchDevice = computed(() => {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
  });

  const prefersReducedMotion = computed(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const prefersDarkMode = computed(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update dimensions
  function updateDimensions() {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  }

  // Debounced resize handler
  let resizeTimeout: number | null = null;
  function handleResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(() => {
      updateDimensions();
    }, 150);
  }

  onMounted(() => {
    updateDimensions();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  });

  return {
    // Dimensions
    windowWidth: computed(() => windowWidth.value),
    windowHeight: computed(() => windowHeight.value),

    // Breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,

    // Convenience
    isMobile,
    isTablet,
    isDesktop,

    // Orientation
    isPortrait,
    isLandscape,

    // Current breakpoint
    currentBreakpoint,

    // Device capabilities
    isTouchDevice,
    prefersReducedMotion,
    prefersDarkMode,
  };
}

/**
 * Get optimal font size for mobile
 */
export function getMobileFontSize(baseFontSize: number): number {
  const viewport = window.innerWidth;
  
  // Prevent zoom on iOS by using minimum 16px for inputs
  if (viewport < 640) {
    return Math.max(baseFontSize, 16);
  }
  
  return baseFontSize;
}

/**
 * Get optimal spacing for mobile
 */
export function getMobileSpacing(baseSpacing: number): number {
  const viewport = window.innerWidth;
  
  if (viewport < 640) {
    return baseSpacing * 0.75; // Reduce spacing on mobile
  }
  
  return baseSpacing;
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
  };
}
