import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionButton from './ActionButton.vue'
import Tooltip from './Tooltip.vue'

describe('ActionButton', () => {
  it('renders with icon and label', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '🗑️',
        label: 'Delete',
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    const button = wrapper.find('button')
    expect(button.find('.action-button__icon').text()).toBe('🗑️')
    expect(button.attributes('aria-label')).toBe('Delete')
  })

  it('applies default variant by default', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '📥',
        label: 'Download',
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    expect(wrapper.find('.action-button--default').exists()).toBe(true)
  })

  it('applies danger variant when specified', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '🗑️',
        label: 'Delete',
        variant: 'danger',
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    expect(wrapper.find('.action-button--danger').exists()).toBe(true)
  })

  it('shows loading spinner when loading', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '📥',
        label: 'Download',
        loading: true,
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    expect(wrapper.find('.action-button__spinner').exists()).toBe(true)
    expect(wrapper.find('.action-button__icon').exists()).toBe(false)
  })

  it('applies disabled state', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '📥',
        label: 'Download',
        disabled: true,
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    const button = wrapper.find('button')
    expect(wrapper.find('.action-button--disabled').exists()).toBe(true)
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '📥',
        label: 'Download',
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.length).toBe(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '📥',
        label: 'Download',
        disabled: true,
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('does not emit click when loading', async () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '📥',
        label: 'Download',
        loading: true,
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('has correct CSS classes for sizing', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '📥',
        label: 'Download',
      },
      global: {
        stubs: {
          Tooltip: {
            template: '<div><slot /></div>',
          },
          Teleport: true,
        },
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('action-button')
  })

  it('integrates with Tooltip component', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: '📥',
        label: 'Download',
        tooltipPosition: 'bottom',
      },
      global: {
        components: {
          Tooltip,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    expect(wrapper.findComponent(Tooltip).exists()).toBe(true)
  })
})
