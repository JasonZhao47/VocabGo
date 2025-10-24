/**
 * Animation Performance Monitor
 * 
 * Monitors animation performance to ensure 60fps target is maintained.
 * Tracks frame rates, dropped frames, and provides optimization recommendations.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

export interface AnimationPerformanceMetrics {
  /** Average frames per second */
  averageFPS: number;
  /** Minimum FPS recorded */
  minFPS: number;
  /** Maximum FPS recorded */
  maxFPS: number;
  /** Number of dropped frames (below 60fps) */
  droppedFrames: number;
  /** Total frames measured */
  totalFrames: number;
  /** Duration of measurement in milliseconds */
  duration: number;
  /** Whether performance meets 60fps target */
  meetsTarget: boolean;
  /** Performance grade (A-F) */
  grade: string;
}

export interface AnimationPerformanceOptions {
  /** Target FPS (default: 60) */
  targetFPS?: number;
  /** Minimum acceptable FPS (default: 55) */
  minAcceptableFPS?: number;
  /** Duration to monitor in milliseconds (default: 5000) */
  duration?: number;
  /** Callback for real-time FPS updates */
  onUpdate?: (fps: number) => void;
}

/**
 * Monitor animation performance during a specific animation
 * 
 * @param callback - Function that triggers the animation to monitor
 * @param options - Performance monitoring options
 * @returns Performance metrics
 * 
 * @example
 * ```typescript
 * const metrics = await monitorAnimationPerformance(
 *   () => {
 *     // Trigger your animation here
 *     gsap.to(element, { x: 100, duration: 1 });
 *   },
 *   { duration: 1000 }
 * );
 * 
 * console.log(`Average FPS: ${metrics.averageFPS}`);
 * console.log(`Grade: ${metrics.grade}`);
 * ```
 */
export async function monitorAnimationPerformance(
  callback: () => void | Promise<void>,
  options: AnimationPerformanceOptions = {}
): Promise<AnimationPerformanceMetrics> {
  const {
    targetFPS = 60,
    minAcceptableFPS = 55,
    duration = 5000,
    onUpdate,
  } = options;

  const frameTimestamps: number[] = [];
  const fpsReadings: number[] = [];
  let animationFrameId: number;
  let startTime: number;
  let lastFrameTime: number;

  return new Promise((resolve) => {
    startTime = performance.now();
    lastFrameTime = startTime;

    const measureFrame = (currentTime: number) => {
      frameTimestamps.push(currentTime);

      // Calculate instantaneous FPS
      const deltaTime = currentTime - lastFrameTime;
      const instantFPS = deltaTime > 0 ? 1000 / deltaTime : 0;
      fpsReadings.push(instantFPS);

      if (onUpdate) {
        onUpdate(instantFPS);
      }

      lastFrameTime = currentTime;

      // Continue monitoring if within duration
      if (currentTime - startTime < duration) {
        animationFrameId = requestAnimationFrame(measureFrame);
      } else {
        // Calculate metrics
        const metrics = calculateMetrics(
          fpsReadings,
          currentTime - startTime,
          targetFPS,
          minAcceptableFPS
        );
        resolve(metrics);
      }
    };

    // Start monitoring
    animationFrameId = requestAnimationFrame(measureFrame);

    // Trigger the animation
    Promise.resolve(callback()).catch((error) => {
      console.error('Animation callback error:', error);
      cancelAnimationFrame(animationFrameId);
      resolve(calculateMetrics(fpsReadings, performance.now() - startTime, targetFPS, minAcceptableFPS));
    });
  });
}

/**
 * Calculate performance metrics from FPS readings
 */
function calculateMetrics(
  fpsReadings: number[],
  duration: number,
  targetFPS: number,
  minAcceptableFPS: number
): AnimationPerformanceMetrics {
  if (fpsReadings.length === 0) {
    return {
      averageFPS: 0,
      minFPS: 0,
      maxFPS: 0,
      droppedFrames: 0,
      totalFrames: 0,
      duration,
      meetsTarget: false,
      grade: 'F',
    };
  }

  const averageFPS = fpsReadings.reduce((sum, fps) => sum + fps, 0) / fpsReadings.length;
  const minFPS = Math.min(...fpsReadings);
  const maxFPS = Math.max(...fpsReadings);
  const droppedFrames = fpsReadings.filter((fps) => fps < targetFPS).length;
  const totalFrames = fpsReadings.length;
  const meetsTarget = averageFPS >= minAcceptableFPS;

  // Calculate grade
  let grade: string;
  if (averageFPS >= 58) {
    grade = 'A';
  } else if (averageFPS >= 55) {
    grade = 'B';
  } else if (averageFPS >= 50) {
    grade = 'C';
  } else if (averageFPS >= 45) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  return {
    averageFPS: Math.round(averageFPS * 100) / 100,
    minFPS: Math.round(minFPS * 100) / 100,
    maxFPS: Math.round(maxFPS * 100) / 100,
    droppedFrames,
    totalFrames,
    duration: Math.round(duration),
    meetsTarget,
    grade,
  };
}

/**
 * Check if GPU acceleration is working for an element
 * 
 * @param element - Element to check
 * @returns Whether GPU acceleration is active
 */
