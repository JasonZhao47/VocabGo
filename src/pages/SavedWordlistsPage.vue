<template>
  <div class="wordlists-page">
    <!-- Header with ElevenLabs styling - Responsive (Task 8.3) -->
    <div data-animate-child class="wordlists-header">
      <h1 class="wordlists-title">Saved Wordlists</h1>
      
      <!-- Optional search bar with minimal styling -->
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search wordlists..."
          class="search-input"
        />
        <svg 
          class="search-icon"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- DataTable Component -->
    <DataTable
      :columns="tableColumns"
      :data="tableData"
      :loading="isLoading"
      :error="hasError ? error : null"
      :on-row-click="handleRowClick"
      :actions="[{}]"
    >
      <!-- Custom empty state -->
      <template #empty>
        <div v-if="!hasWordlists" class="custom-empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="empty-title">No saved wordlists</h3>
          <p class="empty-description">Upload a document to create your first wordlist</p>
          <router-link 
            to="/upload" 
            class="empty-action-button"
          >
            Upload Document
          </router-link>
        </div>
        <div v-else class="custom-empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="empty-title">No wordlists found</h3>
          <p class="empty-description">Try adjusting your search query</p>
        </div>
      </template>

      <!-- Custom error state -->
      <template #error="{ error: errorMsg }">
        <div class="custom-error-state">
          <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <h3 class="error-title">Error loading wordlists</h3>
          <p class="error-description">{{ errorMsg }}</p>
        </div>
      </template>

      <!-- Custom actions slot -->
      <template #actions="{ row }">
        <div class="table-action-buttons">
          <ActionButton
            icon="📥"
            label="Download"
            @click="handleExport(row)"
          />
          <ActionButton
            icon="🎯"
            label="Practice"
            :disabled="row.wordCount < 4 || isGenerating"
            :loading="isGenerating"
            @click="generateAndDownload(row)"
          />
          <ActionButton
            icon="🗑️"
            label="Delete"
            variant="danger"
            @click="confirmDelete(row.id, row.filename)"
          />
        </div>
      </template>
    </DataTable>

    <!-- Expanded Wordlist View -->
    <Transition
      name="expand"
      @enter="onExpandEnter"
      @leave="onExpandLeave"
    >
      <div 
        v-if="expandedWordlist"
        class="wordlist-expanded"
      >
        <h4 class="expanded-title">Word Pairs</h4>
        <div class="expanded-table-container">
          <table class="expanded-table">
            <thead>
              <tr class="expanded-table-header">
                <th scope="col" class="expanded-table-header-cell">
                  English
                </th>
                <th scope="col" class="expanded-table-header-cell">
                  Mandarin
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pair, index) in expandedWordlist.words" :key="index" class="expanded-table-row">
                <td class="expanded-table-cell">
                  {{ pair.en }}
                </td>
                <td class="expanded-table-cell">
                  {{ pair.zh }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal with ElevenLabs styling -->
    <div 
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-250"
      @click.self="cancelDelete"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 transform transition-all duration-250">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-[20px] font-semibold text-black">Delete Wordlist</h3>
            <p class="mt-2 text-[15px] text-gray-600 leading-relaxed">
              Are you sure you want to delete "<span class="font-medium text-black">{{ deleteTarget?.filename }}</span>"? This action cannot be undone.
            </p>
          </div>
        </div>
        <div class="mt-8 flex gap-3">
          <button
            @click="cancelDelete"
            :disabled="deletingId !== null"
            class="flex-1 h-11 px-6 text-[15px] font-semibold text-black bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            :disabled="deletingId !== null"
            class="flex-1 h-11 px-6 text-[15px] font-semibold text-white bg-red-600 border border-transparent rounded-full hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="deletingId !== null" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ deletingId !== null ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, h, defineAsyncComponent } from 'vue'
import { useWordlist } from '@/composables/useWordlist'
import { usePracticeQuestions } from '@/composables/usePracticeQuestions'
import type { WordlistRecord } from '@/state/wordlistsState'
import { staggerAnimation } from '@/utils/staggerAnimation'
import { useMotionPreference } from '@/composables/useMotionPreference'
import { animationConfig } from '@/config/animations'
import { useToast } from '@/composables/useToast'
import gsap from 'gsap'

// Lazy load heavy UI components for better performance
const DataTable = defineAsyncComponent(() => import('@/components/ui/DataTable.vue'))
const ActionButton = defineAsyncComponent(() => import('@/components/ui/ActionButton.vue'))

// Use the wordlist composable
const {
  wordlists,
  hasWordlists,
  isLoading,
  hasError,
  error,
  loadWordlists,
  removeWordlist,
  downloadWordlist,
} = useWordlist()

// Use practice questions composable
const { isGenerating, generateAndDownload } = usePracticeQuestions()

// Motion preference detection
const { shouldAnimate, getDuration } = useMotionPreference()

// Toast notifications
const { showToast } = useToast()

// Local state for UI interactions
const searchQuery = ref('')
const expandedWordlistId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ id: string; filename: string } | null>(null)
const exportingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const hasAnimated = ref(false)

