import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import gsap from 'gsap';
import {
  staggerAnimation,
  staggerFadeInUp,
  staggerScaleIn,
  type StaggerOptions,
} from './staggerAnimation';
import { animationConfig } from '@/config/animations';

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    from: vi.fn((elements, config) => ({
      elements,
      config,
      kill: vi.fn(),
    })),
  },
}));

describe('staggerAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('stagger calculations', () => {
    it('should calculate correct stagger amount for default delay', () => {
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];

      staggerAnimation(elements, { opacity: 1 });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: expect.objectContaining({
            amount: (animationConfig.stagger.normal * elements.length) / 1000,
          }),
        })
      );
    });

    it('should calculate correct stagger amount for custom delay', () => {
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      const customDelay = 200;

      staggerAnimation(elements, { opacity: 1 }, { delay: customDelay });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: expect.objectContaining({
            amount: (customDelay * elements.length) / 1000,
          }),
        })
      );
    });

    it('should handle single element correctly', () => {
      const elements = [document.createElement('div')];

      staggerAnimation(elements, { opacity: 1 });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: expect.objectContaining({
            amount: animationConfig.stagger.normal / 1000,
          }),
        })
      );
    });

    it('should handle empty array gracefully', () => {
      const elements: Element[] = [];

      staggerAnimation(elements, { opacity: 1 });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: expect.objectContaining({
            amount: 0,
          }),
        })
      );
    });

    it('should scale stagger amount with number of elements', () => {
      const smallArray = [document.createElement('div'), document.createElement('div')];
      const largeArray = Array.from({ length: 10 }, () => document.createElement('div'));

      staggerAnimation(smallArray, { opacity: 1 });
      const smallCall = vi.mocked(gsap.from).mock.calls[0][1] as any;

      vi.clearAllMocks();

      staggerAnimation(largeArray, { opacity: 1 });
      const largeCall = vi.mocked(gsap.from).mock.calls[0][1] as any;

      expect(largeCall.stagger.amount).toBeGreaterThan(smallCall.stagger.amount);
    });
  });

  describe('timing function conversions', () => {
    it('should convert duration from milliseconds to seconds', () => {
      const elements = [document.createElement('div')];
      const durationMs = 500;

      staggerAnimation(elements, { opacity: 1 }, { duration: durationMs });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          duration: durationMs / 1000,
        })
      );
    });

    it('should use default duration when not specified', () => {
      const elements = [document.createElement('div')];

      staggerAnimation(elements, { opacity: 1 });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          duration: animationConfig.duration.normal / 1000,
        })
      );
    });

    it('should handle zero duration', () => {
      const elements = [document.createElement('div')];

      staggerAnimation(elements, { opacity: 1 }, { duration: 0 });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          duration: 0,
        })
      );
    });

    it('should convert delay from milliseconds to seconds in stagger amount', () => {
      const elements = [document.createElement('div'), document.createElement('div')];
      const delayMs = 150;

      staggerAnimation(elements, { opacity: 1 }, { delay: delayMs });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: expect.objectContaining({
            amount: (delayMs * elements.length) / 1000,
          }),
        })
      );
    });
  });

  describe('stagger options', () => {
    it('should use default "start" origin when not specified', () => {
      const elements = [document.createElement('div')];

      staggerAnimation(elements, { opacity: 1 });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: expect.objectContaining({
            from: 'start',
          }),
        })
      );
    });

    it('should support "center" origin', () => {
      const elements = [document.createElement('div')];

      staggerAnimation(elements, { opacity: 1 }, { from: 'center' });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: expect.objectContaining({
            from: 'center',
          }),
        })
      );
    });

    it('should support "end" origin', () => {
      const elements = [document.createElement('div')];

      staggerAnimation(elements, { opacity: 1 }, { from: 'end' });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          stagger: expect.objectContaining({
            from: 'end',
          }),
        })
      );
    });

    it('should use default easing when not specified', () => {
      const elements = [document.createElement('div')];

      staggerAnimation(elements, { opacity: 1 });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          ease: animationConfig.easing.easeOut,
        })
      );
    });

    it('should support custom easing function', () => {
      const elements = [document.createElement('div')];
      const customEase = 'power2.inOut';

      staggerAnimation(elements, { opacity: 1 }, { ease: customEase });

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          ease: customEase,
        })
      );
    });
  });

  describe('animation properties', () => {
    it('should pass through animation properties to GSAP', () => {
      const elements = [document.createElement('div')];
      const animation = {
        opacity: 0,
        x: 100,
        y: 50,
        scale: 0.5,
      };

      staggerAnimation(elements, animation);

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining(animation)
      );
    });

    it('should merge animation properties with timing options', () => {
      const elements = [document.createElement('div')];
      const animation = { opacity: 0, y: 20 };
      const options: StaggerOptions = {
        duration: 300,
        delay: 50,
        from: 'center',
        ease: 'power1.out',
      };

      staggerAnimation(elements, animation, options);

      expect(gsap.from).toHaveBeenCalledWith(
        elements,
        expect.objectContaining({
          ...animation,
          duration: options.duration! / 1000,
          ease: options.ease,
          stagger: expect.objectContaining({
            amount: (options.delay! * elements.length) / 1000,
            from: options.from,
          }),
        })
      );
    });
  });
});

