/**
 * Document Chunker
 * 
 * Splits large documents into manageable chunks for processing.
 * Implements intelligent text splitting at paragraph/sentence boundaries
 * with overlap between chunks for context continuity.
 */

import { getChunkingConfig } from '../config/chunkingConfig.ts'

export interface ChunkConfig {
  targetSize: number      // Target characters per chunk (8000)
  maxSize: number          // Maximum characters per chunk (10000)
  minSize: number          // Minimum chunk size (2000)
  overlapSize: number      // Overlap between chunks (200)
}

export interface DocumentChunk {
  id: string               // Unique chunk identifier (e.g., "chunk-1")
  text: string             // Chunk text content
  startIndex: number       // Character position in original document
  endIndex: number         // Character position in original document
  position: number         // Chunk number (1-based)
  totalChunks: number      // Total number of chunks (set after all chunks created)
}

export interface ChunkingResult {
  chunks: DocumentChunk[]
  metadata: {
    originalLength: number
    totalChunks: number
    averageChunkSize: number
  }
}

/**
 * Get default chunk config from environment
 */
function getDefaultConfig(): ChunkConfig {
  const globalConfig = getChunkingConfig()
  return {
    targetSize: globalConfig.targetSize,
    maxSize: globalConfig.maxSize,
    minSize: globalConfig.minSize,
    overlapSize: globalConfig.overlapSize
  }
}

/**
 * Chunk a document into manageable pieces
 */
export function chunkDocument(
  text: string,
  config: Partial<ChunkConfig> = {}
): ChunkingResult {
  const defaultConfig = getDefaultConfig()
  const finalConfig = { ...defaultConfig, ...config }
  
  // Handle empty or whitespace-only documents
  if (!text || text.trim().length === 0) {
    throw new Error('Document contains no extractable text')
  }
  
  const trimmedText = text.trim()
  
  // If document is small enough, return as single chunk
  if (trimmedText.length <= finalConfig.targetSize) {
    const chunk: DocumentChunk = {
      id: 'chunk-1',
      text: trimmedText,
      startIndex: 0,
      endIndex: trimmedText.length,
      position: 1,
      totalChunks: 1
    }
    
    return {
      chunks: [chunk],
      metadata: {
        originalLength: trimmedText.length,
        totalChunks: 1,
        averageChunkSize: trimmedText.length
      }
    }
  }
  
  // Split into multiple chunks
  const chunks: DocumentChunk[] = []
  let currentIndex = 0
  let chunkPosition = 1
  
  while (currentIndex < trimmedText.length) {
    const remainingText = trimmedText.length - currentIndex
    
    // If remaining text is small, include it all in this chunk
    if (remainingText <= finalConfig.maxSize) {
      const chunkText = trimmedText.substring(currentIndex)
      chunks.push({
        id: `chunk-${chunkPosition}`,
        text: chunkText,
        startIndex: currentIndex,
        endIndex: trimmedText.length,
        position: chunkPosition,
        totalChunks: 0 // Will be set later
      })
      break
    }
    
    // Find the best split point
    const splitPoint = findSplitPoint(
      trimmedText,
      currentIndex,
      finalConfig.targetSize,
      finalConfig.maxSize
    )
    
    const chunkText = trimmedText.substring(currentIndex, splitPoint)
    chunks.push({
      id: `chunk-${chunkPosition}`,
      text: chunkText,
      startIndex: currentIndex,
      endIndex: splitPoint,
      position: chunkPosition,
      totalChunks: 0 // Will be set later
    })
    
    // Move to next chunk with overlap
    currentIndex = Math.max(
      currentIndex + 1,
      splitPoint - finalConfig.overlapSize
    )
    chunkPosition++
  }
  
  // Merge final chunk if it's too small
  if (chunks.length > 1) {
    const lastChunk = chunks[chunks.length - 1]
    if (lastChunk.text.length < finalConfig.minSize) {
      const secondLastChunk = chunks[chunks.length - 2]
      
      // Merge last chunk into second-to-last
      const mergedText = trimmedText.substring(
        secondLastChunk.startIndex,
        lastChunk.endIndex
      )
      
      secondLastChunk.text = mergedText
      secondLastChunk.endIndex = lastChunk.endIndex
      
      chunks.pop()
    }
  }
  
  // Set totalChunks for all chunks
  const totalChunks = chunks.length
  chunks.forEach(chunk => {
    chunk.totalChunks = totalChunks
  })
  
  // Calculate metadata
  const totalChunkSize = chunks.reduce((sum, chunk) => sum + chunk.text.length, 0)
  const averageChunkSize = Math.round(totalChunkSize / chunks.length)
  
  return {
    chunks,
    metadata: {
      originalLength: trimmedText.length,
      totalChunks,
      averageChunkSize
    }
  }
}

