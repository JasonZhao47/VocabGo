import { describe, it, expect } from 'vitest';
import gsap from 'gsap';

describe('GSAP Setup', () => {
  it('should import GSAP successfully', () => {
    expect(gsap).toBeDefined();
    expect(typeof gsap.to).toBe('function');
    expect(typeof gsap.from).toBe('function');
    expect(typeof gsap.fromTo).toBe('function');
    expect(typeof gsap.set).toBe('function');
  });

  it('should have GSAP version 3.x', () => {
    expect(gsap.version).toMatch(/^3\./);
  });
});
