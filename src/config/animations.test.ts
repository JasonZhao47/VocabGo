import { describe, it, expect } from 'vitest';
import { animationConfig } from './animations';

describe('Animation Configuration', () => {
  it('should have valid duration values', () => {
    expect(animationConfig.duration.instant).toBe(0);
    expect(animationConfig.duration.fast).toBeGreaterThan(0);
    expect(animationConfig.duration.normal).toBeGreaterThan(animationConfig.duration.fast);
    expect(animationConfig.duration.slow).toBeGreaterThan(animationConfig.duration.normal);
    expect(animationConfig.duration.slower).toBeGreaterThan(animationConfig.duration.slow);
  });

  it('should have valid easing functions', () => {
    expect(animationConfig.easing.easeInOut).toMatch(/cubic-bezier/);
    expect(animationConfig.easing.easeOut).toMatch(/cubic-bezier/);
    expect(animationConfig.easing.easeIn).toMatch(/cubic-bezier/);
    expect(animationConfig.easing.spring).toMatch(/cubic-bezier/);
    expect(animationConfig.easing.bounce).toMatch(/cubic-bezier/);
  });

  it('should have valid stagger delays', () => {
    expect(animationConfig.stagger.fast).toBeGreaterThan(0);
    expect(animationConfig.stagger.normal).toBeGreaterThan(animationConfig.stagger.fast);
    expect(animationConfig.stagger.slow).toBeGreaterThan(animationConfig.stagger.normal);
  });

  it('should have valid scale values', () => {
    expect(animationConfig.scale.hover).toBeGreaterThan(1);
    expect(animationConfig.scale.hover).toBeLessThan(2);
    expect(animationConfig.scale.active).toBeLessThan(1);
    expect(animationConfig.scale.active).toBeGreaterThan(0.5);
    expect(animationConfig.scale.enter).toBeLessThan(1);
    expect(animationConfig.scale.enter).toBeGreaterThan(0.5);
  });

  it('should have valid slide distances', () => {
    expect(animationConfig.slide.small).toBeGreaterThan(0);
    expect(animationConfig.slide.medium).toBeGreaterThan(animationConfig.slide.small);
    expect(animationConfig.slide.large).toBeGreaterThan(animationConfig.slide.medium);
  });
});
