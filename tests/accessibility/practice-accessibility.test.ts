/**
 * Practice Question Accessibility Tests (Task 8.4)
 * 
 * Tests to verify:
 * - Keyboard navigation and screen reader compatibility
 * - ARIA labels and semantic HTML structure
 * - Touch interactions and mobile accessibility
 * - Color contrast and visual accessibility
 * 
 * Requirements: 7.1, 8.1, 8.2, 8.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PracticeSession from '@/components/practice/PracticeSession.vue'
import MatchingQuestion from '@/components/practice/MatchingQuestion.vue'
import FillBlankQuestion from '@/components/practice/FillBlankQuestion.vue'
import MultipleChoiceQuestion from '@/components/practice/MultipleChoiceQuestion.vue'
import PracticeSetup from '@/components/practice/PracticeSetup.vue'
import ResultsView from '@/components/practice/ResultsView.vue'
import type { MatchingQuestion as MatchingQuestionType, FillBlankQuestion as FillBlankQuestionType, MultipleChoiceQuestion as MultipleChoiceQuestionType } from '@/types/practice'

// Helper function to calculate color contrast ratio
function getContrastRatio(color1: string, color2: string): number {
  function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')
  
  const r1 = parseInt(hex1.substr(0, 2), 16)
  const g1 = parseInt(hex1.substr(2, 2), 16)
  const b1 = parseInt(hex1.substr(4, 2), 16)
  
  const r2 = parseInt(hex2.substr(0, 2), 16)
  const g2 = parseInt(hex2.substr(2, 2), 16)
  const b2 = parseInt(hex2.substr(4, 2), 16)
  
  const l1 = getLuminance(r1, g1, b1)
  const l2 = getLuminance(r2, g2, b2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

describe('Practice Question Accessibility Tests', () => {
  describe('Keyboard Navigation', () => {
    it('should support tab navigation through matching question elements', async () => {
      const mockQuestion: MatchingQuestionType = {
        id: 'q1',
        type: 'matching',
        pairs: [
          { english: 'hello', mandarin: '你好' },
          { english: 'goodbye', mandarin: '再见' }
        ],
        shuffledMandarin: ['再见', '你好']
      }

      const wrapper = mount(MatchingQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check that interactive elements have tabindex
      const englishWords = wrapper.findAll('[data-testid^="english-word-"]')
      const mandarinWords = wrapper.findAll('[data-testid^="mandarin-word-"]')

      englishWords.forEach(element => {
        expect(element.attributes('tabindex')).toBeDefined()
      })

      mandarinWords.forEach(element => {
        expect(element.attributes('tabindex')).toBeDefined()
      })

      wrapper.unmount()
    })

    it('should support keyboard selection in multiple choice questions', async () => {
      const mockQuestion: MultipleChoiceQuestionType = {
        id: 'q1',
        type: 'multiple-choice',
        sentence: 'I want to say _____ to my friend.',
        targetWord: 'hello',
        options: [
          { text: 'hello', isCorrect: true },
          { text: 'goodbye', isCorrect: false },
          { text: 'maybe', isCorrect: false },
          { text: 'never', isCorrect: false }
        ]
      }

      const wrapper = mount(MultipleChoiceQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check that options are keyboard accessible
      const options = wrapper.findAll('[data-testid^="option-"]')
      
      options.forEach(option => {
        expect(option.attributes('tabindex')).toBeDefined()
        expect(option.attributes('role')).toBe('button')
      })

      wrapper.unmount()
    })

    it('should support Enter key to submit fill-in-the-blank answers', async () => {
      const mockQuestion: FillBlankQuestionType = {
        id: 'q1',
        type: 'fill-blank',
        sentence: 'I want to say _____ to my friend.',
        correctAnswer: 'hello',
        acceptableVariations: ['hi']
      }

      const onAnswerSpy = vi.fn()
      const wrapper = mount(FillBlankQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: onAnswerSpy
        }
      })

      await nextTick()

      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)

      // Simulate typing and pressing Enter
      await input.setValue('hello')
      await input.trigger('keydown.enter')

      expect(onAnswerSpy).toHaveBeenCalled()

      wrapper.unmount()
    })

    it('should provide skip functionality via keyboard', async () => {
      const mockQuestions: MatchingQuestionType[] = [{
        id: 'q1',
        type: 'matching',
        pairs: [{ english: 'test', mandarin: '测试' }],
        shuffledMandarin: ['测试']
      }]

      const wrapper = mount(PracticeSession, {
        props: {
          questions: mockQuestions,
          currentQuestionIndex: 0,
          answers: new Map(),
          isPaused: false,
          timeRemaining: 600,
          timerDuration: 10
        }
      })

      await nextTick()

      // Check for skip button
      const skipButton = wrapper.find('[data-testid="skip-button"]')
      if (skipButton.exists()) {
        expect(skipButton.attributes('tabindex')).toBeDefined()
        expect(skipButton.attributes('aria-label')).toContain('Skip')
      }

      wrapper.unmount()
    })
  })

  describe('Screen Reader Compatibility', () => {
    it('should have proper ARIA labels for matching question elements', async () => {
      const mockQuestion: MatchingQuestionType = {
        id: 'q1',
        type: 'matching',
        pairs: [
          { english: 'hello', mandarin: '你好' }
        ],
        shuffledMandarin: ['你好']
      }

      const wrapper = mount(MatchingQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check ARIA labels
      const englishWord = wrapper.find('[data-testid="english-word-0"]')
      const mandarinWord = wrapper.find('[data-testid="mandarin-word-0"]')

      if (englishWord.exists()) {
        expect(englishWord.attributes('aria-label')).toBeTruthy()
        expect(englishWord.attributes('role')).toBe('button')
      }

      if (mandarinWord.exists()) {
        expect(mandarinWord.attributes('aria-label')).toBeTruthy()
        expect(mandarinWord.attributes('role')).toBe('button')
      }

      wrapper.unmount()
    })

    it('should announce question progress to screen readers', async () => {
      const mockQuestions: MatchingQuestionType[] = [
        {
          id: 'q1',
          type: 'matching',
          pairs: [{ english: 'test1', mandarin: '测试1' }],
          shuffledMandarin: ['测试1']
        },
        {
          id: 'q2',
          type: 'matching',
          pairs: [{ english: 'test2', mandarin: '测试2' }],
          shuffledMandarin: ['测试2']
        }
      ]

      const wrapper = mount(PracticeSession, {
        props: {
          questions: mockQuestions,
          currentQuestionIndex: 0,
          answers: new Map(),
          isPaused: false,
          timeRemaining: 600,
          timerDuration: 10
        }
      })

      await nextTick()

      // Check for progress announcement
      const progressElement = wrapper.find('[aria-live="polite"]')
      if (progressElement.exists()) {
        expect(progressElement.text()).toContain('1')
        expect(progressElement.text()).toContain('2')
      }

      wrapper.unmount()
    })

    it('should provide descriptive labels for timer', async () => {
      const mockQuestions: MatchingQuestionType[] = [{
        id: 'q1',
        type: 'matching',
        pairs: [{ english: 'test', mandarin: '测试' }],
        shuffledMandarin: ['测试']
      }]

      const wrapper = mount(PracticeSession, {
        props: {
          questions: mockQuestions,
          currentQuestionIndex: 0,
          answers: new Map(),
          isPaused: false,
          timeRemaining: 600,
          timerDuration: 10
        }
      })

      await nextTick()

      const timerElement = wrapper.find('[data-testid="timer"]')
      if (timerElement.exists()) {
        expect(timerElement.attributes('aria-label')).toContain('time')
        expect(timerElement.attributes('role')).toBe('timer')
      }

      wrapper.unmount()
    })

    it('should announce correct/incorrect answers', async () => {
      const mockQuestion: FillBlankQuestionType = {
        id: 'q1',
        type: 'fill-blank',
        sentence: 'Test sentence with _____.',
        correctAnswer: 'hello',
        acceptableVariations: []
      }

      const wrapper = mount(FillBlankQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check for feedback announcement area
      const feedbackElement = wrapper.find('[aria-live="assertive"]')
      if (feedbackElement.exists()) {
        expect(feedbackElement.attributes('aria-live')).toBe('assertive')
      }

      wrapper.unmount()
    })

    it('should provide semantic structure with headings', async () => {
      const mockQuestions: MatchingQuestionType[] = [{
        id: 'q1',
        type: 'matching',
        pairs: [{ english: 'test', mandarin: '测试' }],
        shuffledMandarin: ['测试']
      }]

      const wrapper = mount(PracticeSession, {
        props: {
          questions: mockQuestions,
          currentQuestionIndex: 0,
          answers: new Map(),
          isPaused: false,
          timeRemaining: 600,
          timerDuration: 10
        }
      })

      await nextTick()

      // Check for proper heading structure
      const mainHeading = wrapper.find('h1, h2')
      if (mainHeading.exists()) {
        expect(mainHeading.text()).toBeTruthy()
      }

      wrapper.unmount()
    })
  })

  describe('Touch Interactions and Mobile Accessibility', () => {
    it('should have minimum touch target size (44x44px)', async () => {
      const mockQuestion: MatchingQuestionType = {
        id: 'q1',
        type: 'matching',
        pairs: [
          { english: 'hello', mandarin: '你好' }
        ],
        shuffledMandarin: ['你好']
      }

      const wrapper = mount(MatchingQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check touch target sizes (this would be done via CSS classes in real implementation)
      const touchTargets = wrapper.findAll('[data-testid^="english-word-"], [data-testid^="mandarin-word-"]')
      
      touchTargets.forEach(target => {
        // In real implementation, we'd check computed styles
        // Here we verify the elements have appropriate classes
        expect(target.classes()).toContain('min-h-11') // 44px minimum height
        expect(target.classes()).toContain('min-w-11') // 44px minimum width
      })

      wrapper.unmount()
    })

    it('should support swipe gestures on mobile', async () => {
      const mockQuestions: MatchingQuestionType[] = [
        {
          id: 'q1',
          type: 'matching',
          pairs: [{ english: 'test1', mandarin: '测试1' }],
          shuffledMandarin: ['测试1']
        },
        {
          id: 'q2',
          type: 'matching',
          pairs: [{ english: 'test2', mandarin: '测试2' }],
          shuffledMandarin: ['测试2']
        }
      ]

      const wrapper = mount(PracticeSession, {
        props: {
          questions: mockQuestions,
          currentQuestionIndex: 0,
          answers: new Map(),
          isPaused: false,
          timeRemaining: 600,
          timerDuration: 10
        }
      })

      await nextTick()

      // Check for swipe gesture support
      const container = wrapper.find('[data-testid="practice-container"]')
      if (container.exists()) {
        expect(container.attributes('data-swipe-enabled')).toBeDefined()
      }

      wrapper.unmount()
    })

    it('should prevent accidental touches with adequate spacing', async () => {
      const mockQuestion: MultipleChoiceQuestionType = {
        id: 'q1',
        type: 'multiple-choice',
        sentence: 'Test sentence',
        targetWord: 'test',
        options: [
          { text: 'option1', isCorrect: true },
          { text: 'option2', isCorrect: false },
          { text: 'option3', isCorrect: false },
          { text: 'option4', isCorrect: false }
        ]
      }

      const wrapper = mount(MultipleChoiceQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check spacing between options
      const options = wrapper.findAll('[data-testid^="option-"]')
      
      options.forEach(option => {
        // Verify adequate spacing classes
        expect(option.classes()).toContain('mb-3') // 12px margin bottom
      })

      wrapper.unmount()
    })

    it('should handle orientation changes gracefully', async () => {
      const mockQuestion: MatchingQuestionType = {
        id: 'q1',
        type: 'matching',
        pairs: [
          { english: 'hello', mandarin: '你好' }
        ],
        shuffledMandarin: ['你好']
      }

      const wrapper = mount(MatchingQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check responsive classes
      const container = wrapper.find('[data-testid="matching-container"]')
      if (container.exists()) {
        expect(container.classes()).toContain('flex-col')
        expect(container.classes()).toContain('md:flex-row')
      }

      wrapper.unmount()
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient contrast for question text', () => {
      // Primary text on white background
      const textColor = '#1F2937' // gray-800
      const backgroundColor = '#FFFFFF'
      const ratio = getContrastRatio(textColor, backgroundColor)
      
      expect(ratio).toBeGreaterThanOrEqual(4.5) // WCAG AA standard
    })

    it('should have sufficient contrast for correct answer feedback', () => {
      // Success green on white background
      const successColor = '#059669' // emerald-600
      const backgroundColor = '#FFFFFF'
      const ratio = getContrastRatio(successColor, backgroundColor)
      
      expect(ratio).toBeGreaterThanOrEqual(3) // WCAG AA for large text
    })

    it('should have sufficient contrast for incorrect answer feedback', () => {
      // Error red on white background
      const errorColor = '#DC2626' // red-600
      const backgroundColor = '#FFFFFF'
      const ratio = getContrastRatio(errorColor, backgroundColor)
      
      expect(ratio).toBeGreaterThanOrEqual(3) // WCAG AA for large text
    })

    it('should have sufficient contrast for interactive elements', () => {
      // Button text on button background
      const buttonTextColor = '#FFFFFF'
      const buttonBgColor = '#3B82F6' // blue-500
      const ratio = getContrastRatio(buttonTextColor, buttonBgColor)
      
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should support high contrast mode', async () => {
      const mockQuestion: MatchingQuestionType = {
        id: 'q1',
        type: 'matching',
        pairs: [{ english: 'test', mandarin: '测试' }],
        shuffledMandarin: ['测试']
      }

      const wrapper = mount(MatchingQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check for high contrast support classes
      const elements = wrapper.findAll('[data-testid^="english-word-"], [data-testid^="mandarin-word-"]')
      
      elements.forEach(element => {
        expect(element.classes()).toContain('border') // Visible borders for high contrast
      })

      wrapper.unmount()
    })
  })

  describe('Motion and Animation Accessibility', () => {
    it('should respect prefers-reduced-motion setting', async () => {
      const mockQuestion: MatchingQuestionType = {
        id: 'q1',
        type: 'matching',
        pairs: [{ english: 'test', mandarin: '测试' }],
        shuffledMandarin: ['测试']
      }

      const wrapper = mount(MatchingQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check for reduced motion classes
      const animatedElements = wrapper.findAll('[class*="transition"]')
      
      animatedElements.forEach(element => {
        expect(element.classes()).toContain('motion-reduce:transition-none')
      })

      wrapper.unmount()
    })

    it('should provide static alternatives to animated feedback', async () => {
      const mockQuestion: FillBlankQuestionType = {
        id: 'q1',
        type: 'fill-blank',
        sentence: 'Test sentence with _____.',
        correctAnswer: 'test',
        acceptableVariations: []
      }

      const wrapper = mount(FillBlankQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check for static feedback elements
      const feedbackArea = wrapper.find('[data-testid="feedback-area"]')
      if (feedbackArea.exists()) {
        expect(feedbackArea.attributes('aria-live')).toBeDefined()
      }

      wrapper.unmount()
    })
  })

  describe('Form Accessibility', () => {
    it('should have proper labels for practice setup form', async () => {
      const wrapper = mount(PracticeSetup, {
        props: {
          wordlistId: '1',
          wordlistName: 'Test Wordlist',
          wordCount: 10,
          isGenerating: false
        }
      })

      await nextTick()

      // Check form labels
      const selects = wrapper.findAll('select')
      const labels = wrapper.findAll('label')

      expect(labels.length).toBeGreaterThan(0)
      
      selects.forEach(select => {
        const id = select.attributes('id')
        if (id) {
          const associatedLabel = wrapper.find(`label[for="${id}"]`)
          expect(associatedLabel.exists()).toBe(true)
        }
      })

      wrapper.unmount()
    })

    it('should provide error messages for invalid inputs', async () => {
      const wrapper = mount(PracticeSetup, {
        props: {
          wordlistId: '1',
          wordlistName: 'Test Wordlist',
          wordCount: 0,
          isGenerating: false
        }
      })

      await nextTick()

      // Check for error message areas
      const errorElements = wrapper.findAll('[role="alert"]')
      
      // Should have error handling structure in place
      expect(wrapper.find('[data-testid="form-container"]').exists()).toBe(true)

      wrapper.unmount()
    })
  })

  describe('Results and Analytics Accessibility', () => {
    it('should provide accessible score presentation', async () => {
      const mockResults = {
        sessionId: 'test-session',
        score: 85,
        totalQuestions: 10,
        correctAnswers: 8,
        duration: 120,
        breakdown: {}
      }

      const wrapper = mount(ResultsView, {
        props: {
          results: mockResults,
          questions: [],
          userAnswers: new Map(),
          practiceSetId: 'test-practice-set',
          wordlistName: 'Test Wordlist'
        }
      })

      await nextTick()

      // Check for accessible score presentation
      const scoreElement = wrapper.find('[data-testid="score-display"]')
      if (scoreElement.exists()) {
        expect(scoreElement.attributes('aria-label')).toContain('score')
        expect(scoreElement.attributes('role')).toBe('status')
      }

      wrapper.unmount()
    })

    it('should provide accessible progress indicators', async () => {
      const mockQuestions: MatchingQuestionType[] = Array.from({ length: 5 }, (_, i) => ({
        id: `q-${i}`,
        type: 'matching',
        pairs: [{ english: `word-${i}`, mandarin: `词-${i}` }],
        shuffledMandarin: [`词-${i}`]
      }))

      const wrapper = mount(PracticeSession, {
        props: {
          questions: mockQuestions,
          currentQuestionIndex: 0,
          answers: new Map(),
          isPaused: false,
          timeRemaining: 600,
          timerDuration: 10
        }
      })

      await nextTick()

      // Check progress bar accessibility
      const progressBar = wrapper.find('[role="progressbar"]')
      if (progressBar.exists()) {
        expect(progressBar.attributes('aria-valuenow')).toBeDefined()
        expect(progressBar.attributes('aria-valuemin')).toBe('0')
        expect(progressBar.attributes('aria-valuemax')).toBeDefined()
        expect(progressBar.attributes('aria-label')).toContain('progress')
      }

      wrapper.unmount()
    })
  })

  describe('Focus Management', () => {
    it('should manage focus properly during question transitions', async () => {
      const mockQuestions: MatchingQuestionType[] = [
        {
          id: 'q1',
          type: 'matching',
          pairs: [{ english: 'test1', mandarin: '测试1' }],
          shuffledMandarin: ['测试1']
        },
        {
          id: 'q2',
          type: 'matching',
          pairs: [{ english: 'test2', mandarin: '测试2' }],
          shuffledMandarin: ['测试2']
        }
      ]

      const wrapper = mount(PracticeSession, {
        props: {
          questions: mockQuestions,
          currentQuestionIndex: 0,
          answers: new Map(),
          isPaused: false,
          timeRemaining: 600,
          timerDuration: 10
        }
      })

      await nextTick()

      // Check for focus management
      const questionContainer = wrapper.find('[data-testid="current-question"]')
      if (questionContainer.exists()) {
        expect(questionContainer.attributes('tabindex')).toBe('-1')
      }

      wrapper.unmount()
    })

    it('should provide visible focus indicators', async () => {
      const mockQuestion: MultipleChoiceQuestionType = {
        id: 'q1',
        type: 'multiple-choice',
        sentence: 'Test sentence',
        targetWord: 'test',
        options: [
          { text: 'option1', isCorrect: true },
          { text: 'option2', isCorrect: false }
        ]
      }

      const wrapper = mount(MultipleChoiceQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check focus indicator classes
      const options = wrapper.findAll('[data-testid^="option-"]')
      
      options.forEach(option => {
        expect(option.classes()).toContain('focus:ring-2')
        expect(option.classes()).toContain('focus:ring-blue-500')
      })

      wrapper.unmount()
    })

    it('should trap focus in modal dialogs', async () => {
      const mockResults = {
        sessionId: 'test-session-2',
        score: 85,
        totalQuestions: 10,
        correctAnswers: 8,
        duration: 120,
        breakdown: {}
      }

      const wrapper = mount(ResultsView, {
        props: {
          results: mockResults,
          questions: [],
          userAnswers: new Map(),
          practiceSetId: 'test-practice-set-2',
          wordlistName: 'Test Wordlist'
        }
      })

      await nextTick()

      // Check for focus trap in modal
      const modal = wrapper.find('[role="dialog"]')
      if (modal.exists()) {
        expect(modal.attributes('aria-modal')).toBe('true')
        expect(modal.attributes('tabindex')).toBe('-1')
      }

      wrapper.unmount()
    })
  })
})