/**
 * Chunking Configuration
 * 
 * Centralized configuration for chunk-based document processing.
 * Reads from environment variables with validation and sensible defaults.
 */

export interface ChunkingConfig {
  // Feature Flags
  enableChunking: boolean
  enableConcurrentProcessing: boolean
  
  // Chunking Parameters
  targetSize: number
  maxSize: number
  minSize: number
  overlapSize: number
  threshold: number
  
  // Processing Parameters
  maxConcurrentChunks: number
  chunkTimeoutMs: number
  maxWordsPerChunk: number
  
  // Performance Thresholds
  processingWarningMs: number
  tokenUsageWarningThreshold: number
  totalTokenWarningThreshold: number
}

/**
 * Default configuration values
 */
const DEFAULTS: ChunkingConfig = {
  // Feature Flags
  enableChunking: true,
  enableConcurrentProcessing: true,
  
  // Chunking Parameters
  targetSize: 8000,
  maxSize: 10000,
  minSize: 2000,
  overlapSize: 200,
  threshold: 8000,
  
  // Processing Parameters
  maxConcurrentChunks: 3,
  chunkTimeoutMs: 30000,
  maxWordsPerChunk: 50,
  
  // Performance Thresholds
  processingWarningMs: 10000,
  tokenUsageWarningThreshold: 5000,
  totalTokenWarningThreshold: 50000
}

/**
 * Parse boolean from environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue
  return value.toLowerCase() === 'true'
}

/**
 * Parse integer from environment variable with validation
 */
function parseInteger(
  value: string | undefined,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  if (value === undefined) return defaultValue
  
  const parsed = parseInt(value, 10)
  
  if (isNaN(parsed)) {
    console.warn(`Invalid integer value: ${value}, using default: ${defaultValue}`)
    return defaultValue
  }
  
  if (min !== undefined && parsed < min) {
    console.warn(`Value ${parsed} below minimum ${min}, using minimum`)
    return min
  }
  
  if (max !== undefined && parsed > max) {
    console.warn(`Value ${parsed} above maximum ${max}, using maximum`)
    return max
  }
  
  return parsed
}

/**
 * Load and validate chunking configuration from environment variables
 */
export function loadChunkingConfig(): ChunkingConfig {
  const config: ChunkingConfig = {
    // Feature Flags
    enableChunking: parseBoolean(
      Deno.env.get('ENABLE_CHUNKING'),
      DEFAULTS.enableChunking
    ),
    enableConcurrentProcessing: parseBoolean(
      Deno.env.get('ENABLE_CONCURRENT_CHUNK_PROCESSING'),
      DEFAULTS.enableConcurrentProcessing
    ),
    
    // Chunking Parameters
    targetSize: parseInteger(
      Deno.env.get('CHUNK_TARGET_SIZE'),
      DEFAULTS.targetSize,
      1000,  // min: 1k chars
      50000  // max: 50k chars
    ),
    maxSize: parseInteger(
      Deno.env.get('CHUNK_MAX_SIZE'),
      DEFAULTS.maxSize,
      1000,  // min: 1k chars
      100000 // max: 100k chars
    ),
    minSize: parseInteger(
      Deno.env.get('CHUNK_MIN_SIZE'),
      DEFAULTS.minSize,
      500,   // min: 500 chars
      10000  // max: 10k chars
    ),
    overlapSize: parseInteger(
      Deno.env.get('CHUNK_OVERLAP_SIZE'),
      DEFAULTS.overlapSize,
      0,     // min: 0 chars (no overlap)
      1000   // max: 1k chars
    ),
    threshold: parseInteger(
      Deno.env.get('CHUNK_THRESHOLD'),
      DEFAULTS.threshold,
      1000,  // min: 1k chars
      50000  // max: 50k chars
    ),
    
    // Processing Parameters
    maxConcurrentChunks: parseInteger(
      Deno.env.get('MAX_CONCURRENT_CHUNKS'),
      DEFAULTS.maxConcurrentChunks,
      1,  // min: 1 (sequential)
      10  // max: 10 (reasonable concurrency limit)
    ),
    chunkTimeoutMs: parseInteger(
      Deno.env.get('CHUNK_TIMEOUT_MS'),
      DEFAULTS.chunkTimeoutMs,
      5000,   // min: 5 seconds
      120000  // max: 2 minutes
    ),
    maxWordsPerChunk: parseInteger(
      Deno.env.get('MAX_WORDS_PER_CHUNK'),
      DEFAULTS.maxWordsPerChunk,
      10,  // min: 10 words
      100  // max: 100 words
    ),
    
    // Performance Thresholds
    processingWarningMs: parseInteger(
      Deno.env.get('CHUNK_PROCESSING_WARNING_MS'),
      DEFAULTS.processingWarningMs,
      1000,   // min: 1 second
      60000   // max: 1 minute
    ),
    tokenUsageWarningThreshold: parseInteger(
      Deno.env.get('TOKEN_USAGE_WARNING_THRESHOLD'),
      DEFAULTS.tokenUsageWarningThreshold,
      1000,   // min: 1k tokens
      20000   // max: 20k tokens
    ),
    totalTokenWarningThreshold: parseInteger(
      Deno.env.get('TOTAL_TOKEN_WARNING_THRESHOLD'),
      DEFAULTS.totalTokenWarningThreshold,
      10000,  // min: 10k tokens
      200000  // max: 200k tokens
    )
  }
  
  // Validate configuration consistency
  validateConfig(config)
  
  return config
}

