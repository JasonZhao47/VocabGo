import { ref } from 'vue'
import type { PracticeQuestions } from '@/types/practice'
import { generatePracticeQuestions } from '@/services/practiceQuestionService'
import { PracticeHtmlGenerator } from '@/services/practiceHtmlGenerator'
import type { WordlistRecord } from '@/services/wordlistService'

export function usePracticeQuestions() {
  const questions = ref<PracticeQuestions | null>(null)
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  async function loadQuestions(wordlistId: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await generatePracticeQuestions(wordlistId)
      questions.value = result
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load questions'
      console.error('Error loading practice questions:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function generateAndDownload(wordlist: WordlistRecord) {
    isGenerating.value = true
    
    try {
      // Generate practice questions
      const practiceQuestions = await generatePracticeQuestions(wordlist.id)
      
      // Convert to simple format for HTML generator
      const simpleQuestions = {
        matching: practiceQuestions.matching.map(q => ({
          pairs: q.pairs.map(p => ({
            en: p.english,
            zh: p.mandarin
          }))
        })),
        fillBlank: practiceQuestions.fillBlank.map(q => ({
          sentence: q.sentence,
          correctAnswer: q.correctAnswer
        })),
        multipleChoice: practiceQuestions.multipleChoice.map(q => ({
          question: q.sentence,
          options: q.options.map(opt => opt.text),
          correctAnswer: q.options.findIndex(opt => opt.isCorrect)
        }))
      }
      
      // Generate HTML
      const generator = new PracticeHtmlGenerator()
      const { html, filename } = generator.generateHtml({
        wordlistName: wordlist.filename,
        questions: simpleQuestions,
        includeTimer: false,
        darkMode: false
      })
      
      // Download HTML file
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to generate practice'
      console.error('Error generating practice:', e)
      throw e
    } finally {
      isGenerating.value = false
    }
  }

  return {
    questions,
    isLoading,
    isGenerating,
    error,
    loadQuestions,
    generateAndDownload
  }
}
