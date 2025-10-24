import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContentLoader from './ContentLoader.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorState from './ErrorState.vue'
import EmptyState from './EmptyState.vue'

describe('ContentLoader', () => {
  it('renders loading state', () => {
    const wrapper = mount(ContentLoader, {
      props: { loading: true }
    })
    
    expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true)
  })

  it('renders error state', () => {
    const error = 'Failed to load data'
    const wrapper = mount(ContentLoader, {
      props: { error }
    })
    
    expect(wrapper.findComponent(ErrorState).exists()).toBe(true)
  })

  it('renders empty state', () => {
    const wrapper = mount(ContentLoader, {
      props: { empty: true }
    })
    
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
  })

  it('renders content when not loading, error, or empty', () => {
    const content = '<div class="test-content">Content</div>'
    const wrapper = mount(ContentLoader, {
      props: {
        loading: false,
        error: null,
        empty: false
      },
      slots: {
        default: content
      }
    })
    
    expect(wrapper.find('.test-content').exists()).toBe(true)
  })

  it('emits retry event from error state', async () => {
    const wrapper = mount(ContentLoader, {
      props: { error: 'Error message' }
    })
    
    const errorState = wrapper.findComponent(ErrorState)
    await errorState.vm.$emit('retry')
    
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('emits emptyAction event from empty state', async () => {
    const wrapper = mount(ContentLoader, {
      props: { 
        empty: true,
        emptyActionLabel: 'Refresh'
      }
    })
    
    const emptyState = wrapper.findComponent(EmptyState)
    await emptyState.vm.$emit('action')
    
    expect(wrapper.emitted('emptyAction')).toBeTruthy()
  })

  it('supports custom loading slot', () => {
    const wrapper = mount(ContentLoader, {
      props: { loading: true },
      slots: {
        loading: '<div class="custom-loading">Custom Loading</div>'
      }
    })
    
    expect(wrapper.find('.custom-loading').exists()).toBe(true)
  })

  it('supports custom error slot', () => {
    const wrapper = mount(ContentLoader, {
      props: { error: 'Error' },
      slots: {
        error: '<div class="custom-error">Custom Error</div>'
      }
    })
    
    expect(wrapper.find('.custom-error').exists()).toBe(true)
  })

  it('supports custom empty slot', () => {
    const wrapper = mount(ContentLoader, {
      props: { empty: true },
      slots: {
        empty: '<div class="custom-empty">Custom Empty</div>'
      }
    })
    
    expect(wrapper.find('.custom-empty').exists()).toBe(true)
  })
})