/**
 * Validate configuration for logical consistency
 */
function validateConfig(config: ChunkingConfig): void {
  const errors: string[] = []
  
  // Validate chunk size relationships
  if (config.targetSize > config.maxSize) {
    errors.push(`targetSize (${config.targetSize}) cannot exceed maxSize (${config.maxSize})`)
  }
  
  if (config.minSize > config.targetSize) {
    errors.push(`minSize (${config.minSize}) cannot exceed targetSize (${config.targetSize})`)
  }
  
  if (config.overlapSize >= config.minSize) {
    errors.push(`overlapSize (${config.overlapSize}) must be less than minSize (${config.minSize})`)
  }
  
  if (config.threshold < config.targetSize) {
    console.warn(`Warning: threshold (${config.threshold}) is less than targetSize (${config.targetSize}). Documents between these sizes will be chunked unnecessarily.`)
  }
  
  // Validate processing parameters
  if (config.maxWordsPerChunk < 10) {
    errors.push(`maxWordsPerChunk (${config.maxWordsPerChunk}) must be at least 10`)
  }
  
  if (config.chunkTimeoutMs < 5000) {
    errors.push(`chunkTimeoutMs (${config.chunkTimeoutMs}) must be at least 5000ms`)
  }
  
  // If concurrent processing is disabled, maxConcurrentChunks should be 1
  if (!config.enableConcurrentProcessing && config.maxConcurrentChunks > 1) {
    console.warn(`Concurrent processing is disabled but maxConcurrentChunks is ${config.maxConcurrentChunks}. Setting to 1.`)
    config.maxConcurrentChunks = 1
  }
  
  // Throw if there are validation errors
  if (errors.length > 0) {
    throw new Error(`Invalid chunking configuration:\n${errors.join('\n')}`)
  }
}

/**
 * Get a summary of the current configuration for logging
 */
export function getConfigSummary(config: ChunkingConfig): string {
  return [
    'Chunking Configuration:',
    `  Feature Flags:`,
    `    - Chunking: ${config.enableChunking ? 'enabled' : 'disabled'}`,
    `    - Concurrent Processing: ${config.enableConcurrentProcessing ? 'enabled' : 'disabled'}`,
    `  Chunking:`,
    `    - Target Size: ${config.targetSize} chars`,
    `    - Max Size: ${config.maxSize} chars`,
    `    - Min Size: ${config.minSize} chars`,
    `    - Overlap: ${config.overlapSize} chars`,
    `    - Threshold: ${config.threshold} chars`,
    `  Processing:`,
    `    - Max Concurrent: ${config.maxConcurrentChunks} chunks`,
    `    - Timeout: ${config.chunkTimeoutMs}ms`,
    `    - Max Words/Chunk: ${config.maxWordsPerChunk}`,
    `  Thresholds:`,
    `    - Processing Warning: ${config.processingWarningMs}ms`,
    `    - Token Warning: ${config.tokenUsageWarningThreshold}`,
    `    - Total Token Warning: ${config.totalTokenWarningThreshold}`
  ].join('\n')
}

// Export singleton instance
let configInstance: ChunkingConfig | null = null

/**
 * Get the global chunking configuration instance
 */
export function getChunkingConfig(): ChunkingConfig {
  if (!configInstance) {
    configInstance = loadChunkingConfig()
    console.log(getConfigSummary(configInstance))
  }
  return configInstance
}

/**
 * Reset configuration (useful for testing)
 */
export function resetChunkingConfig(): void {
  configInstance = null
}
