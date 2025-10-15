import { ref } from 'vue'
import { practiceHtmlGenerator, type SimplePracticeQuestions } from '@/services/practiceHtmlGenerator'
import { useToast } from '@/composables/useToast'
import { getSessionId } from '@/lib/session'
import type { WordlistRecord } from '@/state/wordlistsState'
import type { PracticeQuestions, MatchingQuestion, FillBlankQuestion, MultipleChoiceQuestion } from '@/types/practice'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export function usePracticeQuestions() {
  const isGenerating = ref(false)
  const isDownloading = ref(false)
  const { showToast } = useToast()

  const generatePracticeQuestions = async (wordlistId: string): Promise<PracticeQuestions> => {
    try {
      const sessionId = getSessionId()

      const request = {
        wordlistId,
        questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
        maxQuestionsPerType: 10,
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'x-session-id': sessionId,
          },
          body: JSON.stringify(request),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate practice questions')
      }

      const result = await response.json()

      if (!result.success || !result.questions) {
        throw new Error(result.error?.message || 'Failed to generate practice questions')
      }

      return result.questions
    } catch (error) {
      console.error('Error generating practice questions:', error)
      throw error
    }
  }

  const generateAndDownload = async (wordlist: WordlistRecord) => {
    if (wordlist.wordCount < 4) {
      showToast('At least 4 words are required to generate practice questions', 'error')
      return
    }

    isGenerating.value = true

    try {
      // Generate practice questions
      const questions = await generatePracticeQuestions(wordlist.id)
      
      if (!questions || (!questions.matching.length && !questions.fillBlank.length && !questions.multipleChoice.length)) {
        showToast('Failed to generate practice questions. Please try again.', 'error')
        return
      }

      // Transform questions to match HTML generator format
      const transformedQuestions: SimplePracticeQuestions = {
        matching: questions.matching.map((q: MatchingQuestion) => ({
          pairs: q.pairs.map(pair => ({
            en: pair.english,
            zh: pair.mandarin
          }))
        })),
        fillBlank: questions.fillBlank.map((q: FillBlankQuestion) => ({
          sentence: q.sentence,
          correctAnswer: q.correctAnswer
        })),
        multipleChoice: questions.multipleChoice.map((q: MultipleChoiceQuestion) => ({
          question: q.sentence,
          options: q.options.map(opt => opt.text),
          correctAnswer: q.options.findIndex(opt => opt.isCorrect)
        }))
      }

      // Generate HTML file
      isDownloading.value = true
      const htmlResult = practiceHtmlGenerator.generateHtml({
        wordlistName: wordlist.filename,
        questions: transformedQuestions,
        includeTimer: true
      })

      // Download the file
      downloadHtmlFile(htmlResult.html, htmlResult.filename)
      
      showToast(`Practice questions downloaded successfully! (${Math.round(htmlResult.size / 1024)}KB)`, 'success')
      
    } catch (error) {
      console.error('Error generating practice questions:', error)
      showToast('Failed to generate practice questions. Please try again.', 'error')
    } finally {
      isGenerating.value = false
      isDownloading.value = false
    }
  }

  const downloadHtmlFile = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  return {
    isGenerating,
    isDownloading,
    generateAndDownload
  }
}