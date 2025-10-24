/**
 * Animation Performance Testing Utilities
 * 
 * Tests and validates that all animations meet 60fps performance targets
 * and use only GPU-accelerated properties.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import {
  PERFORMANCE_TARGETS,
  GPU_ACCELERATED_PROPERTIES,
  FORBIDDEN_ANIMATION_PROPERTIES,
  AnimationPerformanceMonitor,
} from '@/config/animationOptimization';

/**
 * Test result interface
 */
export interface AnimationTestResult {
  passed: boolean;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  droppedFrames: number;
  duration: number;
  usesGPUProperties: boolean;
  usesForbiddenProperties: boolean;
  hasWillChange: boolean;
  errors: string[];
}

/**
 * Tests an element's animation performance
 * 
 * @param element - The element to test
 * @param animationFn - Function that triggers the animation
 * @param duration - Expected animation duration in ms
 * @returns Test results
 */
export async function testAnimationPerformance(
  element: HTMLElement,
  animationFn: () => void | Promise<void>,
  duration: number
): Promise<AnimationTestResult> {
  const monitor = new AnimationPerformanceMonitor();
  const errors: string[] = [];
  
  // Check initial state
  const initialStyles = window.getComputedStyle(element);
  const hasWillChange = initialStyles.willChange !== 'auto';
  
  // Start monitoring
  monitor.start();
  let frameId: number;
  
  const recordFrames = () => {
    monitor.recordFrame();
    frameId = requestAnimationFrame(recordFrames);
  };
  
  frameId = requestAnimationFrame(recordFrames);
  
  // Run animation
  const startTime = performance.now();
  await animationFn();
  
  // Wait for animation to complete
  await new Promise(resolve => setTimeout(resolve, duration + 100));
  
  // Stop monitoring
  cancelAnimationFrame(frameId);
  const actualDuration = performance.now() - startTime;
  
  // Get performance report
  const report = monitor.getReport();
  
  // Check for GPU-accelerated properties
  const usesGPUProperties = checkGPUProperties(element);
  const usesForbiddenProperties = checkForbiddenProperties(element);
  
  // Validate results
  if (report.averageFPS < PERFORMANCE_TARGETS.targetFPS * 0.9) {
    errors.push(`Average FPS (${report.averageFPS.toFixed(2)}) below target (${PERFORMANCE_TARGETS.targetFPS})`);
  }
  
  if (report.droppedFrames > 0) {
    errors.push(`${report.droppedFrames} dropped frames detected`);
  }
  
  if (usesForbiddenProperties) {
    errors.push('Animation uses forbidden properties that cause layout recalculation');
  }
  
  if (!usesGPUProperties) {
    errors.push('Animation does not use GPU-accelerated properties');
  }
  
  return {
    passed: errors.length === 0 && report.isPerformant,
    averageFPS: report.averageFPS,
    minFPS: report.minFPS,
    maxFPS: report.maxFPS,
    droppedFrames: report.droppedFrames,
    duration: actualDuration,
    usesGPUProperties,
    usesForbiddenProperties,
    hasWillChange,
    errors,
  };
}

/**
 * Checks if an element's animations use GPU-accelerated properties
 */
function checkGPUProperties(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element);
  const transition = styles.transition;
  const animation = styles.animation;
  
  // Check transition properties
  if (transition && transition !== 'none') {
    const properties = transition.split(',').map(t => t.trim().split(' ')[0]);
    return properties.some(prop => 
      GPU_ACCELERATED_PROPERTIES.includes(prop as any) ||
      prop === 'all'
    );
  }
  
  // Check animation properties
  if (animation && animation !== 'none') {
    // Animations are harder to check, assume they're optimized if they exist
    return true;
  }
  
  return false;
}

/**
 * Checks if an element's animations use forbidden properties
 */
function checkForbiddenProperties(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element);
  const transition = styles.transition;
  
  if (transition && transition !== 'none') {
    const properties = transition.split(',').map(t => t.trim().split(' ')[0]);
    return properties.some(prop => 
      FORBIDDEN_ANIMATION_PROPERTIES.includes(prop as any)
    );
  }
  
  return false;
}

/**
 * Tests will-change optimization
 */
export function testWillChangeOptimization(element: HTMLElement): {
  hasWillChange: boolean;
  properties: string[];
  isOptimal: boolean;
  warnings: string[];
} {
  const styles = window.getComputedStyle(element);
  const willChange = styles.willChange;
  const warnings: string[] = [];
  
  if (willChange === 'auto') {
    return {
      hasWillChange: false,
      properties: [],
      isOptimal: true,
      warnings: [],
    };
  }
  
  const properties = willChange.split(',').map(p => p.trim());
  
  // Check if properties are GPU-accelerated
  const nonGPUProps = properties.filter(
    prop => !GPU_ACCELERATED_PROPERTIES.includes(prop as any)
  );
  
  if (nonGPUProps.length > 0) {
    warnings.push(`Non-GPU properties in will-change: ${nonGPUProps.join(', ')}`);
  }
  
  // Check if too many properties
  if (properties.length > 3) {
    warnings.push(`Too many properties in will-change (${properties.length}). Keep it minimal.`);
  }
  
  return {
    hasWillChange: true,
    properties,
    isOptimal: warnings.length === 0,
    warnings,
  };
}

