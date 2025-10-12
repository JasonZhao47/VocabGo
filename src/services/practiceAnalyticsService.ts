/**
 * Practice Analytics Service
 * Tracks practice session metrics, question generation performance, and errors
 */

export interface PracticeSessionMetrics {
  sessionId: string;
  wordlistId: string;
  wordlistSize: number;
  questionTypes: string[];
  totalQuestions: number;
  score: number;
  duration: number; // in seconds
  timerDuration?: number;
  completedAt: Date;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
}

export interface QuestionGenerationMetrics {
  wordlistId: string;
  wordlistSize: number;
  questionTypes: string[];
  generationTime: number; // in milliseconds
  success: boolean;
  errorType?: string;
  cacheHit: boolean;
  timestamp: Date;
}

export interface ErrorLog {
  type: 'generation' | 'session' | 'sharing' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export interface PerformanceMetrics {
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

class PracticeAnalyticsService {
  private readonly STORAGE_KEY = 'vocabgo_analytics';
  private readonly MAX_STORED_EVENTS = 100;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  private eventQueue: any[] = [];
  private flushTimer: number | null = null;

  constructor() {
    this.startAutoFlush();
    this.setupErrorHandlers();
  }

  /**
   * Track a practice session completion
   */
  trackSession(metrics: PracticeSessionMetrics): void {
    const event = {
      type: 'session_completed',
      ...metrics,
      deviceType: this.getDeviceType(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    this.queueEvent(event);
    this.logToConsole('Session tracked', event);
  }

  /**
   * Track question generation performance
   */
  trackGeneration(metrics: QuestionGenerationMetrics): void {
    const event = {
      type: 'question_generation',
      ...metrics,
      timestamp: new Date().toISOString(),
    };

    this.queueEvent(event);

    // Alert if generation is slow (> 10 seconds for 40 words)
    const expectedTime = (metrics.wordlistSize / 40) * 10000;
    if (metrics.generationTime > expectedTime * 1.5) {
      this.logError({
        type: 'generation',
        severity: 'medium',
        message: `Slow question generation: ${metrics.generationTime}ms for ${metrics.wordlistSize} words`,
        context: metrics,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }

    this.logToConsole('Generation tracked', event);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, unit: string, context?: Record<string, any>): void {
    const event: PerformanceMetrics = {
      metric,
      value,
      unit,
      timestamp: new Date(),
      context,
    };

    this.queueEvent({
      type: 'performance',
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    this.logToConsole('Performance tracked', event);
  }

  /**
   * Log an error with context
   */
  logError(error: ErrorLog): void {
    const event = {
      eventType: 'error',
      ...error,
      timestamp: error.timestamp.toISOString(),
    };

    this.queueEvent(event);

    // Log to console based on severity
    if (error.severity === 'critical' || error.severity === 'high') {
      console.error('[Analytics Error]', error);
    } else {
      console.warn('[Analytics Warning]', error);
    }

    // Store critical errors separately for immediate attention
    if (error.severity === 'critical') {
      this.storeCriticalError(error);
    }
  }

  /**
   * Get analytics summary for display
   */
  getAnalyticsSummary(): {
    totalSessions: number;
    averageScore: number;
    totalGenerations: number;
    averageGenerationTime: number;
    errorCount: number;
    cacheHitRate: number;
  } {
    const stored = this.getStoredEvents();
    
    const sessions = stored.filter((e: any) => e.type === 'session_completed');
    const generations = stored.filter((e: any) => e.type === 'question_generation');
    const errors = stored.filter((e: any) => e.eventType === 'error');

    const totalSessions = sessions.length;
    const averageScore = totalSessions > 0
      ? sessions.reduce((sum: number, s: any) => sum + s.score, 0) / totalSessions
      : 0;

    const totalGenerations = generations.length;
    const averageGenerationTime = totalGenerations > 0
      ? generations.reduce((sum: number, g: any) => sum + g.generationTime, 0) / totalGenerations
      : 0;

    const cacheHits = generations.filter((g: any) => g.cacheHit).length;
    const cacheHitRate = totalGenerations > 0 ? cacheHits / totalGenerations : 0;

    return {
      totalSessions,
      averageScore: Math.round(averageScore * 100) / 100,
      totalGenerations,
      averageGenerationTime: Math.round(averageGenerationTime),
      errorCount: errors.length,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    };
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): ErrorLog[] {
    const stored = this.getStoredEvents();
    return stored
      .filter((e: any) => e.eventType === 'error')
      .slice(-limit)
      .map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      }));
  }

  /**
   * Clear all stored analytics data
   */
  clearAnalytics(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(`${this.STORAGE_KEY}_critical`);
    this.eventQueue = [];
    console.log('[Analytics] Data cleared');
  }

  /**
   * Export analytics data for analysis
   */
  exportAnalytics(): string {
    const stored = this.getStoredEvents();
    return JSON.stringify(stored, null, 2);
  }

  // Private methods

  private queueEvent(event: any): void {
    this.eventQueue.push(event);

    // Flush immediately in test environment or when batch size is reached
    if (import.meta.env.MODE === 'test' || this.eventQueue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Store events locally
    this.storeEvents(events);

    // In a production environment, you would send these to an analytics service
    // Example: this.sendToAnalyticsService(events);
  }

  private storeEvents(events: any[]): void {
    try {
      const stored = this.getStoredEvents();
      const updated = [...stored, ...events].slice(-this.MAX_STORED_EVENTS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[Analytics] Failed to store events:', error);
    }
  }

  private getStoredEvents(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Analytics] Failed to retrieve events:', error);
      return [];
    }
  }

  private storeCriticalError(error: ErrorLog): void {
    try {
      const key = `${this.STORAGE_KEY}_critical`;
      const stored = localStorage.getItem(key);
      const errors = stored ? JSON.parse(stored) : [];
      errors.push(error);
      localStorage.setItem(key, JSON.stringify(errors.slice(-10)));
    } catch (e) {
      console.error('[Analytics] Failed to store critical error:', e);
    }
  }

  private startAutoFlush(): void {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'network',
        severity: 'medium',
        message: event.message,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'network',
        severity: 'high',
        message: `Unhandled promise rejection: ${event.reason}`,
        context: { reason: event.reason },
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private logToConsole(message: string, data: any): void {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${message}`, data);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Export singleton instance
export const analyticsService = new PracticeAnalyticsService();
