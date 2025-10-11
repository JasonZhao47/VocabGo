<template>
  <div class="wordlists-page">
    <!-- Header with ElevenLabs styling - Responsive (Task 8.3) -->
    <div class="wordlists-header">
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

    <!-- Loading State with Skeletons (Task 11.2) -->
    <div v-if="isLoading" class="wordlists-grid">
      <WordlistCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading wordlists</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasWordlists" class="text-center py-20">
      <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-6 text-[20px] font-semibold text-black">No saved wordlists</h3>
      <p class="mt-2 text-[15px] text-gray-500">Upload a document to create your first wordlist</p>
      <router-link 
        to="/upload" 
        class="mt-8 inline-flex items-center h-11 px-6 text-[15px] font-semibold text-white bg-black rounded-full hover:bg-gray-800 transition-colors duration-150"
      >
        Upload Document
      </router-link>
    </div>

    <!-- No Search Results -->
    <div v-else-if="!hasFilteredWordlists" class="text-center py-20">
      <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 class="mt-6 text-[20px] font-semibold text-black">No wordlists found</h3>
      <p class="mt-2 text-[15px] text-gray-500">Try adjusting your search query</p>
    </div>

    <!-- Wordlists Grid with ElevenLabs styling - Responsive (Task 8.3) -->
    <div v-else class="wordlists-grid page-enter-stagger-2">
      <div 
        v-for="wordlist in filteredWordlists" 
        :key="wordlist.id"
        class="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 ease-out"
      >
        <!-- Card Content -->
        <div class="p-6">
          <!-- Filename -->
          <h3 class="text-[18px] font-semibold text-black mb-3 truncate" :title="wordlist.filename">
            {{ wordlist.filename }}
          </h3>
          
          <!-- Metadata Row -->
          <div class="flex items-center gap-4 mb-4">
            <!-- Document Type Badge -->
            <span class="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
              {{ getFileExtension(wordlist.filename) }}
            </span>
            
            <!-- Word Count -->
            <span class="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-black text-white">
              {{ wordlist.wordCount }} words
            </span>
          </div>
          
          <!-- Date -->
          <div class="flex items-center text-[13px] text-gray-500 mb-6">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDate(wordlist.createdAt) }}
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-col gap-2">
            <!-- View Button (Primary) -->
            <button
              @click="toggleExpanded(wordlist.id)"
              class="w-full h-10 px-4 text-[14px] font-semibold text-white bg-black rounded-full hover:bg-gray-800 transition-colors duration-150 flex items-center justify-center gap-2"
              :aria-expanded="expandedWordlistId === wordlist.id"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ expandedWordlistId === wordlist.id ? 'Hide' : 'View' }}
            </button>
            
            <!-- Secondary Actions Row -->
            <div class="flex gap-2">
              <!-- Export Button (Secondary) -->
              <button
                @click.stop="handleExport(wordlist)"
                :disabled="exportingId === wordlist.id"
                class="flex-1 h-10 px-4 text-[14px] font-semibold text-black bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title="Export as CSV"
              >
                <span v-if="exportingId === wordlist.id" class="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span class="hidden sm:inline">Export</span>
              </button>
              
              <!-- Delete Button (Ghost) -->
              <button
                @click.stop="confirmDelete(wordlist.id, wordlist.filename)"
                :disabled="deletingId === wordlist.id"
                class="flex-1 h-10 px-4 text-[14px] font-semibold text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title="Delete wordlist"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span class="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Expanded Wordlist View -->
        <div 
          v-if="expandedWordlistId === wordlist.id"
          class="border-t border-gray-100 bg-gray-50 p-6"
        >
          <h4 class="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-4">Word Pairs</h4>
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-100">
                  <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    English
                  </th>
                  <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Mandarin
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pair, index) in wordlist.words" :key="index" class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-5 py-4 text-[15px] font-medium text-black">
                    {{ pair.en }}
                  </td>
                  <td class="px-5 py-4 text-[15px] text-gray-800">
                    {{ pair.zh }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted } from 'vue'
import { useWordlist } from '@/composables/useWordlist'
import type { WordlistRecord } from '@/state/wordlistsState'
import WordlistCardSkeleton from '@/components/ui/WordlistCardSkeleton.vue'

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

// Local state for UI interactions
const searchQuery = ref('')
const expandedWordlistId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ id: string; filename: string } | null>(null)
const exportingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

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

// Load wordlists on mount
onMounted(async () => {
  await loadWordlists()
})

/**
 * Toggle expanded view for a wordlist
 */
function toggleExpanded(id: string) {
  expandedWordlistId.value = expandedWordlistId.value === id ? null : id
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

  deletingId.value = deleteTarget.value.id
  const success = await removeWordlist(deleteTarget.value.id)
  deletingId.value = null
  
  if (success) {
    // Close expanded view if this wordlist was expanded
    if (expandedWordlistId.value === deleteTarget.value.id) {
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
/* Mobile-first Responsive Design (Task 8.3) */

/* Page Container - Mobile (0-767px) */
.wordlists-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 16px;
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

/* Header Section - Responsive (Task 8.3) */
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

/* Search Container - Responsive (Task 8.3) */
.search-container {
  position: relative;
  max-width: 100%;
}

@media (min-width: 768px) {
  .search-container {
    max-width: 28rem; /* 448px */
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
  min-height: 44px; /* Touch-friendly (Task 8.3) */
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

/* Wordlists Grid - Responsive card layout (Task 8.3) */
.wordlists-grid {
  display: grid;
  grid-template-columns: 1fr; /* 1 column on mobile */
  gap: 16px;
}

@media (min-width: 768px) {
  .wordlists-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on tablet */
    gap: 20px;
  }
}

@media (min-width: 1024px) {
  .wordlists-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 columns on desktop */
    gap: 24px;
  }
}

/* Mobile-optimized typography and spacing (Task 8.3) */
@media (max-width: 767px) {
  /* Adjust card padding for mobile */
  .wordlists-grid :deep(.bg-white) {
    padding: 20px;
  }
  
  /* Adjust font sizes for mobile */
  .wordlists-grid :deep(h3) {
    font-size: 16px;
  }
  
  /* Adjust button sizes for mobile */
  .wordlists-grid :deep(button) {
    min-height: 44px; /* Touch-friendly */
    font-size: 14px;
  }
  
  /* Stack action buttons on very small screens */
  .wordlists-grid :deep(.flex.gap-2) {
    flex-direction: column;
    gap: 8px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet-specific adjustments */
  .wordlists-grid :deep(h3) {
    font-size: 17px;
  }
}
</style>

