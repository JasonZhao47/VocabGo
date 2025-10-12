/**
 * Session State Persistence Utility
 * Handles local storage operations for practice sessions
 */

import type { Answer, LocalPracticeState } from '@/types/practice';

const STORAGE_KEY = 'vocabgo_practice_session';
const HISTORY_KEY = 'vocabgo_practice_history';
const SESSION_EXPIRY_HOURS = 24;

export interface StoredSessionData {
  practiceSetId: string;
  sessionId: string;
  startTime: number;
  timerDuration?: number;
  timeRemaining: number;
  currentQuestionIndex: number;
  answers: Record<string, Answer>;
  isPaused: boolean;
}

export interface SessionHistoryItem {
  practiceSetId: string;
  wordlistId: string;
  wordlistName: string;
  score: number;
  completedAt: number;
  duration: number;
  questionTypes: string[];
}

/**
 * Save current session state to local storage
 */
export function saveSession(sessionData: StoredSessionData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('Failed to save session to storage:', error);
    return false;
  }
}

/**
 * Restore session state from local storage
 */
export function restoreSession(): StoredSessionData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const sessionData: StoredSessionData = JSON.parse(stored);

    // Check if session is expired
    if (isSessionExpired(sessionData.startTime)) {
      clearSession();
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Failed to restore session from storage:', error);
    return null;
  }
}

/**
 * Clear current session from local storage
 */
export function clearSession(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear session from storage:', error);
    return false;
  }
}

/**
 * Check if a session has expired
 */
export function isSessionExpired(startTime: number): boolean {
  const sessionAge = Date.now() - startTime;
  const maxAge = SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
  return sessionAge > maxAge;
}

/**
 * Save completed session to history
 */
export function saveToHistory(historyItem: SessionHistoryItem): boolean {
  try {
    const history = getHistory();
    history.push(historyItem);

    // Keep only last 50 sessions
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Failed to save session to history:', error);
    return false;
  }
}

/**
 * Get session history from local storage
 */
export function getHistory(): SessionHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    const history: SessionHistoryItem[] = JSON.parse(stored);
    
    // Clean up expired sessions (older than 90 days)
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    return history.filter((item) => item.completedAt > ninetyDaysAgo);
  } catch (error) {
    console.error('Failed to get session history:', error);
    return [];
  }
}

/**
 * Get history for a specific wordlist
 */
export function getHistoryForWordlist(wordlistId: string): SessionHistoryItem[] {
  const history = getHistory();
  return history.filter((item) => item.wordlistId === wordlistId);
}

/**
 * Clear all session history
 */
export function clearHistory(): boolean {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear session history:', error);
    return false;
  }
}

/**
 * Delete specific session from history
 */
export function deleteHistoryItem(completedAt: number): boolean {
  try {
    const history = getHistory();
    const filtered = history.filter((item) => item.completedAt !== completedAt);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete history item:', error);
    return false;
  }
}

/**
 * Clean up expired sessions automatically
 */
export function cleanupExpiredSessions(): void {
  try {
    // Clean up current session if expired
    const currentSession = restoreSession();
    if (currentSession && isSessionExpired(currentSession.startTime)) {
      clearSession();
    }

    // Clean up old history items
    const history = getHistory();
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const filtered = history.filter((item) => item.completedAt > ninetyDaysAgo);
    
    if (filtered.length !== history.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  hasCurrentSession: boolean;
  historyCount: number;
  estimatedSize: number;
} {
  try {
    const currentSession = localStorage.getItem(STORAGE_KEY);
    const history = getHistory();
    
    const estimatedSize = 
      (currentSession?.length || 0) + 
      (localStorage.getItem(HISTORY_KEY)?.length || 0);

    return {
      hasCurrentSession: !!currentSession,
      historyCount: history.length,
      estimatedSize,
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      hasCurrentSession: false,
      historyCount: 0,
      estimatedSize: 0,
    };
  }
}

/**
 * Export session data as JSON (for backup/debugging)
 */
export function exportSessionData(): string {
  try {
    const currentSession = restoreSession();
    const history = getHistory();
    
    return JSON.stringify({
      currentSession,
      history,
      exportedAt: Date.now(),
    }, null, 2);
  } catch (error) {
    console.error('Failed to export session data:', error);
    return '{}';
  }
}

/**
 * Import session data from JSON (for restore)
 */
export function importSessionData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.currentSession) {
      saveSession(data.currentSession);
    }
    
    if (data.history && Array.isArray(data.history)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import session data:', error);
    return false;
  }
}

/**
 * Initialize session persistence (run on app startup)
 */
export function initializeSessionPersistence(): void {
  // Clean up expired sessions on startup
  cleanupExpiredSessions();
  
  // Set up periodic cleanup (every hour)
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}
