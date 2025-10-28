/**
 * Practice Question Generator Agent
 * Generates three types of practice questions from wordlists:
 * - Matching (English-Mandarin pairs)
 * - Fill-in-the-blank (contextual sentences)
 * - Multiple choice (translation selection)
 */

import { callLLM } from '../llm/service.ts'
import { LLMError } from '../llm/types.ts'

// Types
export interface WordPair {
  en: string
  zh: string
}

export interface MatchingQuestion {
  id: string
  type: 'matching'
  pairs: Array<{
    english: string
    mandarin: string
  }>
  shuffledMandarin: string[]
}

export interface FillBlankQuestion {
  id: string
  type: 'fill-blank'
  sentence: string
  correctAnswer: string
  acceptableVariations: string[]
  hint?: string
}

export interface MultipleChoiceQuestion {
  id: string
  type: 'multiple-choice'
  sentence: string
  targetWord: string
  options: Array<{
    text: string
    isCorrect: boolean
  }>
}

export interface QuestionSet {
  matching: MatchingQuestion[]
  fillBlank: FillBlankQuestion[]
  multipleChoice: MultipleChoiceQuestion[]
}

export interface GenerateQuestionsRequest {
  words: WordPair[]
  questionTypes: ('matching' | 'fill-blank' | 'multiple-choice')[]
  maxQuestionsPerType?: number
}

export interface GenerateQuestionsResponse {
  questions: QuestionSet
  confidence: number
  estimatedTimeMinutes: number
}

// Constants
const MAX_QUESTIONS_PER_TYPE = 10 // Maximum 10 questions per practice session
const MIN_WORDS_FOR_QUESTIONS = 4

/**
 * Generate all practice questions
 */
