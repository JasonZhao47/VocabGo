<template>
  <div class="session-history">
    <!-- Header with Statistics -->
    <div class="history-header">
      <h2 class="text-2xl font-semibold text-gray-900">Practice History</h2>
      
      <div v-if="totalSessions > 0" class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Sessions</div>
          <div class="stat-value">{{ totalSessions }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Average Score</div>
          <div class="stat-value">{{ averageScore }}%</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Best Score</div>
          <div class="stat-value">{{ bestScore }}%</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Total Practice Time</div>
          <div class="stat-value">{{ formatTotalTime(totalPracticeTime) }}</div>
        </div>
      </div>

      <!-- Progress Trend Indicator -->
      <div v-if="totalSessions >= 2" class="trend-indicator" :class="`trend-${progressTrend}`">
        <span class="trend-icon">
          <template v-if="progressTrend === 'improving'">↗</template>
          <template v-else-if="progressTrend === 'declining'">↘</template>
          <template v-else>→</template>
        </span>
        <span class="trend-text">
          {{ progressTrend === 'improving' ? 'Improving' : progressTrend === 'declining' ? 'Needs Practice' : 'Stable' }}
        </span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="question-type-filter" class="filter-label">Question Type</label>
        <select
          id="question-type-filter"
          v-model="selectedQuestionType"
          class="filter-select"
        >
          <option value="">All Types</option>
          <option value="matching">Matching</option>
          <option value="fill-blank">Fill in the Blank</option>
          <option value="multiple-choice">Multiple Choice</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="date-range-filter" class="filter-label">Date Range</label>
        <select
          id="date-range-filter"
          v-model="selectedDateRange"
          class="filter-select"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      <div v-if="selectedDateRange === 'custom'" class="custom-date-range">
        <input
          v-model="customStartDate"
          type="date"
          class="date-input"
          placeholder="Start Date"
        />
        <span class="date-separator">to</span>
        <input
          v-model="customEndDate"
          type="date"
          class="date-input"
          placeholder="End Date"
        />
      </div>

      <button
        v-if="history.length > 0"
        @click="handleClearHistory"
        class="clear-button"
      >
        Clear History
      </button>
    </div>

    <!-- Progress Trend Chart -->
    <div v-if="filteredHistory.length >= 2" class="trend-chart">
      <h3 class="chart-title">Score Trend</h3>
      <div class="chart-container">
        <svg
          ref="chartSvg"
          class="chart-svg"
          viewBox="0 0 600 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- Grid lines -->
          <line
            v-for="i in 5"
            :key="`grid-${i}`"
            :x1="40"
            :x2="580"
            :y1="20 + (i - 1) * 40"
            :y2="20 + (i - 1) * 40"
            stroke="#e5e7eb"
            stroke-width="1"
          />
          
          <!-- Y-axis labels -->
          <text
            v-for="i in 5"
            :key="`label-${i}`"
            :x="30"
            :y="25 + (i - 1) * 40"
            text-anchor="end"
            class="chart-label"
          >
            {{ 100 - (i - 1) * 25 }}%
          </text>

          <!-- Trend line -->
          <polyline
            :points="trendLinePoints"
            fill="none"
            stroke="#8b5cf6"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Data points -->
          <circle
            v-for="(point, index) in trendDataPoints"
            :key="`point-${index}`"
            :cx="point.x"
            :cy="point.y"
            r="4"
            fill="#8b5cf6"
            class="chart-point"
          >
            <title>{{ point.label }}</title>
          </circle>
        </svg>
      </div>
    </div>

    <!-- Session List -->
    <div class="sessions-list">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading history...</p>
      </div>

      <div v-else-if="filteredHistory.length === 0" class="empty-state">
        <p class="empty-message">
          {{ history.length === 0 ? 'No practice sessions yet' : 'No sessions match your filters' }}
        </p>
        <p v-if="history.length === 0" class="empty-hint">
          Complete a practice session to see your history here
        </p>
      </div>

      <div v-else class="session-cards">
        <div
          v-for="session in filteredHistory"
          :key="session.completedAt"
          class="session-card"
        >
          <div class="session-header">
            <h4 class="session-wordlist">{{ session.wordlistName }}</h4>
            <button
              @click="handleDeleteSession(session.completedAt)"
              class="delete-button"
              aria-label="Delete session"
            >
              ×
            </button>
          </div>

          <div class="session-details">
            <div class="detail-item">
              <span class="detail-label">Score:</span>
              <span class="detail-value score" :class="getScoreClass(session.score)">
                {{ session.score }}%
              </span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">{{ formatDuration(session.duration) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{ formatDateTime(session.completedAt) }}</span>
            </div>
          </div>

          <div class="session-types">
            <span
              v-for="type in session.questionTypes"
              :key="type"
              class="type-badge"
            >
              {{ formatQuestionType(type) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSessionHistory } from '@/composables/useSessionHistory';

interface Props {
  wordlistId?: string;
}

const props = defineProps<Props>();

const {
  history,
  isLoading,
  totalSessions,
  averageScore,
  bestScore,
  progressTrend,
  totalPracticeTime,
  deleteSession,
  clearAllHistory,
  getSessionsByDateRange,
  getSessionsByQuestionType,
  formatDuration,
  formatDateTime,
} = useSessionHistory(props.wordlistId);

// Filter state
const selectedQuestionType = ref('');
const selectedDateRange = ref('all');
const customStartDate = ref('');
const customEndDate = ref('');

// Filtered history
const filteredHistory = computed(() => {
  let filtered = [...history.value];

  // Filter by question type
  if (selectedQuestionType.value) {
    filtered = filtered.filter((session) =>
      session.questionTypes.includes(selectedQuestionType.value)
    );
  }

  // Filter by date range
  if (selectedDateRange.value !== 'all') {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (selectedDateRange.value) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (customStartDate.value && customEndDate.value) {
          startDate = new Date(customStartDate.value);
          endDate = new Date(customEndDate.value);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return filtered;
        }
        break;
      default:
        return filtered;
    }

    filtered = getSessionsByDateRange(startDate, endDate);
  }

  // Sort by date (most recent first)
  return filtered.sort((a, b) => b.completedAt - a.completedAt);
});

// Trend chart data
const trendDataPoints = computed(() => {
  const sessions = [...filteredHistory.value]
    .sort((a, b) => a.completedAt - b.completedAt)
    .slice(-10); // Last 10 sessions

  if (sessions.length < 2) return [];

  const width = 540; // 580 - 40 (margins)
  const height = 160; // 180 - 20 (margins)
  const xStep = width / (sessions.length - 1);

  return sessions.map((session, index) => ({
    x: 40 + index * xStep,
    y: 20 + height - (session.score / 100) * height,
    label: `${session.score}% - ${formatDateTime(session.completedAt)}`,
  }));
});

const trendLinePoints = computed(() => {
  return trendDataPoints.value.map((point) => `${point.x},${point.y}`).join(' ');
});

// Helper functions
function formatQuestionType(type: string): string {
  const typeMap: Record<string, string> = {
    'matching': 'Matching',
    'fill-blank': 'Fill Blank',
    'multiple-choice': 'Multiple Choice',
  };
  return typeMap[type] || type;
}

function getScoreClass(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'needs-improvement';
}

function formatTotalTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Actions
function handleDeleteSession(completedAt: number) {
  if (confirm('Are you sure you want to delete this session?')) {
    deleteSession(completedAt);
  }
}

function handleClearHistory() {
  if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
    clearAllHistory();
  }
}

