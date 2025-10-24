import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from './EmptyState.vue'

describe('EmptyState', () => {
  it('renders with default props', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state-title').text()).toBe('No data available')
  })

  it('renders different variants', () => {
    const variants = ['no-data', 'search', 'empty', 'custom'] as const
    
    variants.forEach(variant => {
      const wrapper = mount(EmptyState, {
        props: { variant }
      })
      expect(wrapper.find(`.empty-state-${variant}`).exists()).toBe(true)
    })
  })

  it('renders custom title and description', () => {
    const title = 'No wordlists'
    const description = 'Upload a document to get started'
    
    const wrapper = mount(EmptyState, {
      props: { title, description }
    })
    
    expect(wrapper.find('.empty-state-title').text()).toBe(title)
    expect(wrapper.find('.empty-state-description').text()).toBe(description)
  })

  it('renders action button when provided', () => {
    const actionLabel = 'Upload Document'
    const wrapper = mount(EmptyState, {
      props: { actionLabel }
    })
    
    const button = wrapper.find('.empty-action-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe(actionLabel)
  })

  it('emits action event when button clicked', async () => {
    const wrapper = mount(EmptyState, {
      props: { actionLabel: 'Click me' }
    })
    
    await wrapper.find('.empty-action-button').trigger('click')
    expect(wrapper.emitted('action')).toBeTruthy()
  })

  it('supports custom icon slot', () => {
    const wrapper = mount(EmptyState, {
      slots: {
        icon: '<div class="custom-icon">Custom</div>'
      }
    })
    
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('has proper ARIA attributes', () => {
    const ariaLabel = 'Empty state message'
    const wrapper = mount(EmptyState, {
      props: { ariaLabel }
    })
    
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-label')).toBe(ariaLabel)
  })
})
