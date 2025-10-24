import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button Micro-interactions', () => {
  it('applies hover scale transform when not disabled', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('hover:scale-[1.02]')
  })

  it('applies active state with reduced opacity and scale for primary variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('active:opacity-80')
    expect(button.classes()).toContain('active:scale-[0.98]')
  })

  it('uses 200ms transition duration', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('duration-200')
  })

  it('does not apply hover effects when disabled', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
        disabled: true,
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).not.toContain('hover:scale-[1.02]')
    expect(button.classes()).not.toContain('hover:opacity-90')
  })

  it('does not apply hover effects when loading', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
        loading: true,
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).not.toContain('hover:scale-[1.02]')
    expect(button.classes()).not.toContain('hover:opacity-90')
  })

  it('shows ripple effect when ripple prop is true and button is clicked', async () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
        ripple: true,
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    
    // Initially no ripple
    expect(wrapper.find('.animate-ripple').exists()).toBe(false)

    // Click the button
    await button.trigger('click')

    // Ripple should appear
    expect(wrapper.find('.animate-ripple').exists()).toBe(true)
    expect(wrapper.find('.animate-ripple').classes()).toContain('animate-ripple')
  })

  it('applies active state for secondary variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'secondary',
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('active:scale-[0.98]')
  })

  it('applies active state for ghost variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'ghost',
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('active:scale-[0.98]')
  })

  it('applies active state for destructive variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'destructive',
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('active:opacity-80')
    expect(button.classes()).toContain('active:scale-[0.98]')
  })

  it('uses ease-in-out timing function', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
      },
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('ease-in-out')
  })
})
