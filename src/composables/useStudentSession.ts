/**
 * useStudentSession Composable
 * 
 * Manages student session state for practicing shared wordlists.
 * Handles session registration, persistence, and mistake recording.
 * 
 * Requirements: FR2, FR3, NFR5
 */

import { ref, readonly, onMounted } from 'vue'

// Storage keys
const SESSION_TOKEN_KEY = 'student_session_token'
const NICKNAME_KEY = 'student_nickname'
const SESSION_ID_KEY = 'student_session_id'

// API base URL
const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL

export interface DeviceInfo {
  userAgent: string
  screenResolution: string
  timezone: string
}

export interface WordPair {
  en: string
  zh: string
}

export interface RegisterSessionResponse {
  success: boolean
  sessionId?: string
  sessionToken?: string
  wordlist?: {
    id: string
    title: string
    words: WordPair[]
  }
  error?: {
    code: string
    message: string
  }
}

export interface RecordMistakeResponse {
  success: boolean
  mistakeCount?: number
  error?: {
    code: string
    message: string
  }
}

// Reactive state
const sessionToken = ref<string | null>(null)
const nickname = ref<string | null>(null)
const sessionId = ref<string | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
let isInitialized = false

/**
 * Get device fingerprint information
 */
function getDeviceInfo(): DeviceInfo {
  return {
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

/**
 * Load session data from localStorage
 */
function loadFromStorage(): void {
  if (isInitialized) return
  
  try {
    sessionToken.value = localStorage.getItem(SESSION_TOKEN_KEY)
    nickname.value = localStorage.getItem(NICKNAME_KEY)
    sessionId.value = localStorage.getItem(SESSION_ID_KEY)
    isInitialized = true
  } catch (err) {
    console.error('Failed to load session from localStorage:', err)
    // Gracefully handle localStorage unavailable (e.g., private browsing)
    isInitialized = true
  }
}

/**
 * Save session data to localStorage
 */
function saveToStorage(token: string, nick: string, id: string): void {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token)
    localStorage.setItem(NICKNAME_KEY, nick)
    localStorage.setItem(SESSION_ID_KEY, id)
  } catch (err) {
    console.error('Failed to save session to localStorage:', err)
    // Gracefully handle localStorage unavailable
  }
}

/**
 * Clear session data from localStorage
 */
function clearStorage(): void {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY)
    localStorage.removeItem(NICKNAME_KEY)
    localStorage.removeItem(SESSION_ID_KEY)
  } catch (err) {
    console.error('Failed to clear session from localStorage:', err)
  }
}

/**
 * Register a new student session or retrieve existing one
 * 
 * @param shareToken - The wordlist share token
 * @param nick - Student nickname (2-20 characters)
 * @returns Promise with registration response
 */
async function registerSession(
  shareToken: string,
  nick: string
): Promise<RegisterSessionResponse> {
  isLoading.value = true
  error.value = null

  try {
    const deviceInfo = getDeviceInfo()

    const response = await fetch(`${API_BASE_URL}/functions/v1/register-student-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shareToken,
        nickname: nick,
        deviceInfo,
      }),
    })

    const data: RegisterSessionResponse = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage = data.error?.message || 'Failed to register session'
      error.value = errorMessage
      return data
    }

    // Save session data
    if (data.sessionToken && data.sessionId) {
      sessionToken.value = data.sessionToken
      nickname.value = nick
      sessionId.value = data.sessionId

      saveToStorage(data.sessionToken, nick, data.sessionId)
    }

    return data
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.'
    error.value = errorMessage
    
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: errorMessage,
      },
    }
  } finally {
    isLoading.value = false
  }
}

/**
 * Record a practice mistake
 * 
 * @param wordlistId - The wordlist ID
 * @param word - The English word
 * @param translation - The Chinese translation
 * @param questionType - Type of question (multiple_choice, fill_blank, matching)
 * @returns Promise with recording response
 */
async function recordMistake(
  wordlistId: string,
  word: string,
  translation: string,
  questionType: 'multiple_choice' | 'fill_blank' | 'matching'
): Promise<RecordMistakeResponse> {
  // Silently fail if no session token (not registered yet)
  if (!sessionToken.value) {
    console.warn('Cannot record mistake: No active session')
    return {
      success: false,
      error: {
        code: 'NO_SESSION',
        message: 'No active session',
      },
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/functions/v1/record-practice-mistake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken: sessionToken.value,
        wordlistId,
        word,
        translation,
        questionType,
      }),
    })

    const data: RecordMistakeResponse = await response.json()

    if (!response.ok || !data.success) {
      // Log error but don't block UI
      console.error('Failed to record mistake:', data.error?.message)
      return data
    }

    return data
  } catch (err) {
    // Log error but don't block UI (fire and forget)
    console.error('Network error recording mistake:', err)
    
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network error',
      },
    }
  }
}

/**
 * Clear the current session
 */
function clearSession(): void {
  sessionToken.value = null
  nickname.value = null
  sessionId.value = null
  error.value = null
  isInitialized = false
  clearStorage()
}

/**
 * Check if user has an active session
 */
function hasActiveSession(): boolean {
  return Boolean(sessionToken.value && nickname.value && sessionId.value)
}

/**
 * Composable hook
 */
export function useStudentSession() {
  // Load from localStorage immediately (not in onMounted for better SSR/testing support)
  loadFromStorage()

  return {
    // State (readonly)
    sessionToken: readonly(sessionToken),
    nickname: readonly(nickname),
    sessionId: readonly(sessionId),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Actions
    registerSession,
    recordMistake,
    clearSession,
    hasActiveSession,
  }
}
