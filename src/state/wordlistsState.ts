import { reactive } from 'vue'
import type { WordPair } from './uploadState'

export interface WordlistRecord {
  id: string
  filename: string
  createdAt: Date
  words: WordPair[]
}

const state = reactive({
  wordlists: [] as WordlistRecord[]
})

export function saveCurrent(filename: string, words: WordPair[]) {
  state.wordlists.unshift({ id: crypto.randomUUID(), filename, createdAt: new Date(), words })
}

export function remove(id: string) {
  state.wordlists = state.wordlists.filter(w => w.id !== id)
}

export default state

