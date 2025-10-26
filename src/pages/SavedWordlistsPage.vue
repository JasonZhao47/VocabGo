<template>
  <div class="page-container">
    <!-- Header with proper semantic HTML (Requirement 13.2) -->
    <header data-animate-child class="page-header">
      <h1 id="page-title" class="page-title">Saved Wordlists</h1>
      <p class="page-subtitle">Manage, share, and download your vocabulary collections</p>
      
      <!-- Search bar with proper ARIA labels (Requirement 13.2) -->
      <div class="search-container" role="search">
        <label for="wordlist-search" class="sr-only">Search wordlists</label>
        <input
          id="wordlist-search"
          v-model="searchQuery"
          type="search"
          placeholder="Search wordlists..."
          aria-label="Search wordlists by filename"
          class="search-input"
        />
        <svg 
          class="search-icon"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </header>

    <!-- DataTable Component with proper ARIA (Requirement 13.2) -->
    <section aria-labelledby="wordlists-table-heading">
      <h2 id="wordlists-table-heading" class="sr-only">Wordlists table</h2>
      <DataTable
        :columns="tableColumns"
        :data="tableData"
        :loading="isLoading"
        :error="hasError ? error : null"
        :on-row-click="handleRowClick"
        aria-label="Saved wordlists"
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
          <!-- Share Icon Button -->
          <button
            class="action-icon-btn"
            :aria-label="`Share ${row.filename}`"
            title="Share with students"
            @click.stop="toggleExpanded(row.id)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
          
          <!-- Download Icon Button with Dropdown -->
          <div class="download-dropdown-container">
            <button
              class="action-icon-btn"
              :aria-label="`Download options for ${row.filename}`"
              :aria-expanded="downloadMenuOpen === row.id"
              title="Download options"
              @click.stop="toggleDownloadMenu(row.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <Transition name="dropdown">
              <div
                v-if="downloadMenuOpen === row.id"
                class="download-dropdown-menu"
                role="menu"
                @click.stop
              >
                <button
                  class="download-menu-item"
                  role="menuitem"
                  @click="handleDownloadWordlist(row)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Wordlist (CSV)</span>
                </button>
                <button
                  class="download-menu-item"
                  role="menuitem"
                  :disabled="row.wordCount < 4 || isGenerating"
                  @click="handleDownloadPractice(row)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>Practice Questions (HTML)</span>
                  <span v-if="row.wordCount < 4" class="menu-item-note">(Need 4+ words)</span>
                </button>
              </div>
            </Transition>
          </div>
          
          <!-- Delete Icon Button -->
          <button
            class="action-icon-btn action-icon-btn-danger"
            :aria-label="`Delete ${row.filename}`"
            title="Delete wordlist"
            @click.stop="confirmDelete(row.id, row.filename)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </template>
      </DataTable>
    </section>

    <!-- Expanded Wordlist View with proper semantic HTML (Requirement 13.2) -->
    <Transition
      name="expand"
      @enter="onExpandEnter"
      @leave="onExpandLeave"
    >
      <section 
        v-if="expandedWordlist"
        class="wordlist-expanded"
        aria-labelledby="expanded-wordlist-title"
        role="region"
      >
        <!-- Sharing Section -->
        <div class="expanded-section">
          <h2 id="expanded-wordlist-title" class="expanded-title">Share with Students</h2>
          <ShareWordlistButton
            :wordlist-id="expandedWordlist.id"
            :initial-share-token="expandedWordlist.share_token"
            :initial-is-shared="expandedWordlist.is_shared || false"
            @share-enabled="handleShareEnabled(expandedWordlist.id, $event)"
            @share-disabled="handleShareDisabled(expandedWordlist.id)"
          />
        </div>

        <!-- Word Pairs Section -->
        <div class="expanded-section">
          <h3 class="expanded-title">Word Pairs</h3>
          <div class="expanded-table-container">
            <table class="expanded-table" aria-label="Word pairs in this wordlist">
              <caption class="sr-only">English to Mandarin word translations</caption>
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
      </section>
    </Transition>

    <!-- Delete Confirmation Modal with proper ARIA (Requirement 13.2) -->
    <div 
      v-if="showDeleteConfirm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
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
            <h2 id="delete-dialog-title" class="text-[18px] font-semibold text-black" style="letter-spacing: -0.01em;">Delete Wordlist</h2>
            <p id="delete-dialog-description" class="mt-2 text-[15px] text-gray-600 leading-relaxed" style="letter-spacing: -0.005em; line-height: 1.6;">
              Are you sure you want to delete "<span class="font-medium text-black">{{ deleteTarget?.filename }}</span>"? This action cannot be undone.
            </p>
          </div>
        </div>
        <div class="mt-8 flex gap-3">
          <button
            type="button"
            @click="cancelDelete"
            :disabled="deletingId !== null"
            :aria-disabled="deletingId !== null"
            aria-label="Cancel deletion"
            class="flex-1 h-11 px-6 text-[15px] font-semibold text-black bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style="letter-spacing: -0.01em;"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleDelete"
            :disabled="deletingId !== null"
            :aria-disabled="deletingId !== null"
            :aria-busy="deletingId !== null"
            :aria-label="deletingId !== null ? 'Deleting wordlist' : 'Confirm deletion'"
            class="flex-1 h-11 px-6 text-[15px] font-semibold text-white bg-red-600 border border-transparent rounded-full hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style="letter-spacing: -0.01em;"
          >
            <span v-if="deletingId !== null" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
            <span>{{ deletingId !== null ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch, h, defineAsyncComponent } from 'vue'
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
const ShareWordlistButton = defineAsyncComponent(() => import('@/components/sharing/ShareWordlistButton.vue'))

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
const downloadMenuOpen = ref<string | null>(null)

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
    width: '35%',
  },
  {
    key: 'createdAt',
    label: 'Date',
    align: 'left' as const,
    width: '20%',
    render: (value: Date) => h('span', { class: 'table-date' }, formatDate(value)),
  },
  {
    key: 'wordCount',
    label: 'Word Count',
    align: 'center' as const,
    width: '15%',
    render: (value: number) => h('span', { class: 'table-word-count' }, `${value}`),
  },
  {
    key: 'is_shared',
    label: 'Status',
    align: 'center' as const,
    width: '15%',
    render: (value: boolean) => {
      if (value) {
        return h('span', { 
          class: 'share-status-badge share-status-active',
          title: 'This wordlist is shared with students'
        }, [
          h('svg', {
            class: 'w-3 h-3',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          }, [
            h('path', {
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': '2',
              d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
            })
          ]),
          'Shared'
        ])
      }
      return h('span', { 
        class: 'share-status-badge share-status-inactive'
      }, 'Not Shared')
    },
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
  
  // Close download menu when clicking outside
  document.addEventListener('click', closeDownloadMenu)
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('click', closeDownloadMenu)
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

/**
 * Toggle download menu
 */
function toggleDownloadMenu(id: string) {
  downloadMenuOpen.value = downloadMenuOpen.value === id ? null : id
}

/**
 * Close download menu when clicking outside
 */
function closeDownloadMenu() {
  downloadMenuOpen.value = null
}

/**
 * Handle download wordlist (CSV)
 */
async function handleDownloadWordlist(wordlist: WordlistRecord) {
  closeDownloadMenu()
  exportingId.value = wordlist.id
  await downloadWordlist(wordlist)
  exportingId.value = null
}

/**
 * Handle download practice questions (HTML)
 */
async function handleDownloadPractice(wordlist: WordlistRecord) {
  closeDownloadMenu()
  if (wordlist.wordCount < 4) {
    showToast('Need at least 4 words to generate practice questions', 'error')
    return
  }
  
  try {
    showToast('Generating practice questions...', 'info')
    // Convert Date to string for service compatibility
    const wordlistForService = {
      ...wordlist,
      createdAt: wordlist.createdAt.toISOString(),
      shared_at: wordlist.shared_at?.toISOString(),
    }
    await generateAndDownload(wordlistForService)
    showToast('Practice questions downloaded successfully!', 'success')
  } catch (error) {
    console.error('Error generating practice questions:', error)
    showToast('Failed to generate practice questions. Please try again.', 'error')
  }
}

/**
 * Handle share enabled event
 */
function handleShareEnabled(wordlistId: string, shareToken: string) {
  // Update the wordlist in the state to reflect the new share status
  const wordlist = wordlists.value.find(w => w.id === wordlistId)
  if (wordlist) {
    wordlist.is_shared = true
    wordlist.share_token = shareToken
  }
}

/**
 * Handle share disabled event
 */
function handleShareDisabled(wordlistId: string) {
  // Update the wordlist in the state to reflect the disabled share status
  const wordlist = wordlists.value.find(w => w.id === wordlistId)
  if (wordlist) {
    wordlist.is_shared = false
    wordlist.share_token = undefined
  }
}


</script>

<style scoped>
/* Mobile-first Responsive Design - ElevenLabs Styling */
/* Page Container and Header - using global .page-container, .page-header, .page-title, .page-subtitle */

/* Search Container */
.search-container {
  position: relative;
  max-width: 100%;
}

@media (min-width: 768px) {
  .search-container {
    max-width: 400px;
  }
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  padding-right: 48px;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: -0.01em;
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(229, 229, 229);
  border-radius: 8px;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 767px) {
  .search-input {
    min-height: 44px;
    font-size: 16px;
  }
}

.search-input:focus {
  outline: none;
  border-color: rgb(0, 0, 0);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: rgb(163, 163, 163);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: rgb(163, 163, 163);
  pointer-events: none;
}

/* Custom Empty State - ElevenLabs styling */
.custom-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 24px;
  background: rgb(250, 250, 250);
  border-radius: 12px;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: rgb(229, 229, 229);
  margin-bottom: 32px;
  opacity: 0;
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) 100ms forwards;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: rgb(0, 0, 0);
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0 0 8px 0;
  opacity: 0;
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) 200ms forwards;
}

