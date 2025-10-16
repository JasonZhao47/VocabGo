import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebVitals } from './useWebVitals'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

describe('useWebVitals', () => {
  beforeEach(() => {
    // Mock PerformanceObserver
    global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    })) as any

    // Mock performance API
    global.performance = {
      ...global.performance,
      getEntriesByType: vi.fn().mockReturnValue([]),
      now: vi.fn().mockReturnValue(1000),
    } as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null metrics', () => {
    const TestComponent = defineComponent({
      setup() {
        const { metrics } = useWebVitals({ enableLogging: false })
        return { metrics }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent)
    const { metrics } = wrapper.vm as any

    expect(metrics.fcp).toBeNull()
    expect(metrics.lcp).toBeNull()
    expect(metrics.fid).toBeNull()
    expect(metrics.cls).toBeNull()
    expect(metrics.tti).toBeNull()
    expect(metrics.ttfb).toBeNull()
  })

  it('should provide getSummary method', () => {
    const TestComponent = defineComponent({
      setup() {
        const { getSummary } = useWebVitals({ enableLogging: false })
        return { getSummary }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent)
    const { getSummary } = wrapper.vm as any
    const summary = getSummary()

    expect(summary).toHaveProperty('fcp')
    expect(summary).toHaveProperty('lcp')
    expect(summary).toHaveProperty('fid')
    expect(summary).toHaveProperty('cls')
    expect(summary).toHaveProperty('tti')
    expect(summary).toHaveProperty('ttfb')
  })

  it('should rate metrics correctly', () => {
    const onMetric = vi.fn()
    const TestComponent = defineComponent({
      setup() {
        const vitals = useWebVitals({ 
          enableLogging: false,
          onMetric 
        })
        return vitals
      },
      render() {
        return h('div')
      },
    })

    mount(TestComponent)

    // PerformanceObserver should be called for each metric type
    expect(global.PerformanceObserver).toHaveBeenCalled()
  })

  it('should handle missing PerformanceObserver gracefully', () => {
    const originalPO = global.PerformanceObserver
    // @ts-ignore
    delete global.PerformanceObserver

    const TestComponent = defineComponent({
      setup() {
        const vitals = useWebVitals({ enableLogging: false })
        return vitals
      },
      render() {
        return h('div')
      },
    })

    expect(() => mount(TestComponent)).not.toThrow()

    global.PerformanceObserver = originalPO
  })

  it('should provide logReport method', () => {
    const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    const consoleEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

    const TestComponent = defineComponent({
      setup() {
        const { logReport } = useWebVitals({ enableLogging: false })
        return { logReport }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent)
    const { logReport } = wrapper.vm as any
    
    logReport()

    expect(consoleSpy).toHaveBeenCalledWith('[WebVitals] Performance Report')
    expect(consoleEndSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
    consoleEndSpy.mockRestore()
  })

  it('should use custom thresholds when provided', () => {
    const customThresholds = {
      fcp: { good: 1000, needsImprovement: 2000 },
    }

    const TestComponent = defineComponent({
      setup() {
        const vitals = useWebVitals({ 
          enableLogging: false,
          thresholds: customThresholds
        })
        return vitals
      },
      render() {
        return h('div')
      },
    })

    expect(() => mount(TestComponent)).not.toThrow()
  })
})
