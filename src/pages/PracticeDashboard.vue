<template>
  <div class="practice-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">{{ wordlistTitle }}</h1>
        <p v-if="stats" class="dashboard-subtitle">
          Practice Statistics & Insights
        </p>
      </div>
      <div class="header-actions">
        <Button
          @click="handleGenerateQuestions"
          variant="primary"
          :loading="isGenerating"
          :disabled="!stats || stats.aggregateMistakes.length === 0"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </template>
          Generate Questions
        </Button>
        <Button
          @click="handleExportCSV"
          variant="secondary"
          :disabled="!stats || stats.aggregateMistakes.length === 0"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </template>
          Export CSV
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <svg class="animate-spin h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
      <p class="loading-text">Loading practice statistics...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <Button @click="loadStats" variant="secondary">
        Try Again
      </Button>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats" class="dashboard-content">
      <!-- Stats Overview Cards -->
      <div class="stats-grid">
        <Card class="stat-card" variant="gradient-border">
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalStudents }}</div>
            <div class="stat-label">Students</div>
          </div>
          <div class="stat-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </Card>

        <Card class="stat-card" variant="gradient-border">
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalPractices }}</div>
            <div class="stat-label">Total Mistakes</div>
          </div>
          <div class="stat-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        </Card>

        <Card class="stat-card" variant="gradient-border">
          <div class="stat-content">
            <div class="stat-value">{{ avgMistakes }}</div>
            <div class="stat-label">Avg Mistakes</div>
          </div>
          <div class="stat-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </Card>
      </div>

      <!-- Most Challenging Words -->
      <Card class="mistakes-section">
        <template #header>
          <h2 class="section-title">Most Challenging Words</h2>
        </template>
        
        <DataTable
          :columns="mistakeColumns"
          :data="stats.aggregateMistakes"
          :loading="false"
        >
          <template #empty>
            <div class="empty-state">
              <p class="empty-text">No mistakes recorded yet</p>
              <p class="empty-hint">{{ stats.totalStudents > 0 ? 'Students have registered but haven\'t practiced yet.' : 'Share your wordlist to get students started!' }}</p>
            </div>
          </template>
        </DataTable>
      </Card>

      <!-- Student List -->
      <Card class="students-section">
        <template #header>
          <h2 class="section-title">Individual Students</h2>
        </template>

        <div v-if="stats.students.length === 0" class="empty-state">
          <p class="empty-text">No students yet</p>
          <p class="empty-hint">Share your wordlist link to get students started!</p>
        </div>

        <Accordion
          v-for="student in stats.students"
          :key="student.sessionId"
          :title="student.nickname"
          variant="bordered"
          class="student-accordion"
        >
          <template #header>
            <div class="student-summary">
              <div class="student-info">
                <span class="student-name">{{ student.nickname }}</span>
                <span class="student-meta">
                  {{ student.totalMistakes }} mistakes · {{ formatRelativeTime(student.lastActive) }}
                </span>
              </div>
              <div class="student-badge">
                {{ student.topMistakes.length }} words
              </div>
            </div>
          </template>

          <div class="student-details">
            <DataTable
              :columns="studentMistakeColumns"
              :data="student.topMistakes"
              :loading="false"
            >
              <template #empty>
                <p class="empty-text-small">No mistakes recorded</p>
              </template>
            </DataTable>
          </div>
        </Accordion>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Accordion from '@/components/ui/Accordion.vue'
import { usePracticeStats } from '@/composables/usePracticeStats'
import { useToast } from '@/composables/useToast'
import type { AggregateMistake, TopMistake } from '@/composables/usePracticeStats'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

// Get wordlist ID from route
const wordlistId = computed(() => route.params.wordlistId as string)

// Initialize composable
const { stats, isLoading, error, fetchStats, generateFromMistakes } = usePracticeStats(wordlistId.value)

// Local state
const wordlistTitle = ref('Practice Dashboard')
const isGenerating = ref(false)

// Computed properties
const avgMistakes = computed(() => {
  if (!stats.value || stats.value.totalStudents === 0) return '0'
  const total = stats.value.aggregateMistakes.reduce((sum, m) => sum + m.totalCount, 0)
  const avg = total / stats.value.totalStudents
  return avg.toFixed(1)
})

const maxMistakes = computed(() => {
  if (!stats.value || stats.value.aggregateMistakes.length === 0) return 1
  return Math.max(...stats.value.aggregateMistakes.map(m => m.totalCount))
})