.empty-description {
  font-size: 18px;
  font-weight: 400;
  color: rgb(115, 115, 115);
  line-height: 1.6;
  letter-spacing: -0.005em;
  margin: 0 0 32px 0;
  text-align: center;
  opacity: 0;
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) 300ms forwards;
}

.empty-action-button {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 32px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(255, 255, 255);
  background: rgb(0, 0, 0);
  border-radius: 9999px;
  text-decoration: none;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) 400ms forwards;
}

.empty-action-button:hover {
  background: rgb(38, 38, 38);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.empty-action-button:active {
  transform: scale(0.98);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Error State - ElevenLabs styling */
.custom-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 24px;
  background: rgb(250, 250, 250);
  border-radius: 12px;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: rgb(220, 38, 38);
  margin-bottom: 24px;
}

.error-title {
  font-size: 18px;
  font-weight: 700;
  color: rgb(220, 38, 38);
  letter-spacing: -0.01em;
  margin: 0 0 8px 0;
}

.error-description {
  font-size: 14px;
  font-weight: 400;
  color: rgb(115, 115, 115);
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

/* Table Action Buttons - ElevenLabs Style */
.table-action-buttons {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  align-items: center;
}

/* Action Icon Buttons - ElevenLabs exact styling */
.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6B7280;
  cursor: pointer;
  transition: all 150ms ease;
}

.action-icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #111827;
}

