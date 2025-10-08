/**
 * Text Cleaner Service
 * Traditional regex and heuristic-based text cleaning
 * Removes noise like headers, footers, page numbers, TOCs, indexes
 */

import type { CleanerInput, CleanerOutput } from './types.ts'

interface CleaningStats {
  originalLength: number
  cleanedLength: number
  linesRemoved: number
  patternsRemoved: string[]
}

/**
 * Clean text using regex patterns and heuristics
 */
export function cleanText(input: CleanerInput): CleanerOutput {
  const { rawText, documentType } = input
  const stats: CleaningStats = {
    originalLength: rawText.length,
    cleanedLength: 0,
    linesRemoved: 0,
    patternsRemoved: [],
  }

  let cleaned = rawText

  // Apply cleaning patterns in order
  cleaned = removePageNumbers(cleaned, stats)
  cleaned = removeHeadersFooters(cleaned, stats)
  cleaned = removeTableOfContents(cleaned, stats)
  cleaned = removeIndexes(cleaned, stats)
  cleaned = removeCaptions(cleaned, stats)
  cleaned = removeUrls(cleaned, stats, documentType)
  cleaned = normalizeWhitespace(cleaned, stats)
  cleaned = removeSpecialCharacters(cleaned, stats)

  stats.cleanedLength = cleaned.length

  // Calculate cleanliness score (0-1)
  // Handle division by zero for empty input
  const removalRatio = stats.originalLength > 0 
    ? 1 - (stats.cleanedLength / stats.originalLength)
    : 0
  const cleanlinessScore = Math.min(1, Math.max(0, removalRatio))

  // Calculate confidence based on how much was cleaned
  const confidence = stats.patternsRemoved.length > 0 ? 0.85 : 0.95

  return {
    cleanedText: cleaned,
    cleanlinessScore,
    removedSections: stats.patternsRemoved,
    confidence,
  }
}

/**
 * Remove page numbers (standalone numbers, "Page X", "- 1 -", etc.)
 */
function removePageNumbers(text: string, stats: CleaningStats): string {
  const patterns = [
    /^\s*\d+\s*$/gm, // Standalone numbers on their own line
    /^\s*-\s*\d+\s*-\s*$/gm, // "- 1 -" format
    /^\s*Page\s+\d+\s*$/gim, // "Page 1" format
    /^\s*\[\d+\]\s*$/gm, // "[1]" format
    /^\s*\d+\s+of\s+\d+\s*$/gim, // "1 of 10" format
  ]

  let result = text
  let removed = false

  for (const pattern of patterns) {
    const before = result
    result = result.replace(pattern, '')
    if (before !== result) removed = true
  }

  if (removed) {
    stats.patternsRemoved.push('page_numbers')
  }

  return result
}

/**
 * Remove headers and footers (repeated text at top/bottom of pages)
 */
function removeHeadersFooters(text: string, stats: CleaningStats): string {
  const lines = text.split('\n')
  const lineFrequency = new Map<string, number>()

  // Count frequency of each line
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length > 0 && trimmed.length < 100) {
      lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1)
    }
  }

  // Find repeated lines (likely headers/footers)
  const repeatedLines = new Set<string>()
  for (const [line, count] of lineFrequency.entries()) {
    if (count >= 3) { // Appears 3+ times
      repeatedLines.add(line)
    }
  }

  // Remove repeated lines
  const filtered = lines.filter(line => !repeatedLines.has(line.trim()))

  if (filtered.length < lines.length) {
    stats.patternsRemoved.push('headers_footers')
    stats.linesRemoved += lines.length - filtered.length
  }

  return filtered.join('\n')
}

/**
 * Remove table of contents (lines with dots and page numbers)
 */
function removeTableOfContents(text: string, stats: CleaningStats): string {
  const tocPatterns = [
    /^.{3,}\.{3,}\s*\d+\s*$/gm, // "Chapter 1 ........ 5"
    /^.{3,}\s+\d+\s*$/gm, // "Chapter 1     5"
  ]

  let result = text
  let removed = false

  for (const pattern of tocPatterns) {
    const before = result
    result = result.replace(pattern, '')
    if (before !== result) removed = true
  }

  if (removed) {
    stats.patternsRemoved.push('table_of_contents')
  }

  return result
}

/**
 * Remove indexes (alphabetically sorted lists with page references)
 */
function removeIndexes(text: string, stats: CleaningStats): string {
  // Pattern: word/phrase followed by page numbers
  const indexPattern = /^[A-Z][a-z]+(?:\s+[a-z]+)*,?\s+\d+(?:[-–]\d+)?(?:,\s*\d+(?:[-–]\d+)?)*\s*$/gm

  const before = text
  const result = text.replace(indexPattern, '')

  if (before !== result) {
    stats.patternsRemoved.push('indexes')
  }

  return result
}

/**
 * Remove captions (Figure X:, Table X:, Image X:)
 */
function removeCaptions(text: string, stats: CleaningStats): string {
  const captionPatterns = [
    /^(?:Figure|Table|Image|Chart|Diagram)\s+\d+[:.]\s*.+$/gim,
    /^(?:Fig\.|Tab\.)\s+\d+[:.]\s*.+$/gim,
  ]

  let result = text
  let removed = false

  for (const pattern of captionPatterns) {
    const before = result
    result = result.replace(pattern, '')
    if (before !== result) removed = true
  }

  if (removed) {
    stats.patternsRemoved.push('captions')
  }

  return result
}

/**
 * Remove URLs and email addresses (optional based on document type)
 */
function removeUrls(text: string, stats: CleaningStats, documentType: string): string {
  // Only remove URLs for certain document types
  if (documentType === 'txt' || documentType === 'pdf') {
    const urlPattern = /https?:\/\/[^\s]+/g
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

    const before = text
    let result = text.replace(urlPattern, '')
    result = result.replace(emailPattern, '')

    if (before !== result) {
      stats.patternsRemoved.push('urls_emails')
    }

    return result
  }

  return text
}

/**
 * Normalize whitespace (multiple newlines, excessive spaces)
 */
function normalizeWhitespace(text: string, stats: CleaningStats): string {
  const before = text

  // Replace multiple newlines with double newline
  let result = text.replace(/\n{3,}/g, '\n\n')

  // Replace multiple spaces with single space
  result = result.replace(/ {2,}/g, ' ')

  // Trim each line
  result = result.split('\n').map(line => line.trim()).join('\n')

  // Remove leading/trailing whitespace
  result = result.trim()

  if (before !== result) {
    stats.patternsRemoved.push('whitespace')
  }

  return result
}

/**
 * Remove special characters and fix encoding issues
 */
function removeSpecialCharacters(text: string, stats: CleaningStats): string {
  const before = text

  // Remove non-printable characters except newlines and tabs
  let result = text.replace(/[^\x20-\x7E\n\t\u4e00-\u9fff]/g, '')

  // Fix common encoding issues
  result = result.replace(/â€™/g, "'") // Smart quote
  result = result.replace(/â€"/g, "-") // Em dash
  result = result.replace(/â€œ/g, '"') // Left quote
  result = result.replace(/â€/g, '"') // Right quote

  if (before !== result) {
    stats.patternsRemoved.push('special_characters')
  }

  return result
}
