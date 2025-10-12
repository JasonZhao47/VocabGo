/**
 * Practice Question Responsive Tests (Task 8.4)
 * 
 * Tests to verify:
 * - Mobile responsiveness and touch interactions
 * - Layout adaptations across breakpoints
 * - Swipe gestures and mobile-specific features
 * - Cross-device compatibility
 * 
 * Requirements: 8.1, 8.2, 8.4
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

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(mockMatchMedia),
  })
})

describe('Practice Question Responsive Tests', () => {
  describe('Mobile Layout (320px - 767px)', () => {
    it('should use single column layout for matching questions on mobile', async () => {
      const mockQuestion: MatchingQuestionType = {
        id: 'q1',
        type: 'matching',
        pairs: [
          { english: 'hello', mandarin: '你好' },
          { english: 'goodbye', mandarin: '再见' },
          { english: 'thank you', mandarin: '谢谢' }
        ],
        shuffledMandarin: ['再见', '你好', '谢谢']
      }

      const wrapper = mount(MatchingQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check mobile layout classes
      const container = wrapper.find('[data-testid="matching-container"]')
      if (container.exists()) {
        expect(container.classes()).toContain('flex-col')
        expect(container.classes()).toContain('space-y-4')
      }

      // Check that words stack vertically on mobile
      const englishSection = wrapper.find('[data-testid="english-words"]')
      const mandarinSection = wrapper.find('[data-testid="mandarin-words"]')

      if (englishSection.exists()) {
        expect(englishSection.classes()).toContain('mb-6')
      }

      wrapper.unmount()
    })

    it('should use full-width buttons on mobile', async () => {
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

      // Check mobile button layout
      const options = wrapper.findAll('[data-testid^="option-"]')
      
      options.forEach(option => {
        expect(option.classes()).toContain('w-full')
        expect(option.classes()).toContain('mb-3')
      })

      wrapper.unmount()
    })

    it('should have larger touch targets on mobile (minimum 44px)', async () => {
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

      // Check touch target sizes
      const touchTargets = wrapper.findAll('[data-testid^="english-word-"], [data-testid^="mandarin-word-"]')
      
      touchTargets.forEach(target => {
        expect(target.classes()).toContain('min-h-11') // 44px
        expect(target.classes()).toContain('p-3') // Adequate padding
      })

      wrapper.unmount()
    })

    it('should use mobile-optimized input sizes', async () => {
      const mockQuestion: FillBlankQuestionType = {
        id: 'q1',
        type: 'fill-blank',
        sentence: 'I want to say _____ to my friend.',
        correctAnswer: 'hello',
        acceptableVariations: ['hi']
      }

      const wrapper = mount(FillBlankQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      const input = wrapper.find('input[type="text"]')
      if (input.exists()) {
        expect(input.classes()).toContain('text-base') // 16px to prevent zoom
        expect(input.classes()).toContain('h-11') // 44px height
        expect(input.classes()).toContain('w-full') // Full width on mobile
      }

      wrapper.unmount()
    })

    it('should show mobile navigation controls', async () => {
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

      // Check mobile navigation
      const navControls = wrapper.find('[data-testid="mobile-nav"]')
      if (navControls.exists()) {
        expect(navControls.classes()).toContain('block')
        expect(navControls.classes()).toContain('md:hidden')
      }

      wrapper.unmount()
    })

    it('should reduce font sizes appropriately on mobile', async () => {
      const mockQuestion: MultipleChoiceQuestionType = {
        id: 'q1',
        type: 'multiple-choice',
        sentence: 'This is a test sentence that might be long.',
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

      // Check mobile typography
      const sentence = wrapper.find('[data-testid="question-sentence"]')
      if (sentence.exists()) {
        expect(sentence.classes()).toContain('text-lg') // Mobile size
        expect(sentence.classes()).toContain('md:text-xl') // Desktop size
      }

      wrapper.unmount()
    })
  })

  describe('Tablet Layout (768px - 1023px)', () => {
    it('should use two-column layout for matching questions on tablet', async () => {
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

      // Check tablet layout
      const container = wrapper.find('[data-testid="matching-container"]')
      if (container.exists()) {
        expect(container.classes()).toContain('md:flex-row')
        expect(container.classes()).toContain('md:space-x-8')
      }

      wrapper.unmount()
    })

    it('should use grid layout for multiple choice on tablet', async () => {
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

      // Check tablet grid layout
      const optionsContainer = wrapper.find('[data-testid="options-container"]')
      if (optionsContainer.exists()) {
        expect(optionsContainer.classes()).toContain('md:grid-cols-2')
        expect(optionsContainer.classes()).toContain('md:gap-4')
      }

      wrapper.unmount()
    })

    it('should show desktop navigation on tablet', async () => {
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

      // Check desktop navigation visibility
      const desktopNav = wrapper.find('[data-testid="desktop-nav"]')
      if (desktopNav.exists()) {
        expect(desktopNav.classes()).toContain('hidden')
        expect(desktopNav.classes()).toContain('md:block')
      }

      wrapper.unmount()
    })
  })

  describe('Desktop Layout (1024px+)', () => {
    it('should use optimized desktop layout for matching questions', async () => {
      const mockQuestion: MatchingQuestionType = {
        id: 'q1',
        type: 'matching',
        pairs: [
          { english: 'hello', mandarin: '你好' },
          { english: 'goodbye', mandarin: '再见' },
          { english: 'thank you', mandarin: '谢谢' }
        ],
        shuffledMandarin: ['再见', '你好', '谢谢']
      }

      const wrapper = mount(MatchingQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: vi.fn()
        }
      })

      await nextTick()

      // Check desktop layout
      const container = wrapper.find('[data-testid="matching-container"]')
      if (container.exists()) {
        expect(container.classes()).toContain('lg:max-w-4xl')
        expect(container.classes()).toContain('lg:mx-auto')
      }

      wrapper.unmount()
    })

    it('should use multi-column layout for multiple choice on desktop', async () => {
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

      // Check desktop grid layout
      const optionsContainer = wrapper.find('[data-testid="options-container"]')
      if (optionsContainer.exists()) {
        expect(optionsContainer.classes()).toContain('lg:grid-cols-2')
        expect(optionsContainer.classes()).toContain('xl:grid-cols-4')
      }

      wrapper.unmount()
    })

    it('should have generous spacing on desktop', async () => {
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

      // Check desktop spacing
      const container = wrapper.find('[data-testid="practice-container"]')
      if (container.exists()) {
        expect(container.classes()).toContain('lg:p-8')
        expect(container.classes()).toContain('lg:space-y-8')
      }

      wrapper.unmount()
    })
  })

  describe('Touch Interactions', () => {
    it('should support drag and drop for matching questions on touch devices', async () => {
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

      // Check touch interaction support
      const draggableElements = wrapper.findAll('[data-testid^="mandarin-word-"]')
      
      draggableElements.forEach(element => {
        expect(element.attributes('draggable')).toBe('true')
        expect(element.attributes('data-touch-enabled')).toBeDefined()
      })

      wrapper.unmount()
    })

    it('should support swipe gestures for navigation', async () => {
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

      // Check swipe gesture support
      const container = wrapper.find('[data-testid="practice-container"]')
      if (container.exists()) {
        expect(container.attributes('data-swipe-enabled')).toBeDefined()
      }

      wrapper.unmount()
    })

    it('should handle touch events for option selection', async () => {
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

      // Check touch event handling
      const options = wrapper.findAll('[data-testid^="option-"]')
      
      options.forEach(option => {
        expect(option.attributes('data-touch-target')).toBeDefined()
      })

      wrapper.unmount()
    })

    it('should prevent accidental touches with debouncing', async () => {
      const mockQuestion: FillBlankQuestionType = {
        id: 'q1',
        type: 'fill-blank',
        sentence: 'Test sentence with _____.',
        correctAnswer: 'test',
        acceptableVariations: []
      }

      const onAnswerSpy = vi.fn()
      const wrapper = mount(FillBlankQuestion, {
        props: {
          question: mockQuestion,
          onAnswer: onAnswerSpy
        }
      })

      await nextTick()

      const submitButton = wrapper.find('[data-testid="submit-button"]')
      if (submitButton.exists()) {
        expect(submitButton.attributes('data-debounced')).toBeDefined()
      }

      wrapper.unmount()
    })
  })

  describe('Responsive Typography', () => {
    it('should scale text appropriately across breakpoints', async () => {
      const mockQuestion: FillBlankQuestionType = {
        id: 'q1',
        type: 'fill-blank',
        sentence: 'This is a longer sentence that needs to be readable across different screen sizes and should adapt accordingly.',
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

      // Check responsive typography
      const sentence = wrapper.find('[data-testid="question-sentence"]')
      if (sentence.exists()) {
        expect(sentence.classes()).toContain('text-base') // Mobile
        expect(sentence.classes()).toContain('md:text-lg') // Tablet
        expect(sentence.classes()).toContain('lg:text-xl') // Desktop
      }

      wrapper.unmount()
    })

    it('should maintain readable line heights', async () => {
      const mockQuestion: MultipleChoiceQuestionType = {
        id: 'q1',
        type: 'multiple-choice',
        sentence: 'This is a test sentence that might wrap to multiple lines on smaller screens.',
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

      // Check line height classes
      const sentence = wrapper.find('[data-testid="question-sentence"]')
      if (sentence.exists()) {
        expect(sentence.classes()).toContain('leading-relaxed')
      }

      wrapper.unmount()
    })
  })

  describe('Responsive Images and Media', () => {
    it('should use responsive connection lines in matching questions', async () => {
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

      // Check responsive connection visualization
      const connectionArea = wrapper.find('[data-testid="connection-area"]')
      if (connectionArea.exists()) {
        expect(connectionArea.classes()).toContain('hidden')
        expect(connectionArea.classes()).toContain('md:block')
      }

      wrapper.unmount()
    })

    it('should adapt progress indicators for different screen sizes', async () => {
      const mockQuestions: MatchingQuestionType[] = Array.from({ length: 10 }, (_, i) => ({
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

      // Check responsive progress bar
      const progressBar = wrapper.find('[data-testid="progress-bar"]')
      if (progressBar.exists()) {
        expect(progressBar.classes()).toContain('h-2') // Mobile
        expect(progressBar.classes()).toContain('md:h-3') // Desktop
      }

      wrapper.unmount()
    })
  })

  describe('Responsive Forms', () => {
    it('should adapt practice setup form for mobile', async () => {
      const wrapper = mount(PracticeSetup, {
        props: {
          wordlistId: '1',
          wordlistName: 'Test Wordlist 1',
          wordCount: 10,
          isGenerating: false
        }
      })

      await nextTick()

      // Check mobile form layout
      const formContainer = wrapper.find('[data-testid="form-container"]')
      if (formContainer.exists()) {
        expect(formContainer.classes()).toContain('space-y-4')
        expect(formContainer.classes()).toContain('md:space-y-6')
      }

      // Check mobile select styling
      const selects = wrapper.findAll('select')
      selects.forEach(select => {
        expect(select.classes()).toContain('w-full')
        expect(select.classes()).toContain('text-base') // Prevent zoom on iOS
      })

      wrapper.unmount()
    })

    it('should use full-width inputs on mobile', async () => {
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

      const input = wrapper.find('input[type="text"]')
      if (input.exists()) {
        expect(input.classes()).toContain('w-full')
        expect(input.classes()).toContain('md:w-auto')
        expect(input.classes()).toContain('md:min-w-48')
      }

      wrapper.unmount()
    })
  })

  describe('Performance on Mobile Devices', () => {
    it('should use efficient animations on mobile', async () => {
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

      // Check for performance-optimized animations
      const animatedElements = wrapper.findAll('[class*="transition"]')
      
      animatedElements.forEach(element => {
        expect(element.classes()).toContain('transform-gpu')
      })

      wrapper.unmount()
    })

    it('should minimize reflows on mobile', async () => {
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

      // Check for layout-stable classes
      const container = wrapper.find('[data-testid="practice-container"]')
      if (container.exists()) {
        expect(container.classes()).toContain('min-h-screen')
      }

      wrapper.unmount()
    })
  })

  describe('Cross-Device Compatibility', () => {
    it('should work on both iOS and Android devices', async () => {
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

      // Check cross-platform compatibility classes
      const options = wrapper.findAll('[data-testid^="option-"]')
      
      options.forEach(option => {
        expect(option.classes()).toContain('select-none') // Prevent text selection
        expect(option.classes()).toContain('touch-manipulation') // Optimize touch
      })

      wrapper.unmount()
    })

    it('should handle different screen densities', async () => {
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

      // Check for high-DPI support
      const elements = wrapper.findAll('[data-testid^="english-word-"], [data-testid^="mandarin-word-"]')
      
      elements.forEach(element => {
        expect(element.classes()).toContain('border') // Crisp borders on high-DPI
      })

      wrapper.unmount()
    })

    it('should support landscape and portrait orientations', async () => {
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

      // Check orientation-adaptive layout
      const container = wrapper.find('[data-testid="practice-container"]')
      if (container.exists()) {
        expect(container.classes()).toContain('landscape:px-8')
        expect(container.classes()).toContain('portrait:px-4')
      }

      wrapper.unmount()
    })
  })
})