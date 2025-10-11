import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Accordion from './Accordion.vue'

describe('Accordion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Accordion Title'
      }
    })
    
    expect(wrapper.find('.accordion-trigger').exists()).toBe(true)
    expect(wrapper.find('.accordion-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Accordion Title')
  })

  it('renders header slot content', () => {
    const wrapper = mount(Accordion, {
      slots: {
        header: '<div class="custom-header">Custom Header</div>'
      }
    })
    
    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom Header')
  })

  it('renders default slot content', () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title'
      },
      slots: {
        default: '<p>Accordion content</p>'
      }
    })
    
    expect(wrapper.text()).toContain('Accordion content')
  })

  it('starts closed by default', () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title'
      }
    })
    
    const trigger = wrapper.find('.accordion-trigger')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('starts open when modelValue is true', () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        modelValue: true
      }
    })
    
    const trigger = wrapper.find('.accordion-trigger')
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('emits update:modelValue when toggled', async () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        modelValue: false
      }
    })
    
    await wrapper.find('.accordion-trigger').trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('emits open event when opened', async () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        modelValue: false
      }
    })
    
    await wrapper.find('.accordion-trigger').trigger('click')
    
    expect(wrapper.emitted('open')).toBeTruthy()
  })

  it('emits close event when closed', async () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        modelValue: true
      }
    })
    
    await wrapper.find('.accordion-trigger').trigger('click')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not toggle when disabled', async () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        modelValue: false,
        disabled: true
      }
    })
    
    await wrapper.find('.accordion-trigger').trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('applies disabled styles when disabled', () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        disabled: true
      }
    })
    
    const trigger = wrapper.find('.accordion-trigger')
    expect(trigger.classes()).toContain('opacity-50')
    expect(trigger.classes()).toContain('cursor-not-allowed')
  })

  it('rotates icon when open', async () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        modelValue: false
      }
    })
    
    const icon = wrapper.find('.accordion-icon')
    expect(icon.classes()).not.toContain('rotate-180')
    
    await wrapper.find('.accordion-trigger').trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(icon.classes()).toContain('rotate-180')
  })

  it('applies correct variant classes', () => {
    const variants = ['default', 'bordered', 'filled'] as const
    
    variants.forEach(variant => {
      const wrapper = mount(Accordion, {
        props: {
          title: 'Title',
          variant
        }
      })
      
      const accordion = wrapper.find('.accordion')
      
      if (variant === 'bordered') {
        expect(accordion.classes()).toContain('border')
        expect(accordion.classes()).toContain('rounded-lg')
      } else if (variant === 'filled') {
        expect(accordion.classes()).toContain('bg-gray-50')
        expect(accordion.classes()).toContain('rounded-lg')
      }
    })
  })

  it('sets correct aria attributes', () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        modelValue: false
      }
    })
    
    const trigger = wrapper.find('.accordion-trigger')
    const content = wrapper.find('.accordion-content')
    
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-controls')).toBeTruthy()
    expect(content.attributes('aria-hidden')).toBe('true')
    expect(content.attributes('id')).toBe(trigger.attributes('aria-controls'))
  })

  it('updates aria-hidden when opened', async () => {
    const wrapper = mount(Accordion, {
      props: {
        title: 'Title',
        modelValue: false
      }
    })
    
    await wrapper.find('.accordion-trigger').trigger('click')
    await wrapper.vm.$nextTick()
    
    const content = wrapper.find('.accordion-content')
    expect(content.attributes('aria-hidden')).toBe('false')
  })
})
