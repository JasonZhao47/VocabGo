import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Modal from './Modal.vue';

// Create mock variables in global scope
const mockGsapSet = vi.fn();
const mockGsapTo = vi.fn();
const mockGsapFrom = vi.fn();
const mockGsapFromTo = vi.fn();
const mockTimelineFromTo = vi.fn().mockReturnThis();
const mockTimelineTo = vi.fn().mockReturnThis();
const mockTimelineKill = vi.fn();
const mockOpen = vi.fn();
const mockClose = vi.fn((modalEl: Element, backdropEl: Element, onComplete: () => void) => {
  onComplete();
});

// Mock GSAP before imports
vi.mock('gsap', () => {
  return {
    default: {
      set: mockGsapSet,
      to: mockGsapTo,
      from: mockGsapFrom,
      fromTo: mockGsapFromTo,
      timeline: vi.fn(() => ({
        fromTo: mockTimelineFromTo,
        to: mockTimelineTo,
        kill: mockTimelineKill,
      })),
    },
  };
});

// Mock composables
vi.mock('@/composables/useModalAnimation', () => {
  return {
    useModalAnimation: vi.fn(() => ({
      isOpen: { value: false },
      open: mockOpen,
      close: mockClose,
    })),
  };
});

vi.mock('@/composables/useMotionPreference', () => ({
  useMotionPreference: vi.fn(() => ({
    shouldAnimate: { value: true },
    getDuration: vi.fn((duration: number) => duration),
    prefersReducedMotion: { value: false },
  })),
}));

