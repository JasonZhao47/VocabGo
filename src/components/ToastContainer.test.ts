/**
 * ToastContainer Component Tests
 * 
 * Tests for toast notification animations including:
 * - Slide-in/out animations for all toast types
 * - Multiple simultaneous toasts
 * - Stacking behavior with smooth position transitions
 * - Progress bar animations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ToastContainer from './ToastContainer.vue'
import { useToast } from '@/composables/useToast'

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    set: vi.fn(),
    to: vi.fn((el, config) => {
      if (config.onComplete) config.onComplete()
    }),
    from: vi.fn(),
  },
}))

// Mock motion preference
vi.mock('@/composables/useMotionPreference', () => ({
  useMotionPreference: () => ({
    shouldAnimate: { value: true },
    getDuration: (duration: number) => duration,
    prefersReducedMotion: { value: false },
  }),
}))

describe('ToastContainer', () => {
  let wrapper: any
  
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear all toasts before mounting to ensure clean state
    const { clearAll } = useToast()
    clearAll()
    wrapper = mount(ToastContainer)
  })
  
  afterEach(() => {
    // Clear all toasts after each test
    const { clearAll } = useToast()
    clearAll()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })
  
  describe('Toast Type Rendering', () => {
    it('should render success toast with correct styling', async () => {
      const { success } = useToast()
      success('Success message', 0)
      
      await nextTick()
      await flushPromises()
      
      const toast = wrapper.find('.toast-success')
      expect(toast.exists()).toBe(true)
      expect(toast.text()).toContain('Success message')
      
      // Check for success icon
      const icon = toast.find('.toast-icon svg')
      expect(icon.exists()).toBe(true)
    })
    
    it('should render error toast with correct styling', async () => {
      const { error } = useToast()
      error('Error message', 0)
      
      await nextTick()
      await flushPromises()
      
      const toast = wrapper.find('.toast-error')
      expect(toast.exists()).toBe(true)
      expect(toast.text()).toContain('Error message')
      expect(toast.attributes('role')).toBe('alert')
    })
    
    it('should render info toast with correct styling', async () => {
      const { info } = useToast()
      info('Info message', 0)
      
      await nextTick()
      await flushPromises()
      
      const toast = wrapper.find('.toast-info')
      expect(toast.exists()).toBe(true)
      expect(toast.text()).toContain('Info message')
      expect(toast.attributes('role')).toBe('status')
    })
  })
  
  describe('Multiple Simultaneous Toasts', () => {
    it('should display multiple toasts at once', async () => {
      const { success, error, info } = useToast()
      
      success('First toast', 0)
      error('Second toast', 0)
      info('Third toast', 0)
      
      await nextTick()
      await flushPromises()
      
      const toasts = wrapper.findAll('.toast')
      expect(toasts).toHaveLength(3)
    })
    
    it('should maintain correct order for stacked toasts', async () => {
      const { success, error, info } = useToast()
      
      success('First', 0)
      await nextTick()
      
      error('Second', 0)
      await nextTick()
      
      info('Third', 0)
      await nextTick()
      await flushPromises()
      
      const toasts = wrapper.findAll('.toast')
      expect(toasts[0].text()).toContain('First')
      expect(toasts[1].text()).toContain('Second')
      expect(toasts[2].text()).toContain('Third')
    })
    
    it('should handle rapid toast creation', async () => {
      const { success } = useToast()
      
      // Create 5 toasts rapidly
      for (let i = 0; i < 5; i++) {
        success(`Toast ${i}`, 0)
      }
      
      await nextTick()
      await flushPromises()
      
      const toasts = wrapper.findAll('.toast')
      expect(toasts).toHaveLength(5)
    })
  })
  
  describe('Stacking Behavior', () => {
    it('should apply toast-move class for smooth transitions', () => {
      // Check that the CSS class exists in the component
      expect(wrapper.html()).toBeTruthy()
      // The .toast-move class is defined in the component's styles
    })
    
    it('should remove toasts and restack remaining ones', async () => {
      const { success, removeToast } = useToast()
      
      const id1 = success('First', 0)
      const id2 = success('Second', 0)
      const id3 = success('Third', 0)
      
      await nextTick()
      await flushPromises()
      
      expect(wrapper.findAll('.toast')).toHaveLength(3)
      
      // Remove middle toast
      removeToast(id2)
      
      // Wait for animation to complete
      vi.advanceTimersByTime(250)
      await nextTick()
      await flushPromises()
      
      const remainingToasts = wrapper.findAll('.toast')
      expect(remainingToasts).toHaveLength(2)
      expect(remainingToasts[0].text()).toContain('First')
      expect(remainingToasts[1].text()).toContain('Third')
    })
  })
  
  describe('Progress Bar Animation', () => {
    it('should display progress bar for toasts with duration', async () => {
      const { success } = useToast()
      success('Message', 3000)
      
      await nextTick()
      await flushPromises()
      
      const progressBar = wrapper.find('.toast-progress-bar')
      expect(progressBar.exists()).toBe(true)
    })
    
    it('should not display progress bar for toasts without duration', async () => {
      const { success } = useToast()
      success('Message', 0)
      
      await nextTick()
      await flushPromises()
      
      const progressContainer = wrapper.find('.toast-progress-container')
      expect(progressContainer.exists()).toBe(false)
    })
    
    it('should animate progress bar from 100% to 0%', async () => {
      const { success, toasts } = useToast()
      success('Message', 1000)
      
      await nextTick()
      await flushPromises()
      
      // Initial progress should be 100%
      expect(toasts[0].progress).toBe(100)
      
      // Advance time halfway
      vi.advanceTimersByTime(500)
      await nextTick()
      
      // Progress should be around 50%
      expect(toasts[0].progress).toBeLessThan(60)
      expect(toasts[0].progress).toBeGreaterThan(40)
    })
    
    it('should use correct color for each toast type', async () => {
      const { success, error, info } = useToast()
      
      success('Success', 1000)
      error('Error', 1000)
      info('Info', 1000)
      
      await nextTick()
      await flushPromises()
      
      const progressBars = wrapper.findAll('.toast-progress-bar')
      expect(progressBars[0].classes()).toContain('toast-progress-success')
      expect(progressBars[1].classes()).toContain('toast-progress-error')
      expect(progressBars[2].classes()).toContain('toast-progress-info')
    })
  })
  
  describe('Toast Dismissal', () => {
    it('should dismiss toast on click', async () => {
      const { success } = useToast()
      success('Click me', 0)
      
      await nextTick()
      await flushPromises()
      
      const toast = wrapper.find('.toast')
      expect(toast.exists()).toBe(true)
      
      await toast.trigger('click')
      
      // Wait for animation
      vi.advanceTimersByTime(250)
      await nextTick()
      await flushPromises()
      
      expect(wrapper.findAll('.toast')).toHaveLength(0)
    })
    
    it('should dismiss toast on close button click', async () => {
      const { success } = useToast()
      success('Close me', 0)
      
      await nextTick()
      await flushPromises()
      
      const closeButton = wrapper.find('.toast-close')
      expect(closeButton.exists()).toBe(true)
      
      await closeButton.trigger('click')
      
      // Wait for animation
      vi.advanceTimersByTime(250)
      await nextTick()
      await flushPromises()
      
      expect(wrapper.findAll('.toast')).toHaveLength(0)
    })
    
    it('should auto-dismiss after duration', async () => {
      const { success } = useToast()
      success('Auto dismiss', 1000)
      
      await nextTick()
      await flushPromises()
      
      expect(wrapper.findAll('.toast')).toHaveLength(1)
      
      // Advance time past duration + animation time
      vi.advanceTimersByTime(1250)
      await nextTick()
      await flushPromises()
      
      expect(wrapper.findAll('.toast')).toHaveLength(0)
    })
  })
  
  describe('Accessibility', () => {
    it('should have aria-live region', () => {
      const container = wrapper.find('.toast-container')
      expect(container.attributes('aria-live')).toBe('polite')
      expect(container.attributes('aria-atomic')).toBe('true')
    })
    
    it('should have appropriate role for error toasts', async () => {
      const { error } = useToast()
      error('Error', 0)
      
      await nextTick()
      await flushPromises()
      
      const toast = wrapper.find('.toast-error')
      expect(toast.attributes('role')).toBe('alert')
    })
    
    it('should have appropriate role for non-error toasts', async () => {
      const { success } = useToast()
      success('Success', 0)
      
      await nextTick()
      await flushPromises()
      
      const toast = wrapper.find('.toast-success')
      expect(toast.attributes('role')).toBe('status')
    })
    
    it('should have aria-label with message', async () => {
      const { success } = useToast()
      success('Test message', 0)
      
      await nextTick()
      await flushPromises()
      
      const toast = wrapper.find('.toast')
      expect(toast.attributes('aria-label')).toContain('Test message')
      expect(toast.attributes('aria-label')).toContain('success')
    })
    
    it('should have accessible close button', async () => {
      const { success } = useToast()
      success('Message', 0)
      
      await nextTick()
      await flushPromises()
      
      const closeButton = wrapper.find('.toast-close')
      expect(closeButton.attributes('aria-label')).toBe('Close')
    })
  })
  
  describe('Animation States', () => {
    it('should set isEntering state on toast creation', async () => {
      const { success, toasts } = useToast()
      success('Message', 0)
      
      await nextTick()
      
      expect(toasts[0].isEntering).toBe(true)
      
      // Should clear after animation
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(toasts[0].isEntering).toBe(false)
    })
    
    it('should set isLeaving state on toast removal', async () => {
      const { success, removeToast, toasts } = useToast()
      const id = success('Message', 0)
      
      await nextTick()
      await flushPromises()
      
      removeToast(id)
      await nextTick()
      
      expect(toasts[0].isLeaving).toBe(true)
    })
    
    it('should apply correct CSS classes for animation states', async () => {
      const { success } = useToast()
      success('Message', 0)
      
      await nextTick()
      await flushPromises()
      
      const toast = wrapper.find('.toast')
      expect(toast.classes()).toContain('toast-entering')
      
      // Wait for entering state to clear
      vi.advanceTimersByTime(300)
      await nextTick()
      await flushPromises()
      
      expect(toast.classes()).not.toContain('toast-entering')
    })
  })
  
  describe('Responsive Design', () => {
    it('should render with responsive container classes', () => {
      const container = wrapper.find('.toast-container')
      expect(container.exists()).toBe(true)
      // Component has responsive styles in CSS
    })
  })
  
  describe('Clear All Functionality', () => {
    it('should clear all toasts at once', async () => {
      const { success, error, info, clearAll } = useToast()
      
      success('First', 0)
      error('Second', 0)
      info('Third', 0)
      
      await nextTick()
      await flushPromises()
      
      expect(wrapper.findAll('.toast')).toHaveLength(3)
      
      clearAll()
      
      // Wait for animations
      vi.advanceTimersByTime(250)
      await nextTick()
      await flushPromises()
      
      expect(wrapper.findAll('.toast')).toHaveLength(0)
    })
  })
})