// Table columns for aggregate mistakes
const mistakeColumns = computed(() => [
  {
    key: 'word',
    label: 'Word',
    align: 'left' as const,
    render: (value: string, row: AggregateMistake) => {
      return h('div', { class: 'word-cell' }, [
        h('div', { class: 'word-en' }, value),
        h('div', { class: 'word-zh' }, row.translation),
      ])
    },
  },
  {
    key: 'studentCount',
    label: 'Students',
    align: 'center' as const,
  },
  {
    key: 'totalCount',
    label: 'Total Mistakes',
    align: 'center' as const,
  },
  {
    key: 'difficulty',
    label: 'Difficulty',
    align: 'left' as const,
    render: (_: any, row: AggregateMistake) => {
      const percentage = (row.totalCount / maxMistakes.value) * 100
      return h('div', { class: 'difficulty-bar-container' }, [
        h('div', { class: 'difficulty-bar' }, [
          h('div', {
            class: 'difficulty-fill',
            style: { width: `${percentage}%` },
          }),
        ]),
        h('span', { class: 'difficulty-count' }, row.totalCount.toString()),
      ])
    },
  },
])

// Table columns for student mistakes
const studentMistakeColumns = computed(() => [
  {
    key: 'word',
    label: 'Word',
    align: 'left' as const,
    render: (value: string, row: TopMistake) => {
      return h('div', { class: 'word-cell-compact' }, [
        h('span', { class: 'word-en-compact' }, value),
        h('span', { class: 'word-zh-compact' }, row.translation),
      ])
    },
  },
  {
    key: 'count',
    label: 'Mistakes',
    align: 'center' as const,
  },
])

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Load practice statistics
 */
async function loadStats() {
  await fetchStats('all')
  
  // Try to get wordlist title from stats or localStorage
  if (stats.value) {
    // You could fetch wordlist details here if needed
    wordlistTitle.value = `Practice Dashboard`
  }
}

/**
 * Handle generate questions from mistakes
 */
async function handleGenerateQuestions() {
  if (!stats.value || stats.value.aggregateMistakes.length === 0) return

  isGenerating.value = true

  try {
    const result = await generateFromMistakes(10)

    if (result) {
      showToast(`Generated ${result.metadata.questionCounts.matching + result.metadata.questionCounts.fillBlank + result.metadata.questionCounts.multipleChoice} questions from top mistakes!`, 'success', 3000)

      // Navigate to practice page with generated questions
      // You could store the questions in state or pass them via route
      router.push({
        name: 'Result',
        params: { wordlistId: wordlistId.value },
      })
    } else {
      showToast(error.value || 'Failed to generate questions', 'error', 5000)
    }
  } catch (err) {
    showToast('An error occurred while generating questions', 'error', 5000)
  } finally {
    isGenerating.value = false
  }
}

/**
 * Handle export to CSV
 */