// Filtered wordlists based on search query
const filteredWordlists = computed(() => {
  if (!searchQuery.value.trim()) {
    return wordlists.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return wordlists.value.filter(wordlist => 
    wordlist.filename.toLowerCase().includes(query)
  )
})

// Check if there are filtered wordlists
const hasFilteredWordlists = computed(() => filteredWordlists.value.length > 0)

// DataTable configuration
const tableColumns = computed(() => [
  {
    key: 'filename',
    label: 'Filename',
    align: 'left' as const,
    width: '40%',
  },
  {
    key: 'createdAt',
    label: 'Date',
    align: 'left' as const,
    width: '25%',
    render: (value: Date) => h('span', { class: 'table-date' }, formatDate(value)),
  },
  {
    key: 'wordCount',
    label: 'Word Count',
    align: 'center' as const,
    width: '20%',
    render: (value: number) => h('span', { class: 'table-word-count' }, `${value} words`),
  },
])

// Table data mapped from filtered wordlists
const tableData = computed(() => filteredWordlists.value)

// Get expanded wordlist
const expandedWordlist = computed(() => {
  if (!expandedWordlistId.value) return null
  return wordlists.value.find(w => w.id === expandedWordlistId.value) || null
})

// Handle row click to expand/collapse
const handleRowClick = (row: WordlistRecord) => {
  toggleExpanded(row.id)
}

// Load wordlists on mount
onMounted(async () => {
  await loadWordlists()
})

/**
 * Animate table rows when expanding
 */
async function animateTableRows() {
  if (!shouldAnimate.value) return

  await nextTick()
  const rows = document.querySelectorAll('.expanded-table-row')
  if (rows.length === 0) return

  // Set initial state
  gsap.set(rows, {
    opacity: 0,
    x: -10,
  })

  // Animate with stagger
  gsap.to(rows, {
    opacity: 1,
    x: 0,
    duration: getDuration(animationConfig.duration.fast) / 1000,
    ease: animationConfig.easing.easeOut,
    stagger: animationConfig.stagger.fast / 1000,
  })
}

/**
 * Toggle expanded view for a wordlist
 */
async function toggleExpanded(id: string) {
  const wasExpanded = expandedWordlistId.value === id
  expandedWordlistId.value = wasExpanded ? null : id
  
  // Animate table rows when expanding
  if (!wasExpanded && shouldAnimate.value) {
    await nextTick()
    animateTableRows()
  }
}

/**
 * Handle expand transition enter
 */
function onExpandEnter(el: Element, done: () => void) {
  if (!shouldAnimate.value) {
    done()
    return
  }

  const element = el as HTMLElement
  
  // Get the natural height
  element.style.height = 'auto'
  const height = element.offsetHeight
  
  // Set initial state
  gsap.set(element, {
    height: 0,
    opacity: 0,
  })

  // Animate to natural height
  gsap.to(element, {
    height,
    opacity: 1,
    duration: getDuration(animationConfig.duration.normal) / 1000,
    ease: animationConfig.easing.easeOut,
    onComplete: () => {
      element.style.height = 'auto'
      done()
    },
  })
}

/**
 * Handle expand transition leave
 */
function onExpandLeave(el: Element, done: () => void) {
  if (!shouldAnimate.value) {
    done()
    return
  }

  const element = el as HTMLElement
  
  // Animate to zero height
  gsap.to(element, {
    height: 0,
    opacity: 0,
    duration: getDuration(animationConfig.duration.fast) / 1000,
    ease: animationConfig.easing.easeIn,
    onComplete: done,
  })
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toUpperCase() || 'FILE'
  return ext
}

/**
 * Show delete confirmation modal
 */
function confirmDelete(id: string, filename: string) {
  deleteTarget.value = { id, filename }
  showDeleteConfirm.value = true
}

/**
 * Cancel delete operation
 */
function cancelDelete() {
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

/**
 * Handle delete operation
 */
async function handleDelete() {
  if (!deleteTarget.value) return

  const targetId = deleteTarget.value.id
  deletingId.value = targetId
  
  // Animate card out before removing
  if (shouldAnimate.value) {
    const card = document.querySelector(`[data-wordlist-id="${targetId}"]`)
    if (card) {
      await gsap.to(card, {
        opacity: 0,
        scale: 0.95,
        duration: getDuration(animationConfig.duration.fast) / 1000,
        ease: animationConfig.easing.easeIn,
      })
    }
  }
  
  const success = await removeWordlist(targetId)
  deletingId.value = null
  
  if (success) {
    // Close expanded view if this wordlist was expanded
    if (expandedWordlistId.value === targetId) {
      expandedWordlistId.value = null
    }
  }

  // Close modal
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

/**
 * Handle export operation
 */
async function handleExport(wordlist: WordlistRecord) {
  exportingId.value = wordlist.id
  await downloadWordlist(wordlist)
  exportingId.value = null
}


</script>

<style scoped>
/* Mobile-first Responsive Design */

/* Page Container */
.wordlists-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  background: #FFFFFF;
}

@media (min-width: 768px) {
  .wordlists-page {
    padding: 32px 24px;
  }
}

@media (min-width: 1024px) {
  .wordlists-page {
    padding: 48px 32px;
  }
}

/* Header Section */
.wordlists-header {
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .wordlists-header {
    margin-bottom: 40px;
  }
}

@media (min-width: 1024px) {
  .wordlists-header {
    margin-bottom: 48px;
  }
}

.wordlists-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  line-height: 1.2;
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .wordlists-title {
    font-size: 28px;
    margin-bottom: 24px;
  }
}

@media (min-width: 1024px) {
  .wordlists-title {
    font-size: 32px;
  }
}

/* Search Container */
.search-container {
  position: relative;
  max-width: 100%;
}

@media (min-width: 768px) {
  .search-container {
    max-width: 28rem;
  }
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  padding-right: 40px;
  font-size: 14px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: border-color 150ms ease-out;
  min-height: 44px;
}

@media (min-width: 768px) {
  .search-input {
    height: 44px;
    font-size: 15px;
  }
}

.search-input:focus {
  outline: none;
  border-color: #9ca3af;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
  pointer-events: none;
}

/* Custom Empty State */
.custom-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 32px 0;
}