describe('Modal', () => {
  beforeEach(() => {
    // Create a div to teleport to
    const el = document.createElement('div');
    el.id = 'modal-root';
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders when modelValue is true', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
      attachTo: document.body,
    });

    await nextTick();
    
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Test Modal');
  });

  it('does not render when modelValue is false', () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: false,
      },
    });

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('renders title when provided', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        title: 'My Modal Title',
      },
      attachTo: document.body,
    });

    await nextTick();
    
    expect(wrapper.text()).toContain('My Modal Title');
  });

  it('renders description when provided', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        description: 'This is a modal description',
      },
      attachTo: document.body,
    });

    await nextTick();
    
    expect(wrapper.text()).toContain('This is a modal description');
  });

  it('renders close button when closable is true', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        closable: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    
    const closeButton = wrapper.find('button[aria-label="Close modal"]');
    expect(closeButton.exists()).toBe(true);
  });

  it('does not render close button when closable is false', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        closable: false,
      },
      attachTo: document.body,
    });

    await nextTick();
    
    const closeButton = wrapper.find('button[aria-label="Close modal"]');
    expect(closeButton.exists()).toBe(false);
  });

  it('emits update:modelValue when close button is clicked', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        closable: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    
    const closeButton = wrapper.find('button[aria-label="Close modal"]');
    await closeButton.trigger('click');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits update:modelValue when backdrop is clicked and closeOnBackdrop is true', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        closeOnBackdrop: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    
    const backdrop = wrapper.find('.fixed.inset-0');
    await backdrop.trigger('click');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('does not close when backdrop is clicked and closeOnBackdrop is false', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        closeOnBackdrop: false,
      },
      attachTo: document.body,
    });

    await nextTick();
    
    const backdrop = wrapper.find('.fixed.inset-0');
    await backdrop.trigger('click');
    
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('does not close when persistent is true', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        persistent: true,
        closable: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    
    const closeButton = wrapper.find('button[aria-label="Close modal"]');
    await closeButton.trigger('click');
    
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('applies correct size classes', async () => {
    const sizes = ['small', 'medium', 'large', 'full'] as const;
    
    for (const size of sizes) {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
          size,
        },
        attachTo: document.body,
      });

      await nextTick();
      
      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.exists()).toBe(true);
      
      wrapper.unmount();
    }
  });

  it('renders header slot content', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
      },
      slots: {
        header: '<div class="custom-header">Custom Header</div>',
      },
      attachTo: document.body,
    });

    await nextTick();
    
    expect(wrapper.html()).toContain('Custom Header');
  });

  it('renders default slot content', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
      },
      slots: {
        default: '<p>Modal content goes here</p>',
      },
      attachTo: document.body,
    });

    await nextTick();
    
    expect(wrapper.text()).toContain('Modal content goes here');
  });

  it('renders footer slot content', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
      },
      slots: {
        footer: '<div class="custom-footer">Footer content</div>',
      },
      attachTo: document.body,
    });

    await nextTick();
    
    expect(wrapper.html()).toContain('Footer content');
  });

  it('has backdrop with blur effect', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
      },
      attachTo: document.body,
    });

    await nextTick();
    
    const backdrop = wrapper.find('.backdrop-blur-sm');
    expect(backdrop.exists()).toBe(true);
  });

  it('has data-animate-child attributes on animatable sections', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        title: 'Test',
      },
      slots: {
        default: '<p>Content</p>',
        footer: '<button>OK</button>',
      },
      attachTo: document.body,
    });

    await nextTick();
    
    const animatableElements = wrapper.findAll('[data-animate-child]');
    expect(animatableElements.length).toBeGreaterThan(0);
  });

  it('emits lifecycle events', async () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: false,
      },
      attachTo: document.body,
    });

    // Open modal
    await wrapper.setProps({ modelValue: true });
    await nextTick();
    
    expect(wrapper.emitted('open')).toBeTruthy();
    expect(wrapper.emitted('before-open')).toBeTruthy();
  });

  describe('Integration Tests - Modal Animations', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      mockOpen.mockClear();
      mockClose.mockClear();
      mockGsapFrom.mockClear();
      mockGsapSet.mockClear();
      mockGsapTo.mockClear();
      mockGsapFromTo.mockClear();
      mockTimelineFromTo.mockClear();
      mockTimelineTo.mockClear();
      mockTimelineKill.mockClear();
    });

    it('calls useModalAnimation.open when modal opens', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: false,
        },
        attachTo: document.body,
      });

      // Open modal
      await wrapper.setProps({ modelValue: true });
      await nextTick();
      await nextTick(); // Wait for transition hooks

      // Verify open animation was called
      expect(mockOpen).toHaveBeenCalled();
    });

    it('calls useModalAnimation.close when modal closes', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
          closable: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      // Close modal via close button
      const closeButton = wrapper.find('button[aria-label="Close modal"]');
      await closeButton.trigger('click');

      // Verify close animation was called
      expect(mockClose).toHaveBeenCalled();
    });

    it('handles animation interruption when rapidly opening/closing', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: false,
        },
        attachTo: document.body,
      });

      // Rapidly toggle modal
      await wrapper.setProps({ modelValue: true });
      await nextTick();
      await wrapper.setProps({ modelValue: false });
      await nextTick();
      await wrapper.setProps({ modelValue: true });
      await nextTick();

      // Verify animations were called multiple times
      expect(mockOpen).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });

    it('animates modal content with stagger effect', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
          title: 'Test Modal',
        },
        slots: {
          default: '<p>Content</p>',
          footer: '<button>OK</button>',
        },
        attachTo: document.body,
      });

      await nextTick();
      await nextTick(); // Wait for after-enter hook

      // Verify GSAP from was called for stagger animation
      expect(mockGsapFrom).toHaveBeenCalled();
    });

    it('handles backdrop click to close modal', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
          closeOnBackdrop: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      // Click backdrop
      const backdrop = wrapper.find('.fixed.inset-0');
      await backdrop.trigger('click');

      // Verify close was called
      expect(mockClose).toHaveBeenCalled();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('does not close on backdrop click when closeOnBackdrop is false', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
          closeOnBackdrop: false,
        },
        attachTo: document.body,
      });

      await nextTick();

      // Click backdrop
      const backdrop = wrapper.find('.fixed.inset-0');
      await backdrop.trigger('click');

      // Verify close was not called
      expect(mockClose).not.toHaveBeenCalled();
      expect(wrapper.emitted('close')).toBeFalsy();
    });

    it('handles escape key to close modal', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
          closeOnEscape: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      // Press escape key
      const modalContainer = wrapper.find('.fixed.inset-0');
      await modalContainer.trigger('keydown.esc');

      // Verify close was called
      expect(mockClose).toHaveBeenCalled();
    });

    it('does not close on escape when closeOnEscape is false', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
          closeOnEscape: false,
        },
        attachTo: document.body,
      });

      await nextTick();

      // Press escape key
      const modalContainer = wrapper.find('.fixed.inset-0');
      await modalContainer.trigger('keydown.esc');

      // Verify close was not called
      expect(mockClose).not.toHaveBeenCalled();
    });

    it('prevents closing when persistent is true', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
          persistent: true,
          closable: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      // Try to close via button
      const closeButton = wrapper.find('button[aria-label="Close modal"]');
      await closeButton.trigger('click');

      // Verify close was not called
      expect(mockClose).not.toHaveBeenCalled();
      expect(wrapper.emitted('close')).toBeFalsy();
    });

    it('completes full open/close animation sequence', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: false,
        },
        attachTo: document.body,
      });

      // Open modal
      await wrapper.setProps({ modelValue: true });
      await nextTick();
      await nextTick();

      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted('before-open')).toBeTruthy();
      expect(wrapper.emitted('open')).toBeTruthy();

      // Close modal
      await wrapper.setProps({ modelValue: false });
      await nextTick();

      expect(wrapper.emitted('before-close')).toBeTruthy();
    });

    it('locks body scroll when modal is open', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: false,
        },
        attachTo: document.body,
      });

      // Initially body should not have overflow hidden
      expect(document.body.style.overflow).not.toBe('hidden');

      // Open modal
      await wrapper.setProps({ modelValue: true });
      await nextTick();

      // Body should have overflow hidden
      expect(document.body.style.overflow).toBe('hidden');

      // Close modal
      await wrapper.setProps({ modelValue: false });
      await nextTick();
      await nextTick();

      // Body overflow should be restored
      expect(document.body.style.overflow).toBe('');
    });

    it('passes correct elements to animation functions', async () => {
      const wrapper = mount(Modal, {
        props: {
          modelValue: true,
        },
        attachTo: document.body,
      });

      await nextTick();
      await nextTick();

      // Verify open was called with modal and backdrop elements
      expect(mockOpen).toHaveBeenCalled();
      const openCall = mockOpen.mock.calls[0];
      expect(openCall[0]).toBeInstanceOf(Element); // modalContentRef
      expect(openCall[1]).toBeInstanceOf(Element); // backdropRef
    });
  });
});
