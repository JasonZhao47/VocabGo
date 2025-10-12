<template>
  <Modal
    :model-value="modelValue"
    title="Share Practice Set"
    size="medium"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="share-modal-content">
      <!-- Loading State -->
      <div v-if="isGenerating" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Generating share link...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="error-message">{{ error }}</p>
        <button @click="generateShareUrl" class="btn-retry">
          Try Again
        </button>
      </div>

      <!-- Share Options -->
      <div v-else-if="shareUrl" class="share-options">
        <p class="share-description">
          Share this practice set with others. They can access it without signing in.
        </p>

        <!-- Share URL Section -->
        <div class="share-section">
          <label class="share-label">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Share Link</span>
          </label>
          
          <div class="input-group">
            <input
              ref="urlInputRef"
              type="text"
              :value="fullUrl"
              readonly
              class="share-input"
              @focus="(e) => (e.target as HTMLInputElement).select()"
            />
            <button
              @click="copyUrl"
              class="btn-copy"
              :class="{ 'btn-copy-success': urlCopied }"
            >
              <svg v-if="!urlCopied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ urlCopied ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>
        </div>

        <!-- HTML Export Section -->
        <div class="share-section">
          <label class="share-label">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>HTML Export</span>
          </label>
          
          <p class="share-hint">
            Download a standalone HTML file that works offline
          </p>
          
          <button
            @click="downloadHtml"
            class="btn-download"
            :disabled="isDownloading"
          >
            <svg v-if="!isDownloading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <div v-else class="loading-spinner-small"></div>
            <span>{{ isDownloading ? 'Generating...' : 'Download HTML' }}</span>
          </button>
        </div>

        <!-- Share Management -->
        <div class="share-management">
          <div class="management-info">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="management-text">
              This link will remain active until you delete it
            </span>
          </div>
          
          <button
            @click="confirmDelete"
            class="btn-delete"
            :disabled="isDeleting"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>{{ isDeleting ? 'Deleting...' : 'Delete Share Link' }}</span>
          </button>
        </div>
      </div>

      <!-- Initial State - Generate Button -->
      <div v-else class="initial-state">
        <div class="initial-icon">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>
        <h3 class="initial-title">Share Your Practice Set</h3>
        <p class="initial-description">
          Generate a shareable link or download an HTML file that works offline
        </p>
        <button @click="generateShareUrl" class="btn-generate">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Generate Share Link</span>
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="showDeleteConfirm"
      title="Delete Share Link?"
      size="small"
    >
      <p class="text-gray-600 mb-4">
        This will permanently delete the share link. Anyone with the link will no longer be able to access this practice set.
      </p>
      
      <template #footer>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteConfirm = false"
            class="btn-cancel"
          >
            Cancel
          </button>
          <button
            @click="deleteShareLink"
            class="btn-confirm-delete"
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Link' }}
          </button>
        </div>
      </template>
    </Modal>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { sharePracticeSet, unsharePracticeSet } from '@/services/practiceShareService'
import { generateStaticHtml } from '@/services/htmlGenerationService'
import type { Question } from '@/types/practice'

interface Props {
  modelValue: boolean
  practiceSetId: string
  questions: Question[]
  wordlistName: string
  existingShareUrl?: string | null
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'share-created', shareUrl: string): void
  (e: 'share-deleted'): void
}

const emit = defineEmits<Emits>()

// State
const shareUrl = ref<string | null>(props.existingShareUrl || null)
const isGenerating = ref(false)
const isDownloading = ref(false)
const isDeleting = ref(false)
const error = ref<string | null>(null)
const urlCopied = ref(false)
const showDeleteConfirm = ref(false)
const urlInputRef = ref<HTMLInputElement>()

// Computed
const fullUrl = computed(() => {
  if (!shareUrl.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/practice/shared/${shareUrl.value}`
})

// Methods
async function generateShareUrl() {
  isGenerating.value = true
  error.value = null

  try {
    const response = await sharePracticeSet(props.practiceSetId)
    shareUrl.value = response.shareUrl
    emit('share-created', response.shareUrl)
  } catch (err) {
    console.error('Failed to generate share URL:', err)
    error.value = err instanceof Error ? err.message : 'Failed to generate share link'
  } finally {
    isGenerating.value = false
  }
}

async function copyUrl() {
  if (!fullUrl.value) return

  try {
    await navigator.clipboard.writeText(fullUrl.value)
    urlCopied.value = true
    
    // Reset after 2 seconds
    setTimeout(() => {
      urlCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy URL:', err)
    // Fallback: select the text
    urlInputRef.value?.select()
  }
}

async function downloadHtml() {
  isDownloading.value = true

  try {
    const html = generateStaticHtml({
      questions: props.questions,
      wordlistName: props.wordlistName,
      shareUrl: shareUrl.value || undefined,
    })

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `practice-${props.wordlistName.replace(/\s+/g, '-').toLowerCase()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download HTML:', err)
    error.value = 'Failed to generate HTML file'
  } finally {
    isDownloading.value = false
  }
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

async function deleteShareLink() {
  isDeleting.value = true

  try {
    await unsharePracticeSet(props.practiceSetId)
    shareUrl.value = null
    showDeleteConfirm.value = false
    emit('share-deleted')
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Failed to delete share link:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete share link'
  } finally {
    isDeleting.value = false
  }
}

// Watch for existing share URL changes
watch(() => props.existingShareUrl, (newUrl) => {
  shareUrl.value = newUrl || null
})

// Reset state when modal closes
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    urlCopied.value = false
    error.value = null
  }
})
</script>

<style scoped>
.share-modal-content {
  min-height: 200px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #6b7280;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fef2f2;
  border-radius: 12px;
  color: #ef4444;
  margin-bottom: 16px;
}

.error-message {
  font-size: 14px;
  color: #dc2626;
  margin-bottom: 16px;
}

.btn-retry {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: #000000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms ease-out;
}

.btn-retry:hover {
  background: #1f2937;
}

/* Initial State */
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}

.initial-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 16px;
  color: #374151;
  margin-bottom: 20px;
}

.initial-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
}

.initial-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
  max-width: 320px;
}

.btn-generate {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  background: #000000;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-generate:hover {
  background: #1f2937;
  transform: translateY(-1px);
}

/* Share Options */
.share-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.share-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.share-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.share-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
}

.share-hint {
  font-size: 13px;
  color: #6b7280;
}

.input-group {
  display: flex;
  gap: 8px;
}

.share-input {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  font-family: 'Monaco', 'Courier New', monospace;
  color: #374151;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: all 150ms ease-out;
}

.share-input:focus {
  background: #ffffff;
  border-color: #000000;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-copy-success {
  color: #059669;
  border-color: #10b981;
  background: #ecfdf5;
}

.btn-copy-success:hover {
  background: #d1fae5;
}

.btn-download {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-download:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Share Management */
.share-management {
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.management-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.management-text {
  font-size: 13px;
  color: #6b7280;
}

.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  background: #ffffff;
  border: 2px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-delete:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #ef4444;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Delete Confirmation Modal */
.btn-cancel {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-confirm-delete {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: #dc2626;
  border: 2px solid #dc2626;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-confirm-delete:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.btn-confirm-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .input-group {
    flex-direction: column;
  }

  .btn-copy {
    justify-content: center;
  }
}
</style>
