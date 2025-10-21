export interface MatchingQuestion {
  type: 'matching'
  id: string
  pairs: Array<{
    english: string
    mandarin: string
  }>
  shuffledMandarin?: string[]
}

export interface FillBlankQuestion {
  type: 'fill-blank'
  id: string
  sentence: string
  correctAnswer: string
  blank: string
}

export interface MultipleChoiceQuestion {
  type: 'multiple-choice'
  id: string
  sentence: string
  targetWord: string
  options: Array<{
    text: string
    isCorrect: boolean
  }>
}

export type PracticeQuestion = MatchingQuestion | FillBlankQuestion | MultipleChoiceQuestion

export interface PracticeQuestions {
  matching: MatchingQuestion[]
  fillBlank: FillBlankQuestion[]
  multipleChoice: MultipleChoiceQuestion[]
}
