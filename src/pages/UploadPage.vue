<template>
  <div style="min-height: 100vh; background-color: #F9FAFB;">
    <!-- Main Content with ElevenLabs exact specs: 752px max-width, 48px horizontal, 64px top -->
    <div style="max-width: 752px; margin: 0 auto; padding: 64px 48px 48px;">
      <!-- Page Header with proper semantic HTML (Requirement 13.2) -->
      <header :class="getStaggerClass(0)" style="margin-bottom: 48px;">
        <h1 id="page-title" style="font-size: 30px; font-weight: 600; color: #000000; margin-bottom: 8px; line-height: 1.2; letter-spacing: 0;">Upload Document</h1>
        <p id="page-description" style="font-size: 14px; font-weight: 400; color: #6B7280; line-height: 1.5; letter-spacing: 0;">Extract vocabulary from your reading materials</p>
      </header>

      <!-- English Resources - Horizontal Scrollable Boxes (ElevenLabs 1:1 Replication) -->
      <section :class="getStaggerClass(1)" style="margin-bottom: 32px; position: relative;" aria-labelledby="resources-heading">
        <h2 id="resources-heading" class="sr-only">Select document type</h2>
        <!-- Left Scroll Arrow -->
        <button
          v-if="canScrollLeft"
          type="button"
          aria-label="Scroll left to view more document types"
          @click="scrollLeft"
          style="position: absolute; left: -12px; top: 50%; transform: translateY(-50%); z-index: 10; width: 32px; height: 32px; border-radius: 50%; background-color: #FFFFFF; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 150ms ease-out;"
          @mouseover="($event.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'"
          @mouseout="($event.currentTarget as HTMLElement).style.backgroundColor = '#FFFFFF'"
        >
          <svg style="width: 16px; height: 16px; color: #000000;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Right Scroll Arrow -->
        <button
          v-if="canScrollRight"
          type="button"
          aria-label="Scroll right to view more document types"
          @click="scrollRight"
          style="position: absolute; right: -12px; top: 50%; transform: translateY(-50%); z-index: 10; width: 32px; height: 32px; border-radius: 50%; background-color: #FFFFFF; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 150ms ease-out;"
          @mouseover="($event.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'"
          @mouseout="($event.currentTarget as HTMLElement).style.backgroundColor = '#FFFFFF'"
        >
          <svg style="width: 16px; height: 16px; color: #000000;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Scrollable container -->
        <div 
          ref="scrollContainer"
          role="group"
          aria-label="Document type selection"
          class="scrollable-resources" 
          style="overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none;"
          @scroll="updateScrollButtons"
        >
          <div style="display: flex; gap: 16px; padding: 4px 0;">
            <button
              v-for="resource in englishResources"
              :key="resource.id"
              type="button"
              :aria-label="`Select ${resource.title} document type`"
              :aria-pressed="selectedResource === resource.id"
              @click="selectResource(resource.id)"
              :style="{
                minWidth: '200px',
                padding: '20px',
                backgroundColor: '#FFFFFF',
                border: selectedResource === resource.id ? '2px solid #000000' : '1px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 150ms ease-out',
                textAlign: 'left',
                flexShrink: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }"
              @mouseover="handleResourceBoxHover($event, resource.id, true)"
              @mouseout="handleResourceBoxHover($event, resource.id, false)"
            >
              <!-- Icon -->
              <div :style="{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: resource.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }">
                <svg style="width: 24px; height: 24px; color: #FFFFFF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="resource.iconPath" />
                </svg>
              </div>
              
              <!-- Title -->
              <div style="font-size: 16px; font-weight: 600; color: #000000; line-height: 1.3; letter-spacing: 0;">
                {{ resource.title }}
              </div>
              
              <!-- Description -->
              <div style="font-size: 14px; color: #6B7280; line-height: 1.6; letter-spacing: 0;">
                {{ resource.description }}
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- ElevenLabs-style Drop Zone with Card styling and smooth transitions -->
      <section aria-labelledby="upload-heading">
        <h2 id="upload-heading" class="sr-only">Upload your document</h2>
        <Card
          data-animate-child
          variant="outlined"
          padding="large"
          :interactive="false"
          role="region"
          aria-label="File upload drop zone"
          aria-describedby="upload-instructions"
          :class="[
          'min-h-[280px]',
          'flex',
          'items-center',
          'justify-center',
          'border-2',
          'border-dashed',
          'transition-all',
          'duration-300',
          'ease-in-out',
          {
            'border-red-600 bg-red-50 scale-[0.98]': validationError || error,
            'border-black bg-gray-50 scale-[1.02]': isDragging && !validationError && !error,
            'border-gray-300 bg-[#F8F9FA]': !isDragging && !validationError && !error,
            'opacity-50 cursor-not-allowed': !canUpload || isProcessing,
            'cursor-pointer hover:border-gray-400 hover:bg-gray-50 hover:scale-[1.01]': canUpload && !isProcessing && !isDragging
          }
        ]"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          aria-label="Choose file to upload"
          style="display: none;"
          accept=".pdf,.txt,.docx,.xlsx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          @change="onFileSelect"
        />

        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;">
          <!-- Upload Icon -->
          <svg
            style="width: 48px; height: 48px; color: #9CA3AF;"
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

          <!-- Selected File Display with fade-in animation -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="selectedFile" style="display: flex; align-items: center; gap: 12px; padding: 16px; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E5E7EB;">
              <svg
                style="width: 24px; height: 24px; color: #6B7280; flex-shrink: 0;"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                <p style="font-size: 15px; font-weight: 600; color: #000000; word-break: break-word; line-height: 1.4; letter-spacing: -0.01em;">{{ selectedFile.name }}</p>
                <p style="font-size: 14px; color: #6B7280; letter-spacing: -0.005em;">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
          </Transition>

          <!-- Upload Instructions with fade-in animation -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="!selectedFile" id="upload-instructions" style="display: flex; flex-direction: column; gap: 8px; text-align: center;">
              <p style="font-size: 16px; font-weight: 600; color: #000000; line-height: 1.3; letter-spacing: 0;">
                Click to upload or drag and drop
              </p>
              <p style="font-size: 14px; color: #6B7280; line-height: 1.6; letter-spacing: 0;">
                Supported formats: PDF, TXT, DOCX, XLSX
              </p>
              <p style="font-size: 14px; color: #9CA3AF; line-height: 1.5;">Maximum file size: 50MB</p>
            </div>
          </Transition>
        </div>
      </Card>
      </section>

      <!-- Loading Skeleton for Processing State with Card styling and fade-in animation -->
      <!-- Live region for dynamic status updates (Requirement 13.2) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div 
          v-if="isProcessing" 
          class="mt-6 space-y-4" 
          data-animate-child
          role="status"
          aria-live="polite"
          aria-label="Processing document"
        >
          <Card variant="outlined" padding="medium">
            <div class="flex items-center gap-4 mb-4">
              <Skeleton variant="circular" width="48px" height="48px" />
              <div class="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" height="20px" />
                <Skeleton variant="text" width="40%" height="16px" />
              </div>
            </div>
            <Skeleton variant="rectangular" width="100%" height="120px" />
          </Card>
        </div>
      </Transition>

      <!-- Error Display with Card styling and fade-in animation -->
      <!-- Live region for error announcements (Requirement 13.2) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <Card 
          v-if="validationError || error" 
          variant="outlined" 
          padding="medium"
          role="alert"
          aria-live="assertive"
          class="mt-4 bg-red-50 border-red-600"
        >
          <div class="flex items-center gap-2 text-red-900 text-[15px] leading-relaxed">
            <svg
              class="w-5 h-5 flex-shrink-0"
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
            <span>{{ validationError || error }}</span>
          </div>
        </Card>
      </Transition>

      <!-- Upload Button using Button component -->
      <Button
        data-animate-child
        variant="primary"
        size="md"
        :disabled="!canUploadFile"
        :loading="isProcessing"
        :aria-label="isProcessing ? 'Processing document' : 'Upload and process document'"
        full-width
        @click="handleUpload"
        class="mt-6"
      >
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Upload and Process</span>
      </Button>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUpload } from '@/composables/useUpload'
import { usePageEntranceAnimation } from '@/composables/usePageEntranceAnimation'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const { canUpload, status, error, uploadFile, validateUploadFile, resetUpload } = useUpload()

// Setup page entrance animations
const { getStaggerClass } = usePageEntranceAnimation({
  baseDelay: 50,
  staggerDelay: 60,
})

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const validationError = ref<string | null>(null)
const isDragging = ref(false)
const selectedResource = ref<string>('toefl')
const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const spinnerRef = ref<HTMLElement | null>(null)

// English Resources - Boxes with icons and descriptions (ElevenLabs 1:1 Replication)
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

function handleResourceBoxHover(event: MouseEvent, resourceId: string, isHover: boolean) {
  if (selectedResource.value !== resourceId) {
    const target = event.currentTarget as HTMLElement
    target.style.borderColor = isHover ? '#9CA3AF' : '#E5E7EB'
    target.style.boxShadow = isHover ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
  }
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

// Initialize scroll buttons and spinner animation on mount
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
/* Hide scrollbar for horizontal resources list */
.scrollable-resources::-webkit-scrollbar {
  display: none;
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
</style>