describe('staggerFadeInUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create fade-in and slide-up animation', () => {
    const elements = [document.createElement('div')];

    staggerFadeInUp(elements);

    expect(gsap.from).toHaveBeenCalledWith(
      elements,
      expect.objectContaining({
        opacity: 0,
        y: animationConfig.slide.medium,
      })
    );
  });

  it('should use medium slide distance from config', () => {
    const elements = [document.createElement('div')];

    staggerFadeInUp(elements);

    expect(gsap.from).toHaveBeenCalledWith(
      elements,
      expect.objectContaining({
        y: animationConfig.slide.medium,
      })
    );
  });

  it('should accept custom options', () => {
    const elements = [document.createElement('div')];
    const options: StaggerOptions = {
      delay: 75,
      duration: 350,
      from: 'end',
    };

    staggerFadeInUp(elements, options);

    expect(gsap.from).toHaveBeenCalledWith(
      elements,
      expect.objectContaining({
        duration: options.duration! / 1000,
        stagger: expect.objectContaining({
          amount: (options.delay! * elements.length) / 1000,
          from: options.from,
        }),
      })
    );
  });

  it('should work with multiple elements', () => {
    const elements = Array.from({ length: 5 }, () => document.createElement('div'));

    staggerFadeInUp(elements);

    expect(gsap.from).toHaveBeenCalledWith(elements, expect.any(Object));
  });
});

describe('staggerScaleIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create fade-in and scale animation', () => {
    const elements = [document.createElement('div')];

    staggerScaleIn(elements);

    expect(gsap.from).toHaveBeenCalledWith(
      elements,
      expect.objectContaining({
        opacity: 0,
        scale: animationConfig.scale.enter,
      })
    );
  });

  it('should use enter scale value from config', () => {
    const elements = [document.createElement('div')];

    staggerScaleIn(elements);

    expect(gsap.from).toHaveBeenCalledWith(
      elements,
      expect.objectContaining({
        scale: animationConfig.scale.enter,
      })
    );
  });

  it('should accept custom options', () => {
    const elements = [document.createElement('div')];
    const options: StaggerOptions = {
      delay: 120,
      duration: 400,
      from: 'center',
      ease: 'back.out',
    };

    staggerScaleIn(elements, options);

    expect(gsap.from).toHaveBeenCalledWith(
      elements,
      expect.objectContaining({
        duration: options.duration! / 1000,
        ease: options.ease,
        stagger: expect.objectContaining({
          amount: (options.delay! * elements.length) / 1000,
          from: options.from,
        }),
      })
    );
  });

  it('should work with grid layouts', () => {
    const elements = Array.from({ length: 12 }, () => document.createElement('div'));

    staggerScaleIn(elements, { from: 'center' });

    expect(gsap.from).toHaveBeenCalledWith(
      elements,
      expect.objectContaining({
        stagger: expect.objectContaining({
          from: 'center',
        }),
      })
    );
  });
});

describe('configuration value validation', () => {
  it('should use valid duration values from config', () => {
    expect(animationConfig.duration.instant).toBe(0);
    expect(animationConfig.duration.fast).toBeGreaterThan(0);
    expect(animationConfig.duration.normal).toBeGreaterThan(0);
    expect(animationConfig.duration.slow).toBeGreaterThan(0);
    expect(animationConfig.duration.slower).toBeGreaterThan(0);
  });

  it('should use valid stagger values from config', () => {
    expect(animationConfig.stagger.fast).toBeGreaterThan(0);
    expect(animationConfig.stagger.normal).toBeGreaterThan(0);
    expect(animationConfig.stagger.slow).toBeGreaterThan(0);
  });

  it('should use valid scale values from config', () => {
    expect(animationConfig.scale.hover).toBeGreaterThan(1);
    expect(animationConfig.scale.active).toBeLessThan(1);
    expect(animationConfig.scale.enter).toBeLessThan(1);
    expect(animationConfig.scale.enter).toBeGreaterThan(0);
  });

  it('should use valid slide values from config', () => {
    expect(animationConfig.slide.small).toBeGreaterThan(0);
    expect(animationConfig.slide.medium).toBeGreaterThan(0);
    expect(animationConfig.slide.large).toBeGreaterThan(0);
  });

  it('should use valid easing functions from config', () => {
    expect(animationConfig.easing.easeOut).toMatch(/cubic-bezier/);
    expect(animationConfig.easing.easeIn).toMatch(/cubic-bezier/);
    expect(animationConfig.easing.easeInOut).toMatch(/cubic-bezier/);
  });
});
