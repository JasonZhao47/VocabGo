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
    console.log('Starting practice question generation for:', wordlist.filename)

    try {
      // Generate practice questions
      console.log('Calling generatePracticeQuestions with ID:', wordlist.id)
      const practiceQuestions = await generatePracticeQuestions(wordlist.id)
      console.log('Practice questions generated:', practiceQuestions)

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
      console.log('Converted to simple format:', simpleQuestions)

      // Generate HTML
      const generator = new PracticeHtmlGenerator()
      console.log('Generating HTML...')
      const { html, filename } = generator.generateHtml({
        wordlistName: wordlist.filename,
        questions: simpleQuestions,
        includeTimer: false,
        darkMode: false
      })
      console.log('HTML generated, filename:', filename, 'size:', html.length)

      // Download HTML file
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      console.log('Triggering download...')
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('Download complete!')

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
