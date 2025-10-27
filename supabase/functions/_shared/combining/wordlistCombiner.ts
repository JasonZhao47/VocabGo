/**
 * Wordlist Combiner
 * 
 * Merges wordlists from multiple chunks into a single combined wordlist.
 * Handles deduplication, word limit enforcement, and priority strategies.
 */

export interface WordPair {
  en: string
  zh: string
}

export interface ChunkWordlist {
  chunkId: string
  words: WordPair[]
  position: number
}

export type PriorityStrategy = 'first-chunk' | 'frequency' | 'random'

export interface CombineOptions {
  chunkResults: ChunkWordlist[]
  maxWords: number
  priorityStrategy?: PriorityStrategy
}

export interface CombinedWordlist {
  words: WordPair[]
  metadata: {
    totalChunksProcessed: number
    successfulChunks: number
    failedChunks: number
    duplicatesRemoved: number
    wordsBeforeLimit: number
    wordsAfterLimit: number
  }
}

/**
 * Combines wordlists from multiple chunks into a single deduplicated list
 * 
 * @param options - Configuration for combining wordlists
 * @returns Combined wordlist with metadata
 */
export function combineWordlists(options: CombineOptions): CombinedWordlist {
  const {
    chunkResults,
    maxWords,
    priorityStrategy = 'first-chunk'
  } = options

  // Validate inputs
  if (!chunkResults || chunkResults.length === 0) {
    return {
      words: [],
      metadata: {
        totalChunksProcessed: 0,
        successfulChunks: 0,
        failedChunks: 0,
        duplicatesRemoved: 0,
        wordsBeforeLimit: 0,
        wordsAfterLimit: 0
      }
    }
  }

  if (maxWords < 10 || maxWords > 50) {
    throw new Error(`Invalid maxWords: ${maxWords}. Must be between 10 and 50.`)
  }

  // Sort chunks by position to ensure first-chunk priority
  const sortedChunks = [...chunkResults].sort((a, b) => a.position - b.position)

  // Filter successful chunks (those with words)
  const successfulChunks = sortedChunks.filter(chunk => 
    chunk.words && chunk.words.length > 0
  )

  const totalChunksProcessed = chunkResults.length
  const successfulChunksCount = successfulChunks.length
  const failedChunksCount = totalChunksProcessed - successfulChunksCount

  // Collect all words with deduplication
  const seen = new Set<string>()
  const combined: WordPair[] = []
  let duplicatesRemoved = 0

  for (const chunk of successfulChunks) {
    for (const wordPair of chunk.words) {
      // Normalize English word for comparison (case-insensitive)
      const normalizedKey = wordPair.en.toLowerCase().trim()
      
      if (!seen.has(normalizedKey)) {
        seen.add(normalizedKey)
        combined.push({
          en: wordPair.en.trim(),
          zh: wordPair.zh.trim()
        })
        
        // Stop if we've reached the limit
        if (combined.length >= maxWords) {
          break
        }
      } else {
        duplicatesRemoved++
      }
    }
    
    // Stop processing chunks if we've reached the limit
    if (combined.length >= maxWords) {
      break
    }
  }

  const wordsBeforeLimit = combined.length + duplicatesRemoved
  const wordsAfterLimit = combined.length

  return {
    words: combined,
    metadata: {
      totalChunksProcessed,
      successfulChunks: successfulChunksCount,
      failedChunks: failedChunksCount,
      duplicatesRemoved,
      wordsBeforeLimit,
      wordsAfterLimit
    }
  }
}

/**
 * Helper function to validate word pairs
 */
export function isValidWordPair(wordPair: any): wordPair is WordPair {
  return (
    wordPair &&
    typeof wordPair === 'object' &&
    typeof wordPair.en === 'string' &&
    typeof wordPair.zh === 'string' &&
    wordPair.en.trim().length > 0 &&
    wordPair.zh.trim().length > 0
  )
}

/**
 * Helper function to sanitize chunk results before combining
 */
export function sanitizeChunkResults(chunkResults: ChunkWordlist[]): ChunkWordlist[] {
  return chunkResults.map(chunk => ({
    ...chunk,
    words: chunk.words.filter(isValidWordPair)
  }))
}