/**
 * Find the best point to split text, preferring paragraph or sentence boundaries
 */
function findSplitPoint(
  text: string,
  startIndex: number,
  targetSize: number,
  maxSize: number
): number {
  const idealSplitIndex = startIndex + targetSize
  const maxSplitIndex = Math.min(startIndex + maxSize, text.length)
  
  // If we can take everything, do so
  if (maxSplitIndex >= text.length) {
    return text.length
  }
  
  // Search window: 1000 chars before and after ideal point
  const searchWindowStart = Math.max(startIndex, idealSplitIndex - 1000)
  const searchWindowEnd = Math.min(maxSplitIndex, idealSplitIndex + 1000)
  
  // Try to find paragraph boundary (double newline)
  const paragraphBoundary = findParagraphBoundary(
    text,
    searchWindowStart,
    searchWindowEnd,
    idealSplitIndex
  )
  
  if (paragraphBoundary !== -1) {
    return paragraphBoundary
  }
  
  // Try to find sentence boundary
  const sentenceBoundary = findSentenceBoundary(
    text,
    searchWindowStart,
    searchWindowEnd,
    idealSplitIndex
  )
  
  if (sentenceBoundary !== -1) {
    return sentenceBoundary
  }
  
  // Try to find word boundary
  const wordBoundary = findWordBoundary(
    text,
    searchWindowStart,
    searchWindowEnd,
    idealSplitIndex
  )
  
  if (wordBoundary !== -1) {
    return wordBoundary
  }
  
  // Fallback: split at ideal point
  return idealSplitIndex
}

/**
 * Find nearest paragraph boundary (double newline)
 */
function findParagraphBoundary(
  text: string,
  searchStart: number,
  searchEnd: number,
  idealPoint: number
): number {
  const paragraphPattern = /\n\s*\n/g
  let bestMatch = -1
  let bestDistance = Infinity
  
  const searchText = text.substring(searchStart, searchEnd)
  let match: RegExpExecArray | null
  
  while ((match = paragraphPattern.exec(searchText)) !== null) {
    const matchIndex = searchStart + match.index + match[0].length
    const distance = Math.abs(matchIndex - idealPoint)
    
    if (distance < bestDistance) {
      bestDistance = distance
      bestMatch = matchIndex
    }
  }
  
  return bestMatch
}

/**
 * Find nearest sentence boundary (. ! ? followed by space or newline)
 */
function findSentenceBoundary(
  text: string,
  searchStart: number,
  searchEnd: number,
  idealPoint: number
): number {
  const sentencePattern = /[.!?][\s\n]/g
  let bestMatch = -1
  let bestDistance = Infinity
  
  const searchText = text.substring(searchStart, searchEnd)
  let match: RegExpExecArray | null
  
  while ((match = sentencePattern.exec(searchText)) !== null) {
    const matchIndex = searchStart + match.index + match[0].length
    const distance = Math.abs(matchIndex - idealPoint)
    
    if (distance < bestDistance) {
      bestDistance = distance
      bestMatch = matchIndex
    }
  }
  
  return bestMatch
}

/**
 * Find nearest word boundary (whitespace)
 */
function findWordBoundary(
  text: string,
  searchStart: number,
  searchEnd: number,
  idealPoint: number
): number {
  // Search backwards from ideal point for whitespace
  for (let i = idealPoint; i >= searchStart; i--) {
    if (/\s/.test(text[i])) {
      return i + 1
    }
  }
  
  // Search forwards from ideal point for whitespace
  for (let i = idealPoint; i < searchEnd; i++) {
    if (/\s/.test(text[i])) {
      return i + 1
    }
  }
  
  return -1
}
