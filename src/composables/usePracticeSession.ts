/**
 * Practice Session Management Composable
 * Handles session state, timer functionality, and persistence
 */

import { ref, computed, watch, onUnmounted } from 'vue';
import type {
  PracticeSession,
  PracticeSet,
  Question,
  Answer,
  SessionResults,
  MatchingQuestion,
  FillBlankQuestion,
  MultipleChoiceQuestion,
  MatchingAnswer,
  FillBlankAnswer,
  MultipleChoiceAnswer,
} from '@/types/practice';
import {
  saveSession,
  restoreSession,
  clearSession,
  saveToHistory,
  type StoredSessionData,
  type SessionHistoryItem,
} from '@/utils/sessionPersistence';
import {
  calculateSessionResults,
  isMatchingAnswerCorrect,
  isFillBlankAnswerCorrect,
  isMultipleChoiceAnswerCorrect,
} from '@/utils/sessionResults';
import { savePracticeSession } from '@/services/practiceSessionService';
import { analyticsService } from '@/services/practiceAnalyticsService';

interface UsePracticeSessionOptions {
  practiceSet: PracticeSet;
  timerDuration?: number; // in minutes
  onTimerExpire?: () => void;
  onSessionComplete?: (results: SessionResults) => void;
}

export function usePracticeSession(options: UsePracticeSessionOptions) {
  const { practiceSet, timerDuration, onTimerExpire, onSessionComplete } = options;

  // Flatten all questions into a single array
  const allQuestions = computed<Question[]>(() => {
    return [
      ...practiceSet.questions.matching,
      ...practiceSet.questions.fillBlank,
      ...practiceSet.questions.multipleChoice,
    ];
  });

  // Session state
  const sessionId = ref<string>(generateSessionId());
  const startTime = ref<Date>(new Date());
  const currentQuestionIndex = ref<number>(0);
  const answers = ref<Map<string, Answer>>(new Map());
  const isPaused = ref<boolean>(false);
  const isCompleted = ref<boolean>(false);

  // Timer state
  const timeRemaining = ref<number>(timerDuration ? timerDuration * 60 : 0);
  const timerInterval = ref<number | null>(null);

  // Computed properties
  const currentQuestion = computed<Question | null>(() => {
    return allQuestions.value[currentQuestionIndex.value] || null;
  });

  const progress = computed<number>(() => {
    if (allQuestions.value.length === 0) return 0;
    return (currentQuestionIndex.value / allQuestions.value.length) * 100;
  });

  const answeredCount = computed<number>(() => {
    return answers.value.size;
  });

  const totalQuestions = computed<number>(() => {
    return allQuestions.value.length;
  });

  const hasTimer = computed<boolean>(() => {
    return timerDuration !== undefined && timerDuration > 0;
  });

  const isTimerActive = computed<boolean>(() => {
    return hasTimer.value && !isPaused.value && !isCompleted.value;
  });

  // Timer functions
  function startTimer() {
    if (!hasTimer.value || timerInterval.value !== null) return;

    timerInterval.value = window.setInterval(() => {
      if (isPaused.value || isCompleted.value) return;

      timeRemaining.value--;

      if (timeRemaining.value <= 0) {
        stopTimer();
        handleTimerExpire();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval.value !== null) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }

  function pauseTimer() {
    isPaused.value = true;
  }

  function resumeTimer() {
    isPaused.value = false;
  }

  function handleTimerExpire() {
    isCompleted.value = true;
    const results = calculateResults();
    saveSessionToHistory(results);
    clearSessionFromStorage();
    onTimerExpire?.();
    onSessionComplete?.(results);
  }

  // Navigation functions
  function goToQuestion(index: number) {
    if (index >= 0 && index < allQuestions.value.length) {
      currentQuestionIndex.value = index;
      saveSessionToStorage();
    }
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < allQuestions.value.length - 1) {
      currentQuestionIndex.value++;
      saveSessionToStorage();
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--;
      saveSessionToStorage();
    }
  }

  // Answer management
  function submitAnswer(questionId: string, answer: Answer) {
    answers.value.set(questionId, answer);
    saveSessionToStorage();
  }

  function getAnswer(questionId: string): Answer | undefined {
    return answers.value.get(questionId);
  }

  function hasAnswer(questionId: string): boolean {
    return answers.value.has(questionId);
  }

  // Session completion
  function completeSession(): SessionResults {
    isCompleted.value = true;
    stopTimer();
    
    const results = calculateResults();
    saveSessionToHistory(results);
    clearSessionFromStorage();
    
    // Track session analytics
    const questionTypes = [
      ...practiceSet.questions.matching.map(() => 'matching'),
      ...practiceSet.questions.fillBlank.map(() => 'fill-blank'),
      ...practiceSet.questions.multipleChoice.map(() => 'multiple-choice'),
    ];

    analyticsService.trackSession({
      sessionId: sessionId.value,
      wordlistId: practiceSet.wordlistId,
      wordlistSize: practiceSet.questions.matching.length + 
                    practiceSet.questions.fillBlank.length + 
                    practiceSet.questions.multipleChoice.length,
      questionTypes,
      totalQuestions: allQuestions.value.length,
      score: results.score,
      duration: results.duration,
      timerDuration,
      completedAt: new Date(),
      deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      userAgent: navigator.userAgent,
    });
    
    onSessionComplete?.(results);
    return results;
  }

  // Results calculation
  function calculateResults(): SessionResults {
    return calculateSessionResults(
      practiceSet.questions,
      answers.value,
      startTime.value,
      sessionId.value
    );
  }

  // Local storage persistence
  function saveSessionToStorage() {
    const sessionData: StoredSessionData = {
      practiceSetId: practiceSet.id,
      sessionId: sessionId.value,
      startTime: startTime.value.getTime(),
      timerDuration,
      timeRemaining: timeRemaining.value,
      currentQuestionIndex: currentQuestionIndex.value,
      answers: Object.fromEntries(answers.value),
      isPaused: isPaused.value,
    };

    saveSession(sessionData);
  }

  function restoreSessionFromStorage(): boolean {
    const sessionData = restoreSession();
    
    if (!sessionData) return false;

    // Check if it's the same practice set
    if (sessionData.practiceSetId !== practiceSet.id) {
      return false;
    }

    // Restore session state
    sessionId.value = sessionData.sessionId;
    startTime.value = new Date(sessionData.startTime);
    currentQuestionIndex.value = sessionData.currentQuestionIndex || 0;
    timeRemaining.value = sessionData.timeRemaining || 0;
    isPaused.value = sessionData.isPaused || false;

    // Restore answers
    if (sessionData.answers) {
      answers.value = new Map(Object.entries(sessionData.answers));
    }

    return true;
  }

  function clearSessionFromStorage() {
    clearSession();
  }

  // Session history management
  async function saveSessionToHistory(results: SessionResults) {
    const questionTypes = [
      ...practiceSet.questions.matching.map(() => 'matching'),
      ...practiceSet.questions.fillBlank.map(() => 'fill-blank'),
      ...practiceSet.questions.multipleChoice.map(() => 'multiple-choice'),
    ];

    const historyItem: SessionHistoryItem = {
      practiceSetId: practiceSet.id,
      wordlistId: practiceSet.wordlistId,
      wordlistName: practiceSet.wordlistId, // TODO: Get actual wordlist name
      score: results.score,
      completedAt: Date.now(),
      duration: results.duration,
      questionTypes,
    };

    // Save to local storage
    saveToHistory(historyItem);

    // Save to database
    try {
      const endTime = new Date(startTime.value.getTime() + results.duration * 1000);
      await savePracticeSession(
        practiceSet.id,
        startTime.value,
        endTime,
        Object.fromEntries(answers.value),
        results.score,
        timerDuration
      );
    } catch (error) {
      console.error('Failed to save session to database:', error);
      // Continue even if database save fails - local storage has it
    }
  }

  // Utility functions
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function resetSession() {
    currentQuestionIndex.value = 0;
    answers.value.clear();
    isPaused.value = false;
    isCompleted.value = false;
    startTime.value = new Date();
    sessionId.value = generateSessionId();
    
    if (hasTimer.value) {
      timeRemaining.value = timerDuration! * 60;
    }
    
    clearSessionFromStorage();
  }

  // Initialize session
  function initializeSession() {
    // Try to restore from storage
    const restored = restoreSessionFromStorage();
    
    if (!restored) {
      // Start fresh session
      if (hasTimer.value) {
        startTimer();
      }
      saveSessionToStorage();
    } else if (hasTimer.value && !isPaused.value) {
      // Resume timer if session was restored
      startTimer();
    }
  }

  // Watch for changes to auto-save
  watch([currentQuestionIndex, answers, isPaused], () => {
    if (!isCompleted.value) {
      saveSessionToStorage();
    }
  }, { deep: true });

  // Cleanup on unmount
  onUnmounted(() => {
    stopTimer();
  });

  // Initialize
  initializeSession();

  // Helper function to check if current answer is correct
  function isCurrentAnswerCorrect(): boolean | null {
    if (!currentQuestion.value) return null;
    
    const answer = answers.value.get(currentQuestion.value.id);
    if (!answer) return null;

    const question = currentQuestion.value;
    
    if (question.type === 'matching') {
      return isMatchingAnswerCorrect(question, answer as MatchingAnswer);
    } else if (question.type === 'fill-blank') {
      return isFillBlankAnswerCorrect(question, answer as FillBlankAnswer);
    } else if (question.type === 'multiple-choice') {
      return isMultipleChoiceAnswerCorrect(question, answer as MultipleChoiceAnswer);
    }
    
    return null;
  }

  return {
    // State
    sessionId: computed(() => sessionId.value),
    startTime: computed(() => startTime.value),
    currentQuestionIndex: computed(() => currentQuestionIndex.value),
    currentQuestion,
    answers: computed(() => answers.value),
    isPaused: computed(() => isPaused.value),
    isCompleted: computed(() => isCompleted.value),
    
    // Timer
    timeRemaining: computed(() => timeRemaining.value),
    hasTimer,
    isTimerActive,
    
    // Progress
    progress,
    answeredCount,
    totalQuestions,
    allQuestions,
    
    // Actions
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitAnswer,
    getAnswer,
    hasAnswer,
    completeSession,
    resetSession,
    isCurrentAnswerCorrect,
    
    // Results
    calculateResults,
  };
}
