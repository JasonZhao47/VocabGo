<template>
  <div class="page-container">
    <!-- Processing Modal -->
    <ProcessingModal 
      v-model="showProcessingModal"
      @retry="handleRetry"
    />

    <!-- Main Content Area -->
    <main class="upload-main">
      <!-- Page Header -->
      <header class="page-header">
        <h1 id="page-title" class="page-title">Upload Document</h1>
        <p id="page-description" class="page-subtitle">Extract vocabulary from your reading materials</p>
      </header>

      <!-- Category Cards - Horizontal Scroll -->
      <section class="category-section" aria-labelledby="resources-heading">
        <h2 id="resources-heading" class="sr-only">Select document type</h2>
        
        <!-- Scroll Navigation -->
        <button
          v-if="canScrollLeft"
          type="button"
          aria-label="Scroll left"
          @click="scrollLeft"
          class="scroll-button scroll-button-left"
        >
          <svg class="scroll-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          v-if="canScrollRight"
          type="button"
          aria-label="Scroll right"
          @click="scrollRight"
          class="scroll-button scroll-button-right"
        >
          <svg class="scroll-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Category Cards Container -->
        <div 
          ref="scrollContainer"
          role="group"
          aria-label="Document type selection"
          class="category-scroll"
          @scroll="updateScrollButtons"
        >
          <button
            v-for="resource in englishResources"
            :key="resource.id"
            type="button"
            :aria-label="`Select ${resource.title}`"
            :aria-pressed="selectedResource === resource.id"
            @click="selectResource(resource.id)"
            class="category-card"
            :class="{ 'category-card-selected': selectedResource === resource.id }"
          >
            <div class="category-icon" :style="{ backgroundColor: resource.iconBg }">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="resource.iconPath" />
              </svg>
            </div>
            <div class="category-title">{{ resource.title }}</div>
            <div class="category-description">{{ resource.description }}</div>
          </button>
        </div>
      </section>

      <!-- Upload Drop Zone -->
      <section aria-labelledby="upload-heading" class="upload-section">
        <h2 id="upload-heading" class="sr-only">Upload your document</h2>
        
        <div
          role="region"
          aria-label="File upload drop zone"
          aria-describedby="upload-instructions"
          class="upload-dropzone"
          :class="{
            'dropzone-error': validationError || error,
            'dropzone-dragging': isDragging && !validationError && !error,
            'dropzone-disabled': !canUpload || isProcessing
          }"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            aria-label="Choose file to upload"
            class="file-input"
            accept=".pdf,.txt,.docx,.xlsx"
            @change="onFileSelect"
          />

          <div class="dropzone-content">
            <!-- Upload Icon -->
            <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <!-- Selected File Display -->
            <Transition name="fade-scale">
              <div v-if="selectedFile" class="selected-file">
                <svg class="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div class="file-info">
                  <p class="file-name">{{ selectedFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
              </div>
            </Transition>

            <!-- Upload Instructions -->
            <Transition name="fade-scale">
              <div v-if="!selectedFile" id="upload-instructions" class="upload-instructions">
                <p class="instruction-title">Click to upload or drag and drop</p>
                <p class="instruction-formats">Supported formats: PDF, TXT, DOCX, XLSX</p>
                <p class="instruction-limit">Maximum file size: 50MB</p>
              </div>
            </Transition>

            <!-- Upload Button (ElevenLabs style) -->
            <div class="dropzone-button-container">
              <Button
                variant="secondary"
                size="md"
                :disabled="!canUploadFile"
                :loading="isProcessing"
                :aria-label="isProcessing ? 'Processing document' : 'Upload and process document'"
                @click.stop="handleUpload"
                class="upload-button"
              >
                <template v-if="!isProcessing" #icon>
                  <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </template>
                {{ isProcessing ? 'Processing...' : 'Upload Document' }}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <!-- Error Display -->
      <Transition name="fade-slide">
        <div 
          v-if="validationError || error" 
          role="alert"
          aria-live="assertive"
          class="error-message"
        >
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ validationError || error }}</span>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUpload } from '@/composables/useUpload'
import { useToast } from '@/composables/useToast'
import uploadState, { 
  isUploading, 
  isProcessing as isProcessingState, 
  isCompleted, 
  hasError 
} from '@/state/uploadState'
import Button from '@/components/ui/Button.vue'
import ProcessingModal from '@/components/processing/ProcessingModal.vue'

const router = useRouter()
const toast = useToast()
const { canUpload, status, error, uploadFile, validateUploadFile, resetUpload } = useUpload()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const validationError = ref<string | null>(null)
const isDragging = ref(false)
const selectedResource = ref<string>('toefl')
const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// English Resources - Category Cards
const englishResources = [
  {
    id: 'toefl',
    title: 'TOEFL',
    description: 'Test preparation materials and practice exams',
    iconBg: '#3B82F6',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  },
  {
    id: 'news',
    title: 'News Articles',
    description: 'Current events and journalism from major publications',
    iconBg: '#8B5CF6',
    iconPath: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
  },
  {
    id: 'academic',
    title: 'Academic Papers',
    description: 'Research papers, journals, and scholarly articles',
    iconBg: '#EC4899',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    id: 'business',
    title: 'Business Reports',
    description: 'Corporate documents, presentations, and reports',
    iconBg: '#F59E0B',
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    id: 'novels',
    title: 'Novels & Fiction',
    description: 'Literary works, stories, and creative writing',
    iconBg: '#10B981',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  },
  {
    id: 'technical',
    title: 'Technical Docs',
    description: 'Manuals, guides, and technical specifications',
    iconBg: '#6366F1',
    iconPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  }
]