.action-icon-btn:active {
  transform: scale(0.95);
}

.action-icon-btn-danger:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #DC2626;
}

.action-icon-btn:focus-visible {
  outline: 2px solid #000;
  outline-offset: 2px;
}

/* Download Dropdown Container */
.download-dropdown-container {
  position: relative;
}

/* Download Dropdown Menu */
.download-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 220px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 50;
}

/* Download Menu Item */
.download-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 400;
  color: #111827;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
}

.download-menu-item:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.download-menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.download-menu-item svg {
  flex-shrink: 0;
  color: #6B7280;
}

.download-menu-item span {
  flex: 1;
}

.menu-item-note {
  font-size: 12px;
  color: #6B7280;
  font-style: italic;
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Table Cell Styling - ElevenLabs typography */
:deep(.table-date) {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  letter-spacing: -0.005em;
}

/* Word Count - Plain gray text, NO background (ElevenLabs exact) */
:deep(.table-word-count) {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  letter-spacing: -0.005em;
}

/* Share Status Badge - Subtle ElevenLabs styling */
:deep(.share-status-badge) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  border-radius: 6px;
  transition: all 150ms ease;
}

:deep(.share-status-active) {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  border: 1px solid rgba(5, 150, 105, 0.2);
}

:deep(.share-status-active:hover) {
  background: rgba(5, 150, 105, 0.15);
  border-color: rgba(5, 150, 105, 0.3);
}

:deep(.share-status-active svg) {
  width: 12px;
  height: 12px;
  color: #059669;
}

:deep(.share-status-inactive) {
  color: #6B7280;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.share-status-inactive:hover) {
  background: rgba(0, 0, 0, 0.02);
}

/* Expanded Wordlist View - ElevenLabs card styling */
.wordlist-expanded {
  margin-top: 32px;
  padding: 32px;
  background: rgb(250, 250, 250);
  border: 1px solid rgb(242, 242, 242);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.wordlist-expanded:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.expanded-section {
  margin-bottom: 32px;
}

.expanded-section:last-child {
  margin-bottom: 0;
}

.expanded-title {
  font-size: 12px;
  font-weight: 700;
  color: rgb(115, 115, 115);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 16px 0;
}

.expanded-table-container {
  background: rgb(255, 255, 255);
  border: 1px solid rgb(242, 242, 242);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.expanded-table {
  width: 100%;
  border-collapse: collapse;
}

.expanded-table-header {
  background: rgb(250, 250, 250);
  border-bottom: 1px solid rgb(242, 242, 242);
}

.expanded-table-header-cell {
  padding: 16px 24px;
  font-size: 12px;
  font-weight: 700;
  color: rgb(115, 115, 115);
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.expanded-table-row {
  border-bottom: 1px solid rgb(245, 245, 245);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded-table-row:last-child {
  border-bottom: none;
}

.expanded-table-row:hover {
  background: rgb(250, 250, 250);
  transform: translateX(4px);
}

.expanded-table-cell {
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 400;
  color: rgb(0, 0, 0);
  letter-spacing: -0.005em;
  line-height: 1.6;
}

.expanded-table-cell:first-child {
  font-weight: 700;
}

.expanded-table-cell:last-child {
  color: rgb(64, 64, 64);
}

/* Expand transition styles */
.expand-enter-active,
.expand-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Screen reader only class for accessibility (Requirement 13.2) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Ensure elements are visible by default (for reduced motion users) */
@media (prefers-reduced-motion: reduce) {
  .wordlist-expanded,
  .expanded-table-row,
  .empty-icon,
  .empty-title,
  .empty-description,
  .empty-action-button {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }
  
  .custom-empty-state,
  .wordlist-expanded,
  .expanded-table-row,
  .empty-action-button,
  :deep(.table-word-count),
  :deep(.share-status-badge) {
    transition: none !important;
  }
}
</style>

