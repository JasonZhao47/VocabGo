/**
 * Session History Composable
 * Provides access to practice session history and statistics
 */

import { ref, computed } from 'vue';
import {
  getHistory,
  getHistoryForWordlist,
  deleteHistoryItem,
  clearHistory,
  type SessionHistoryItem,
} from '@/utils/sessionPersistence';
import { fetchPracticeHistory } from '@/services/practiceSessionService';
import type { SessionResults } from '@/types/practice';

export function useSessionHistory(wordlistId?: string) {
  const history = ref<SessionHistoryItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Load history from both local storage and database
  async function loadHistory() {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Load from local storage first (fast)
      const localHistory = wordlistId 
        ? getHistoryForWordlist(wordlistId)
        : getHistory();
      
      history.value = localHistory;

      // Then fetch from database (may have more complete data)
      const response = await fetchPracticeHistory(wordlistId);
      
      if (response.success && response.history) {
        // Convert database format to local format
        const dbHistory: SessionHistoryItem[] = response.history.map((item) => ({
          practiceSetId: item.practiceSetId,
          wordlistId: item.wordlistId,
          wordlistName: item.wordlistName,
          score: item.score,
          completedAt: new Date(item.createdAt).getTime(),
          duration: Math.floor(
            (new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 1000
          ),
          questionTypes: item.questionTypes,
        }));

        // Merge with local history (prefer database data)
        const mergedHistory = mergeHistories(localHistory, dbHistory);
        history.value = mergedHistory;
      }
    } catch (err) {
      console.error('Error loading history:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load history';
      // Keep local history on error
    } finally {
      isLoading.value = false;
    }
  }

  // Merge local and database histories, removing duplicates
  function mergeHistories(
    local: SessionHistoryItem[],
    db: SessionHistoryItem[]
  ): SessionHistoryItem[] {
    const merged = new Map<number, SessionHistoryItem>();

    // Add local items
    local.forEach((item) => {
      merged.set(item.completedAt, item);
    });

    // Add/override with database items
    db.forEach((item) => {
      merged.set(item.completedAt, item);
    });

    return Array.from(merged.values()).sort((a, b) => b.completedAt - a.completedAt);
  }

  // Computed statistics
  const totalSessions = computed(() => history.value.length);

  const averageScore = computed(() => {
    if (history.value.length === 0) return 0;
    const sum = history.value.reduce((acc, item) => acc + item.score, 0);
    return Math.round((sum / history.value.length) * 100) / 100;
  });

  const bestScore = computed(() => {
    if (history.value.length === 0) return 0;
    return Math.max(...history.value.map((item) => item.score));
  });

  const recentSessions = computed(() => {
    return [...history.value]
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 5);
  });

  const progressTrend = computed(() => {
    if (history.value.length < 2) return 'stable';

    const sorted = [...history.value].sort((a, b) => a.completedAt - b.completedAt);
    const recent = sorted.slice(-3);
    
    if (recent.length < 2) return 'stable';

    const firstScore = recent[0].score;
    const lastScore = recent[recent.length - 1].score;
    const diff = lastScore - firstScore;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  });

  const totalPracticeTime = computed(() => {
    return history.value.reduce((acc, item) => acc + item.duration, 0);
  });

  const averageDuration = computed(() => {
    if (history.value.length === 0) return 0;
    return Math.round(totalPracticeTime.value / history.value.length);
  });

  // Actions
  function deleteSession(completedAt: number) {
    const success = deleteHistoryItem(completedAt);
    if (success) {
      loadHistory();
    }
    return success;
  }

  function clearAllHistory() {
    const success = clearHistory();
    if (success) {
      history.value = [];
    }
    return success;
  }

  function getSessionsByDateRange(startDate: Date, endDate: Date) {
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    return history.value.filter(
      (item) => item.completedAt >= start && item.completedAt <= end
    );
  }

  function getSessionsByQuestionType(questionType: string) {
    return history.value.filter((item) =>
      item.questionTypes.includes(questionType)
    );
  }

  // Format helpers
  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // Initialize
  loadHistory();

  return {
    // State
    history: computed(() => history.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Statistics
    totalSessions,
    averageScore,
    bestScore,
    recentSessions,
    progressTrend,
    totalPracticeTime,
    averageDuration,

    // Actions
    loadHistory,
    deleteSession,
    clearAllHistory,
    getSessionsByDateRange,
    getSessionsByQuestionType,

    // Helpers
    formatDuration,
    formatDate,
    formatDateTime,
  };
}