// Reset custom dates when switching away from custom range
watch(selectedDateRange, (newValue) => {
  if (newValue !== 'custom') {
    customStartDate.value = '';
    customEndDate.value = '';
  }
});
</script>

<style scoped>
.session-history {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.history-header {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
}

.trend-improving {
  background: #d1fae5;
  color: #065f46;
}

.trend-declining {
  background: #fee2e2;
  color: #991b1b;
}

.trend-stable {
  background: #e0e7ff;
  color: #3730a3;
}

.trend-icon {
  font-size: 20px;
}

.filters-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 32px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-select,
.date-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.filter-select:focus,
.date-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.custom-date-range {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 2;
}

.date-separator {
  color: #6b7280;
  font-size: 14px;
}

.clear-button {
  padding: 10px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-button:hover {
  background: #dc2626;
}

.trend-chart {
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
  overflow-x: auto;
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-label {
  font-size: 12px;
  fill: #6b7280;
}

.chart-point {
  cursor: pointer;
  transition: r 0.2s;
}

.chart-point:hover {
  r: 6;
}

.sessions-list {
  min-height: 200px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-message {
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #9ca3af;
}

.session-cards {
  display: grid;
  gap: 16px;
}

.session-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s;
}

.session-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.session-wordlist {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.delete-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-button:hover {
  background: #fee2e2;
  color: #dc2626;
}

.session-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 16px;
  color: #111827;
  font-weight: 600;
}

.detail-value.score {
  font-size: 20px;
}

.score.excellent {
  color: #059669;
}

.score.good {
  color: #2563eb;
}

.score.fair {
  color: #d97706;
}

.score.needs-improvement {
  color: #dc2626;
}

.session-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-badge {
  padding: 4px 12px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .session-history {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: 100%;
  }

  .custom-date-range {
    flex-direction: column;
  }

  .session-details {
    grid-template-columns: 1fr;
  }
}
</style>
