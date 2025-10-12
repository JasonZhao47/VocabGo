<template>
  <div class="analytics-dashboard">
    <div class="analytics-header">
      <h2 class="text-2xl font-semibold text-gray-900">Practice Analytics</h2>
      <div class="flex gap-2">
        <Button variant="secondary" size="sm" @click="refreshData">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
        <Button variant="secondary" size="sm" @click="exportData">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </Button>
        <Button variant="destructive" size="sm" @click="clearData">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </Button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="card-icon bg-blue-100 text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-label">Total Sessions</div>
          <div class="card-value">{{ summary.totalSessions }}</div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="card-icon bg-green-100 text-green-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-label">Average Score</div>
          <div class="card-value">{{ summary.averageScore }}%</div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="card-icon bg-purple-100 text-purple-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-label">Avg Generation Time</div>
          <div class="card-value">{{ (summary.averageGenerationTime / 1000).toFixed(1) }}s</div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="card-icon bg-amber-100 text-amber-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-label">Cache Hit Rate</div>
          <div class="card-value">{{ (summary.cacheHitRate * 100).toFixed(0) }}%</div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="card-icon" :class="hasErrors ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-label">Errors</div>
          <div class="card-value">{{ summary.errorCount }}</div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="card-icon bg-indigo-100 text-indigo-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-label">Performance Score</div>
          <div class="card-value">{{ performanceScore }}/100</div>
        </div>
      </div>
    </div>

    <!-- Recent Errors -->
    <div v-if="hasErrors" class="errors-section">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h3>
      <div class="errors-list">
        <div
          v-for="(error, index) in recentErrors"
          :key="index"
          class="error-item"
          :class="`severity-${error.severity}`"
        >
          <div class="error-header">
            <span class="error-type">{{ error.type }}</span>
            <span class="error-severity">{{ error.severity }}</span>
            <span class="error-time">{{ formatTime(error.timestamp) }}</span>
          </div>
          <div class="error-message">{{ error.message }}</div>
          <div v-if="error.context" class="error-context">
            <details>
              <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                View context
              </summary>
              <pre class="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">{{ JSON.stringify(error.context, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAnalytics } from '@/composables/useAnalytics';
import Button from '@/components/ui/Button.vue';

const {
  summary,
  recentErrors,
  hasErrors,
  performanceScore,
  refreshSummary,
  clearAnalytics,
  exportAnalytics,
} = useAnalytics();

function refreshData() {
  refreshSummary();
}

function exportData() {
  const data = exportAnalytics();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vocabgo-analytics-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearData() {
  if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
    clearAnalytics();
  }
}

function formatTime(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
</script>

<style scoped>
.analytics-dashboard {
  @apply space-y-6;
}

.analytics-header {
  @apply flex items-center justify-between mb-6;
}

.analytics-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.analytics-card {
  @apply bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4;
}

.card-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0;
}

.card-content {
  @apply flex-1;
}

.card-label {
  @apply text-sm text-gray-600 mb-1;
}

.card-value {
  @apply text-2xl font-semibold text-gray-900;
}

.errors-section {
  @apply bg-white rounded-lg border border-gray-200 p-6;
}

.errors-list {
  @apply space-y-3;
}

.error-item {
  @apply border-l-4 bg-gray-50 p-4 rounded;
}

.error-item.severity-low {
  @apply border-blue-500;
}

.error-item.severity-medium {
  @apply border-yellow-500;
}

.error-item.severity-high {
  @apply border-orange-500;
}

.error-item.severity-critical {
  @apply border-red-500;
}

.error-header {
  @apply flex items-center gap-3 mb-2;
}

.error-type {
  @apply text-sm font-medium text-gray-900 capitalize;
}

.error-severity {
  @apply text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 uppercase;
}

.error-time {
  @apply text-xs text-gray-500 ml-auto;
}

.error-message {
  @apply text-sm text-gray-700 mb-2;
}

.error-context {
  @apply text-xs text-gray-600;
}
</style>
