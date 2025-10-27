<template>
  <div class="result-page">
    <!-- Header Section (Subtask 6.1) - Responsive (Task 8.3) -->
    <div data-animate-child class="result-header">
      <!-- Small uppercase label -->
      <div class="result-label">
        WORDLIST RESULT
      </div>
      
      <!-- H1 title -->
      <h1 class="result-title">Wordlist Result</h1>
      
      <!-- Metadata row with filename and word count badge -->
      <div class="result-metadata">
        <span v-if="filename" class="result-filename">{{ filename }}</span>
        <!-- Black pill badge with white text -->
        <span class="result-badge">
          {{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}
        </span>
      </div>
    </div>

    <!-- Warning Banner for Partial Failures (Task 7) -->
    <div v-if="warnings.length > 0" data-animate-child class="warning-banner">
      <div class="warning-icon">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div class="warning-content">
        <p class="warning-title">Partial Results</p>
        <p class="warning-message">{{ warnings[0] }}</p>
        <!-- Show chunk summary if available -->
        <p v-if="chunkSummary" class="warning-details">{{ chunkSummary }}</p>
      </div>
    </div>

    <!-- Loading Skeleton (Task 11.2) -->
    <div v-if="isProcessing" class="table-container">
      <WordlistTableSkeleton :rows="8" />
    </div>

    <!-- Wordlist Table (Subtasks 6.2 & 6.3) - Responsive with horizontal scroll (Task 8.3) -->
    <div v-else-if="wordPairs && wordPairs.length > 0" data-animate-child class="table-container">
      <!-- Wrapper for horizontal scroll with shadow indicators (Task 8.3) -->
      <div class="table-scroll-wrapper">
        <div class="table-wrapper">
          <table class="wordlist-table">
            <!-- Header row with uppercase labels -->
            <thead>
              <tr class="table-header-row">
                <th scope="col" class="table-header-cell">
                  English
                </th>
                <th scope="col" class="table-header-cell">
                  Mandarin
                </th>
              </tr>
            </thead>
            <!-- Clean row styling with subtle hover effects -->
            <tbody class="table-body">
              <tr 
                v-for="(pair, index) in wordPairs" 
                :key="`${pair.en}-${index}`" 
                class="table-row"
              >
                <!-- English words: medium weight black text, responsive sizing (Task 8.3) -->
                <td class="table-cell table-cell-english">
                  {{ pair.en }}
                </td>
                <!-- Mandarin translations: regular weight dark gray text -->
                <td class="table-cell table-cell-mandarin">
                  {{ pair.zh }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State - Responsive (Task 8.3) -->
    <div v-else class="empty-state">
      <!-- Simple icon -->
      <div class="empty-state-icon">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="empty-state-title">No words found</p>
      <p class="empty-state-subtitle">This document didn't contain any extractable vocabulary.</p>
    </div>

    <!-- Action Buttons (Subtask 6.4) - Responsive stacked layout (Task 8.3) -->
    <div data-animate-child class="action-buttons">
      <!-- Black pill "Save" button with icon -->
      <button 
        @click="saveList"
        :disabled="wordPairs.length === 0 || isSaving"
        class="action-button action-button-primary"
      >
        <!-- Save icon (16px) -->
        <svg v-if="!isSaving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        <span v-if="isSaving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
      </button>
      
      <!-- Outlined "Export" button with icon -->
      <button 
        @click="exportCSV"
        :disabled="wordPairs.length === 0 || isExporting"
        class="action-button action-button-secondary"
      >
        <!-- Export icon (16px) -->
        <svg v-if="!isExporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span v-if="isExporting" class="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
        <span>{{ isExporting ? 'Exporting...' : 'Export' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import uploadState, { isProcessing } from '@/state/uploadState'
import { useWordlist } from '@/composables/useWordlist'
import { exportWordlist, downloadBlob, type WordlistRecord } from '@/services/wordlistService'
import WordlistTableSkeleton from '@/components/ui/WordlistTableSkeleton.vue'

const wordPairs = computed(() => uploadState.currentResult || [])
const filename = computed(() => uploadState.currentFile?.name || 'Unknown Document')
const wordCount = computed(() => wordPairs.value.length)

// Warning display for partial failures (Task 7)
const warnings = computed(() => uploadState.warnings || [])
const chunkSummary = computed(() => {
  if (!uploadState.chunkingMetadata) return null
  
  const { successfulChunks, failedChunks, totalChunks } = uploadState.chunkingMetadata
  
  if (failedChunks > 0) {
    return `${failedChunks} of ${totalChunks} sections could not be processed`
  }
  
  return null
})

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

<style scoped>
/* Mobile-first Responsive Design (Task 8.3) */

/* Page Container - Aligned with UploadPage styling */
.result-page {
  max-width: 752px;
  margin: 0 auto;
  padding: 64px 20px 20px;
  background-color: #FFFFFF;
  min-height: 100vh;
}

@media (max-width: 767px) {
  .result-page {
    padding: 24px 16px 16px;
  }
}

/* Header Section - Responsive (Task 8.3) */
.result-header {
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .result-header {
    margin-bottom: 40px;
  }
}

/* Warning Banner for Partial Failures (Task 7) */
.warning-banner {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 12px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .warning-banner {
    padding: 20px;
    margin-bottom: 32px;
  }
}

.warning-icon {
  flex-shrink: 0;
  color: #D97706;
}

.warning-content {
  flex: 1;
  min-width: 0;
}

.warning-title {
  font-size: 14px;
  font-weight: 600;
  color: #92400E;
  margin-bottom: 4px;
  letter-spacing: 0;
}

.warning-message {
  font-size: 14px;
  font-weight: 400;
  color: #78350F;
  margin-bottom: 4px;
  letter-spacing: 0;
}

.warning-details {
  font-size: 13px;
  font-weight: 400;
  color: #92400E;
  letter-spacing: 0;
}

.result-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

@media (min-width: 768px) {
  .result-label {
    margin-bottom: 12px;
  }
}

.result-title {
  font-size: 30px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
  line-height: 1.2;
  letter-spacing: 0;
}

.result-metadata {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .result-metadata {
    gap: 12px;
  }
}

.result-filename {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  word-break: break-word;
  letter-spacing: 0;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background-color: #000000;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  white-space: nowrap;
  letter-spacing: 0;
}

/* Table Container with Horizontal Scroll (Task 8.3) */
.table-container {
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .table-container {
    margin-bottom: 32px;
  }
}

/* Scroll wrapper with shadow indicators (Task 8.3) */
.table-scroll-wrapper {
  position: relative;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  
  /* Shadow indicators for scrollable content */
  background:
    linear-gradient(to right, white 30%, rgba(255,255,255,0)),
    linear-gradient(to right, rgba(255,255,255,0), white 70%) 0 100%,
    radial-gradient(farthest-side at 0% 50%, rgba(0,0,0,.1), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,.1), rgba(0,0,0,0)) 0 100%;
  background-repeat: no-repeat;
  background-color: white;
  background-size: 40px 100%, 40px 100%, 14px 100%, 14px 100%;
  background-attachment: local, local, scroll, scroll;
}

.table-wrapper {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
  min-width: 100%;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Table Styles - Responsive (Task 8.3) */
.wordlist-table {
  width: 100%;
  min-width: 500px; /* Ensures table doesn't get too cramped on mobile */
  border-collapse: collapse;
}

@media (min-width: 768px) {
  .wordlist-table {
    min-width: 100%;
  }
}

.table-header-row {
  background-color: #ffffff;
  border-bottom: 1px solid #f9fafb;
}

.table-header-cell {
  padding: 12px 16px;
  text-align: left;
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (min-width: 768px) {
  .table-header-cell {
    padding: 14px 20px;
    font-size: 11px;
  }
}

@media (min-width: 1024px) {
  .table-header-cell {
    padding: 16px 20px;
  }
}

.table-body {
  background-color: #ffffff;
}

.table-row {
  border-bottom: 1px solid #f9fafb;
  transition: background-color 150ms ease-out;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #fafafa;
}

.table-cell {
  padding: 12px 16px;
  line-height: 1.6;
}

@media (min-width: 768px) {
  .table-cell {
    padding: 14px 20px;
  }
}

@media (min-width: 1024px) {
  .table-cell {
    padding: 16px 20px;
  }
}

.table-cell-english {
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  letter-spacing: 0;
}

.table-cell-mandarin {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  letter-spacing: 0;
}

/* Empty State - Responsive (Task 8.3) */
.empty-state {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  padding: 48px 24px;
  text-align: center;
}

@media (min-width: 768px) {
  .empty-state {
    border-radius: 16px;
    padding: 64px 32px;
  }
}

@media (min-width: 1024px) {
  .empty-state {
    padding: 80px 32px;
  }
}

.empty-state-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 8px;
}

@media (min-width: 768px) {
  .empty-state-title {
    font-size: 20px;
  }
}

.empty-state-subtitle {
  font-size: 13px;
  color: #6b7280;
}

@media (min-width: 768px) {
  .empty-state-subtitle {
    font-size: 14px;
  }
}

/* Action Buttons - Responsive stacked layout (Task 8.3) */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

@media (min-width: 768px) {
  .action-buttons {
    flex-direction: row;
    align-items: center;
    margin-top: 32px;
  }
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 150ms ease-out;
  cursor: pointer;
  letter-spacing: 0;
}

@media (max-width: 767px) {
  .action-button {
    width: 100%;
    min-height: 44px;
  }
}

.action-button-primary {
  background-color: #000000;
  color: #ffffff;
  border: none;
}

.action-button-primary:hover:not(:disabled) {
  background-color: #1a1a1a;
}

.action-button-primary:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.action-button-secondary {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #d1d5db;
}

.action-button-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
}

.action-button-secondary:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>

