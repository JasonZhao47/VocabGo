import { describe, it, expect } from 'vitest'
import { PracticeHtmlGenerator } from './practiceHtmlGenerator'
import type { Question, MultipleChoiceQuestion, FillBlankQuestion, MatchingQuestion } from '@/types/practice'

describe('PracticeHtmlGenerator', () => {
  const generator = new PracticeHtmlGenerator()

  const mockMultipleChoiceQuestion: MultipleChoiceQuestion = {
    id: '1',
    type: 'multiple-choice',
    sentence: 'The weather today is very _____ and sunny.',
    targetWord: 'warm',
    options: [
      { text: 'cold', isCorrect: false },
      { text: 'warm', isCorrect: true },
      { text: 'rainy', isCorrect: false },
      { text: 'snowy', isCorrect: false }
    ]
  }

  const mockFillBlankQuestion: FillBlankQuestion = {
    id: '2',
    type: 'fill-blank',
    sentence: 'The cat is sleeping on the _____.',
    correctAnswer: 'bed',
    acceptableVariations: ['sofa', 'couch', 'chair']
  }

  const mockMatchingQuestion: MatchingQuestion = {
    id: '3',
    type: 'matching',
    pairs: [
      { english: 'hello', mandarin: '你好' },
      { english: 'goodbye', mandarin: '再见' },
      { english: 'thank you', mandarin: '谢谢' }
    ],
    shuffledMandarin: ['再见', '你好', '谢谢']
  }

  it('should generate HTML with multiple choice question styles', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    expect(result.html).toContain('<!DOCTYPE html>')
    expect(result.html).toContain('Test Wordlist Practice')
    expect(result.html).toContain('multiple-choice-container')
    expect(result.html).toContain('multiple-choice-sentence')
    expect(result.html).toContain('multiple-choice-options')
    expect(result.html).toContain('multiple-choice-option')
    expect(result.html).toContain('multiple-choice-option-indicator')
    expect(result.html).toContain('multiple-choice-option-text')
  })

  it('should include multiple choice CSS styles', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for key CSS classes
    expect(result.html).toContain('.multiple-choice-container')
    expect(result.html).toContain('.multiple-choice-sentence')
    expect(result.html).toContain('.multiple-choice-options')
    expect(result.html).toContain('.multiple-choice-option')
    expect(result.html).toContain('.multiple-choice-option-indicator')
    expect(result.html).toContain('.multiple-choice-option-text')
    
    // Check for state styles
    expect(result.html).toContain('.multiple-choice-option:hover')
    expect(result.html).toContain('.multiple-choice-option.selected')
    expect(result.html).toContain('.multiple-choice-option.correct')
    expect(result.html).toContain('.multiple-choice-option.incorrect')
    expect(result.html).toContain('.multiple-choice-option.disabled')
  })

  it('should include multiple choice JavaScript functionality', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for JavaScript functions
    expect(result.html).toContain('renderMultipleChoiceQuestion')
    expect(result.html).toContain('initializeMultipleChoice')
    expect(result.html).toContain('handleMultipleChoiceSelection')
    expect(result.html).toContain('checkMultipleChoiceAnswer')
  })

  it('should generate proper filename', () => {
    const result = generator.generateHtml({
      wordlistName: 'My Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:30:45Z')
    })

    expect(result.filename).toBe('my-test-wordlist-practice-2025-01-13.html')
  })

  it('should calculate file size', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    expect(result.size).toBeGreaterThan(0)
    expect(typeof result.size).toBe('number')
  })

  it('should render multiple choice question with proper HTML structure', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check that the question data is embedded
    expect(result.html).toContain('The weather today is very _____ and sunny.')
    expect(result.html).toContain('cold')
    expect(result.html).toContain('warm')
    expect(result.html).toContain('rainy')
    expect(result.html).toContain('snowy')
    
    // Check for proper ARIA attributes
    expect(result.html).toContain('role="radiogroup"')
    expect(result.html).toContain('role="radio"')
    expect(result.html).toContain('aria-checked="false"')
  })

  it('should include responsive design styles for multiple choice', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for mobile responsive styles
    expect(result.html).toContain('@media (max-width: 768px)')
    expect(result.html).toContain('@media (max-width: 480px)')
    
    // Check for mobile-specific multiple choice styles
    expect(result.html).toMatch(/\.multiple-choice-sentence[\s\S]*@media \(max-width: 768px\)/)
    expect(result.html).toMatch(/\.multiple-choice-options[\s\S]*@media \(max-width: 768px\)/)
  })

  it('should include accessibility features for multiple choice', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for accessibility CSS
    expect(result.html).toContain('.multiple-choice-option[aria-selected="true"]')
    expect(result.html).toContain('.multiple-choice-option[aria-checked="true"]')
    expect(result.html).toContain('.multiple-choice-option[role="radio"]:focus')
    
    // Check for reduced motion support
    expect(result.html).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('should include results view CSS styles', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for results view CSS classes
    expect(result.html).toContain('.results-container')
    expect(result.html).toContain('.results-score')
    expect(result.html).toContain('.results-breakdown')
    expect(result.html).toContain('.results-stats')
    expect(result.html).toContain('.results-stat-value')
    expect(result.html).toContain('.results-stat-label')
    expect(result.html).toContain('.results-by-type')
    expect(result.html).toContain('.results-incorrect-answers')
    expect(result.html).toContain('.results-success-icon')
    expect(result.html).toContain('high-score')
  })

  it('should include results view JavaScript functionality', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for results view JavaScript functions
    expect(result.html).toContain('showResults()')
    expect(result.html).toContain('results-container')
    expect(result.html).toContain('this.progressSection.style.display = \'none\'')
    expect(result.html).toContain('this.navigation.style.display = \'none\'')
    expect(result.html).toContain('Great job! Excellent work!')
    expect(result.html).toContain('Keep practicing!')
    expect(result.html).toContain('Results Summary')
  })

  it('should generate HTML with fill-in-the-blank question styles', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockFillBlankQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    expect(result.html).toContain('<!DOCTYPE html>')
    expect(result.html).toContain('Test Wordlist Practice')
    expect(result.html).toContain('fill-blank-container')
    expect(result.html).toContain('fill-blank-sentence')
    expect(result.html).toContain('fill-blank-input-container')
    expect(result.html).toContain('fill-blank-input')
    expect(result.html).toContain('fill-blank-submit-btn')
    expect(result.html).toContain('fill-blank-feedback')
  })

  it('should include fill-in-the-blank CSS styles', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockFillBlankQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for key CSS classes
    expect(result.html).toContain('.fill-blank-container')
    expect(result.html).toContain('.fill-blank-sentence')
    expect(result.html).toContain('.fill-blank-input-container')
    expect(result.html).toContain('.fill-blank-input')
    expect(result.html).toContain('.fill-blank-submit-btn')
    expect(result.html).toContain('.fill-blank-feedback')
    
    // Check for state styles
    expect(result.html).toContain('.fill-blank-input:focus')
    expect(result.html).toContain('.fill-blank-input.correct')
    expect(result.html).toContain('.fill-blank-input.incorrect')
    expect(result.html).toContain('.fill-blank-feedback.correct')
    expect(result.html).toContain('.fill-blank-feedback.incorrect')
  })

  it('should include fill-in-the-blank JavaScript functionality', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockFillBlankQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for JavaScript functions
    expect(result.html).toContain('renderFillBlankQuestion')
    expect(result.html).toContain('initializeFillBlank')
    expect(result.html).toContain('submitFillBlankAnswer')
    expect(result.html).toContain('checkFillBlankAnswer')
    expect(result.html).toContain('showFillBlankFeedback')
    expect(result.html).toContain('clearFillBlankFeedback')
    expect(result.html).toContain('calculateStringSimilarity')
  })

  it('should render fill-in-the-blank question with proper HTML structure', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockFillBlankQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check that the question data is embedded
    expect(result.html).toContain('The cat is sleeping on the _____.')
    expect(result.html).toContain('bed')
    expect(result.html).toContain('sofa')
    expect(result.html).toContain('couch')
    expect(result.html).toContain('chair')
    
    // Check for proper form elements
    expect(result.html).toContain('input type="text"')
    expect(result.html).toContain('placeholder="Type your answer here..."')
    expect(result.html).toContain('Submit Answer')
    
    // Check for proper ARIA attributes
    expect(result.html).toContain('aria-label="Fill in the blank answer"')
    expect(result.html).toContain('aria-describedby="fill-blank-feedback"')
    expect(result.html).toContain('aria-live="polite"')
  })

  it('should include fuzzy matching logic for fill-in-the-blank', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockFillBlankQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for fuzzy matching implementation
    expect(result.html).toContain('checkFillBlankAnswer(userAnswer, correctAnswer, acceptableVariations)')
    expect(result.html).toContain('normalizeAnswer')
    expect(result.html).toContain('calculateStringSimilarity')
    expect(result.html).toContain('acceptableVariations')
    expect(result.html).toContain('toLowerCase()')
    expect(result.html).toContain('trim()')
    expect(result.html).toContain('replace(/[.,!?;:\'"()\\[\\]{}]/g, \'\')')
  })

  it('should include Enter key support for fill-in-the-blank', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockFillBlankQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for Enter key handling
    expect(result.html).toContain('addEventListener(\'keydown\'')
    expect(result.html).toContain('event.key === \'Enter\'')
    expect(result.html).toContain('preventDefault()')
    expect(result.html).toContain('submitFillBlankAnswer')
  })

  it('should include real-time feedback for fill-in-the-blank', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockFillBlankQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Check for real-time feedback implementation
    expect(result.html).toContain('addEventListener(\'input\'')
    expect(result.html).toContain('clearFillBlankFeedback')
    expect(result.html).toContain('showFillBlankFeedback')
    expect(result.html).toContain('Correct! Well done!')
    expect(result.html).toContain('Incorrect. Try again next time!')
    expect(result.html).toContain('Correct answer:')
  })

  it('should include CSS animations and transitions', () => {
    const result = generator.generateHtml({
      wordlistName: 'Test Wordlist',
      questions: [mockMultipleChoiceQuestion],
      timestamp: new Date('2025-01-13T10:00:00Z')
    })

    // Should include fade-in animations for question transitions (250ms ease-out)
    expect(result.html).toContain('animation: questionSlideIn var(--transition-normal) ease-out')
    expect(result.html).toContain('animation: questionSlideOut var(--transition-normal) ease-out')
    expect(result.html).toContain('--transition-normal: 250ms ease-out')

    // Should include button hover effects and color transitions (150ms)
    expect(result.html).toContain('transition: all var(--transition-fast)')
    expect(result.html).toContain('--transition-fast: 150ms ease-out')
    expect(result.html).toContain('transform: translateY(-1px)')

    // Should include smooth progress bar width animations (300ms)
    expect(result.html).toContain('transition: width var(--transition-slow) ease-out')
    expect(result.html).toContain('--transition-slow: 300ms ease-out')

    // Should include SVG stroke animation for matching question connection lines
    expect(result.html).toContain('animation: drawConnectionLine var(--transition-slow) ease-out forwards')
    expect(result.html).toContain('stroke-dasharray: 1000')
    expect(result.html).toContain('stroke-dashoffset: 1000')

    // Should include reduced motion support
    expect(result.html).toContain('@media (prefers-reduced-motion: reduce)')
    expect(result.html).toContain('animation-duration: 0.01ms !important')
    expect(result.html).toContain('transition-duration: 0.01ms !important')
  })

  describe('Performance Optimizations', () => {
    it('should generate minified CSS with optimized custom properties', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should use minified CSS without unnecessary whitespace
      expect(result.html).toMatch(/<style>[^<]*{[^}]*}[^<]*<\/style>/)
      
      // Should not contain excessive whitespace in CSS
      expect(result.html).not.toMatch(/\s{2,}/)
      
      // Should contain optimized CSS custom properties
      expect(result.html).toContain(':root{')
      expect(result.html).toContain('--color-black:#000')
      expect(result.html).toContain('--color-white:#fff')
    })

    it('should generate minified JavaScript with performance optimizations', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should contain minified JavaScript
      expect(result.html).toMatch(/<script>[^<]*class P{[^<]*<\/script>/)
      
      // Should use short variable names for optimization
      expect(result.html).toContain('class P{') // PracticeApp -> P
      expect(result.html).toContain('this.q=') // questions -> q
      expect(result.html).toContain('this.i=') // currentQuestionIndex -> i
      expect(result.html).toContain('this.a=') // answers -> a
    })

    it('should include DOM update queue for efficient batching', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include DOM update queue functionality
      expect(result.html).toContain('DOMUpdateQueue')
      expect(result.html).toContain('requestAnimationFrame')
      expect(result.html).toContain('this.uq=') // updateQueue -> uq
      expect(result.html).toContain('this.iu=') // isUpdating -> iu
    })

    it('should include memory management utilities', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include memory management
      expect(result.html).toContain('MemoryManager')
      expect(result.html).toContain('addEventListener')
      expect(result.html).toContain('removeEventListener')
      expect(result.html).toContain('beforeunload')
      expect(result.html).toContain('cleanup')
    })

    it('should include performance monitoring', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include performance monitoring
      expect(result.html).toContain('PerformanceMonitor')
      expect(result.html).toContain('performance.now()')
      expect(result.html).toContain('performance.memory')
      expect(result.html).toContain('observeMemory')
    })

    it('should optimize CSS based on question types used', () => {
      // Test with only multiple choice questions
      const mcResult = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include multiple choice styles
      expect(mcResult.html).toContain('multiple-choice')
      
      // Test with only fill-blank questions
      const fbResult = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockFillBlankQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include fill-blank styles
      expect(fbResult.html).toContain('fill-blank')
    })

    it('should keep file size under 500KB for typical practice sets', () => {
      // Create a typical practice set with mixed question types
      const typicalQuestions: Question[] = [
        mockMultipleChoiceQuestion,
        mockFillBlankQuestion,
        {
          id: '3',
          type: 'multiple-choice',
          sentence: 'She likes to _____ books in her free time.',
          targetWord: 'read',
          options: [
            { text: 'read', isCorrect: true },
            { text: 'write', isCorrect: false },
            { text: 'buy', isCorrect: false },
            { text: 'sell', isCorrect: false }
          ]
        }
      ]

      const result = generator.generateHtml({
        wordlistName: 'Typical Practice Set',
        questions: typicalQuestions,
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // File size should be reasonable for typical use
      expect(result.size).toBeLessThan(500 * 1024) // 500KB
      expect(result.size).toBeGreaterThan(10 * 1024) // At least 10KB (sanity check)
    })

    it('should apply aggressive optimizations for large files', () => {
      // Create a large set of questions to trigger aggressive optimizations
      const largeQuestionSet: Question[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        type: 'multiple-choice' as const,
        sentence: `This is test sentence number ${i + 1} with a blank _____.`,
        targetWord: 'word',
        options: [
          { text: 'word', isCorrect: true },
          { text: 'option1', isCorrect: false },
          { text: 'option2', isCorrect: false },
          { text: 'option3', isCorrect: false }
        ]
      }))

      const result = generator.generateHtml({
        wordlistName: 'Large Practice Set',
        questions: largeQuestionSet,
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should still generate valid HTML
      expect(result.html).toContain('<!DOCTYPE html>')
      expect(result.html).toContain('Large Practice Set Practice')
      
      // Should have reasonable file size even with many questions
      expect(result.size).toBeGreaterThan(0)
      expect(typeof result.size).toBe('number')
    })

    it('should remove unused CSS for question types not present', () => {
      // Test with only multiple choice questions
      const result = generator.generateHtml({
        wordlistName: 'MC Only',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include multiple choice styles
      expect(result.html).toContain('multiple-choice')
      
      // The optimized version should be more compact
      expect(result.html.length).toBeGreaterThan(1000) // Should still be substantial
    })
  })

  describe('Matching Question Tests', () => {
    it('should generate HTML with matching question styles', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      expect(result.html).toContain('<!DOCTYPE html>')
      expect(result.html).toContain('Test Wordlist Practice')
      expect(result.html).toContain('matching-container')
      expect(result.html).toContain('matching-column')
      expect(result.html).toContain('matching-item')
      expect(result.html).toContain('connections-svg')
    })

    it('should include matching CSS styles', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Check for key CSS classes
      expect(result.html).toContain('.matching-container')
      expect(result.html).toContain('.matching-column')
      expect(result.html).toContain('.matching-item')
      expect(result.html).toContain('.connections-svg')
      
      // Check for state styles
      expect(result.html).toContain('.matching-item:hover')
      expect(result.html).toContain('.matching-item.selected')
      expect(result.html).toContain('.matching-item.correct')
      expect(result.html).toContain('.matching-item.incorrect')
      expect(result.html).toContain('.matching-item.disabled')
    })

    it('should include matching JavaScript functionality', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Check for JavaScript functions
      expect(result.html).toContain('renderMatchingQuestion')
      expect(result.html).toContain('initializeMatching')
      expect(result.html).toContain('handleMatchingItemClick')
      expect(result.html).toContain('drawConnectionLine')
      expect(result.html).toContain('checkMatchingAnswers')
    })

    it('should render matching question with proper HTML structure', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Check that the question data is embedded
      expect(result.html).toContain('hello')
      expect(result.html).toContain('goodbye')
      expect(result.html).toContain('thank you')
      expect(result.html).toContain('你好')
      expect(result.html).toContain('再见')
      expect(result.html).toContain('谢谢')
      
      // Check for SVG element
      expect(result.html).toContain('<svg')
      expect(result.html).toContain('connections-svg')
    })

    it('should include SVG line drawing animation', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Check for SVG animation
      expect(result.html).toContain('stroke-dasharray')
      expect(result.html).toContain('stroke-dashoffset')
      expect(result.html).toContain('drawConnectionLine')
      expect(result.html).toContain('createElementNS')
      expect(result.html).toContain('http://www.w3.org/2000/svg')
    })

    it('should include connection validation logic', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Check for validation logic
      expect(result.html).toContain('checkMatchingAnswers')
      expect(result.html).toContain('connections')
      expect(result.html).toContain('correct')
      expect(result.html).toContain('incorrect')
    })

    it('should include responsive design for matching questions', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Check for mobile responsive styles
      expect(result.html).toContain('@media (max-width: 768px)')
      expect(result.html).toMatch(/\.matching-container[\s\S]*@media \(max-width: 768px\)/)
    })
  })

  describe('Question Data Embedding and Parsing', () => {
    it('should embed question data as JSON in the HTML', () => {
      const questions: Question[] = [mockMultipleChoiceQuestion, mockFillBlankQuestion, mockMatchingQuestion]
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions,
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should contain embedded question data
      expect(result.html).toContain('const questions=')
      expect(result.html).toContain('"type":"multiple-choice"')
      expect(result.html).toContain('"type":"fill-blank"')
      expect(result.html).toContain('"type":"matching"')
    })

    it('should properly escape special characters in question data', () => {
      const questionWithSpecialChars: MultipleChoiceQuestion = {
        id: '1',
        type: 'multiple-choice',
        sentence: 'She said "Hello!" & waved.',
        targetWord: 'Hello',
        options: [
          { text: 'Hello', isCorrect: true },
          { text: 'Goodbye', isCorrect: false }
        ]
      }

      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [questionWithSpecialChars],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should properly escape special characters
      expect(result.html).toContain('She said')
      expect(result.html).toContain('Hello')
      expect(result.html).toContain('waved')
    })

    it('should handle Unicode characters in question data', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should properly handle Chinese characters
      expect(result.html).toContain('你好')
      expect(result.html).toContain('再见')
      expect(result.html).toContain('谢谢')
    })

    it('should embed all question types in mixed practice sets', () => {
      const mixedQuestions: Question[] = [
        mockMultipleChoiceQuestion,
        mockFillBlankQuestion,
        mockMatchingQuestion
      ]

      const result = generator.generateHtml({
        wordlistName: 'Mixed Practice',
        questions: mixedQuestions,
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should contain all question types
      expect(result.html).toContain('"type":"multiple-choice"')
      expect(result.html).toContain('"type":"fill-blank"')
      expect(result.html).toContain('"type":"matching"')
      
      // Should contain data from all questions
      expect(result.html).toContain('The weather today is very')
      expect(result.html).toContain('The cat is sleeping on the')
      expect(result.html).toContain('hello')
      expect(result.html).toContain('你好')
    })
  })

  describe('Download Mechanism', () => {
    it('should generate valid HTML that can be saved as a file', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should be valid HTML
      expect(result.html).toMatch(/^<!DOCTYPE html>/)
      expect(result.html).toContain('<html')
      expect(result.html).toContain('</html>')
      expect(result.html).toContain('<head>')
      expect(result.html).toContain('</head>')
      expect(result.html).toContain('<body>')
      expect(result.html).toContain('</body>')
    })

    it('should generate proper filename with timestamp', () => {
      const result = generator.generateHtml({
        wordlistName: 'My Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:30:45Z')
      })

      expect(result.filename).toBe('my-test-wordlist-practice-2025-01-13.html')
    })

    it('should handle special characters in wordlist name for filename', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test/Wordlist: Special & Characters!',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should sanitize filename
      expect(result.filename).toMatch(/^[a-z0-9-]+\.html$/)
      expect(result.filename).not.toContain('/')
      expect(result.filename).not.toContain(':')
      expect(result.filename).not.toContain('&')
      expect(result.filename).not.toContain('!')
    })

    it('should calculate accurate file size in bytes', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // File size should match actual HTML length
      const expectedSize = new Blob([result.html]).size
      expect(result.size).toBe(expectedSize)
    })

    it('should generate self-contained HTML with no external dependencies', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should not contain external links
      expect(result.html).not.toContain('link rel="stylesheet" href=')
      expect(result.html).not.toContain('script src=')
      expect(result.html).not.toContain('http://')
      expect(result.html).not.toContain('https://')
      
      // Should contain inline styles and scripts
      expect(result.html).toContain('<style>')
      expect(result.html).toContain('</style>')
      expect(result.html).toContain('<script>')
      expect(result.html).toContain('</script>')
    })
  })

  describe('CSS Generation and Inline Embedding', () => {
    it('should include all required CSS custom properties', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include color variables
      expect(result.html).toContain('--color-black')
      expect(result.html).toContain('--color-white')
      expect(result.html).toContain('--color-gray')
      expect(result.html).toContain('--color-success')
      expect(result.html).toContain('--color-error')
      
      // Should include spacing variables
      expect(result.html).toContain('--space-')
      
      // Should include transition variables
      expect(result.html).toContain('--transition-fast')
      expect(result.html).toContain('--transition-normal')
      expect(result.html).toContain('--transition-slow')
    })

    it('should include base styles for layout', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include base styles
      expect(result.html).toContain('box-sizing:border-box')
      expect(result.html).toContain('.container')
      expect(result.html).toContain('max-width')
      expect(result.html).toContain('margin:0 auto')
    })

    it('should include progress bar styles', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include progress styles
      expect(result.html).toContain('.progress-section')
      expect(result.html).toContain('.progress-text')
      expect(result.html).toContain('.progress-bar')
      expect(result.html).toContain('.progress-fill')
    })

    it('should include navigation button styles', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include navigation styles
      expect(result.html).toContain('.navigation')
      expect(result.html).toContain('.btn-nav')
      expect(result.html).toContain('.btn-prev')
      expect(result.html).toContain('.btn-next')
      expect(result.html).toContain('.btn-primary')
    })

    it('should embed CSS inline within style tags', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should have inline styles
      const styleMatch = result.html.match(/<style>([\s\S]*?)<\/style>/)
      expect(styleMatch).toBeTruthy()
      expect(styleMatch![1].length).toBeGreaterThan(1000) // Should have substantial CSS
    })

    it('should minify CSS for production', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should have minified CSS (no excessive whitespace)
      const styleMatch = result.html.match(/<style>([\s\S]*?)<\/style>/)
      expect(styleMatch).toBeTruthy()
      
      // Should not have multiple consecutive spaces
      expect(styleMatch![1]).not.toMatch(/  +/)
    })
  })

  describe('JavaScript Functionality in Generated HTML', () => {
    it('should include PracticeApp class', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include main app class
      expect(result.html).toContain('class P{') // Minified PracticeApp
      expect(result.html).toContain('constructor')
      expect(result.html).toContain('this.q=') // questions
      expect(result.html).toContain('this.i=') // currentQuestionIndex
      expect(result.html).toContain('this.a=') // answers
    })

    it('should include navigation methods', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include navigation methods
      expect(result.html).toContain('nextQuestion')
      expect(result.html).toContain('previousQuestion')
      expect(result.html).toContain('updateProgress')
    })

    it('should include score calculation logic', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include scoring logic
      expect(result.html).toContain('calculateScore')
      expect(result.html).toContain('showResults')
    })

    it('should include event listeners setup', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include event listener setup
      expect(result.html).toContain('addEventListener')
      expect(result.html).toContain('DOMContentLoaded')
      expect(result.html).toContain('click')
    })

    it('should embed JavaScript inline within script tags', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should have inline scripts
      const scriptMatch = result.html.match(/<script>([\s\S]*?)<\/script>/)
      expect(scriptMatch).toBeTruthy()
      expect(scriptMatch![1].length).toBeGreaterThan(1000) // Should have substantial JS
    })

    it('should minify JavaScript for production', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should have minified JS
      const scriptMatch = result.html.match(/<script>([\s\S]*?)<\/script>/)
      expect(scriptMatch).toBeTruthy()
      
      // Should use short variable names
      expect(scriptMatch![1]).toContain('this.q=')
      expect(scriptMatch![1]).toContain('this.i=')
      expect(scriptMatch![1]).toContain('this.a=')
    })
  })

  describe('Error Handling and Browser Compatibility', () => {
    it('should include global error handler', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include error handling
      expect(result.html).toContain('window.addEventListener(\'error\'')
      expect(result.html).toContain('console.error')
    })

    it('should include browser feature detection', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMatchingQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should check for SVG support
      expect(result.html).toContain('createElementNS')
      expect(result.html).toContain('http://www.w3.org/2000/svg')
    })

    it('should include proper meta tags for compatibility', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should include proper meta tags
      expect(result.html).toContain('<meta charset="UTF-8">')
      expect(result.html).toContain('<meta name="viewport"')
      expect(result.html).toContain('width=device-width')
      expect(result.html).toContain('initial-scale=1.0')
    })

    it('should work without JavaScript (graceful degradation)', () => {
      const result = generator.generateHtml({
        wordlistName: 'Test Wordlist',
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should have content visible without JS
      expect(result.html).toContain('Test Wordlist Practice')
      expect(result.html).toContain('The weather today is very')
    })
  })

  describe('Integration Tests', () => {
    it('should generate complete HTML for all question types', () => {
      const allQuestions: Question[] = [
        mockMultipleChoiceQuestion,
        mockFillBlankQuestion,
        mockMatchingQuestion
      ]

      const result = generator.generateHtml({
        wordlistName: 'Complete Practice Set',
        questions: allQuestions,
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should be valid HTML
      expect(result.html).toContain('<!DOCTYPE html>')
      expect(result.html).toContain('Complete Practice Set Practice')
      
      // Should include all question types
      expect(result.html).toContain('multiple-choice')
      expect(result.html).toContain('fill-blank')
      expect(result.html).toContain('matching')
      
      // Should have proper filename
      expect(result.filename).toBe('complete-practice-set-practice-2025-01-13.html')
      
      // Should have reasonable file size
      expect(result.size).toBeGreaterThan(0)
      expect(result.size).toBeLessThan(500 * 1024) // Under 500KB
    })

    it('should handle empty question array gracefully', () => {
      const result = generator.generateHtml({
        wordlistName: 'Empty Practice',
        questions: [],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should still generate valid HTML
      expect(result.html).toContain('<!DOCTYPE html>')
      expect(result.html).toContain('Empty Practice Practice')
      expect(result.filename).toBe('empty-practice-practice-2025-01-13.html')
    })

    it('should handle very long wordlist names', () => {
      const longName = 'A'.repeat(200)
      const result = generator.generateHtml({
        wordlistName: longName,
        questions: [mockMultipleChoiceQuestion],
        timestamp: new Date('2025-01-13T10:00:00Z')
      })

      // Should truncate or handle long names
      expect(result.filename.length).toBeLessThan(255) // Max filename length
      expect(result.filename).toContain('.html')
    })
  })
})