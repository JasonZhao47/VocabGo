import { reactive, computed } from 'vue'
import type { WordPair } from './uploadState'

export interface WordlistRecord {
  id: string
  filename: string
  createdAt: Date
  words: WordPair[]
  documentType: string
  wordCount: number
}

export interface WordlistsState {
  wordlists: WordlistRecord[]
  loading: boolean
  error: string | null
}

const state = reactive<WordlistsState>({
  wordlists: [],
  loading: false,
  error: null
})

// Computed properties
export const hasWordlists = computed(() => state.wordlists.length > 0)
export const isLoading = computed(() => state.loading)
export const hasError = computed(() => state.error !== null)

// CRUD operations
export function setLoading(loading: boolean) {
  state.loading = loading
  if (loading) {
    state.error = null
  }
}

export function setError(errorMessage: string) {
  state.error = errorMessage
  state.loading = false
}

export function setWordlists(wordlists: WordlistRecord[]) {
  state.wordlists = wordlists
  state.loading = false
  state.error = null
}

export function addWordlist(wordlist: WordlistRecord) {
  state.wordlists.unshift(wordlist)
  state.error = null
}

export function saveCurrent(filename: string, words: WordPair[], documentType: string = 'unknown') {
  const wordlist: WordlistRecord = {
    id: crypto.randomUUID(),
    filename,
    createdAt: new Date(),
    words,
    documentType,
    wordCount: words.length
  }
  addWordlist(wordlist)
  return wordlist
}

export function remove(id: string) {
  state.wordlists = state.wordlists.filter(w => w.id !== id)
}

export function findById(id: string): WordlistRecord | undefined {
  return state.wordlists.find(w => w.id === id)
}

export function clear() {
  state.wordlists = []
  state.loading = false
  state.error = null
}

export default state