.empty-action-button {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  background: #000000;
  border-radius: 9999px;
  text-decoration: none;
  transition: background-color 150ms ease-out;
}

.empty-action-button:hover {
  background: #374151;
}

/* Custom Error State */
.custom-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc2626;
  margin-bottom: 16px;
}

.error-title {
  font-size: 15px;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 8px 0;
}

.error-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

/* Table Action Buttons */
.table-action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Table Cell Styling */
:deep(.table-date) {
  font-size: 15px;
  color: #6b7280;
}

:deep(.table-word-count) {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: #000000;
  border-radius: 9999px;
}

/* Expanded Wordlist View */
.wordlist-expanded {
  margin-top: 24px;
  padding: 24px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.expanded-title {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 16px 0;
}

.expanded-table-container {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.expanded-table {
  width: 100%;
  border-collapse: collapse;
}

.expanded-table-header {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.expanded-table-header-cell {
  padding: 12px 20px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.expanded-table-row {
  border-bottom: 1px solid #f5f5f5;
  transition: all 150ms ease-out;
}

.expanded-table-row:last-child {
  border-bottom: none;
}

.expanded-table-row:hover {
  background: #fafafa;
  transform: translateX(2px);
}

.expanded-table-cell {
  padding: 16px 20px;
  font-size: 15px;
  color: #000000;
}

.expanded-table-cell:first-child {
  font-weight: 500;
}

.expanded-table-cell:last-child {
  color: #374151;
}

/* Expand transition styles */
.expand-enter-active,
.expand-leave-active {
  transition: all 200ms ease-out;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Ensure elements are visible by default (for reduced motion users) */
@media (prefers-reduced-motion: reduce) {
  .wordlist-expanded,
  .expanded-table-row {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>

