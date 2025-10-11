import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Toggle from './Toggle.vue'

describe('Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false
      }
    })
    
    expect(wrapper.find('button[role="switch"]').exists()).toBe(true)
    expect(wrapper.find('.toggle-track').exists()).toBe(true)
    expect(wrapper.find('.toggle-thumb').exists()).toBe(true)
  })

  it('displays label when provided', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
        label: 'Enable notifications'
      }
    })
    
    expect(wrapper.text()).toContain('Enable notifications')
  })

  it('emits update:modelValue when clicked', async () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('toggles from true to false', async () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: true
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
        disabled: true
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('applies correct aria attributes', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: true,
        ariaLabel: 'Toggle setting'
      }
    })
    
    const button = wrapper.find('button')
    expect(button.attributes('aria-checked')).toBe('true')
    expect(button.attributes('aria-label')).toBe('Toggle setting')
  })

  it('applies disabled styles when disabled', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
        disabled: true
      }
    })
    
    expect(wrapper.find('button').classes()).toContain('opacity-50')
    expect(wrapper.find('button').classes()).toContain('cursor-not-allowed')
  })

  it('applies correct size classes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    
    sizes.forEach(size => {
      const wrapper = mount(Toggle, {
        props: {
          modelValue: false,
          size
        }
      })
      
      const track = wrapper.find('.toggle-track')
      expect(track.classes().some(c => c.startsWith('w-'))).toBe(true)
      expect(track.classes().some(c => c.startsWith('h-'))).toBe(true)
    })
  })

  it('applies correct background color based on state', () => {
    const wrapperOff = mount(Toggle, {
      props: {
        modelValue: false
      }
    })
    
    const wrapperOn = mount(Toggle, {
      props: {
        modelValue: true
      }
    })
    
    expect(wrapperOff.find('.toggle-track').classes()).toContain('bg-gray-200')
    expect(wrapperOn.find('.toggle-track').classes()).toContain('bg-black')
  })

  it('applies translate class to thumb when on', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: true
      }
    })
    
    expect(wrapper.find('.toggle-thumb').classes()).toContain('translate-x-full')
  })

  it('does not apply translate class to thumb when off', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false
      }
    })
    
    expect(wrapper.find('.toggle-thumb').classes()).not.toContain('translate-x-full')
  })
})
