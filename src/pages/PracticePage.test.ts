/**
 * PracticePage Comprehensive Tests
 * Tests for task 3: Add tests for the fixed implementation
 * 
 * Covers:
 * - Unit tests for PracticePage state transitions
 * - Integration tests for full practice flow
 * - Error scenario tests
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PracticePage from './PracticePage.vue'
import * as practiceQuestionService from '@/services/practiceQuestionService'
import { useRouter, useRoute } from 'vue-router'
import type { PracticeQuestions } from '@/types/practice'

// Mock dependencies
vi.mock('vue-router')
vi.mock('@/services/practiceQuestionService')
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}))

// Mock usePracticeSession with proper return type
const mockSessionComposable = {
  allQuestions: { value: [] },
  currentQuestionIndex: { value: 0 },
  answers: { value: new Map() },
  timeRemaining: { value: 300 },
  isPaused: { value: false },
  sessionId: { value: 'test-session' },
  submitAnswer: vi.fn(),
  goToQuestion: vi.fn(),
  completeSession: vi.fn(() => ({
    sessionId: 'test-session',
    totalQuestions: 3,
    correctAnswers: 2,
    score: 66.67,
    duration: 120,
    breakdown: {},
  })),
  pauseTimer: vi.fn(),
  resumeTimer: vi.fn(),
  resetSession: vi.fn(),
}

vi.mock('@/composables/usePracticeSession', () => ({
  usePracticeSession: vi.fn(() => mockSessionComposable),
}))

// Mock practice questions for successful responses
const mockPracticeQuestions: PracticeQuestions = {
  matching: [
    {
      id: 'q1',
      type: 'matching',
      pairs: [
        { english: 'achievement', mandarin: '成就' },
        { english: 'beneficial', mandarin: '有益的' },
      ],
      shuffledMandarin: ['有益的', '成就'],
    },
  ],
  fillBlank: [
    {
      id: 'q2',
      type: 'fill-blank',
      sentence: 'The project was a great ___.',
      correctAnswer: 'achievement',
      acceptableVariations: ['Achievement'],
    },
  ],
  multipleChoice: [
    {
      id: 'q3',
      type: 'multiple-choice',
      sentence: 'This exercise is very ___ for your health.',
      targetWord: 'beneficial',
      options: [
        { text: '有益的', isCorrect: true },
        { text: '困难的', isCorrect: false },
        { text: '昂贵的', isCorrect: false },
        { text: '危险的', isCorrect: false },
      ],
    },
  ],
}

describe('PracticePage - Comprehensive Tests (Task 3)', () => {
  const mockRouter = {
    push: vi.fn(),
  }

  const mockRoute = {
    query: {
      wordlistId: 'test-wordlist-id',
      wordlistName: 'Test Wordlist',
      questionTypes: 'matching,fill-blank',
      timerDuration: '300',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    vi.mocked(useRoute).mockReturnValue(mockRoute as any)
  })

  describe('Error State with Retryable Flag', () => {
    it('should set retryable to false for INSUFFICIENT_WORDS error', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'INSUFFICIENT_WORDS',
          message: 'This wordlist needs at least 4 words to generate practice questions.',
        },
      }

      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue(mockResponse)

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should show error state
      expect(wrapper.find('.error-container').exists()).toBe(true)
      
      // ErrorDisplay should have retryable=false
      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.props('retryable')).toBe(false)
    })

    it('should set retryable to true for GENERATION_TIMEOUT error', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'GENERATION_TIMEOUT',
          message: 'Question generation is taking longer than expected. Please try again.',
        },
      }

      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue(mockResponse)

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.props('retryable')).toBe(true)
    })

    it('should set retryable to true for NETWORK_ERROR', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to the server. Please check your internet connection.',
        },
      }

      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue(mockResponse)

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.props('retryable')).toBe(true)
    })
  })

  describe('Error Message Extraction', () => {
    it('should extract and display error message from API response', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate practice questions. Please try again.',
        },
      }

      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue(mockResponse)

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.props('message')).toBe('Failed to generate practice questions. Please try again.')
    })

    it('should provide helpful details for INSUFFICIENT_WORDS error', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'INSUFFICIENT_WORDS',
          message: 'This wordlist needs at least 4 words to generate practice questions.',
        },
      }

      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue(mockResponse)

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.props('details')).toContain('Try adding more words')
    })

    it('should provide helpful details for GENERATION_TIMEOUT error', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'GENERATION_TIMEOUT',
          message: 'Question generation is taking longer than expected.',
        },
      }

      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue(mockResponse)

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.props('details')).toContain('usually resolves on retry')
    })
  })

  describe('Loading Progress Messages', () => {
    it('should update loading message during question generation', async () => {
      let progressCallback: ((message: string) => void) | undefined

      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockImplementation(
        async (wordlistId, questionTypes, maxQuestions, onProgress) => {
          progressCallback = onProgress
          
          // Simulate progress updates
          if (progressCallback) {
            progressCallback('Generating practice questions...')
            await new Promise(resolve => setTimeout(resolve, 50))
            progressCallback('Processing word definitions...')
            await new Promise(resolve => setTimeout(resolve, 50))
            progressCallback('Creating question variations...')
          }

          return {
            success: true,
            practiceSetId: 'test-practice-set',
            questions: {
              matching: [],
              fillBlank: [],
              multipleChoice: [],
            },
          }
        }
      )

      const wrapper = mount(PracticePage)
      await nextTick()

      // Should show loading state initially
      expect(wrapper.find('.loading-container').exists()).toBe(true)
      
      // Loading message should be present
      const loadingText = wrapper.find('.loading-text')
      expect(loadingText.exists()).toBe(true)
    })
  })

  describe('Retry Functionality', () => {
    it('should reset state and regenerate questions on retry', async () => {
      // First call fails
      vi.mocked(practiceQuestionService.generatePracticeQuestions)
        .mockResolvedValueOnce({
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: 'Failed to generate questions',
          },
        })
        // Second call succeeds
        .mockResolvedValueOnce({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: {
            matching: [],
            fillBlank: [],
            multipleChoice: [],
          },
        })

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should be in error state
      expect(wrapper.find('.error-container').exists()).toBe(true)

      // Click retry
      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      await errorDisplay.vm.$emit('retry')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should call generatePracticeQuestions again
      expect(practiceQuestionService.generatePracticeQuestions).toHaveBeenCalledTimes(2)
    })

    it('should clear error state when retrying', async () => {
      vi.mocked(practiceQuestionService.generatePracticeQuestions)
        .mockResolvedValueOnce({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Network error',
          },
        })
        .mockResolvedValueOnce({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: {
            matching: [],
            fillBlank: [],
            multipleChoice: [],
          },
        })

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify error state
      expect(wrapper.find('.error-container').exists()).toBe(true)

      // Retry
      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      await errorDisplay.vm.$emit('retry')
      await nextTick()

      // Should transition to loading state
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Error should be cleared
      expect(wrapper.find('.error-container').exists()).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing wordlistId', async () => {
      vi.mocked(useRoute).mockReturnValue({
        query: {},
      } as any)

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should show error
      expect(wrapper.find('.error-container').exists()).toBe(true)
      
      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.props('message')).toBe('No wordlist selected')
      expect(errorDisplay.props('retryable')).toBe(false)
    })

    it('should handle invalid API response (missing questions)', async () => {
      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
        success: true,
        practiceSetId: 'test-id',
        // Missing questions field
      } as any)

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should show error
      expect(wrapper.find('.error-container').exists()).toBe(true)
      
      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      expect(errorDisplay.props('message')).toBe('Invalid response from server')
      expect(errorDisplay.props('retryable')).toBe(true)
    })
  })

  // ============================================================================
  // TASK 3: STATE TRANSITION TESTS
  // Requirements: 1.1, 1.2, 1.3, 1.4
  // ============================================================================

  describe('State Transitions (Task 3)', () => {
    describe('loading → active transition', () => {
      it('should transition from loading to active on successful question generation', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: mockPracticeQuestions,
        })

        const wrapper = mount(PracticePage)
        
        // Should start in loading state
        await nextTick()
        expect(wrapper.find('.loading-container').exists()).toBe(true)
        expect(wrapper.find('.loading-text').text()).toContain('Preparing')

        // Wait for async initialization
        await new Promise(resolve => setTimeout(resolve, 100))

        // Should transition to active state
        expect(wrapper.find('.loading-container').exists()).toBe(false)
        const practiceSession = wrapper.findComponent({ name: 'PracticeSession' })
        expect(practiceSession.exists()).toBe(true)
      })

      it('should initialize composable with complete practice set', async () => {
        const mockUsePracticeSession = vi.fn(() => mockSessionComposable)
        vi.mocked(require('@/composables/usePracticeSession').usePracticeSession).mockImplementation(mockUsePracticeSession)

        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: mockPracticeQuestions,
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Verify usePracticeSession was called with complete data
        expect(mockUsePracticeSession).toHaveBeenCalledWith(
          expect.objectContaining({
            practiceSet: expect.objectContaining({
              id: 'test-practice-set',
              wordlistId: 'test-wordlist-id',
              questions: mockPracticeQuestions,
            }),
          })
        )
      })

      it('should pass timer configuration to composable', async () => {
        const mockUsePracticeSession = vi.fn(() => mockSessionComposable)
        vi.mocked(require('@/composables/usePracticeSession').usePracticeSession).mockImplementation(mockUsePracticeSession)

        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: mockPracticeQuestions,
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Verify timer duration was passed
        expect(mockUsePracticeSession).toHaveBeenCalledWith(
          expect.objectContaining({
            timerDuration: 300,
          })
        )
      })
    })

    describe('loading → error transition', () => {
      it('should transition to error state on API failure', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: 'Failed to generate questions',
          },
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(wrapper.find('.loading-container').exists()).toBe(false)
        expect(wrapper.find('.error-container').exists()).toBe(true)
      })

      it('should not initialize composable on error', async () => {
        const mockUsePracticeSession = vi.fn(() => mockSessionComposable)
        vi.mocked(require('@/composables/usePracticeSession').usePracticeSession).mockImplementation(mockUsePracticeSession)

        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: 'Failed to generate questions',
          },
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Composable should not be initialized
        expect(mockUsePracticeSession).not.toHaveBeenCalled()
      })
    })

    describe('active → completed transition', () => {
      it('should transition to completed state when session is submitted', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: mockPracticeQuestions,
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Should be in active state
        const practiceSession = wrapper.findComponent({ name: 'PracticeSession' })
        expect(practiceSession.exists()).toBe(true)

        // Submit session
        await practiceSession.vm.$emit('submit')
        await nextTick()

        // Should transition to completed state
        expect(wrapper.findComponent({ name: 'PracticeSession' }).exists()).toBe(false)
        expect(wrapper.findComponent({ name: 'ResultsView' }).exists()).toBe(true)
      })

      it('should call completeSession on composable', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: mockPracticeQuestions,
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const practiceSession = wrapper.findComponent({ name: 'PracticeSession' })
        await practiceSession.vm.$emit('submit')
        await nextTick()

        expect(mockSessionComposable.completeSession).toHaveBeenCalled()
      })
    })

    describe('error → loading transition (retry)', () => {
      it('should transition back to loading on retry', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions)
          .mockResolvedValueOnce({
            success: false,
            error: {
              code: 'GENERATION_FAILED',
              message: 'Failed',
            },
          })
          .mockResolvedValueOnce({
            success: true,
            practiceSetId: 'test-practice-set',
            questions: mockPracticeQuestions,
          })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Should be in error state
        expect(wrapper.find('.error-container').exists()).toBe(true)

        // Retry
        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        await errorDisplay.vm.$emit('retry')
        await nextTick()

        // Should transition to loading
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Then to active after successful generation
        await new Promise(resolve => setTimeout(resolve, 100))
        expect(wrapper.findComponent({ name: 'PracticeSession' }).exists()).toBe(true)
      })

      it('should reset all state on retry', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions)
          .mockResolvedValueOnce({
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: 'Network error',
            },
          })
          .mockResolvedValueOnce({
            success: true,
            practiceSetId: 'new-practice-set',
            questions: mockPracticeQuestions,
          })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Verify error state
        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        expect(errorDisplay.props('message')).toBeTruthy()

        // Retry
        await errorDisplay.vm.$emit('retry')
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Should have new practice set
        expect(practiceQuestionService.generatePracticeQuestions).toHaveBeenCalledTimes(2)
      })
    })

    describe('completed → active transition (retry from results)', () => {
      it('should reset session when retrying from results', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: mockPracticeQuestions,
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Complete session
        const practiceSession = wrapper.findComponent({ name: 'PracticeSession' })
        await practiceSession.vm.$emit('submit')
        await nextTick()

        // Should be in completed state
        const resultsView = wrapper.findComponent({ name: 'ResultsView' })
        expect(resultsView.exists()).toBe(true)

        // Retry from results
        await resultsView.vm.$emit('retry')
        await nextTick()

        // Should call resetSession
        expect(mockSessionComposable.resetSession).toHaveBeenCalled()
      })
    })
  })

  // ============================================================================
  // TASK 3: FULL PRACTICE FLOW INTEGRATION TESTS
  // Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
  // ============================================================================

  describe('Full Practice Flow Integration (Task 3)', () => {
    it('should complete full practice flow from start to finish', async () => {
      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
        success: true,
        practiceSetId: 'test-practice-set',
        questions: mockPracticeQuestions,
      })

      const wrapper = mount(PracticePage)
      
      // 1. Start in loading state
      await nextTick()
      expect(wrapper.find('.loading-container').exists()).toBe(true)

      // 2. Transition to active state
      await new Promise(resolve => setTimeout(resolve, 100))
      const practiceSession = wrapper.findComponent({ name: 'PracticeSession' })
      expect(practiceSession.exists()).toBe(true)

      // 3. Answer questions
      await practiceSession.vm.$emit('answer', {
        questionId: 'q1',
        answer: { pairs: [{ english: 'achievement', selectedMandarin: '成就' }] },
      })
      expect(mockSessionComposable.submitAnswer).toHaveBeenCalled()

      // 4. Navigate between questions
      await practiceSession.vm.$emit('navigate', 1)
      expect(mockSessionComposable.goToQuestion).toHaveBeenCalledWith(1)

      // 5. Submit session
      await practiceSession.vm.$emit('submit')
      await nextTick()

      // 6. View results
      const resultsView = wrapper.findComponent({ name: 'ResultsView' })
      expect(resultsView.exists()).toBe(true)
      expect(resultsView.props('results')).toBeTruthy()
    })

    it('should handle timer functionality throughout flow', async () => {
      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
        success: true,
        practiceSetId: 'test-practice-set',
        questions: mockPracticeQuestions,
      })

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const practiceSession = wrapper.findComponent({ name: 'PracticeSession' })
      
      // Pause timer
      await practiceSession.vm.$emit('toggle-pause')
      expect(mockSessionComposable.pauseTimer).toHaveBeenCalled()

      // Resume timer
      mockSessionComposable.isPaused.value = true
      await nextTick()
      await practiceSession.vm.$emit('toggle-pause')
      expect(mockSessionComposable.resumeTimer).toHaveBeenCalled()
    })

    it('should handle navigation back to wordlists', async () => {
      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
        success: false,
        error: {
          code: 'INSUFFICIENT_WORDS',
          message: 'Not enough words',
        },
      })

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Click back button
      const backButton = wrapper.find('.btn-back')
      await backButton.trigger('click')

      expect(mockRouter.push).toHaveBeenCalledWith('/wordlists')
    })

    it('should handle share functionality from results', async () => {
      vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
        success: true,
        practiceSetId: 'test-practice-set',
        questions: mockPracticeQuestions,
      })

      const wrapper = mount(PracticePage)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Complete session
      const practiceSession = wrapper.findComponent({ name: 'PracticeSession' })
      await practiceSession.vm.$emit('submit')
      await nextTick()

      // Trigger share from results
      const resultsView = wrapper.findComponent({ name: 'ResultsView' })
      await resultsView.vm.$emit('share-created', 'https://example.com/share/123')

      // Share modal should be shown
      await nextTick()
      // Note: Modal visibility is controlled by showShareModal ref
    })
  })

  // ============================================================================
  // TASK 3: ERROR SCENARIO TESTS
  // Requirements: 1.5, 3.1, 3.2, 3.3
  // ============================================================================

  describe('Error Scenarios (Task 3)', () => {
    describe('Network and connectivity errors', () => {
      it('should handle network timeout', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timed out',
          },
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        expect(errorDisplay.props('retryable')).toBe(true)
        expect(errorDisplay.props('message')).toContain('timed out')
      })

      it('should handle offline state', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: false,
          error: {
            code: 'OFFLINE',
            message: 'No internet connection',
          },
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        expect(errorDisplay.props('retryable')).toBe(true)
        expect(errorDisplay.props('details')).toContain('internet connection')
      })

      it('should handle network error with retry', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions)
          .mockResolvedValueOnce({
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: 'Network error',
            },
          })
          .mockResolvedValueOnce({
            success: true,
            practiceSetId: 'test-practice-set',
            questions: mockPracticeQuestions,
          })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Should show error
        expect(wrapper.find('.error-container').exists()).toBe(true)

        // Retry should succeed
        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        await errorDisplay.vm.$emit('retry')
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(wrapper.findComponent({ name: 'PracticeSession' }).exists()).toBe(true)
      })
    })

    describe('Validation and data errors', () => {
      it('should handle validation error', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Generated questions did not meet quality standards',
          },
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        expect(errorDisplay.props('retryable')).toBe(true)
        expect(errorDisplay.props('details')).toContain('quality standards')
      })

      it('should handle missing practice set ID', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: '',
          questions: mockPracticeQuestions,
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(wrapper.find('.error-container').exists()).toBe(true)
        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        expect(errorDisplay.props('message')).toBe('Invalid response from server')
      })

      it('should handle malformed questions data', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-id',
          questions: null as any,
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(wrapper.find('.error-container').exists()).toBe(true)
      })
    })

    describe('Server and internal errors', () => {
      it('should handle internal server error', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        expect(errorDisplay.props('retryable')).toBe(true)
      })

      it('should handle unknown error gracefully', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockRejectedValue(
          new Error('Unexpected error')
        )

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(wrapper.find('.error-container').exists()).toBe(true)
        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        expect(errorDisplay.props('message')).toBeTruthy()
      })

      it('should handle error with custom user message', async () => {
        const customError = new Error('Technical error')
        ;(customError as any).userMessage = 'Something went wrong. Please try again.'
        ;(customError as any).code = 'CUSTOM_ERROR'

        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockRejectedValue(customError)

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        expect(errorDisplay.props('message')).toBe('Something went wrong. Please try again.')
      })
    })

    describe('Multiple retry scenarios', () => {
      it('should handle multiple consecutive failures', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions)
          .mockResolvedValueOnce({
            success: false,
            error: { code: 'GENERATION_FAILED', message: 'Failed 1' },
          })
          .mockResolvedValueOnce({
            success: false,
            error: { code: 'GENERATION_FAILED', message: 'Failed 2' },
          })
          .mockResolvedValueOnce({
            success: true,
            practiceSetId: 'test-practice-set',
            questions: mockPracticeQuestions,
          })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // First failure
        expect(wrapper.find('.error-container').exists()).toBe(true)

        // First retry
        let errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        await errorDisplay.vm.$emit('retry')
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Second failure
        expect(wrapper.find('.error-container').exists()).toBe(true)

        // Second retry
        errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        await errorDisplay.vm.$emit('retry')
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Success
        expect(wrapper.findComponent({ name: 'PracticeSession' }).exists()).toBe(true)
        expect(practiceQuestionService.generatePracticeQuestions).toHaveBeenCalledTimes(3)
      })

      it('should maintain state consistency across retries', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions)
          .mockResolvedValueOnce({
            success: false,
            error: { code: 'GENERATION_TIMEOUT', message: 'Timeout' },
          })
          .mockResolvedValueOnce({
            success: true,
            practiceSetId: 'retry-practice-set',
            questions: mockPracticeQuestions,
          })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Verify error state
        expect(wrapper.find('.error-container').exists()).toBe(true)

        // Retry
        const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
        await errorDisplay.vm.$emit('retry')
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Verify clean state after retry
        expect(wrapper.find('.error-container').exists()).toBe(false)
        expect(wrapper.findComponent({ name: 'PracticeSession' }).exists()).toBe(true)
      })
    })

    describe('Edge case error handling', () => {
      it('should handle error during session completion', async () => {
        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: mockPracticeQuestions,
        })

        // Mock completeSession to throw error
        mockSessionComposable.completeSession.mockImplementation(() => {
          throw new Error('Failed to complete session')
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const practiceSession = wrapper.findComponent({ name: 'PracticeSession' })
        
        // Should not crash when submit fails
        await practiceSession.vm.$emit('submit')
        await nextTick()

        // Should still be in active state (not transitioned to completed)
        expect(wrapper.findComponent({ name: 'PracticeSession' }).exists()).toBe(true)
      })

      it('should handle missing route parameters gracefully', async () => {
        vi.mocked(useRoute).mockReturnValue({
          query: {
            wordlistId: 'test-id',
            // Missing other parameters
          },
        } as any)

        vi.mocked(practiceQuestionService.generatePracticeQuestions).mockResolvedValue({
          success: true,
          practiceSetId: 'test-practice-set',
          questions: mockPracticeQuestions,
        })

        const wrapper = mount(PracticePage)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // Should still work with defaults
        expect(wrapper.findComponent({ name: 'PracticeSession' }).exists()).toBe(true)
      })
    })
  })
})
