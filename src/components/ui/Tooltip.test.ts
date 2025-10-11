import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Tooltip from './Tooltip.vue'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders trigger content', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text'
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    expect(wrapper.text()).toContain('Hover me')
  })

  it('does not show tooltip initially', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text'
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    expect(wrapper.find('.tooltip').exists()).toBe(false)
  })

  it('shows tooltip on mouse enter after delay', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text',
        delay: 200
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
    
    // Tooltip should not be visible immediately
    expect(wrapper.find('.tooltip').exists()).toBe(false)
    
    // Advance timers past delay
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.tooltip').exists()).toBe(true)
    expect(wrapper.text()).toContain('Tooltip text')
  })

  it('hides tooltip on mouse leave', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text',
        delay: 0
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
    vi.advanceTimersByTime(0)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.tooltip').exists()).toBe(true)
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseleave')
    await wrapper.vm.$nextTick()
    
    // Tooltip should start hiding (check DOM instead of internal state)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(wrapper.find('.tooltip').exists()).toBe(false)
  })

  it('shows tooltip on focus', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text'
      },
      slots: {
        default: '<button>Focus me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('focus')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.tooltip').exists()).toBe(true)
  })

  it('hides tooltip on blur', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text'
      },
      slots: {
        default: '<button>Focus me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('focus')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.tooltip').exists()).toBe(true)
    
    await wrapper.find('.tooltip-wrapper').trigger('blur')
    await wrapper.vm.$nextTick()
    
    // Check DOM instead of internal state
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(wrapper.find('.tooltip').exists()).toBe(false)
  })

  it('does not show tooltip when disabled', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text',
        disabled: true,
        delay: 0
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
    vi.advanceTimersByTime(0)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.tooltip').exists()).toBe(false)
  })

  it('renders content slot', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        delay: 0
      },
      slots: {
        default: '<button>Hover me</button>',
        content: '<strong>Custom content</strong>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
    vi.advanceTimersByTime(0)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('strong').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom content')
  })

  it('shows arrow by default', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text',
        delay: 0
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
    vi.advanceTimersByTime(0)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.tooltip-arrow').exists()).toBe(true)
  })

  it('hides arrow when showArrow is false', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text',
        showArrow: false,
        delay: 0
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
    vi.advanceTimersByTime(0)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.tooltip-arrow').exists()).toBe(false)
  })

  it('applies correct position classes', async () => {
    const positions = ['top', 'bottom', 'left', 'right'] as const
    
    for (const position of positions) {
      const wrapper = mount(Tooltip, {
        props: {
          content: 'Tooltip text',
          position,
          delay: 0
        },
        slots: {
          default: '<button>Hover me</button>'
        }
      })
      
      await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
      vi.advanceTimersByTime(0)
      await wrapper.vm.$nextTick()
      
      const arrow = wrapper.find('.tooltip-arrow')
      expect(arrow.exists()).toBe(true)
      
      // Check that position-specific classes are applied
      const classes = arrow.classes()
      expect(classes.length).toBeGreaterThan(1)
    }
  })

  it('sets correct aria attributes', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text',
        delay: 0
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
    vi.advanceTimersByTime(0)
    await wrapper.vm.$nextTick()
    
    const tooltip = wrapper.find('.tooltip')
    expect(tooltip.attributes('role')).toBe('tooltip')
    expect(tooltip.attributes('aria-hidden')).toBe('false')
  })

  it('cancels show timeout on mouse leave before delay', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text',
        delay: 500
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })
    
    await wrapper.find('.tooltip-wrapper').trigger('mouseenter')
    
    // Leave before delay completes
    vi.advanceTimersByTime(200)
    await wrapper.find('.tooltip-wrapper').trigger('mouseleave')
    
    // Complete the original delay
    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()
    
    // Tooltip should not have appeared
    expect(wrapper.find('.tooltip').exists()).toBe(false)
  })
})
