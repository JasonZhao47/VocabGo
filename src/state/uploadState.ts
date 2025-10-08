import { reactive, computed } from 'vue'

export type UploadStatus = 'queued' | 'processing' | 'completed'

export interface UploadItem {
  id: string
  file: File
  status: UploadStatus
}

export interface WordPair { en: string; zh: string }

const state = reactive({
  uploads: [] as UploadItem[],
  latestWordPairs: [] as WordPair[],
  latestFilename: '' as string
})

export const activeUploadsCount = computed(() => state.uploads.filter(u => u.status !== 'completed').length)
export const allCompleted = computed(() => state.uploads.length > 0 && state.uploads.every(u => u.status === 'completed'))

export function queueFiles(files: File[]) {
  for (const file of files) {
    state.uploads.push({ id: crypto.randomUUID(), file, status: 'queued' })
  }
  processQueue()
}

function processQueue() {
  for (const item of state.uploads) {
    if (item.status === 'queued') {
      item.status = 'processing'
      setTimeout(() => {
        item.status = 'completed'
        state.latestFilename = item.file.name
        state.latestWordPairs = Array.from({ length: 3 }).map((_, i) => ({ en: `word${i+1}`, zh: `词${i+1}` }))
      }, 10)
    }
  }
}

export default state

