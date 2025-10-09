/**
 * Session management utility for anonymous user identification
 * Generates and persists session IDs in browser localStorage
 */

const SESSION_KEY = 'vocabgo_session_id'

/**
 * Get or generate a session ID for the current browser session
 * @returns Session ID (UUID v4 format)
 */
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY)
  
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  
  return sessionId
}

/**
 * Clear the current session ID from localStorage
 * Used for "logging out" or resetting the session
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