export async function generatePracticeQuestions(
  request: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> {
  const { words, questionTypes, maxQuestionsPerType = MAX_QUESTIONS_PER_TYPE } = request

  // Validate minimum word count
  if (words.length < MIN_WORDS_FOR_QUESTIONS) {
    throw new Error(`Minimum ${MIN_WORDS_FOR_QUESTIONS} words required for question generation`)
  }

  const questions: QuestionSet = {
    matching: [],
    fillBlank: [],
    multipleChoice: [],
  }

  let totalConfidence = 0
  let questionTypeCount = 0

  // Generate matching questions
  // Note: Matching always generates 1 exercise (with multiple pairs inside)
  if (questionTypes.includes('matching')) {
    // For matching, maxQuestionsPerType represents the number of pairs in the exercise
    // Default to 5 pairs if not specified, but respect explicit limits
    const matchingPairCount = Math.min(maxQuestionsPerType || 5, words.length)
    const result = await generateMatchingQuestions(words, matchingPairCount)
    questions.matching = result.questions
    totalConfidence += result.confidence
    questionTypeCount++
  }

  // Generate fill-in-the-blank questions
  if (questionTypes.includes('fill-blank')) {
    const result = await generateFillBlankQuestions(words, maxQuestionsPerType)
    questions.fillBlank = result.questions
    totalConfidence += result.confidence
    questionTypeCount++
  }

  // Generate multiple choice questions
  if (questionTypes.includes('multiple-choice')) {
    const result = await generateMultipleChoiceQuestions(words, maxQuestionsPerType)
    questions.multipleChoice = result.questions
    totalConfidence += result.confidence
    questionTypeCount++
  }

  const averageConfidence = questionTypeCount > 0 ? totalConfidence / questionTypeCount : 0

  // Calculate estimated time (2 minutes per question type + 1 minute per 5 questions)
  const totalQuestions = questions.matching.length + questions.fillBlank.length + questions.multipleChoice.length
  const estimatedTimeMinutes = Math.ceil(questionTypeCount * 2 + totalQuestions / 5)

  return {
    questions,
    confidence: averageConfidence,
    estimatedTimeMinutes,
  }
}

/**
 * Generate matching questions
 * Note: Creates one matching exercise with up to maxQuestions pairs
 * Each pair tests one individual word
 */
export async function generateMatchingQuestions(
  words: WordPair[],
  maxQuestions: number
): Promise<{ questions: MatchingQuestion[]; confidence: number }> {
  // Limit to max 10 pairs per matching exercise
  const selectedWords = words.slice(0, Math.min(maxQuestions, words.length))

  // Create matching question with individual word pairs
  const pairs = selectedWords.map(word => ({
    english: word.en,
    mandarin: word.zh,
  }))

  // Shuffle Mandarin translations
  const shuffledMandarin = [...pairs.map(p => p.mandarin)].sort(() => Math.random() - 0.5)

  const question: MatchingQuestion = {
    id: crypto.randomUUID(),
    type: 'matching',
    pairs,
    shuffledMandarin,
  }

  return {
    questions: [question],
    confidence: 1.0, // High confidence for direct matching
  }
}

/**
 * Generate fill-in-the-blank questions
 */
export async function generateFillBlankQuestions(
  words: WordPair[],
  maxQuestions: number
): Promise<{ questions: FillBlankQuestion[]; confidence: number }> {
  // Limit to max questions
  const selectedWords = words.slice(0, Math.min(maxQuestions, words.length))

  // Build AI prompt
  const prompt = buildFillBlankPrompt(selectedWords)

  try {
    const response = await callLLM({
      prompt,
      systemPrompt: 'You are an expert English teacher creating practice exercises for English learners.',
      maxTokens: 2000,
      temperature: 0.7,
    })

    // Parse response
    const questions = parseFillBlankResponse(response.content, selectedWords)

    return {
      questions,
      confidence: 0.85, // Good confidence for AI-generated sentences
    }
  } catch (error) {
    if (error instanceof LLMError) {
      throw new Error(`Failed to generate fill-blank questions: ${error.message}`)
    }
    throw error
  }
}

/**
 * Generate multiple choice questions
 */
export async function generateMultipleChoiceQuestions(
  words: WordPair[],
  maxQuestions: number
): Promise<{ questions: MultipleChoiceQuestion[]; confidence: number }> {
  console.log(`[Practice] Generating multiple choice questions for ${words.length} words, max: ${maxQuestions}`)
  
  // Limit to max questions
  const selectedWords = words.slice(0, Math.min(maxQuestions, words.length))

  // Build AI prompt
  const prompt = buildMultipleChoicePrompt(selectedWords, words)
  console.log(`[Practice] Prompt built, length: ${prompt.length} chars`)

  try {
    console.log(`[Practice] Calling LLM for multiple choice questions...`)
    const response = await callLLM({
      prompt,
      systemPrompt: 'You are an expert English teacher creating practice exercises for English learners.',
      maxTokens: 3000,
      temperature: 0.7,
    })
    console.log(`[Practice] LLM response received for multiple choice`)

    // Parse response
    const questions = parseMultipleChoiceResponse(response.content, selectedWords)

    return {
      questions,
      confidence: 0.85, // Good confidence for AI-generated questions
    }
  } catch (error) {
    if (error instanceof LLMError) {
      throw new Error(`Failed to generate multiple choice questions: ${error.message}`)
    }
    throw error
  }
}

/**
 * Build fill-in-the-blank prompt
 */
function buildFillBlankPrompt(words: WordPair[]): string {
  const wordList = words.map(w => `${w.en} (${w.zh})`).join(', ')

  return `Create fill-in-the-blank practice sentences for English learners.

For each word below, create a contextually appropriate sentence with the word missing (replaced with ___).
The sentence should demonstrate proper usage and be at an intermediate English level.

Words: ${wordList}

IMPORTANT RULES:
- Each question tests ONLY ONE WORD from the list
- Only the target word should be replaced with ___
- The sentence should provide clear context for the missing word

For each word, provide:
1. A sentence with ___ where the word should go
2. The correct answer (the word itself)
3. Acceptable variations (common misspellings or alternative forms)
4. A hint (the first letter of the word)

Format your response as JSON:
[
  {
    "sentence": "The ___ was very beautiful.",
    "correctAnswer": "sunset",
    "acceptableVariations": ["sunsets", "sun set"],
    "hint": "s"
  }
]

Provide exactly ${words.length} questions, one for each word.`
}

/**
 * Build multiple choice prompt
 */
function buildMultipleChoicePrompt(selectedWords: WordPair[], allWords: WordPair[]): string {
  const wordList = selectedWords.map(w => `${w.en} (${w.zh})`).join(', ')

  return `Create multiple choice practice questions for English learners.

For each word below, create:
1. A practice sentence using the word in context
2. Four answer options (one correct Mandarin translation, three plausible but incorrect distractors)

Words to test: ${wordList}

IMPORTANT RULES:
- Each question tests ONLY ONE WORD from the list
- In the sentence, wrap the target word with <strong> tags to make it bold (e.g., "The <strong>sunset</strong> was beautiful.")
- Do NOT use any words from this list as distractors: ${allWords.map(w => w.en).join(', ')}
- Distractors should be semantically related but clearly incorrect
- Distractors should be plausible translations that a learner might confuse

Format your response as JSON:
[
  {
    "sentence": "The <strong>sunset</strong> was very beautiful.",
    "targetWord": "sunset",
    "options": [
      {"text": "日落", "isCorrect": true},
      {"text": "日出", "isCorrect": false},
      {"text": "黄昏", "isCorrect": false},
      {"text": "夜晚", "isCorrect": false}
    ]
  }
]

Provide exactly ${selectedWords.length} questions, one for each word.`
}

/**
 * Parse fill-in-the-blank response
 */
function parseFillBlankResponse(content: string, words: WordPair[]): FillBlankQuestion[] {
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array')
    }

    return parsed.map((item, index) => ({
      id: crypto.randomUUID(),
      type: 'fill-blank' as const,
      sentence: item.sentence || '',
      correctAnswer: item.correctAnswer || words[index]?.en || '',
      acceptableVariations: item.acceptableVariations || [],
      hint: item.hint || item.correctAnswer?.[0] || '',
    }))
  } catch (error) {
    console.error('Failed to parse fill-blank response:', error)
    // Fallback: create simple questions
    return words.map(word => ({
      id: crypto.randomUUID(),
      type: 'fill-blank' as const,
      sentence: `The ___ is important.`,
      correctAnswer: word.en,
      acceptableVariations: [],
      hint: word.en[0],
    }))
  }
}

/**
 * Parse multiple choice response
 */
function parseMultipleChoiceResponse(content: string, words: WordPair[]): MultipleChoiceQuestion[] {
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array')
    }

    return parsed.map((item, index) => ({
      id: crypto.randomUUID(),
      type: 'multiple-choice' as const,
      sentence: item.sentence || `This is a sentence with ${words[index]?.en}.`,
      targetWord: item.targetWord || words[index]?.en || '',
      options: item.options || [
        { text: words[index]?.zh || '', isCorrect: true },
        { text: '选项1', isCorrect: false },
        { text: '选项2', isCorrect: false },
        { text: '选项3', isCorrect: false },
      ],
    }))
  } catch (error) {
    console.error('Failed to parse multiple choice response:', error)
    // Fallback: create simple questions
    return words.map(word => ({
      id: crypto.randomUUID(),
      type: 'multiple-choice' as const,
      sentence: `This is a sentence with ${word.en}.`,
      targetWord: word.en,
      options: [
        { text: word.zh, isCorrect: true },
        { text: '选项1', isCorrect: false },
        { text: '选项2', isCorrect: false },
        { text: '选项3', isCorrect: false },
      ],
    }))
  }
}
