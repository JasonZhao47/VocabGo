import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from './LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.spinner-ring').exists()).toBe(true)
  })

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    
    sizes.forEach(size => {
      const wrapper = mount(LoadingSpinner, {
        props: { size }
      })
      expect(wrapper.find(`.spinner-${size}`).exists()).toBe(true)
    })
  })

  it('renders with label', () => {
    const label = 'Loading data...'
    const wrapper = mount(LoadingSpinner, {
      props: { label }
    })
    expect(wrapper.find('.spinner-label').text()).toBe(label)
  })

  it('has proper ARIA attributes', () => {
    const ariaLabel = 'Loading content'
    const wrapper = mount(LoadingSpinner, {
      props: { ariaLabel }
    })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-label')).toBe(ariaLabel)
  })

  it('includes screen reader text', () => {
    const wrapper = mount(LoadingSpinner)
    const srText = wrapper.find('.sr-only')
    expect(srText.exists()).toBe(true)
    expect(srText.text()).toBe('Loading...')
  })
})
