<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Saved Wordlists</h1>
      <p class="text-gray-600">Manage your saved vocabulary lists</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading wordlists...</span>
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
    <div v-else-if="!hasWordlists" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No saved wordlists</h3>
      <p class="mt-2 text-gray-600">Upload a document to create your first wordlist</p>
      <router-link 
        to="/upload" 
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Upload Document
      </router-link>
    </div>

    <!-- Wordlists List -->
    <div v-else class="space-y-4">
      <div 
        v-for="wordlist in wordlists" 
        :key="wordlist.id"
        class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <!-- Wordlist Header -->
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 truncate">
                {{ wordlist.filename }}
              </h3>
              <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                  </svg>
                  {{ wordlist.wordCount }} words
                </span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  {{ formatDate(wordlist.createdAt) }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="ml-4 flex items-center space-x-2">
              <button
                @click="toggleExpanded(wordlist.id)"
                class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :aria-expanded="expandedWordlistId === wordlist.id"
              >
                {{ expandedWordlistId === wordlist.id ? 'Hide' : 'View' }}
              </button>
              <button
                @click="handleExport(wordlist)"
                :disabled="exportingId === wordlist.id"
                class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                title="Export as CSV"
              >
                <span v-if="exportingId === wordlist.id" class="inline-block w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></span>
                <span>Export CSV</span>
              </button>
              <button
                @click="confirmDelete(wordlist.id, wordlist.filename)"
                :disabled="deletingId === wordlist.id"
                class="px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete wordlist"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Expanded Wordlist View -->
        <div 
          v-if="expandedWordlistId === wordlist.id"
          class="border-t border-gray-200 bg-gray-50 p-6"
        >
          <h4 class="text-sm font-medium text-gray-900 mb-4">Word Pairs</h4>
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    English
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mandarin
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(pair, index) in wordlist.words" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ pair.en }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ pair.zh }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
      @click.self="cancelDelete"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-medium text-gray-900">Delete Wordlist</h3>
            <p class="mt-2 text-sm text-gray-500">
              Are you sure you want to delete "{{ deleteTarget?.filename }}"? This action cannot be undone.
            </p>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="cancelDelete"
            :disabled="deletingId !== null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            :disabled="deletingId !== null"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
import { ref, onMounted } from 'vue'
import { useWordlist } from '@/composables/useWordlist'
import type { WordlistRecord } from '@/state/wordlistsState'

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
const expandedWordlistId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ id: string; filename: string } | null>(null)
const exportingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

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