function selectResource(id: string) {
  selectedResource.value = id
}

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -220, behavior: 'smooth' })
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 220, behavior: 'smooth' })
  }
}

function updateScrollButtons() {
  if (scrollContainer.value) {
    canScrollLeft.value = scrollContainer.value.scrollLeft > 0
    canScrollRight.value = 
      scrollContainer.value.scrollLeft < 
      scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth - 1
  }
}

onMounted(() => {
  updateScrollButtons()
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', updateScrollButtons)
  }
})

const isProcessing = computed(() => status.value === 'processing' || status.value === 'uploading')

const canUploadFile = computed(() => {
  return canUpload.value && selectedFile.value !== null && !validationError.value && !isProcessing.value
})

// Modal visibility - show when uploading, processing, or has error
const showProcessingModal = computed({
  get: () => isUploading.value || isProcessingState.value || hasError.value,
  set: (value: boolean) => {
    // Allow closing modal only when not actively processing
    if (!value && !isUploading.value && !isProcessingState.value) {
      resetUpload()
      selectedFile.value = null
      validationError.value = null
    }
  }
})

// Handle retry action from modal
function handleRetry() {
  resetUpload()
  selectedFile.value = null
  validationError.value = null
}

// Watch for completion and handle success flow
watch(isCompleted, (completed) => {
  if (completed) {
    // Close modal after 500ms delay
    setTimeout(() => {
      // Show success toast
      toast.success('Document processed successfully!')
      
      // Navigate to result page
      router.push('/result')
      
      // Reset state after navigation
      setTimeout(() => {
        resetUpload()
        selectedFile.value = null
        validationError.value = null
      }, 100)
    }, 500)
  }
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
  validationError.value = null
  resetUpload()

  const validation = validateUploadFile(file)
  
  if (!validation.valid) {
    validationError.value = validation.error
    selectedFile.value = null
    return
  }

  selectedFile.value = file
  validationError.value = null
}

async function handleUpload() {
  if (!selectedFile.value || !canUploadFile.value) return

  try {
    await uploadFile(selectedFile.value)
  } catch (err) {
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
/* ===== ELEVENLABS DESIGN SYSTEM ===== */

/* Page Layout - using global .page-container */
.upload-main {
  flex: 1;
  width: 100%;
}

/* Category Section */
.category-section {
  position: relative;
  margin-bottom: 32px;
}

.category-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
  -ms-overflow-scrolling: touch;
  -webkit-overflow-scrolling: touch;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

/* Category Cards */
.category-card {
  flex-shrink: 0;
  width: 180px;
  padding: 16px;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-card:hover {
  border-color: #9CA3AF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.category-card-selected {
  border: 2px solid #000000;
  border-color: #000000;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-icon .icon {
  width: 24px;
  height: 24px;
  color: #FFFFFF;
}

.category-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.category-description {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.4;
}

/* Scroll Buttons */
.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;
}

.scroll-button:hover {
  background-color: #F9FAFB;
}

.scroll-button-left {
  left: -12px;
}

.scroll-button-right {
  right: -12px;
}

.scroll-icon {
  width: 16px;
  height: 16px;
  color: #111827;
}

/* Upload Section */
.upload-section {
  margin-bottom: 24px;
}

.upload-dropzone {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  background-color: #F9FAFB;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 32px 24px;
}

.upload-dropzone:hover:not(.dropzone-disabled) {
  border-color: #9CA3AF;
  background-color: #F3F4F6;
}

.dropzone-dragging {
  border-color: #000000;
  background-color: #F3F4F6;
  transform: scale(1.01);
}

.dropzone-error {
  border-color: #DC2626;
  background-color: #FEF2F2;
}

.dropzone-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 500px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #9CA3AF;
}

/* Selected File */
.selected-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  width: 100%;
}

.file-icon {
  width: 24px;
  height: 24px;
  color: #6B7280;
  flex-shrink: 0;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
  line-height: 1.4;
}

.file-size {
  font-size: 14px;
  color: #6B7280;
}

/* Upload Instructions */
.upload-instructions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.instruction-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.instruction-formats {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
}

.instruction-limit {
  font-size: 14px;
  color: #9CA3AF;
  line-height: 1.5;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #FEF2F2;
  border: 1px solid #DC2626;
  border-radius: 8px;
  color: #991B1B;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 16px;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Dropzone Button Container - ElevenLabs style */
.dropzone-button-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  /* ElevenLabs: auto width with padding, not full width */
  width: auto;
  min-width: 180px;
}

.button-icon {
  width: 16px;
  height: 16px;
}

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Screen Reader Only */
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
</style>
