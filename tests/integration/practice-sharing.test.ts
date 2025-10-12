import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateStaticHtml } from '@/services/htmlGenerationService'
import type { Question } from '@/types/practice'

describe('Practice Sharing Functionality', () => {
  describe('Static HTML Generation', () => {
    const mockQuestions: Question[] = [
      {
        id: '1',
        type: 'multiple-choice',
        sentence: 'The cat is very ___.',
        targetWord: 'cute',
        options: [
          { text: '可爱的', isCorrect: true },
          { text: '大的', isCorrect: false },
          { text: '小的', isCorrect: false },
          { text: '快的', isCorrect: false }
        ]
      },
      {
        id: '2',
        type: 'fill-blank',
        sentence: 'I need to ___ my homework.',
        correctAnswer: 'finish',
        acceptableVariations: ['complete', 'do'],
        hint: 'f'
      },
      {
        id: '3',
        type: 'matching',
        pairs: [
          { english: 'apple', mandarin: '苹果' },
          { english: 'book', mandarin: '书' }
        ],
        shuffledMandarin: ['书', '苹果']
      }
    ]

    it('should generate valid HTML structure', () => {
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName: 'Test Wordlist'
      })

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('</html>')
      expect(html).toContain('<head>')
      expect(html).toContain('<body>')
    })

    it('should include wordlist name in title and header', () => {
      const wordlistName = 'My Vocabulary List'
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName
      })

      expect(html).toContain(`<title>${wordlistName} - Practice Questions</title>`)
      expect(html).toContain(`<h1>${wordlistName}</h1>`)
    })

    it('should escape HTML special characters in wordlist name', () => {
      const wordlistName = '<script>alert("xss")</script>'
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName
      })

      // Should escape the malicious script in the title and header
      expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      // Should not have unescaped script tags in title/header (but will have legitimate script tags for functionality)
      expect(html).toContain('<title>&lt;script&gt;')
      expect(html).toContain('<h1>&lt;script&gt;')
    })

    it('should embed all questions as JSON', () => {
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName: 'Test'
      })

      expect(html).toContain('const questions = ')
      expect(html).toContain(JSON.stringify(mockQuestions))
    })

    it('should include self-contained CSS', () => {
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName: 'Test'
      })

      expect(html).toContain('<style>')
      expect(html).toContain('</style>')
      expect(html).toContain('.container')
      expect(html).toContain('.question')
      expect(html).toContain('.btn')
    })

    it('should include self-contained JavaScript', () => {
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName: 'Test'
      })

      expect(html).toContain('<script>')
      expect(html).toContain('</script>')
      expect(html).toContain('function renderQuestions()')
      expect(html).toContain('function submitAnswers()')
    })

    it('should include share URL when provided', () => {
      const shareUrl = 'https://example.com/share/abc123'
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName: 'Test',
        shareUrl
      })

      expect(html).toContain(shareUrl)
      expect(html).toContain('Share this practice set')
    })

    it('should not include share link when URL not provided', () => {
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName: 'Test'
      })

      expect(html).not.toContain('Share this practice set')
    })

    it('should handle empty questions array', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Empty List'
      })

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Empty List')
    })

    it('should include responsive meta viewport tag', () => {
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName: 'Test'
      })

      expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    })

    it('should include mobile-responsive CSS', () => {
      const html = generateStaticHtml({
        questions: mockQuestions,
        wordlistName: 'Test'
      })

      expect(html).toContain('@media (max-width: 640px)')
    })
  })

  describe('HTML Functionality Validation', () => {
    it('should include question rendering logic for all types', () => {
      const questions: Question[] = [
        {
          id: '1',
          type: 'multiple-choice',
          sentence: 'Test sentence',
          targetWord: 'test',
          options: [{ text: 'option1', isCorrect: true }]
        },
        {
          id: '2',
          type: 'fill-blank',
          sentence: 'Fill ___ blank',
          correctAnswer: 'the',
          acceptableVariations: [],
          hint: 't'
        },
        {
          id: '3',
          type: 'matching',
          pairs: [{ english: 'word', mandarin: '词' }],
          shuffledMandarin: ['词']
        }
      ]

      const html = generateStaticHtml({
        questions,
        wordlistName: 'Test'
      })

      // Check for multiple choice rendering
      expect(html).toContain('multiple-choice')
      expect(html).toContain('options')

      // Check for fill-blank rendering
      expect(html).toContain('fill-blank')
      expect(html).toContain('input-answer')

      // Check for matching rendering
      expect(html).toContain('matching')
      expect(html).toContain('matching-pairs')
    })

    it('should include answer submission logic', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      expect(html).toContain('function submitAnswers()')
      expect(html).toContain('Submit Answers')
    })

    it('should include score calculation logic', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      expect(html).toContain('score')
      expect(html).toContain('correct')
    })

    it('should include results display logic', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      expect(html).toContain('results-container')
      expect(html).toContain('Try Again')
    })
  })

  describe('Offline Functionality', () => {
    it('should not include external dependencies', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      // Should not have external script tags
      expect(html).not.toMatch(/<script[^>]*src=["']http/)
      
      // Should not have external stylesheet links
      expect(html).not.toMatch(/<link[^>]*href=["']http/)
      
      // Should not have external font imports
      expect(html).not.toContain('@import url(')
    })

    it('should use system fonts for offline compatibility', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      expect(html).toContain('-apple-system')
      expect(html).toContain('BlinkMacSystemFont')
      expect(html).toContain('sans-serif')
    })

    it('should include all interactive functionality inline', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      // All JavaScript should be inline
      expect(html).toContain('<script>')
      expect(html).toContain('renderQuestions()')
      expect(html).toContain('selectOption')
      expect(html).toContain('submitAnswers')
      
      // Should initialize on load
      expect(html).toContain('renderQuestions()')
    })

    it('should work without network connectivity', () => {
      const html = generateStaticHtml({
        questions: [
          {
            id: '1',
            type: 'multiple-choice',
            sentence: 'Test',
            targetWord: 'test',
            options: [{ text: 'A', isCorrect: true }]
          }
        ],
        wordlistName: 'Test'
      })

      // Verify no fetch calls or network requests
      expect(html).not.toContain('fetch(')
      expect(html).not.toContain('XMLHttpRequest')
      expect(html).not.toContain('axios')
    })
  })

  describe('Security and Data Validation', () => {
    it('should escape user-provided content', () => {
      const maliciousQuestions: Question[] = [
        {
          id: '1',
          type: 'multiple-choice',
          sentence: '<script>alert("xss")</script>',
          targetWord: 'test',
          options: [
            { text: '<img src=x onerror=alert(1)>', isCorrect: true }
          ]
        }
      ]

      const html = generateStaticHtml({
        questions: maliciousQuestions,
        wordlistName: '<script>alert("xss")</script>'
      })

      // Should not contain unescaped script tags
      expect(html).not.toMatch(/<script>alert\("xss"\)<\/script>/)
      
      // Should contain escaped versions
      expect(html).toContain('&lt;script&gt;')
    })

    it('should handle special characters in questions', () => {
      const questions: Question[] = [
        {
          id: '1',
          type: 'fill-blank',
          sentence: 'What\'s the "correct" answer & solution?',
          correctAnswer: 'test',
          acceptableVariations: [],
          hint: 't'
        }
      ]

      const html = generateStaticHtml({
        questions,
        wordlistName: 'Test'
      })

      expect(html).toContain('What')
      expect(html).toContain('correct')
      expect(html).toContain('answer')
    })

    it('should validate question data structure', () => {
      const validQuestion: Question = {
        id: '1',
        type: 'multiple-choice',
        sentence: 'Test',
        targetWord: 'test',
        options: [{ text: 'A', isCorrect: true }]
      }

      expect(validQuestion.id).toBeDefined()
      expect(validQuestion.type).toBeDefined()
      expect(['multiple-choice', 'fill-blank', 'matching']).toContain(validQuestion.type)
    })
  })

  describe('Accessibility Features', () => {
    it('should include proper HTML semantics', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      expect(html).toContain('<html lang="en">')
      expect(html).toContain('<meta charset="UTF-8">')
      expect(html).toContain('<h1>')
    })

    it('should have readable font sizes', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      // Check for reasonable font sizes (not too small)
      expect(html).toMatch(/font-size:\s*1[2-9]px/)
    })

    it('should include proper button elements', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      expect(html).toContain('class="btn"')
      expect(html).toContain('Submit Answers')
    })
  })

  describe('Performance Considerations', () => {
    it('should generate HTML efficiently for large question sets', () => {
      const largeQuestionSet: Question[] = Array.from({ length: 30 }, (_, i) => ({
        id: `${i}`,
        type: 'multiple-choice' as const,
        sentence: `Question ${i}`,
        targetWord: `word${i}`,
        options: [
          { text: `Option ${i}A`, isCorrect: true },
          { text: `Option ${i}B`, isCorrect: false }
        ]
      }))

      const startTime = performance.now()
      const html = generateStaticHtml({
        questions: largeQuestionSet,
        wordlistName: 'Large Test'
      })
      const endTime = performance.now()

      expect(html).toBeDefined()
      expect(html.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })

    it('should not include unnecessary whitespace', () => {
      const html = generateStaticHtml({
        questions: [],
        wordlistName: 'Test'
      })

      // Should be reasonably compact (not minified, but not excessive whitespace)
      const lines = html.split('\n')
      const emptyLines = lines.filter(line => line.trim() === '')
      
      // Empty lines should be less than 20% of total (allowing for readable formatting)
      expect(emptyLines.length / lines.length).toBeLessThan(0.2)
    })
  })
})
