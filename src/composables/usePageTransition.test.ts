/**
 * Tests for usePageTransition composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePageTransition } from './usePageTransition';

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    set: vi.fn(),
    to: vi.fn((target, config) => {
      // Immediately call onComplete if it exists
      if (config.onComplete) {
        config.onComplete();
      }
    }),
    from: vi.fn(),
  },
}));

// Mock useMotionPreference
vi.mock('./useMotionPreference', () => ({
  useMotionPreference: () => ({
    shouldAnimate: { value: true },
    getDuration: (duration: number) => duration,
    prefersReducedMotion: { value: false },
  }),
}));

describe('usePageTransition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { isEntering, isLeaving } = usePageTransition();

    expect(isEntering.value).toBe(false);
    expect(isLeaving.value).toBe(false);
  });

  it('should provide enter and leave functions', () => {
    const { enter, leave } = usePageTransition();

    expect(typeof enter).toBe('function');
    expect(typeof leave).toBe('function');
  });

  it('should accept custom options', () => {
    const options = {
      duration: 500,
      slideDistance: 30,
      stagger: false,
      staggerDelay: 150,
    };

    const transition = usePageTransition(options);

    expect(transition).toBeDefined();
    expect(typeof transition.enter).toBe('function');
    expect(typeof transition.leave).toBe('function');
  });

  it('should call done callback on enter', () => {
    const { enter } = usePageTransition();
    const mockElement = document.createElement('div');
    const done = vi.fn();

    enter(mockElement, done);

    expect(done).toHaveBeenCalled();
  });

  it('should call done callback on leave', () => {
    const { leave } = usePageTransition();
    const mockElement = document.createElement('div');
    const done = vi.fn();

    leave(mockElement, done);

    expect(done).toHaveBeenCalled();
  });

  it('should handle elements with data-animate-child attribute', () => {
    const { enter } = usePageTransition({ stagger: true });
    const mockElement = document.createElement('div');
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    
    child1.setAttribute('data-animate-child', '');
    child2.setAttribute('data-animate-child', '');
    
    mockElement.appendChild(child1);
    mockElement.appendChild(child2);
    
    const done = vi.fn();

    enter(mockElement, done);

    expect(done).toHaveBeenCalled();
  });
});
