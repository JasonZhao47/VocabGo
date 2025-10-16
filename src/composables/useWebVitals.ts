/**
 * Web Vitals Monitoring Composable
 * 
 * Monitors Core Web Vitals metrics:
 * - First Contentful Paint (FCP)
 * - Time to Interactive (TTI)
 * - Cumulative Layout Shift (CLS)
 * - Largest Contentful Paint (LCP)
 * - First Input Delay (FID)
 * 
 * Requirements: 6.3
 */

import { ref, onMounted, onUnmounted } from 'vue'

export interface WebVitalsMetrics {
  fcp: number | null // First Contentful Paint (ms)
  lcp: number | null // Largest Contentful Paint (ms)
  fid: number | null // First Input Delay (ms)
  cls: number | null // Cumulative Layout Shift (score)
  tti: number | null // Time to Interactive (ms)
  ttfb: number | null // Time to First Byte (ms)
}

export interface WebVitalsThresholds {
  fcp: { good: number; needsImprovement: number } // Good: <1800ms, Needs improvement: <3000ms
  lcp: { good: number; needsImprovement: number } // Good: <2500ms, Needs improvement: <4000ms
  fid: { good: number; needsImprovement: number } // Good: <100ms, Needs improvement: <300ms
  cls: { good: number; needsImprovement: number } // Good: <0.1, Needs improvement: <0.25
  tti: { good: number; needsImprovement: number } // Good: <3800ms, Needs improvement: <7300ms
  ttfb: { good: number; needsImprovement: number } // Good: <800ms, Needs improvement: <1800ms
}

export interface WebVitalsRating {
  metric: keyof WebVitalsMetrics
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Standard Web Vitals thresholds based on Google's recommendations
const DEFAULT_THRESHOLDS: WebVitalsThresholds = {
  fcp: { good: 1800, needsImprovement: 3000 },
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  tti: { good: 3800, needsImprovement: 7300 },
  ttfb: { good: 800, needsImprovement: 1800 },
}

/**
 * Composable for monitoring Web Vitals
 */
export function useWebVitals(options: {
  enableLogging?: boolean
  thresholds?: Partial<WebVitalsThresholds>
  onMetric?: (metric: WebVitalsRating) => void
} = {}) {
  const enableLogging = options.enableLogging ?? import.meta.env.DEV
  const thresholds = { ...DEFAULT_THRESHOLDS, ...options.thresholds }

  const metrics = ref<WebVitalsMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    tti: null,
    ttfb: null,
  })

  const ratings = ref<WebVitalsRating[]>([])

  /**
   * Rate a metric based on thresholds
   */
  const rateMetric = (
    metric: keyof WebVitalsMetrics,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = thresholds[metric]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Record a metric and trigger callback
   */
  const recordMetric = (metric: keyof WebVitalsMetrics, value: number) => {
    metrics.value[metric] = value
    const rating = rateMetric(metric, value)

    const metricRating: WebVitalsRating = { metric, value, rating }
    ratings.value.push(metricRating)

    if (enableLogging) {
      console.log(`[WebVitals] ${metric.toUpperCase()}: ${value.toFixed(2)}ms (${rating})`)
    }

    if (options.onMetric) {
      options.onMetric(metricRating)
    }
  }

  /**
   * Measure First Contentful Paint (FCP)
   */
  const measureFCP = () => {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            recordMetric('fcp', entry.startTime)
            observer.disconnect()
          }
        }
      })

      observer.observe({ type: 'paint', buffered: true })
    } catch (error) {
      if (enableLogging) {
        console.warn('[WebVitals] Failed to measure FCP:', error)
      }
    }
  }

  /**
   * Measure Largest Contentful Paint (LCP)
   */
  const measureLCP = () => {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          recordMetric('lcp', lastEntry.startTime)
        }
      })

      observer.observe({ type: 'largest-contentful-paint', buffered: true })

      // Stop observing after page is fully loaded
      window.addEventListener('load', () => {
        setTimeout(() => observer.disconnect(), 0)
      })
    } catch (error) {
      if (enableLogging) {
        console.warn('[WebVitals] Failed to measure LCP:', error)
      }
    }
  }

  /**
   * Measure First Input Delay (FID)
   */
  const measureFID = () => {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.name === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming
            const fid = fidEntry.processingStart - fidEntry.startTime
            recordMetric('fid', fid)
            observer.disconnect()
          }
        }
      })

      observer.observe({ type: 'first-input', buffered: true })
    } catch (error) {
      if (enableLogging) {
        console.warn('[WebVitals] Failed to measure FID:', error)
      }
    }
  }

  /**
   * Measure Cumulative Layout Shift (CLS)
   */
  const measureCLS = () => {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        recordMetric('cls', clsValue)
      })

      observer.observe({ type: 'layout-shift', buffered: true })

      // Report final CLS when page is hidden
      const reportCLS = () => {
        recordMetric('cls', clsValue)
        observer.disconnect()
      }

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportCLS()
        }
      })
    } catch (error) {
      if (enableLogging) {
        console.warn('[WebVitals] Failed to measure CLS:', error)
      }
    }
  }

  /**
   * Estimate Time to Interactive (TTI)
   * Uses a simplified heuristic based on long tasks
   */
  const measureTTI = () => {
    if (!('PerformanceObserver' in window)) return

    try {
      let lastLongTaskEnd = 0

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          lastLongTaskEnd = Math.max(lastLongTaskEnd, entry.startTime + entry.duration)
        }
      })

      observer.observe({ type: 'longtask', buffered: true })

      // Estimate TTI after load event
      window.addEventListener('load', () => {
        setTimeout(() => {
          const tti = Math.max(lastLongTaskEnd, performance.now())
          recordMetric('tti', tti)
          observer.disconnect()
        }, 5000) // Wait 5s after load to ensure we capture all long tasks
      })
    } catch (error) {
      if (enableLogging) {
        console.warn('[WebVitals] Failed to measure TTI:', error)
      }
    }
  }

  /**
   * Measure Time to First Byte (TTFB)
   */
  const measureTTFB = () => {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        recordMetric('ttfb', ttfb)
      }
    } catch (error) {
      if (enableLogging) {
        console.warn('[WebVitals] Failed to measure TTFB:', error)
      }
    }
  }

  /**
   * Get summary of all metrics
   */
  const getSummary = () => {
    const summary: Record<string, { value: number | null; rating: string }> = {}

    Object.entries(metrics.value).forEach(([key, value]) => {
      if (value !== null) {
        const rating = rateMetric(key as keyof WebVitalsMetrics, value)
        summary[key] = { value, rating }
      } else {
        summary[key] = { value: null, rating: 'pending' }
      }
    })

    return summary
  }

  /**
   * Log performance report
   */
  const logReport = () => {
    const summary = getSummary()
    console.group('[WebVitals] Performance Report')
    Object.entries(summary).forEach(([metric, data]) => {
      const icon = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌'
      const value = data.value !== null ? `${data.value.toFixed(2)}ms` : 'pending'
      console.log(`${icon} ${metric.toUpperCase()}: ${value} (${data.rating})`)
    })
    console.groupEnd()
  }

  /**
   * Initialize monitoring
   */
  onMounted(() => {
    // Start measuring all metrics
    measureFCP()
    measureLCP()
    measureFID()
    measureCLS()
    measureTTI()
    measureTTFB()

    if (enableLogging) {
      // Log report after page is fully loaded
      window.addEventListener('load', () => {
        setTimeout(() => logReport(), 6000)
      })
    }
  })

  return {
    metrics,
    ratings,
    getSummary,
    logReport,
  }
}