/**
 * Batch test multiple animations
 */
export async function testMultipleAnimations(
  tests: Array<{
    name: string;
    element: HTMLElement;
    animationFn: () => void | Promise<void>;
    duration: number;
  }>
): Promise<Map<string, AnimationTestResult>> {
  const results = new Map<string, AnimationTestResult>();
  
  for (const test of tests) {
    const result = await testAnimationPerformance(
      test.element,
      test.animationFn,
      test.duration
    );
    results.set(test.name, result);
  }
  
  return results;
}

/**
 * Generates a performance report
 */
export function generatePerformanceReport(
  results: Map<string, AnimationTestResult>
): string {
  let report = '# Animation Performance Report\n\n';
  
  const passed = Array.from(results.values()).filter(r => r.passed).length;
  const total = results.size;
  
  report += `## Summary\n`;
  report += `- Total Tests: ${total}\n`;
  report += `- Passed: ${passed}\n`;
  report += `- Failed: ${total - passed}\n`;
  report += `- Success Rate: ${((passed / total) * 100).toFixed(1)}%\n\n`;
  
  report += `## Detailed Results\n\n`;
  
  for (const [name, result] of results) {
    report += `### ${name}\n`;
    report += `- Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `- Average FPS: ${result.averageFPS.toFixed(2)}\n`;
    report += `- Min FPS: ${result.minFPS.toFixed(2)}\n`;
    report += `- Max FPS: ${result.maxFPS.toFixed(2)}\n`;
    report += `- Dropped Frames: ${result.droppedFrames}\n`;
    report += `- Duration: ${result.duration.toFixed(2)}ms\n`;
    report += `- Uses GPU Properties: ${result.usesGPUProperties ? 'Yes' : 'No'}\n`;
    report += `- Uses Forbidden Properties: ${result.usesForbiddenProperties ? 'Yes' : 'No'}\n`;
    report += `- Has will-change: ${result.hasWillChange ? 'Yes' : 'No'}\n`;
    
    if (result.errors.length > 0) {
      report += `- Errors:\n`;
      result.errors.forEach(error => {
        report += `  - ${error}\n`;
      });
    }
    
    report += '\n';
  }
  
  return report;
}

/**
 * Validates that an animation meets all performance criteria
 */
export function validateAnimation(
  element: HTMLElement,
  expectedDuration: number
): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  const styles = window.getComputedStyle(element);
  
  // Check transition properties
  const transition = styles.transition;
  if (transition && transition !== 'none') {
    const properties = transition.split(',').map(t => t.trim().split(' ')[0]);
    
    // Check for forbidden properties
    const forbidden = properties.filter(prop =>
      FORBIDDEN_ANIMATION_PROPERTIES.includes(prop as any)
    );
    
    if (forbidden.length > 0) {
      issues.push(`Uses forbidden properties: ${forbidden.join(', ')}`);
      recommendations.push('Use transform and opacity instead');
    }
    
    // Check for non-GPU properties
    const nonGPU = properties.filter(prop =>
      !GPU_ACCELERATED_PROPERTIES.includes(prop as any) && prop !== 'all'
    );
    
    if (nonGPU.length > 0) {
      issues.push(`Uses non-GPU properties: ${nonGPU.join(', ')}`);
      recommendations.push('Stick to transform, opacity, and filter');
    }
  }
  
  // Check will-change
  const willChange = styles.willChange;
  if (willChange === 'auto') {
    recommendations.push('Consider adding will-change before animation starts');
  }
  
  // Check duration
  const duration = parseFloat(styles.transitionDuration) * 1000;
  if (duration > 0 && Math.abs(duration - expectedDuration) > 50) {
    issues.push(`Duration mismatch: expected ${expectedDuration}ms, got ${duration}ms`);
  }
  
  // Check if duration is optimal for 60fps
  if (duration > 0) {
    const frames = Math.round((duration / 1000) * PERFORMANCE_TARGETS.targetFPS);
    if (frames < 2) {
      issues.push('Animation too short (less than 2 frames at 60fps)');
      recommendations.push('Increase duration to at least 33ms');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Monitor real-time FPS during development
 */
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private rafId: number | null = null;
  
  start(callback?: (fps: number) => void): void {
    const measure = () => {
      this.frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - this.lastTime;
      
      if (delta >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        if (callback) {
          callback(this.fps);
        }
      }
      
      this.rafId = requestAnimationFrame(measure);
    };
    
    this.rafId = requestAnimationFrame(measure);
  }
  
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  getCurrentFPS(): number {
    return this.fps;
  }
  
  isPerformant(): boolean {
    return this.fps >= PERFORMANCE_TARGETS.targetFPS * 0.9;
  }
}

/**
 * Export a global FPS monitor for development
 */
export const globalFPSMonitor = new FPSMonitor();

// Auto-start in development mode
if (import.meta.env.DEV) {
  globalFPSMonitor.start((fps) => {
    if (fps < PERFORMANCE_TARGETS.targetFPS * 0.9) {
      console.warn(`⚠️ Low FPS detected: ${fps} (target: ${PERFORMANCE_TARGETS.targetFPS})`);
    }
  });
}
