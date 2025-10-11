/**
 * Animation Configuration
 * Centralized animation settings for consistent timing, easing, and scale values
 * across the application. Inspired by ElevenLabs animation patterns.
 */

export interface AnimationConfig {
  // Duration presets (in milliseconds)
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    slower: number;
  };

  // Easing functions (CSS cubic-bezier values)
  easing: {
    easeInOut: string;
    easeOut: string;
    easeIn: string;
    spring: string;
    bounce: string;
  };

  // Stagger delays (in milliseconds)
  stagger: {
    fast: number;
    normal: number;
    slow: number;
  };

  // Scale values for transforms
  scale: {
    hover: number;
    active: number;
    enter: number;
  };

  // Slide distances (in pixels)
  slide: {
    small: number;
    medium: number;
    large: number;
  };
}

/**
 * Default animation configuration
 * These values are optimized for smooth, professional animations
 * that maintain 60fps performance
 */
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
