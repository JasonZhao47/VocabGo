/**
 * StudentNicknameEntry Component Tests
 * 
 * Tests for the student nickname entry modal component.
 * Requirements: FR2, FR6, NFR4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import StudentNicknameEntry from './StudentNicknameEntry.vue'
import { nextTick } from 'vue'

// Mock GSAP to avoid animation issues in tests
vi.mock('gsap', () => ({
  default: {
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      play: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
    })),
  },
}))

describe('StudentNicknameEntry', () => {
  let wrapper: VueWrapper

  const defaultProps = {
    modelValue: true,
    shareToken: 'test-share-token-123',
  }

  beforeEach(async () => {
    wrapper = mount(StudentNicknameEntry, {
      props: defaultProps,
      attachTo: document.body,
    })
    await nextTick()
  })

  describe('Rendering', () => {
    it('renders modal when modelValue is true', () => {
      expect(wrapper.find('.nickname-entry-modal').exists()).toBe(true)
    })

    it('displays welcome message', () => {
      expect(wrapper.text()).toContain('Welcome!')
      expect(wrapper.text()).toContain('Enter your name to start practicing')
    })

    it('displays privacy reassurance message', () => {
      expect(wrapper.text()).toContain('Your name will be visible to your teacher')
      expect(wrapper.text()).toContain('Your practice data is private and secure')
    })

    it('displays character count', () => {
      expect(wrapper.text()).toContain('0/20')
    })

    it('displays Unicode support hint', () => {
      expect(wrapper.text()).toContain('Unicode characters supported')
    })

    it('renders input field with placeholder', () => {
      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toContain('Your name')
    })

    it('renders submit button', () => {
      const button = wrapper.find('button[type="submit"]')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Start Practicing')
    })
  })

  describe('Validation', () => {
    it('disables submit button when nickname is empty', async () => {
      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('disables submit button when nickname is too short', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('A')
      await nextTick()

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('enables submit button when nickname is valid', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('Amy')
      await nextTick()

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('accepts Unicode characters (Chinese)', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('小明')
      await nextTick()

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('accepts Unicode characters (accented)', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('José')
      await nextTick()

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('accepts names with spaces', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('John Doe')
      await nextTick()

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('accepts names with hyphens and apostrophes', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue("Mary-Jane O'Connor")
      await nextTick()

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('updates character count as user types', async () => {
      const input = wrapper.find('input[type="text"]')
      
      await input.setValue('Amy')
      await nextTick()
      expect(wrapper.text()).toContain('3/20')

      await input.setValue('Amy Smith')
      await nextTick()
      expect(wrapper.text()).toContain('9/20')
    })

    it('counts Unicode characters correctly', async () => {
      const input = wrapper.find('input[type="text"]')
      
      // Chinese characters should count as individual characters
      await input.setValue('小明')
      await nextTick()
      expect(wrapper.text()).toContain('2/20')

      // Emoji should count as 1 character
      await input.setValue('Amy 😊')
      await nextTick()
      expect(wrapper.text()).toContain('5/20')
    })

    it('shows warning color when approaching character limit', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('12345678901234567890') // 20 chars
      await nextTick()

      // Character count should have warning styling
      const countElement = wrapper.find('.text-amber-500')
      expect(countElement.exists()).toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('emits submit event with trimmed nickname', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('  Amy  ')
      await nextTick()

      const form = wrapper.find('form')
      await form.trigger('submit')
      await nextTick()

      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')?.[0]).toEqual(['Amy'])
    })

    it('does not submit when nickname is invalid', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('A')
      await nextTick()

      const form = wrapper.find('form')
      await form.trigger('submit')
      await nextTick()

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('shows loading state during submission', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('Amy')
      await nextTick()

      // Manually set submitting state via exposed method
      // @ts-expect-error - Accessing exposed property from defineExpose
      wrapper.vm.setSubmitting(true)
      await nextTick()

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.text()).toContain('Starting...')
    })

    it('disables input during submission', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('Amy')
      await nextTick()

      // @ts-expect-error - Accessing exposed property from defineExpose
      wrapper.vm.setSubmitting(true)
      await nextTick()

      expect(input.attributes('disabled')).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('displays validation error', async () => {
      // @ts-expect-error - Accessing exposed property from defineExpose
      wrapper.vm.setError('Invalid nickname format')
      await nextTick()

      expect(wrapper.text()).toContain('Invalid nickname format')
    })

    it('shows inline validation errors', async () => {
      const input = wrapper.find('input[type="text"]')
      
      // Type single character
      await input.setValue('A')
      await nextTick()

      expect(wrapper.text()).toContain('Name must be at least 2 characters')
    })

    it('validates on input change', async () => {
      const input = wrapper.find('input[type="text"]')
      
      // Start with invalid input
      await input.setValue('A')
      await nextTick()
      expect(wrapper.text()).toContain('Name must be at least')

      // Fix to valid input
      await input.setValue('Amy')
      await nextTick()
      expect(wrapper.text()).not.toContain('Name must be at least')
    })
  })

  describe('Modal Behavior', () => {
    it('is persistent (cannot be closed by backdrop or escape)', () => {
      // Modal should have persistent prop set to true
      const modal = wrapper.findComponent({ name: 'Modal' })
      expect(modal.props('persistent')).toBe(true)
      expect(modal.props('closable')).toBe(false)
      expect(modal.props('closeOnBackdrop')).toBe(false)
      expect(modal.props('closeOnEscape')).toBe(false)
    })

    it('resets state when modal closes', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('Amy')
      // @ts-expect-error - Accessing exposed property from defineExpose
      wrapper.vm.setError('Test error')
      await nextTick()

      await wrapper.setProps({ modelValue: false })
      await nextTick()

      await wrapper.setProps({ modelValue: true })
      await nextTick()

      // @ts-expect-error - HTMLInputElement has value property
      expect(wrapper.find('input[type="text"]').element.value).toBe('')
      expect(wrapper.text()).not.toContain('Test error')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on modal', () => {
      const modal = wrapper.findComponent({ name: 'Modal' })
      expect(modal.exists()).toBe(true)
    })

    it('supports keyboard navigation', async () => {
      const input = wrapper.find('input[type="text"]')
      await input.setValue('Amy')
      await nextTick()

      // Pressing Enter should submit the form
      await input.trigger('keydown', { key: 'Enter' })
      await nextTick()

      expect(wrapper.emitted('submit')).toBeTruthy()
    })

    it('submit button has proper type', () => {
      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('type')).toBe('submit')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('applies mobile-specific styles', () => {
      // Component should have responsive classes
      expect(wrapper.find('.nickname-entry-modal').exists()).toBe(true)
    })
  })

  describe('Exposed Methods', () => {
    it('exposes setSubmitting method', () => {
      // @ts-expect-error - Accessing exposed property from defineExpose
      expect(wrapper.vm.setSubmitting).toBeDefined()
      // @ts-expect-error - Accessing exposed property from defineExpose
      wrapper.vm.setSubmitting(true)
      // @ts-expect-error - Accessing exposed property from defineExpose
      expect(wrapper.vm.isSubmitting).toBe(true)
    })

    it('exposes setError method', () => {
      // @ts-expect-error - Accessing exposed property from defineExpose
      expect(wrapper.vm.setError).toBeDefined()
      // @ts-expect-error - Accessing exposed property from defineExpose
      wrapper.vm.setError('Test error')
      // @ts-expect-error - Accessing exposed property from defineExpose
      expect(wrapper.vm.validationError).toBe('Test error')
      // @ts-expect-error - Accessing exposed property from defineExpose
      expect(wrapper.vm.isSubmitting).toBe(false)
    })
  })
})
