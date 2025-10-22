import { describe, it, expect } from 'vitest'
import { transformQuestionsForView, generateHint } from './questionTransform'
import type { PracticeQuestions } from '@/types/practice'

describe('questionTransform', () => {
  describe('generateHint', () => {
    it('should generate hint with first letter and underscores', () => {
      expect(generateHint('hello')).toBe('h _ _ _ _')
      expect(generateHint('cat')).toBe('c _ _')
      expect(generateHint('a')).toBe('a')
    })

    it('should handle empty string', () => {
      expect(generateHint('')).toBe('')
    })
  })

  describe('transformQuestionsForView', () => {
    it('should transform matching questions with shuffled Mandarin', () => {
      const input: PracticeQuestions = {
        matching: [{
          type: 'matching',
          id: 'test-1',
          pairs: [
            { english: 'hello', mandarin: '你好' },
            { english: 'goodbye', mandarin: '再见' }
          ]
        }],
        fillBlank: [],
        multipleChoice: []
      }

      const result = transformQuestionsForView(input)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('matching')
      expect(result[0].id).toBeDefined()
      expect(result[0].pairs).toEqual([
        { english: 'hello', mandarin: '你好' },
        { english: 'goodbye', mandarin: '再见' }
      ])
      expect(result[0].shuffledMandarin).toHaveLength(2)
      expect(result[0].shuffledMandarin).toContain('你好')
      expect(result[0].shuffledMandarin).toContain('再见')
    })

    it('should transform fill-blank questions with hints', () => {
      const input: PracticeQuestions = {
        matching: [],
        fillBlank: [{
          type: 'fill-blank',
          id: 'test-2',
          sentence: 'I say ___ to my friends.',
          correctAnswer: 'hello',
          blank: '___'
        }],
        multipleChoice: []
      }

      const result = transformQuestionsForView(input)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('fill-blank')
      expect(result[0].id).toBeDefined()
      expect(result[0].sentence).toBe('I say ___ to my friends.')
      expect(result[0].correctAnswer).toBe('hello')
      expect(result[0].hint).toBe('h _ _ _ _')
    })

    it('should transform multiple-choice questions with correct answer marked', () => {
      const input: PracticeQuestions = {
        matching: [],
        fillBlank: [],
        multipleChoice: [{
          type: 'multiple-choice',
          id: 'test-3',
          sentence: 'What does "你好" mean?',
          targetWord: '你好',
          options: [
            { text: 'goodbye', isCorrect: false },
            { text: 'hello', isCorrect: true },
            { text: 'thank you', isCorrect: false },
            { text: 'sorry', isCorrect: false }
          ]
        }]
      }

      const result = transformQuestionsForView(input)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('multiple-choice')
      expect(result[0].id).toBeDefined()
      expect(result[0].question).toBe('What does "你好" mean?')
      expect(result[0].options).toEqual([
        { text: 'goodbye', isCorrect: false },
        { text: 'hello', isCorrect: true },
        { text: 'thank you', isCorrect: false },
        { text: 'sorry', isCorrect: false }
      ])
    })

    it('should transform all question types together', () => {
      const input: PracticeQuestions = {
        matching: [{
          type: 'matching',
          id: 'test-4',
          pairs: [{ english: 'cat', mandarin: '猫' }]
        }],
        fillBlank: [{
          type: 'fill-blank',
          id: 'test-5',
          sentence: 'The ___ is sleeping.',
          correctAnswer: 'cat',
          blank: '___'
        }],
        multipleChoice: [{
          type: 'multiple-choice',
          id: 'test-6',
          sentence: 'What is "猫"?',
          targetWord: '猫',
          options: [
            { text: 'dog', isCorrect: false },
            { text: 'cat', isCorrect: true },
            { text: 'bird', isCorrect: false },
            { text: 'fish', isCorrect: false }
          ]
        }]
      }

      const result = transformQuestionsForView(input)

      expect(result).toHaveLength(3)
      expect(result[0].type).toBe('matching')
      expect(result[1].type).toBe('fill-blank')
      expect(result[2].type).toBe('multiple-choice')
      
      // Each should have unique ID
      const ids = result.map(q => q.id)
      expect(new Set(ids).size).toBe(3)
    })

    it('should generate unique IDs for each question', () => {
      const input: PracticeQuestions = {
        matching: [
          { type: 'matching', id: 'test-7', pairs: [{ english: 'a', mandarin: 'A' }] },
          { type: 'matching', id: 'test-8', pairs: [{ english: 'b', mandarin: 'B' }] }
        ],
        fillBlank: [],
        multipleChoice: []
      }

      const result = transformQuestionsForView(input)

      expect(result[0].id).not.toBe(result[1].id)
    })
  })
})
