import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from './ErrorState.vue'

describe('ErrorState', () => {
  it('renders with default props', () => {
    const wrapper = mount(ErrorState)
    expect(wrapper.find('.error-state').exists()).toBe(true)
    expect(wrapper.find('.error-state-title').text()).toBe('Something went wrong')
  })

  it('renders custom title and message', () => {
    const title = 'Upload Failed'
    const message = 'The file could not be processed'
    
    const wrapper = mount(ErrorState, {
      props: { title, message }
    })
    
    expect(wrapper.find('.error-state-title').text()).toBe(title)
    expect(wrapper.find('.error-state-message').text()).toBe(message)
  })

  it('shows retry button by default', () => {
    const wrapper = mount(ErrorState)
    expect(wrapper.find('.error-action-primary').exists()).toBe(true)
    expect(wrapper.find('.error-action-primary').text()).toBe('Try Again')
  })

  it('shows cancel button when enabled', () => {
    const wrapper = mount(ErrorState, {
      props: { showCancel: true }
    })
    
    expect(wrapper.find('.error-action-secondary').exists()).toBe(true)
    expect(wrapper.find('.error-action-secondary').text()).toBe('Cancel')
  })

  it('emits retry event when retry button clicked', async () => {
    const wrapper = mount(ErrorState)
    await wrapper.find('.error-action-primary').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mount(ErrorState, {
      props: { showCancel: true }
    })
    
    await wrapper.find('.error-action-secondary').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('supports custom button labels', () => {
    const retryLabel = 'Retry Upload'
    const cancelLabel = 'Go Back'
    
    const wrapper = mount(ErrorState, {
      props: { 
        showCancel: true,
        retryLabel,
        cancelLabel
      }
    })
    
    expect(wrapper.find('.error-action-primary').text()).toBe(retryLabel)
    expect(wrapper.find('.error-action-secondary').text()).toBe(cancelLabel)
  })

  it('has proper ARIA attributes', () => {
    const ariaLabel = 'Error occurred'
    const wrapper = mount(ErrorState, {
      props: { ariaLabel }
    })
    
    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.attributes('aria-label')).toBe(ariaLabel)
  })
})
