<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Wordlist Result</h1>
      <div class="flex items-center gap-4 text-sm text-gray-600">
        <span v-if="filename" class="font-medium">{{ filename }}</span>
        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">
          {{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}
        </span>
      </div>
    </div>

    <!-- Wordlist Table -->
    <div v-if="wordPairs && wordPairs.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
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
          <tr v-for="(pair, index) in wordPairs" :key="`${pair.en}-${index}`" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ pair.en }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {{ pair.zh }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-gray-50 rounded-lg p-8 text-center">
      <p class="text-gray-500">No words found in the result.</p>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-4">
      <button 
        @click="saveList"
        :disabled="wordPairs.length === 0 || isSaving"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <span v-if="isSaving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ isSaving ? 'Saving...' : 'Save to My Wordlists' }}</span>
      </button>
      
      <button 
        @click="exportCSV"
        :disabled="wordPairs.length === 0 || isExporting"
        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <span v-if="isExporting" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ isExporting ? 'Exporting...' : 'Export as CSV' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import uploadState from '@/state/uploadState'
import { useWordlist } from '@/composables/useWordlist'
import { exportWordlist, downloadBlob, type WordlistRecord } from '@/services/wordlistService'

const wordPairs = computed(() => uploadState.currentResult || [])
const filename = computed(() => uploadState.currentFile?.name || 'Unknown Document')
const wordCount = computed(() => wordPairs.value.length)

const { saveCurrentWordlist } = useWordlist()

const isExporting = ref(false)
const isSaving = ref(false)

async function saveList() {
  if (wordPairs.value.length === 0 || isSaving.value) {
    return
  }

  isSaving.value = true

  try {
    const documentType = getDocumentType(filename.value)
    await saveCurrentWordlist(
      filename.value,
      documentType,
      wordPairs.value
    )
  } catch (error) {
    console.error('Save error:', error)
  } finally {
    isSaving.value = false
  }
}

async function exportCSV() {
  if (wordPairs.value.length === 0 || isExporting.value) {
    return
  }

  isExporting.value = true

  try {
    // Create a temporary wordlist record for export
    const tempWordlist: WordlistRecord = {
      id: crypto.randomUUID(),
      filename: filename.value,
      documentType: getDocumentType(filename.value),
      wordCount: wordPairs.value.length,
      words: wordPairs.value,
      createdAt: new Date().toISOString()
    }

    // Export the wordlist as CSV
    const blob = await exportWordlist(tempWordlist)
    
    // Generate filename
    const baseFilename = filename.value.replace(/\.[^/.]+$/, '') // Remove original extension
    const downloadFilename = `${baseFilename}_wordlist.csv`
    
    // Trigger download
    downloadBlob(blob, downloadFilename)
  } catch (error) {
    console.error('Export error:', error)
  } finally {
    isExporting.value = false
  }
}

function getDocumentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension || 'unknown'
}
</script>

