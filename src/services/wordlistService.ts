/**
 * Wordlist Service
 * 
 * Handles saving, fetching, deleting, and exporting wordlists.
 */

import { getSessionId } from '@/lib/session'
import type { WordPair } from '@/types/database'

// Response types matching Edge Functions
interface SaveResponse {
  success: boolean
  wordlistId?: string
  error?: {
    code: string
    message: string
  }
}

interface FetchResponse {
  success: boolean
  wordlists?: WordlistRecord[]
  error?: {
    code: string
    message: string
  }
}

interface DeleteResponse {
  success: boolean
  error?: {
    code: string
    message: string
  }
}

export interface WordlistRecord {
  id: string
  filename: string
  documentType: string
  wordCount: number
  words: WordPair[]
  createdAt: string
  is_shared?: boolean
  share_token?: string
  shared_at?: string
}

/**
 * Saves a wordlist to the database
 * 
 * @param filename - Name of the original document
 * @param documentType - Type of document (pdf, txt, docx, xlsx)
 * @param words - Array of word pairs (English and Mandarin)
 * @returns Promise with the saved wordlist ID
 * @throws Error if save fails
 */
export async function saveWordlist(
  filename: string,
  documentType: string,
  words: WordPair[]
): Promise<string> {
  try {
    // Get session ID for anonymous access
    const sessionId = getSessionId()

    // Validate input
    if (!filename || !documentType || !words || words.length === 0) {
      throw new Error('Invalid wordlist data')
    }

    if (words.length > 40) {
      throw new Error('Word count exceeds maximum of 40')
    }

    // Call save-wordlist Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          filename,
          documentType,
          words,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`
      )
    }

    const result: SaveResponse = await response.json()

    if (!result.success || !result.wordlistId) {
      throw new Error(result.error?.message || 'Failed to save wordlist')
    }

    return result.wordlistId
  } catch (error) {
    console.error('Save wordlist error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred while saving the wordlist')
  }
}

/**
 * Fetches all saved wordlists for the current user
 * 
 * @returns Promise with array of wordlist records
 * @throws Error if fetch fails
 */
export async function fetchWordlists(): Promise<WordlistRecord[]> {
  try {
    // Get session ID for anonymous access
    const sessionId = getSessionId()

    // Call fetch-wordlists Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-wordlists`,
      {
        method: 'GET',
        headers: {
          'X-Session-ID': sessionId,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`
      )
    }

    const result: FetchResponse = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch wordlists')
    }

    return result.wordlists || []
  } catch (error) {
    console.error('Fetch wordlists error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred while fetching wordlists')
  }
}

/**
 * Deletes a saved wordlist
 * 
 * @param wordlistId - ID of the wordlist to delete
 * @throws Error if delete fails
 */
export async function deleteWordlist(wordlistId: string): Promise<void> {
  try {
    // Get session ID for anonymous access
    const sessionId = getSessionId()

    if (!wordlistId) {
      throw new Error('Wordlist ID is required')
    }

    // Call delete-wordlist Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          wordlistId,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`
      )
    }

    const result: DeleteResponse = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete wordlist')
    }
  } catch (error) {
    console.error('Delete wordlist error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred while deleting the wordlist')
  }
}

/**
 * Exports a wordlist to CSV format
 * 
 * @param wordlist - The wordlist to export
 * @returns Promise with the CSV file blob
 */
export async function exportWordlist(
  wordlist: WordlistRecord
): Promise<Blob> {
  try {
    return exportToCSV(wordlist)
  } catch (error) {
    console.error('Export wordlist error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred while exporting the wordlist')
  }
}

/**
 * Exports wordlist to CSV format with UTF-8 BOM for proper encoding
 */
function exportToCSV(wordlist: WordlistRecord): Blob {
  // Create CSV content with UTF-8 BOM for proper encoding
  const BOM = '\uFEFF'
  let csv = BOM + 'English,Mandarin\n'
  
  for (const word of wordlist.words) {
    // Escape quotes and wrap in quotes if contains comma
    const en = word.en.includes(',') ? `"${word.en.replace(/"/g, '""')}"` : word.en
    const zh = word.zh.includes(',') ? `"${word.zh.replace(/"/g, '""')}"` : word.zh
    csv += `${en},${zh}\n`
  }
  
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Triggers a download of a blob with the given filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
