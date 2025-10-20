/**
 * Sharing Service
 * 
 * Handles wordlist sharing operations including enabling/disabling sharing
 * and copying share URLs to clipboard.
 * 
 * Requirements: FR1
 */

import { getSessionId } from '@/lib/session'

// Response types matching Edge Function
interface ShareWordlistResponse {
  success: boolean
  shareToken?: string
  shareUrl?: string
  error?: {
    code: string
    message: string
  }
}

export interface ShareSettings {
  anonymousMode?: boolean
}

export interface EnableSharingResult {
  shareToken: string
  shareUrl: string
}

/**
 * Enables sharing for a wordlist
 * 
 * @param wordlistId - ID of the wordlist to share
 * @param settings - Optional sharing settings (e.g., anonymous mode)
 * @returns Promise with share token and URL
 * @throws Error if enabling sharing fails
 */
export async function enableSharing(
  wordlistId: string,
  settings?: ShareSettings
): Promise<EnableSharingResult> {
  try {
    // Get session ID for authorization
    const sessionId = getSessionId()

    if (!wordlistId) {
      throw new Error('Wordlist ID is required')
    }

    // Call share-wordlist Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-wordlist`,
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
          enable: true,
          settings,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`
      )
    }

    const result: ShareWordlistResponse = await response.json()

    if (!result.success || !result.shareToken || !result.shareUrl) {
      throw new Error(result.error?.message || 'Failed to enable sharing')
    }

    return {
      shareToken: result.shareToken,
      shareUrl: result.shareUrl,
    }
  } catch (error) {
    console.error('Enable sharing error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred while enabling sharing')
  }
}

/**
 * Disables sharing for a wordlist
 * 
 * @param wordlistId - ID of the wordlist to stop sharing
 * @throws Error if disabling sharing fails
 */
export async function disableSharing(wordlistId: string): Promise<void> {
  try {
    // Get session ID for authorization
    const sessionId = getSessionId()

    if (!wordlistId) {
      throw new Error('Wordlist ID is required')
    }

    // Call share-wordlist Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-wordlist`,
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
          enable: false,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`
      )
    }

    const result: ShareWordlistResponse = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to disable sharing')
    }
  } catch (error) {
    console.error('Disable sharing error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('An unexpected error occurred while disabling sharing')
  }
}

/**
 * Copies a share URL to the clipboard
 * 
 * @param shareToken - The share token to construct the URL from
 * @returns Promise that resolves when copy is successful
 * @throws Error if clipboard API is not available or copy fails
 */
export async function copyShareUrl(shareToken: string): Promise<void> {
  try {
    if (!shareToken) {
      throw new Error('Share token is required')
    }

    // Check if clipboard API is available
    if (!navigator.clipboard) {
      throw new Error('Clipboard API is not available in this browser')
    }

    // Construct share URL
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/practice/${shareToken}`

    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl)
  } catch (error) {
    console.error('Copy share URL error:', error)
    
    if (error instanceof Error) {
      // Provide user-friendly error messages
      if (error.message.includes('Clipboard API')) {
        throw new Error('Your browser does not support copying to clipboard. Please copy the URL manually.')
      }
      throw error
    }
    
    throw new Error('Failed to copy share URL to clipboard')
  }
}
