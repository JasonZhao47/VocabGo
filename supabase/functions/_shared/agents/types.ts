/**
 * AI Agent Types
 * Shared types for all AI agents
 */

export interface WordPair {
  en: string
  zh: string
}

// Cleaner Agent Types
export interface CleanerInput {
  rawText: string
  documentType: string
}

export interface CleanerOutput {
  cleanedText: string
  cleanlinessScore: number // 0-1, internal use only
  removedSections: string[]
  confidence: number
}

// Extractor Agent Types
export interface ExtractorInput {
  cleanedText: string
  maxWords: number // Always 40
}

export interface ExtractorOutput {
  words: string[]
  confidence: number
  filteredCount: number // How many duplicates/stop words removed
}

// Translator Agent Types
export interface TranslatorInput {
  words: string[]
  context?: string // Optional document context for polysemous words
}

export interface TranslatorOutput {
  translations: WordPair[]
  confidence: number
  fallbackUsed: string[] // Words that used fallback translation
}
