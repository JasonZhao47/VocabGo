<template>
  <div>
    <h2>Upload Documents</h2>
    <input type="file" multiple @change="onFiles" />
    <p>Supported: PDF / TXT / DOCX / XLSX</p>
    <button :disabled="isUploadDisabled" @click="startUpload">Upload</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import uploadState, { activeUploadsCount, queueFiles } from '@/state/uploadState'

const router = useRouter()
const selectedFiles = ref<File[]>([])

function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    selectedFiles.value = Array.from(input.files)
  }
}

const isUploadDisabled = computed(() => activeUploadsCount.value >= 5 || selectedFiles.value.length === 0)

function startUpload() {
  queueFiles(selectedFiles.value)
  router.push({ name: 'processing' })
}
</script>

