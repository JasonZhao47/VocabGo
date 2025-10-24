import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from './Input.vue'
import { nextTick } from 'vue'

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

describe('Input Component Animations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default state', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
        placeholder: 'Enter text'
      }
    })

    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('applies focus state classes when focused', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: ''
      }
    })

    const input = wrapper.find('input')
    await input.trigger('focus')
    await nextTick()

    // Check that focus state is applied
    expect(input.classes()).toContain('border-black')
  })

  it('applies error state classes when error prop is provided', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
        error: 'This field is required'
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-red-500')
    expect(wrapper.text()).toContain('This field is required')
  })

  it('applies success state classes when success prop is true', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'valid input',
        success: true
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-green-500')
  })

  it('shows success indicator when success prop is true', () => {
    const wrapper = mount(Input, {
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
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    const input = wrapper.find('input')
    expect(input.classes()).toContain('opacity-50')
    expect(input.classes()).toContain('cursor-not-allowed')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: ''
      }
    })

    const input = wrapper.find('input')
    await input.setValue('test value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value'])
  })

  it('applies glow effect on focus', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: ''
      }
    })

    const input = wrapper.find('input')
    await input.trigger('focus')
    await nextTick()

    // Check for ring class (focus ring effect)
    expect(input.classes().some(c => c.includes('ring'))).toBe(true)
  })

  it('shows helper text when provided', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
        helperText: 'This is helper text'
      }
    })

    expect(wrapper.text()).toContain('This is helper text')
  })

  it('shows label when provided', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
        label: 'Email Address'
      }
    })

    expect(wrapper.text()).toContain('Email Address')
  })

  it('shows required indicator when required', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
        label: 'Email',
        required: true
      }
    })

    expect(wrapper.html()).toContain('*')
  })
})
