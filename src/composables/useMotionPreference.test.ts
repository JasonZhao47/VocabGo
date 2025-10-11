import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useMotionPreference } from './useMotionPreference';

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) => {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];
  
  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        listeners.push(listener);
      }
    }),
    removeEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }),
    dispatchEvent: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    triggerChange: (newMatches: boolean) => {
      listeners.forEach(listener => {
        listener({ matches: newMatches } as MediaQueryListEvent);
      });
    },
  };
};

describe('useMotionPreference', () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    matchMediaMock = createMatchMediaMock(false);
    window.matchMedia = vi.fn(() => matchMediaMock as unknown as MediaQueryList);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with prefers-reduced-motion disabled', async () => {
    const TestComponent = defineComponent({
      setup() {
        const motionPref = useMotionPreference();
        return { motionPref };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.motionPref.prefersReducedMotion.value).toBe(false);
    expect(wrapper.vm.motionPref.shouldAnimate.value).toBe(true);
  });

  it('should detect when prefers-reduced-motion is enabled', async () => {
    matchMediaMock = createMatchMediaMock(true);
    window.matchMedia = vi.fn(() => matchMediaMock as unknown as MediaQueryList);

    const TestComponent = defineComponent({
      setup() {
        const motionPref = useMotionPreference();
        return { motionPref };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.motionPref.prefersReducedMotion.value).toBe(true);
    expect(wrapper.vm.motionPref.shouldAnimate.value).toBe(false);
  });

  it('should return 0 duration when reduced motion is preferred', async () => {
    matchMediaMock = createMatchMediaMock(true);
    window.matchMedia = vi.fn(() => matchMediaMock as unknown as MediaQueryList);

    const TestComponent = defineComponent({
      setup() {
        const motionPref = useMotionPreference();
        return { motionPref };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.motionPref.getDuration(300)).toBe(0);
    expect(wrapper.vm.motionPref.getDuration(500)).toBe(0);
  });

  it('should return original duration when animations are enabled', async () => {
    const TestComponent = defineComponent({
      setup() {
        const motionPref = useMotionPreference();
        return { motionPref };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.motionPref.getDuration(300)).toBe(300);
    expect(wrapper.vm.motionPref.getDuration(500)).toBe(500);
  });

  it('should add event listener for preference changes', async () => {
    const TestComponent = defineComponent({
      setup() {
        const motionPref = useMotionPreference();
        return { motionPref };
      },
      template: '<div></div>',
    });

    mount(TestComponent);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should remove event listener on unmount', async () => {
    const TestComponent = defineComponent({
      setup() {
        const motionPref = useMotionPreference();
        return { motionPref };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();

    wrapper.unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should update preference when media query changes', async () => {
    const TestComponent = defineComponent({
      setup() {
        const motionPref = useMotionPreference();
        return { motionPref };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.motionPref.prefersReducedMotion.value).toBe(false);

    // Simulate media query change
    matchMediaMock.matches = true;
    matchMediaMock.triggerChange(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.motionPref.prefersReducedMotion.value).toBe(true);
    expect(wrapper.vm.motionPref.shouldAnimate.value).toBe(false);
  });
});
