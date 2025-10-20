/**
 * useWordlist Composable
 * 
 * Provides wordlist management functionality including loading, saving, deleting, and exporting.
 */

import { computed } from 'vue'
import wordlistsState, {
  setLoading,
  setError,
  setWordlists,
  remove,
  hasWordlists as hasWordlistsComputed,
  isLoading as isLoadingComputed,
  hasError as hasErrorComputed,
} from '@/state/wordlistsState'
import {
  fetchWordlists,
  saveWordlist,
  deleteWordlist,
  exportWordlist,
  downloadBlob,
  type WordlistRecord,
} from '@/services/wordlistService'
import type { WordPair } from '@/state/uploadState'
import { useToast } from '@/composables/useToast'

export function useWordlist() {
  const toast = useToast()
  
  // Expose computed properties from state
  const wordlists = computed(() => wordlistsState.wordlists)
  const hasWordlists = hasWordlistsComputed
  const isLoading = isLoadingComputed
  const hasError = hasErrorComputed
  const error = computed(() => wordlistsState.error)

  /**
   * Loads all saved wordlists for the current user
   */
  async function loadWordlists(): Promise<void> {
    try {
      setLoading(true)
      const lists = await fetchWordlists()
      
      // Convert createdAt and shared_at strings to Date objects
      const wordlistsWithDates = lists.map(list => ({
        ...list,
        createdAt: new Date(list.createdAt),
        shared_at: list.shared_at ? new Date(list.shared_at) : undefined,
      }))
      
      setWordlists(wordlistsWithDates)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wordlists'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Load wordlists error:', err)
    }
  }

  /**
   * Saves the current wordlist
   */
  async function saveCurrentWordlist(
    filename: string,
    documentType: string,
    words: WordPair[]
  ): Promise<string | null> {
    try {
      setLoading(true)
      const wordlistId = await saveWordlist(filename, documentType, words)
      
      // Reload wordlists to get the saved one
      await loadWordlists()
      
      toast.success('Wordlist saved successfully!')
      return wordlistId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save wordlist'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Save wordlist error:', err)
      return null
    }
  }

  /**
   * Removes a wordlist by ID
   */
  async function removeWordlist(id: string): Promise<boolean> {
    try {
      // Don't set loading state for delete - it causes UI flicker
      await deleteWordlist(id)
      
      // Remove from local state immediately
      remove(id)
      
      toast.success('Wordlist deleted successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete wordlist'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Delete wordlist error:', err)
      return false
    }
  }

  /**
   * Downloads a wordlist as CSV
   */
  async function downloadWordlist(
    wordlist: import('@/state/wordlistsState').WordlistRecord
  ): Promise<boolean> {
    try {
      // Convert Date to string for service compatibility
      const wordlistForExport: import('@/services/wordlistService').WordlistRecord = {
        ...wordlist,
        createdAt: wordlist.createdAt.toISOString(),
        shared_at: wordlist.shared_at?.toISOString(),
      }
      
      const blob = await exportWordlist(wordlistForExport)
      
      // Generate filename
      const baseFilename = wordlist.filename.replace(/\.[^/.]+$/, '') // Remove original extension
      const filename = `${baseFilename}_wordlist.csv`
      
      // Trigger download
      downloadBlob(blob, filename)
      
      toast.success('Wordlist exported as CSV successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export wordlist'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Export wordlist error:', err)
      return false
    }
  }

  /**
   * Finds a wordlist by ID
   */
  function findWordlistById(id: string): import('@/state/wordlistsState').WordlistRecord | undefined {
    return wordlistsState.wordlists.find(w => w.id === id)
  }

  return {
    // State
    wordlists,
    hasWordlists,
    isLoading,
    hasError,
    error,

    // Actions
    loadWordlists,
    saveCurrentWordlist,
    removeWordlist,
    downloadWordlist,
    findWordlistById,
  }
}
