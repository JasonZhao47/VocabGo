<template>
  <div class="upload-page">
    <div class="upload-container">
      <h1 class="page-title">Upload Document</h1>
      <p class="page-subtitle">Extract vocabulary from your reading materials</p>

      <!-- Drag and Drop Zone -->
      <div
        class="drop-zone"
        :class="{
          'drop-zone-active': isDragging,
          'drop-zone-error': validationError,
          'drop-zone-disabled': !canUpload || isProcessing
        }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          class="file-input"
          accept=".pdf,.txt,.docx,.xlsx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          @change="onFileSelect"
        />

        <div class="drop-zone-content">
          <!-- Upload Icon -->
          <svg
            class="upload-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>

          <!-- Selected File Display -->
          <div v-if="selectedFile" class="selected-file">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>

          <!-- Upload Instructions -->
          <div v-else class="upload-instructions">
            <p class="instruction-primary">
              <span class="instruction-highlight">Click to upload</span> or drag and drop
            </p>
            <p class="instruction-secondary">
              Supported formats: PDF, TXT, DOCX, XLSX
            </p>
            <p class="instruction-limit">Maximum file size: 50MB</p>
          </div>
        </div>
      </div>

      <!-- Validation Error Display -->
      <div v-if="validationError" class="error-message">
        <svg
          class="error-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>{{ validationError }}</span>
      </div>

      <!-- Upload Error Display -->
      <div v-if="error" class="error-message">
        <svg
          class="error-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Processing Status -->
      <div v-if="isProcessing" class="processing-status">
        <div class="spinner"></div>
        <p class="processing-text">Processing your document...</p>
      </div>

      <!-- Upload Button -->
      <button
        class="upload-button"
        :class="{ 'upload-button-disabled': !canUploadFile }"
        :disabled="!canUploadFile"
        @click="handleUpload"
      >
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Upload and Process</span>
      </button>

      <!-- Supported Formats Info -->
      <div class="format-info">
        <h3 class="format-title">Supported File Formats</h3>
        <div class="format-grid">
          <div class="format-item">
            <span class="format-badge">PDF</span>
            <span class="format-description">Portable Document Format</span>
          </div>
          <div class="format-item">
            <span class="format-badge">TXT</span>
            <span class="format-description">Plain Text</span>
          </div>
          <div class="format-item">
            <span class="format-badge">DOCX</span>
            <span class="format-description">Microsoft Word</span>
          </div>
          <div class="format-item">
            <span class="format-badge">XLSX</span>
            <span class="format-description">Microsoft Excel</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUpload } from '@/composables/useUpload'

const { canUpload, status, error, uploadFile, validateUploadFile, resetUpload } = useUpload()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const validationError = ref<string | null>(null)
const isDragging = ref(false)

const isProcessing = computed(() => status.value === 'processing' || status.value === 'uploading')

const canUploadFile = computed(() => {
  return canUpload.value && selectedFile.value !== null && !validationError.value && !isProcessing.value
})

function triggerFileInput() {
  if (!canUpload.value || isProcessing.value) return
  fileInput.value?.click()
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    handleFileSelection(input.files[0])
  }
}

function onDragOver(event: DragEvent) {
  if (!canUpload.value || isProcessing.value) return
  isDragging.value = true
}

function onDragLeave(event: DragEvent) {
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  
  if (!canUpload.value || isProcessing.value) return

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileSelection(files[0])
  }
}

function handleFileSelection(file: File) {
  // Reset previous errors
  validationError.value = null
  resetUpload()

  // Validate the file
  const validation = validateUploadFile(file)
  
  if (!validation.valid) {
    validationError.value = validation.error
    selectedFile.value = null
    return
  }

  // File is valid
  selectedFile.value = file
  validationError.value = null
}

async function handleUpload() {
  if (!selectedFile.value || !canUploadFile.value) return

  try {
    await uploadFile(selectedFile.value)
    // Navigation to results page is handled by the composable
  } catch (err) {
    // Error is handled by the composable and stored in state
    console.error('Upload failed:', err)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-container {
  max-width: 600px;
  width: 100%;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.page-subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9fafb;
}

.drop-zone:hover:not(.drop-zone-disabled) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.drop-zone-active {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: scale(1.02);
}

.drop-zone-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.drop-zone-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
}

.selected-file {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
}

.upload-instructions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.instruction-primary {
  font-size: 1rem;
  color: #4b5563;
}

.instruction-highlight {
  color: #3b82f6;
  font-weight: 600;
}

.instruction-secondary {
  font-size: 0.875rem;
  color: #6b7280;
}

.instruction-limit {
  font-size: 0.75rem;
  color: #9ca3af;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.processing-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-top: 1rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  color: #1e40af;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #bfdbfe;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing-text {
  font-weight: 500;
}

.upload-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  margin-top: 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button:hover:not(.upload-button-disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.upload-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.format-info {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.format-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  text-align: center;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.format-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.format-badge {
  font-size: 0.875rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
}

.format-description {
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 640px) {
  .upload-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .drop-zone {
    padding: 2rem 1rem;
  }

  .format-grid {
    grid-template-columns: 1fr;
  }
}
</style>