function handleExportCSV() {
  if (!stats.value) return

  try {
    // Build aggregate CSV content
    const aggregateHeaders = ['Word', 'Translation', 'Students Affected', 'Total Mistakes', 'Avg per Student']
    const aggregateRows = [...stats.value.aggregateMistakes].map(m => [
      m.word,
      m.translation,
      m.studentCount.toString(),
      m.totalCount.toString(),
      m.avgPerStudent.toFixed(2),
    ])

    // Build per-student CSV content
    const studentHeaders = ['Student Name', 'Word', 'Translation', 'Mistake Count', 'Last Active']
    const studentRows: string[][] = []
    
    stats.value.students.forEach(student => {
      student.topMistakes.forEach(mistake => {
        studentRows.push([
          student.nickname,
          mistake.word,
          mistake.translation,
          mistake.count.toString(),
          new Date(student.lastActive).toLocaleString(),
        ])
      })
    })

    // Combine both sections with a separator
    const csvContent = [
      '# Aggregate Mistake Summary',
      aggregateHeaders.join(','),
      ...aggregateRows.map(row => row.map(cell => `"${cell}"`).join(',')),
      '',
      '# Per-Student Breakdown',
      studentHeaders.join(','),
      ...studentRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `practice-stats-${wordlistId.value}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    showToast('CSV exported successfully!', 'success', 3000)
  } catch (err) {
    showToast('Failed to export CSV', 'error', 5000)
  }
}

// Load stats on mount
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.practice-dashboard {
  @apply min-h-screen bg-gray-50 py-8 px-4;
}

/* Header */
.dashboard-header {
  @apply max-w-7xl mx-auto mb-8;
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between;
  @apply gap-4;
}

.header-content {
  @apply flex-1;
}

.dashboard-title {
  @apply text-3xl font-semibold text-gray-900 mb-1;
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  @apply text-sm text-gray-600;
}

.header-actions {
  @apply flex gap-3 flex-wrap;
}

/* Loading & Error States */
.loading-container,
.error-container {
  @apply max-w-7xl mx-auto;
  @apply flex flex-col items-center justify-center;
  @apply py-16;
}

.loading-spinner {
  @apply mb-4;
}

.loading-text {
  @apply text-gray-600 text-lg;
}

.error-icon {
  @apply text-6xl mb-4;
}

.error-text {
  @apply text-red-600 text-lg mb-4;
}

/* Dashboard Content */
.dashboard-content {
  @apply max-w-7xl mx-auto space-y-6;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-3 gap-6;
}

.stat-card {
  @apply relative overflow-hidden;
  @apply transition-all duration-300;
}

.stat-card:hover {
  @apply shadow-lg transform scale-105;
}

.stat-content {
  @apply relative z-10;
}

.stat-value {
  @apply text-4xl font-bold text-gray-900 mb-1;
}

.stat-label {
  @apply text-sm text-gray-600 font-medium;
}

.stat-icon {
  @apply absolute top-4 right-4 opacity-10;
  @apply text-purple-600;
}

/* Sections */
.mistakes-section,
.students-section {
  @apply transition-all duration-300;
}

.section-title {
  @apply text-xl font-semibold text-gray-900;
}

/* Word Cells */
.word-cell {
  @apply flex flex-col gap-1;
}

.word-en {
  @apply text-base font-medium text-gray-900;
}

.word-zh {
  @apply text-sm text-gray-600;
}

.word-cell-compact {
  @apply flex items-center gap-2;
}

.word-en-compact {
  @apply text-sm font-medium text-gray-900;
}

.word-zh-compact {
  @apply text-sm text-gray-600;
}

/* Difficulty Bar */
.difficulty-bar-container {
  @apply flex items-center gap-3;
}

.difficulty-bar {
  @apply flex-1 h-2 bg-gray-100 rounded-full overflow-hidden;
}

.difficulty-fill {
  @apply h-full rounded-full;
  @apply transition-all duration-500;
  background: linear-gradient(90deg, #a855f7 0%, #ec4899 100%);
}

.difficulty-count {
  @apply text-sm font-medium text-gray-700 min-w-[2rem] text-right;
}

/* Student Accordion */
.student-accordion {
  @apply mb-3;
}

.student-summary {
  @apply flex items-center justify-between w-full;
}

.student-info {
  @apply flex flex-col gap-1;
}

.student-name {
  @apply text-base font-medium text-gray-900;
}

.student-meta {
  @apply text-sm text-gray-600;
}

.student-badge {
  @apply px-3 py-1 rounded-full;
  @apply bg-purple-100 text-purple-700;
  @apply text-xs font-medium;
}

.student-details {
  @apply mt-4;
}

/* Empty States */
.empty-state {
  @apply text-center py-8;
}

.empty-text {
  @apply text-gray-600 text-base font-medium mb-2;
}

.empty-hint {
  @apply text-gray-500 text-sm;
}

.empty-text-small {
  @apply text-gray-500 text-sm;
}

/* Responsive */
@media (max-width: 640px) {
  .dashboard-title {
    @apply text-2xl;
  }

  .header-actions {
    @apply flex-col w-full;
  }

  .header-actions > * {
    @apply w-full;
  }

  .stats-grid {
    @apply gap-4;
  }

  .stat-value {
    @apply text-3xl;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-content > * {
  animation: fadeIn 0.3s ease-out;
}

.dashboard-content > *:nth-child(1) {
  animation-delay: 0.05s;
}

.dashboard-content > *:nth-child(2) {
  animation-delay: 0.1s;
}

.dashboard-content > *:nth-child(3) {
  animation-delay: 0.15s;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .stat-card:hover {
    @apply transform-none;
  }

  .difficulty-fill {
    @apply transition-none;
  }

  .dashboard-content > * {
    animation: none;
  }
}
</style>
