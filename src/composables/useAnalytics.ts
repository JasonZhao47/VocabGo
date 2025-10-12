/**
 * Analytics Composable
 * Provides easy access to analytics tracking in Vue components
 */

import { onUnmounted, ref, computed } from 'vue';
import {
  analyticsService,
  type PracticeSessionMetrics,
  type QuestionGenerationMetrics,
  type ErrorLog,
} from '@/services/practiceAnalyticsService';

export function useAnalytics() {
  const summary = ref(analyticsService.getAnalyticsSummary());
  const recentErrors = ref(analyticsService.getRecentErrors());

  // Refresh summary data
  const refreshSummary = () => {
    summary.value = analyticsService.getAnalyticsSummary();
    recentErrors.value = analyticsService.getRecentErrors();
  };

  // Track practice session
  const trackSession = (metrics: PracticeSessionMetrics) => {
    analyticsService.trackSession(metrics);
    refreshSummary();
  };

  // Track question generation
  const trackGeneration = (metrics: QuestionGenerationMetrics) => {
    analyticsService.trackGeneration(metrics);
    refreshSummary();
  };

  // Track performance metric
  const trackPerformance = (
    metric: string,
    value: number,
    unit: string,
    context?: Record<string, any>
  ) => {
    analyticsService.trackPerformance(metric, value, unit, context);
  };

  // Log error
  const logError = (error: ErrorLog) => {
    analyticsService.logError(error);
    refreshSummary();
  };

  // Clear analytics data
  const clearAnalytics = () => {
    analyticsService.clearAnalytics();
    refreshSummary();
  };

  // Export analytics data
  const exportAnalytics = () => {
    return analyticsService.exportAnalytics();
  };

  // Computed properties for easy access
  const hasErrors = computed(() => summary.value.errorCount > 0);
  const performanceScore = computed(() => {
    const { averageGenerationTime, cacheHitRate } = summary.value;
    // Score based on generation time and cache efficiency
    const timeScore = Math.max(0, 100 - (averageGenerationTime / 100));
    const cacheScore = cacheHitRate * 100;
    return Math.round((timeScore + cacheScore) / 2);
  });

  // Cleanup on unmount
  onUnmounted(() => {
    // Flush any pending events
    analyticsService['flush']();
  });

  return {
    // State
    summary,
    recentErrors,
    hasErrors,
    performanceScore,

    // Methods
    trackSession,
    trackGeneration,
    trackPerformance,
    logError,
    clearAnalytics,
    exportAnalytics,
    refreshSummary,
  };
}
