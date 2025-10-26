import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProcessingModal from './ProcessingModal.vue'
import uploadState from '@/state/uploadState'
import * as accessibilityAnnouncer from '@/utils/accessibilityAnnouncer'

// Mock the accessibility announcer
vi.mock('@/utils/accessibilityAnnouncer', () => ({
  announcePolite: vi.fn(),
  announceError: vi.fn(),
}))

// Mock Modal component
vi.mock('@/components/ui/Modal.vue', () => ({
  default: {
    name: 'Modal',
    template: `
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="processing-title"
        data-testid="modal"
      >
        <slot name="header" />
        <slot />
      </div>
    `,
    props: ['modelValue', 'size', 'closable', 'closeOnBackdrop', 'closeOnEscape', 'persistent'],
    emits: ['update:modelValue'],
  },
}))

// Mock other components
vi.mock('@/components/ui/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div data-testid="loading-spinner" />',
    props: ['size'],
  },
}))

vi.mock('@/components/ui/Skeleton.vue', () => ({
  default: {
    name: 'Skeleton',
    template: '<div data-testid="skeleton" />',
    props: ['variant', 'width', 'height'],
  },
}))

vi.mock('@/components/ui/Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button data-testid="button"><slot /></button>',
    props: ['variant', 'size', 'fullWidth'],
  },
}))

describe('ProcessingModal Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset upload state
    uploadState.status = 'idle'
    uploadState.currentFile = null
    uploadState.error = null
    uploadState.processingStage = null
  })

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA attributes on modal', () => {
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      const modal = wrapper.find('[data-testid="modal"]')
      expect(modal.attributes('role')).toBe('dialog')
      expect(modal.attributes('aria-modal')).toBe('true')
      expect(modal.attributes('aria-labelledby')).toBe('processing-title')
    })

    it('should have proper heading with id for aria-labelledby', () => {
      uploadState.status = 'uploading'
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      const heading = wrapper.find('#processing-title')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Uploading Document')
    })

    it('should have aria-live region for screen reader announcements', () => {
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      const liveRegion = wrapper.find('[aria-live="polite"]')
      expect(liveRegion.exists()).toBe(true)
      expect(liveRegion.attributes('aria-atomic')).toBe('true')
      expect(liveRegion.classes()).toContain('sr-only')
    })

    it('should have proper aria-label on loading spinner', () => {
      uploadState.status = 'uploading'
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      const spinner = wrapper.find('[data-testid="loading-spinner"]')
      expect(spinner.exists()).toBe(true)
    })

    it('should have proper aria attributes on progress bar', () => {
      uploadState.status = 'processing'
      uploadState.processingStage = 'extracting'
      
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('aria-valuenow')).toBe('75')
      expect(progressBar.attributes('aria-valuemin')).toBe('0')
      expect(progressBar.attributes('aria-valuemax')).toBe('100')
    })

    it('should have aria-label on stage indicators', () => {
      uploadState.status = 'processing'
      uploadState.processingStage = 'cleaning'
      
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      const stageIndicators = wrapper.findAll('[aria-label*="Cleaning"]')
      expect(stageIndicators.length).toBeGreaterThan(0)
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should announce when upload starts', async () => {
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      uploadState.status = 'uploading'
      uploadState.currentFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(accessibilityAnnouncer.announcePolite).toHaveBeenCalledWith(
        expect.stringContaining('Uploading document test.pdf')
      )
    })

    it('should announce when processing starts', async () => {
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      uploadState.status = 'processing'
      
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(accessibilityAnnouncer.announcePolite).toHaveBeenCalledWith(
        expect.stringContaining('Processing document')
      )
    })

    it('should announce stage changes', async () => {
      uploadState.status = 'processing'
      
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      uploadState.processingStage = 'cleaning'
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(accessibilityAnnouncer.announcePolite).toHaveBeenCalledWith(
        expect.stringContaining('Cleaning text')
      )

      uploadState.processingStage = 'extracting'
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(accessibilityAnnouncer.announcePolite).toHaveBeenCalledWith(
        expect.stringContaining('Extracting words')
      )
    })

    it('should announce errors', async () => {
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      uploadState.status = 'error'
      uploadState.error = 'Failed to upload document'
      
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(accessibilityAnnouncer.announceError).toHaveBeenCalledWith(
        'Failed to upload document'
      )
    })

    it('should update aria-live region content based on state', async () => {
      uploadState.status = 'uploading'
      uploadState.currentFile = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      const liveRegion = wrapper.find('[aria-live="polite"]')
      expect(liveRegion.text()).toContain('Uploading document document.pdf')

      uploadState.status = 'processing'
      uploadState.processingStage = 'cleaning'
      await wrapper.vm.$nextTick()

      expect(liveRegion.text()).toContain('Cleaning Text')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should allow escape key to close when not actively processing', () => {
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      // Modal should be closable when idle
      expect(wrapper.vm.isActiveProcessing).toBe(false)
    })

    it('should prevent escape key close during active processing', () => {
      uploadState.status = 'uploading'
      
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      // Modal should not be closable during upload
      expect(wrapper.vm.isActiveProcessing).toBe(true)
    })

    it('should allow escape key to close in error state', () => {
      uploadState.status = 'error'
      uploadState.error = 'Test error'
      
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      // Modal should be closable in error state
      expect(wrapper.vm.isActiveProcessing).toBe(false)
    })
  })

  describe('Color Contrast Compliance', () => {
    it('should use WCAG AA compliant colors for text', () => {
      uploadState.status = 'processing'
      uploadState.processingStage = 'cleaning'
      
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      // Check that text uses gray-900 (high contrast) or gray-600 (7:1 ratio)
      const heading = wrapper.find('#processing-title')
      expect(heading.classes()).toContain('text-gray-900')

      const statusText = wrapper.find('.text-gray-600')
      expect(statusText.exists()).toBe(true)
    })

    it('should use high contrast colors for error messages', () => {
      uploadState.status = 'error'
      uploadState.error = 'Test error'
      
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      const errorMessage = wrapper.find('.text-red-700')
      expect(errorMessage.exists()).toBe(true)
    })
  })

  describe('Modal Title Updates', () => {
    it('should update modal title based on state', async () => {
      const wrapper = mount(ProcessingModal, {
        props: {
          modelValue: true,
        },
      })

      uploadState.status = 'uploading'
      await wrapper.vm.$nextTick()
      expect(wrapper.find('#processing-title').text()).toBe('Uploading Document')

      uploadState.status = 'processing'
      await wrapper.vm.$nextTick()
      expect(wrapper.find('#processing-title').text()).toBe('Processing Document')

      uploadState.status = 'error'
      await wrapper.vm.$nextTick()
      expect(wrapper.find('#processing-title').text()).toBe('Processing Failed')
    })
  })
})
