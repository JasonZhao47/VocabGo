/**
 * Performance Monitoring Utility
 * 
 * Monitors animation performance (FPS) and automatically reduces complexity
 * when performance drops below acceptable thresholds.
 */

export interface PerformanceMetrics {
  fps: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  frameCount: number;
  droppedFrames: number;
  isLowPerformance: boolean;
}

export interface PerformanceMonitorOptions {
  /** Target FPS (default: 60) */
  targetFps?: number;
  /** FPS threshold for low performance detection (default: 30) */
  lowFpsThreshold?: number;
  /** Number of frames to average for FPS calculation (default: 60) */
  sampleSize?: number;
  /** Enable logging in development mode (default: true) */
  enableLogging?: boolean;
  /** Callback when low performance is detected */
  onLowPerformance?: (metrics: PerformanceMetrics) => void;
  /** Callback when performance recovers */
  onPerformanceRecover?: (metrics: PerformanceMetrics) => void;
}

class PerformanceMonitor {
  private targetFps: number;
  private lowFpsThreshold: number;
  private sampleSize: number;
  private enableLogging: boolean;
  private onLowPerformance?: (metrics: PerformanceMetrics) => void;
  private onPerformanceRecover?: (metrics: PerformanceMetrics) => void;

  private isMonitoring = false;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsHistory: number[] = [];
  private droppedFrames = 0;
  private wasLowPerformance = false;

  constructor(options: PerformanceMonitorOptions = {}) {
    this.targetFps = options.targetFps ?? 60;
    this.lowFpsThreshold = options.lowFpsThreshold ?? 30;
    this.sampleSize = options.sampleSize ?? 60;
    this.enableLogging = options.enableLogging ?? (import.meta.env.DEV ?? false);
    this.onLowPerformance = options.onLowPerformance;
    this.onPerformanceRecover = options.onPerformanceRecover;
  }

  /**
   * Start monitoring performance
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fpsHistory = [];
    this.droppedFrames = 0;

    this.monitorFrame();

    if (this.enableLogging) {
      console.log('[PerformanceMonitor] Started monitoring');
    }
  }

  /**
   * Stop monitoring performance
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.enableLogging) {
      const metrics = this.getMetrics();
      console.log('[PerformanceMonitor] Stopped monitoring', metrics);
    }
  }

  /**
   * Monitor a single frame
   */
  private monitorFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    // Calculate FPS for this frame
    const fps = 1000 / deltaTime;

    // Track frame
    this.frameCount++;
    this.fpsHistory.push(fps);

    // Keep history size limited
    if (this.fpsHistory.length > this.sampleSize) {
      this.fpsHistory.shift();
    }

    // Detect dropped frames (frame took longer than target)
    const targetFrameTime = 1000 / this.targetFps;
    if (deltaTime > targetFrameTime * 1.5) {
      this.droppedFrames++;
    }

    // Check for low performance
    const metrics = this.getMetrics();
    const isCurrentlyLowPerformance = metrics.isLowPerformance;

    // Trigger callbacks on state change
    if (isCurrentlyLowPerformance && !this.wasLowPerformance) {
      this.wasLowPerformance = true;
      if (this.onLowPerformance) {
        this.onLowPerformance(metrics);
      }
      if (this.enableLogging) {
        console.warn('[PerformanceMonitor] Low performance detected', metrics);
      }
    } else if (!isCurrentlyLowPerformance && this.wasLowPerformance) {
      this.wasLowPerformance = false;
      if (this.onPerformanceRecover) {
        this.onPerformanceRecover(metrics);
      }
      if (this.enableLogging) {
        console.log('[PerformanceMonitor] Performance recovered', metrics);
      }
    }

    this.lastFrameTime = currentTime;
    this.animationFrameId = requestAnimationFrame(this.monitorFrame);
  };

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const currentFps = this.fpsHistory.length > 0 
      ? this.fpsHistory[this.fpsHistory.length - 1] 
      : 0;

    const averageFps = this.fpsHistory.length > 0
      ? this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length
      : 0;

    const minFps = this.fpsHistory.length > 0
      ? Math.min(...this.fpsHistory)
      : 0;

    const maxFps = this.fpsHistory.length > 0
      ? Math.max(...this.fpsHistory)
      : 0;

    const isLowPerformance = averageFps < this.lowFpsThreshold && this.fpsHistory.length >= 10;

    return {
      fps: Math.round(currentFps),
      averageFps: Math.round(averageFps),
      minFps: Math.round(minFps),
      maxFps: Math.round(maxFps),
      frameCount: this.frameCount,
      droppedFrames: this.droppedFrames,
      isLowPerformance,
    };
  }

  /**
   * Check if currently monitoring
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.frameCount = 0;
    this.fpsHistory = [];
    this.droppedFrames = 0;
    this.wasLowPerformance = false;
  }
}

// Singleton instance
let monitorInstance: PerformanceMonitor | null = null;

/**
 * Get or create the performance monitor instance
 */
export function getPerformanceMonitor(options?: PerformanceMonitorOptions): PerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor(options);
  }
  return monitorInstance;
}

/**
 * Composable for using performance monitoring in Vue components
 */
export function usePerformanceMonitor(options?: PerformanceMonitorOptions) {
  const monitor = getPerformanceMonitor(options);

  return {
    start: () => monitor.start(),
    stop: () => monitor.stop(),
    getMetrics: () => monitor.getMetrics(),
    isActive: () => monitor.isActive(),
    reset: () => monitor.reset(),
  };
}

/**
 * Monitor performance during an animation
 * Automatically starts monitoring before animation and stops after
 */
export async function monitorAnimation<T>(
  animationFn: () => Promise<T> | T,
  options?: PerformanceMonitorOptions
): Promise<T> {
  const monitor = getPerformanceMonitor(options);
  
  monitor.start();
  
  try {
    const result = await animationFn();
    return result;
  } finally {
    monitor.stop();
  }
}

/**
 * Get a performance report for logging
 */
export function getPerformanceReport(): string {
  const monitor = getPerformanceMonitor();
  const metrics = monitor.getMetrics();

  return `
Performance Report:
- Current FPS: ${metrics.fps}
- Average FPS: ${metrics.averageFps}
- Min FPS: ${metrics.minFps}
- Max FPS: ${metrics.maxFps}
- Total Frames: ${metrics.frameCount}
- Dropped Frames: ${metrics.droppedFrames}
- Low Performance: ${metrics.isLowPerformance ? 'Yes' : 'No'}
  `.trim();
}
