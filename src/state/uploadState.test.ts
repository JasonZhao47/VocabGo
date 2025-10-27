import { describe, it, expect, beforeEach } from 'vitest'
import {
  startUpload,
  setChunkProgress,
  setCompleted,
  reset,
  type ChunkProgress,
  type ChunkingMetadata
} from './uploadState'
import uploadState from './uploadState'

describe('uploadState - Chunk Progress Tracking', () => {
  beforeEach(() => {
    reset()
  })

  it('should initialize with empty chunk progress', () => {
    expect(uploadState.chunkProgress).toEqual([])
    expect(uploadState.isChunked).toBe(false)
  })

  it('should set chunk progress correctly', () => {
    const mockProgress: ChunkProgress[] = [
      {
        chunkId: 'chunk-1',
        position: 1,
        totalChunks: 3,
        status: 'completed',
        wordsExtracted: 15
      },
      {
        chunkId: 'chunk-2',
        position: 2,
        totalChunks: 3,
        status: 'processing'
      },
      {
        chunkId: 'chunk-3',
        position: 3,
        totalChunks: 3,
        status: 'completed',
        wordsExtracted: 12
      }
    ]

    setChunkProgress(mockProgress)

    expect(uploadState.chunkProgress).toEqual(mockProgress)
    expect(uploadState.isChunked).toBe(true)
  })

  it('should track failed chunks', () => {
    const mockProgress: ChunkProgress[] = [
      {
        chunkId: 'chunk-1',
        position: 1,
        totalChunks: 2,
        status: 'completed',
        wordsExtracted: 15
      },
      {
        chunkId: 'chunk-2',
        position: 2,
        totalChunks: 2,
        status: 'failed',
        error: 'Extraction timeout'
      }
    ]

    setChunkProgress(mockProgress)

    expect(uploadState.chunkProgress).toEqual(mockProgress)
    expect(uploadState.chunkProgress[1].status).toBe('failed')
    expect(uploadState.chunkProgress[1].error).toBe('Extraction timeout')
  })

  it('should reset chunk progress on new upload', () => {
    // Set initial chunk progress
    const mockProgress: ChunkProgress[] = [
      {
        chunkId: 'chunk-1',
        position: 1,
        totalChunks: 1,
        status: 'completed',
        wordsExtracted: 10
      }
    ]
    setChunkProgress(mockProgress)
    expect(uploadState.isChunked).toBe(true)

    // Start new upload
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    startUpload(mockFile)

    expect(uploadState.chunkProgress).toEqual([])
    expect(uploadState.isChunked).toBe(false)
  })

  it('should preserve chunk progress after completion', () => {
    const mockProgress: ChunkProgress[] = [
      {
        chunkId: 'chunk-1',
        position: 1,
        totalChunks: 2,
        status: 'completed',
        wordsExtracted: 15
      },
      {
        chunkId: 'chunk-2',
        position: 2,
        totalChunks: 2,
        status: 'completed',
        wordsExtracted: 12
      }
    ]

    setChunkProgress(mockProgress)
    setCompleted([{ en: 'test', zh: '测试' }])

    // Chunk progress should still be available after completion
    expect(uploadState.chunkProgress).toEqual(mockProgress)
    expect(uploadState.isChunked).toBe(true)
    expect(uploadState.status).toBe('completed')
  })

  it('should clear chunk progress on reset', () => {
    const mockProgress: ChunkProgress[] = [
      {
        chunkId: 'chunk-1',
        position: 1,
        totalChunks: 1,
        status: 'completed',
        wordsExtracted: 10
      }
    ]
    setChunkProgress(mockProgress)

    reset()

    expect(uploadState.chunkProgress).toEqual([])
    expect(uploadState.isChunked).toBe(false)
  })
})

describe('uploadState - Warning Display for Partial Failures', () => {
  beforeEach(() => {
    reset()
  })

  it('should initialize with empty warnings and no chunking metadata', () => {
    expect(uploadState.warnings).toEqual([])
    expect(uploadState.chunkingMetadata).toBeNull()
  })

  it('should set warnings when chunks fail', () => {
    const mockWarnings = ['2 of 3 sections processed successfully']
    const mockMetadata: ChunkingMetadata = {
      totalChunks: 3,
      successfulChunks: 2,
      failedChunks: 1,
      averageChunkSize: 8500,
      duplicatesRemoved: 5
    }

    setCompleted(
      [{ en: 'test', zh: '测试' }],
      mockWarnings,
      mockMetadata
    )

    expect(uploadState.warnings).toEqual(mockWarnings)
    expect(uploadState.chunkingMetadata).toEqual(mockMetadata)
    expect(uploadState.status).toBe('completed')
  })

  it('should handle completion without warnings', () => {
    setCompleted([{ en: 'test', zh: '测试' }])

    expect(uploadState.warnings).toEqual([])
    expect(uploadState.chunkingMetadata).toBeNull()
    expect(uploadState.status).toBe('completed')
  })

  it('should clear warnings on new upload', () => {
    // Set initial warnings
    const mockWarnings = ['1 of 2 sections processed successfully']
    const mockMetadata: ChunkingMetadata = {
      totalChunks: 2,
      successfulChunks: 1,
      failedChunks: 1,
      averageChunkSize: 9000,
      duplicatesRemoved: 3
    }
    setCompleted(
      [{ en: 'test', zh: '测试' }],
      mockWarnings,
      mockMetadata
    )

    // Start new upload
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    startUpload(mockFile)

    expect(uploadState.warnings).toEqual([])
    expect(uploadState.chunkingMetadata).toBeNull()
  })

  it('should clear warnings on reset', () => {
    const mockWarnings = ['2 of 3 sections processed successfully']
    const mockMetadata: ChunkingMetadata = {
      totalChunks: 3,
      successfulChunks: 2,
      failedChunks: 1,
      averageChunkSize: 8500,
      duplicatesRemoved: 5
    }
    setCompleted(
      [{ en: 'test', zh: '测试' }],
      mockWarnings,
      mockMetadata
    )

    reset()

    expect(uploadState.warnings).toEqual([])
    expect(uploadState.chunkingMetadata).toBeNull()
  })

  it('should handle multiple warnings', () => {
    const mockWarnings = [
      '2 of 3 sections processed successfully',
      'Some sections may have incomplete vocabulary'
    ]
    const mockMetadata: ChunkingMetadata = {
      totalChunks: 3,
      successfulChunks: 2,
      failedChunks: 1,
      averageChunkSize: 8500,
      duplicatesRemoved: 5
    }

    setCompleted(
      [{ en: 'test', zh: '测试' }],
      mockWarnings,
      mockMetadata
    )

    expect(uploadState.warnings).toEqual(mockWarnings)
    expect(uploadState.warnings.length).toBe(2)
  })

  it('should track chunking metadata correctly', () => {
    const mockMetadata: ChunkingMetadata = {
      totalChunks: 5,
      successfulChunks: 4,
      failedChunks: 1,
      averageChunkSize: 7800,
      duplicatesRemoved: 12
    }

    setCompleted(
      [{ en: 'test', zh: '测试' }],
      ['4 of 5 sections processed successfully'],
      mockMetadata
    )

    expect(uploadState.chunkingMetadata?.totalChunks).toBe(5)
    expect(uploadState.chunkingMetadata?.successfulChunks).toBe(4)
    expect(uploadState.chunkingMetadata?.failedChunks).toBe(1)
    expect(uploadState.chunkingMetadata?.averageChunkSize).toBe(7800)
    expect(uploadState.chunkingMetadata?.duplicatesRemoved).toBe(12)
  })
})
