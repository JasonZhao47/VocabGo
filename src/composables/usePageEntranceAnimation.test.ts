import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { usePageEntranceAnimation } from './usePageEntranceAnimation'

// Mock useMotionPreference
vi.mock('./useMotionPreference', () => ({
  useMotionPreference: () => ({
    shouldAnimate: ref(true),
    getStagger: (delay: number) => delay,
  }),
}))

describe('usePageEntranceAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return stagger class names', () => {
    const TestComponent = defineComponent({
      setup() {
        const { getStaggerClass } = usePageEntranceAnimation()
        return { getStaggerClass }
      },
      template: '<div></div>',
    })

    const wrapper = mount(TestComponent)
    const { getStaggerClass } = wrapper.vm

    expect(getStaggerClass(0)).toBe('page-enter-stagger page-enter-stagger-1')
    expect(getStaggerClass(1)).toBe('page-enter-stagger page-enter-stagger-2')
    expect(getStaggerClass(5)).toBe('page-enter-stagger page-enter-stagger-6')
  })

  it('should cap stagger index at maxElements', () => {
    const TestComponent = defineComponent({
      setup() {
        const { getStaggerClass } = usePageEntranceAnimation({ maxElements: 3 })
        return { getStaggerClass }
      },
      template: '<div></div>',
    })

    const wrapper = mount(TestComponent)
    const { getStaggerClass } = wrapper.vm

    expect(getStaggerClass(5)).toBe('page-enter-stagger page-enter-stagger-3')
  })

  it('should respect motion preferences', () => {
    // This test verifies that the composable uses useMotionPreference
    // The actual behavior of respecting reduced motion is tested in useMotionPreference.test.ts
    const TestComponent = defineComponent({
      setup() {
        const result = usePageEntranceAnimation()
        return { result }
      },
      template: '<div></div>',
    })

    const wrapper = mount(TestComponent)
    
    // Verify the composable returns expected functions
    expect(wrapper.vm.result.getStaggerClass).toBeDefined()
    expect(wrapper.vm.result.getStaggerStyle).toBeDefined()
    expect(wrapper.vm.result.getDelay).toBeDefined()
  })

  it('should calculate correct delays', () => {
    const TestComponent = defineComponent({
      setup() {
        const { getDelay } = usePageEntranceAnimation({ staggerDelay: 100 })
        return { getDelay }
      },
      template: '<div></div>',
    })

    const wrapper = mount(TestComponent)
    const { getDelay } = wrapper.vm

    expect(getDelay(0)).toBe(0)
    expect(getDelay(1)).toBe(100)
    expect(getDelay(2)).toBe(200)
  })

  it('should generate stagger styles with animation delay', () => {
    const TestComponent = defineComponent({
      setup() {
        const { getStaggerStyle } = usePageEntranceAnimation({ staggerDelay: 50 })
        return { getStaggerStyle }
      },
      template: '<div></div>',
    })

    const wrapper = mount(TestComponent)
    const { getStaggerStyle } = wrapper.vm

    // Index 0 returns empty object (no delay)
    expect(getStaggerStyle(0)).toEqual({})
    expect(getStaggerStyle(1)).toEqual({ animationDelay: '50ms' })
    expect(getStaggerStyle(2)).toEqual({ animationDelay: '100ms' })
  })
})
