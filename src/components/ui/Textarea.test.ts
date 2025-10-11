import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Textarea from './Textarea.vue'

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
    to: vi.fn()
  }
}))

// Mock motion preference composable
vi.mock('@/composables/useMotionPreference', () => ({
  useMotionPreference: () => ({
    shouldAnimate: { value: true },
    getDuration: (duration: number) => duration,
    prefersReducedMotion: { value: false }
  })
}))

describe('Textarea Component Animations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default state', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: '',
        placeholder: 'Enter text'
      }
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('applies focus state classes when focused', async () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.trigger('focus')
    await nextTick()

    // Check that focus state is applied
    expect(textarea.classes()).toContain('border-black')
  })

  it('applies error state classes when error prop is provided', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: '',
        error: 'This field is required'
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('border-red-300')
    expect(wrapper.text()).toContain('This field is required')
  })

  it('applies success state classes when success prop is true', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: 'valid input',
        success: true
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('border-green-300')
  })

  it('shows success indicator when success prop is true', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: 'valid input',
        success: true
      }
    })

    // Check for success icon
    const successIcon = wrapper.find('svg.text-green-500')
    expect(successIcon.exists()).toBe(true)
  })

  it('applies disabled state classes when disabled', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('bg-gray-100')
    expect(textarea.classes()).toContain('cursor-not-allowed')
    expect(textarea.attributes('disabled')).toBeDefined()
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('test value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value'])
  })

  it('applies glow effect on focus', async () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.trigger('focus')
    await nextTick()

    // Check for shadow class (glow effect)
    expect(textarea.classes().some(c => c.includes('shadow'))).toBe(true)
  })

  it('shows character count when maxLength is provided', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: 'test',
        maxLength: 100
      }
    })

    expect(wrapper.text()).toContain('4/100')
  })

  it('applies resize-none class when autoResize is true', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: '',
        autoResize: true
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('resize-none')
  })

  it('applies resize-vertical class when autoResize is false', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: '',
        autoResize: false
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('resize-vertical')
  })

  it('shows label when provided', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: '',
        label: 'Description'
      }
    })

    expect(wrapper.text()).toContain('Description')
  })

  it('shows required indicator when required', () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: '',
        label: 'Description',
        required: true
      }
    })

    expect(wrapper.html()).toContain('*')
  })

  it('enforces maxLength constraint', async () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: '',
        maxLength: 10
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('this is a very long text that exceeds the limit')

    // Should emit only the first 10 characters
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const lastEmit = emitted?.[emitted.length - 1]?.[0] as string
    expect(lastEmit.length).toBeLessThanOrEqual(10)
  })
})