export function isGPUAccelerated(element: HTMLElement): boolean {
  const computedStyle = window.getComputedStyle(element);
  const transform = computedStyle.transform;
  const willChange = computedStyle.willChange;

  // Check for 3D transforms (indicates GPU layer)
  const has3DTransform = transform !== 'none' && transform.includes('matrix3d');

  // Check for will-change hints
  const hasWillChange = willChange !== 'auto' && (
    willChange.includes('transform') ||
    willChange.includes('opacity')
  );

  // Check for translateZ(0) hack
  const hasTranslateZ = transform.includes('translateZ');

  return has3DTransform || hasWillChange || hasTranslateZ;
}

/**
 * Get optimization recommendations based on element's animation properties
 * 
 * @param element - Element to analyze
 * @returns Array of optimization recommendations
 */
export function getOptimizationRecommendations(element: HTMLElement): string[] {
  const recommendations: string[] = [];
  const computedStyle = window.getComputedStyle(element);

  // Check transition properties
  const transitionProperty = computedStyle.transitionProperty;
  if (transitionProperty === 'all') {
    recommendations.push(
      'Use specific transition properties (transform, opacity) instead of "all" for better performance'
    );
  }

  // Check for expensive properties
  const expensiveProperties = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding'];
  const hasExpensiveTransitions = expensiveProperties.some((prop) =>
    transitionProperty.includes(prop)
  );

  if (hasExpensiveTransitions) {
    recommendations.push(
      'Avoid animating layout properties (width, height, position). Use transform instead'
    );
  }

  // Check for GPU acceleration
  if (!isGPUAccelerated(element)) {
    recommendations.push(
      'Add will-change: transform or will-change: opacity for GPU acceleration'
    );
  }

  // Check animation duration
  const transitionDuration = parseFloat(computedStyle.transitionDuration);
  if (transitionDuration > 0.5) {
    recommendations.push(
      'Consider shorter animation durations (150-400ms) for snappier interactions'
    );
  }

  // Check for box-shadow animations
  if (transitionProperty.includes('box-shadow')) {
    recommendations.push(
      'Avoid animating box-shadow. Use opacity on a pseudo-element with shadow instead'
    );
  }

  return recommendations;
}

/**
 * Real-time FPS monitor for development
 * Creates an on-screen FPS counter
 * 
 * @returns Cleanup function to remove the monitor
 */
export function createFPSMonitor(): () => void {
  const monitor = document.createElement('div');
  monitor.id = 'fps-monitor';
  monitor.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #0f0;
    padding: 10px;
    font-family: monospace;
    font-size: 14px;
    z-index: 999999;
    border-radius: 4px;
    min-width: 120px;
  `;

  document.body.appendChild(monitor);

  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;

  const updateFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= 1000) {
      fps = Math.round((frameCount * 1000) / deltaTime);
      frameCount = 0;
      lastTime = currentTime;

      // Update display with color coding
      const color = fps >= 55 ? '#0f0' : fps >= 45 ? '#ff0' : '#f00';
      monitor.style.color = color;
      monitor.innerHTML = `
        <div>FPS: ${fps}</div>
        <div style="font-size: 10px; color: #888; margin-top: 4px;">
          ${fps >= 55 ? '✓ Good' : fps >= 45 ? '⚠ Fair' : '✗ Poor'}
        </div>
      `;
    }

    requestAnimationFrame(updateFPS);
  };

  const animationId = requestAnimationFrame(updateFPS);

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationId);
    monitor.remove();
  };
}

/**
 * Batch test multiple animations and compare performance
 * 
 * @param tests - Array of test configurations
 * @returns Array of performance metrics for each test
 */
export async function batchTestAnimations(
  tests: Array<{
    name: string;
    callback: () => void | Promise<void>;
    options?: AnimationPerformanceOptions;
  }>
): Promise<Array<{ name: string; metrics: AnimationPerformanceMetrics }>> {
  const results: Array<{ name: string; metrics: AnimationPerformanceMetrics }> = [];

  for (const test of tests) {
    console.log(`Testing: ${test.name}...`);
    const metrics = await monitorAnimationPerformance(test.callback, test.options);
    results.push({ name: test.name, metrics });

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Generate a performance report
 * 
 * @param results - Array of test results
 * @returns Formatted report string
 */
export function generatePerformanceReport(
  results: Array<{ name: string; metrics: AnimationPerformanceMetrics }>
): string {
  let report = '\n=== Animation Performance Report ===\n\n';

  results.forEach(({ name, metrics }) => {
    report += `${name}:\n`;
    report += `  Average FPS: ${metrics.averageFPS} (${metrics.grade})\n`;
    report += `  Min FPS: ${metrics.minFPS}\n`;
    report += `  Max FPS: ${metrics.maxFPS}\n`;
    report += `  Dropped Frames: ${metrics.droppedFrames}/${metrics.totalFrames}\n`;
    report += `  Meets Target: ${metrics.meetsTarget ? '✓ Yes' : '✗ No'}\n`;
    report += `  Duration: ${metrics.duration}ms\n\n`;
  });

  return report;
}
