/**
 * Font Loading Performance Utility
 * 
 * Measures and monitors font loading performance for Waldenburg fonts.
 * Requirement: 1.1 - Performance optimization
 */

export interface FontLoadingMetrics {
  fontName: string;
  loadTime: number;
  status: 'loaded' | 'failed' | 'timeout';
  timestamp: number;
}

/**
 * Measure font loading performance using Font Loading API
 */
export async function measureFontLoading(
  fontFamily: string,
  fontWeight: number = 400,
  timeout: number = 3000
): Promise<FontLoadingMetrics> {
  const startTime = performance.now();
  const fontName = `${fontFamily} ${fontWeight}`;

  try {
    // Check if Font Loading API is supported
    if (!('fonts' in document)) {
      return {
        fontName,
        loadTime: 0,
        status: 'loaded',
        timestamp: Date.now(),
      };
    }

    // Wait for font to load with timeout
    await Promise.race([
      document.fonts.load(`${fontWeight} 16px ${fontFamily}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Font load timeout')), timeout)
      ),
    ]);

    const loadTime = performance.now() - startTime;

    return {
      fontName,
      loadTime,
      status: 'loaded',
      timestamp: Date.now(),
    };
  } catch (error) {
    const loadTime = performance.now() - startTime;

    return {
      fontName,
      loadTime,
      status: loadTime >= timeout ? 'timeout' : 'failed',
      timestamp: Date.now(),
    };
  }
}

/**
 * Measure all Inter font variants
 */
export async function measureAllFonts(): Promise<FontLoadingMetrics[]> {
  const fonts = [
    { family: 'Inter', weight: 400 },
    { family: 'Inter', weight: 500 },
    { family: 'Inter', weight: 600 },
    { family: 'Inter', weight: 700 },
  ];

  const results = await Promise.all(
    fonts.map(({ family, weight }) => measureFontLoading(family, weight))
  );

  return results;
}

/**
 * Log font loading metrics to console (development only)
 */
export function logFontMetrics(metrics: FontLoadingMetrics[]): void {
  if (import.meta.env.DEV) {
    console.group('🔤 Font Loading Performance');
    metrics.forEach((metric) => {
      const emoji = metric.status === 'loaded' ? '✅' : '❌';
      console.log(
        `${emoji} ${metric.fontName}: ${metric.loadTime.toFixed(2)}ms (${metric.status})`
      );
    });
    console.groupEnd();
  }
}

/**
 * Check if fonts are properly cached
 */
export async function checkFontCaching(): Promise<{
  cached: boolean;
  cacheStatus: string;
}> {
  try {
    // Check if Cache API is supported
    if (!('caches' in window)) {
      return { cached: false, cacheStatus: 'Cache API not supported' };
    }

    const cacheNames = await caches.keys();
    const fontUrls = [
      'fonts.gstatic.com', // Google Fonts CDN
      'Inter',
    ];

    // Check if fonts are in any cache
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        if (fontUrls.some((url) => request.url.includes(url))) {
          return { cached: true, cacheStatus: `Cached in: ${cacheName}` };
        }
      }
    }

    return { cached: false, cacheStatus: 'Inter fonts loaded from Google Fonts CDN' };
  } catch (error) {
    return {
      cached: false,
      cacheStatus: `Cache check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Initialize font loading monitoring (call on app startup)
 */
export async function initFontMonitoring(): Promise<void> {
  if (import.meta.env.DEV) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Measure font loading
    const metrics = await measureAllFonts();
    logFontMetrics(metrics);

    // Check caching
    const cacheStatus = await checkFontCaching();
    console.log('💾 Font Cache Status:', cacheStatus);
  }
}
