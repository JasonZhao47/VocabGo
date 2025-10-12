/**
 * Practice Error Handler
 * Provides comprehensive error handling and recovery for practice sessions
 */

export enum PracticeErrorCode {
  // Question Generation Errors
  INSUFFICIENT_WORDS = 'INSUFFICIENT_WORDS',
  GENERATION_FAILED = 'GENERATION_FAILED',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  OFFLINE = 'OFFLINE',
  TIMEOUT = 'TIMEOUT',
  
  // Session Errors
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SAVE_FAILED = 'SAVE_FAILED',
  
  // Authorization Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  MISSING_SESSION_ID = 'MISSING_SESSION_ID',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface PracticeError {
  code: PracticeErrorCode
  message: string
  userMessage: string
  recoverable: boolean
  retryable: boolean
  retryDelay?: number // in milliseconds
}

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: PracticeError) => void
}

/**
 * Parse error from API response or exception
 */
export function parsePracticeError(error: any): PracticeError {
  // Handle API error responses
  if (error?.error?.code) {
    const code = error.error.code as PracticeErrorCode
    const message = error.error.message || 'An error occurred'
    
    return {
      code,
      message,
      userMessage: getUserMessage(code, message),
      recoverable: isRecoverable(code),
      retryable: isRetryable(code),
      retryDelay: getRetryDelay(code),
    }
  }
  
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: PracticeErrorCode.NETWORK_ERROR,
      message: 'Network request failed',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      recoverable: true,
      retryable: true,
      retryDelay: 2000,
    }
  }
  
  // Handle timeout errors
  if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
    return {
      code: PracticeErrorCode.TIMEOUT,
      message: 'Request timed out',
      userMessage: 'The request took too long. Please try again.',
      recoverable: true,
      retryable: true,
      retryDelay: 3000,
    }
  }
  
  // Handle offline status
  if (!navigator.onLine) {
    return {
      code: PracticeErrorCode.OFFLINE,
      message: 'Device is offline',
      userMessage: 'You appear to be offline. Please check your internet connection.',
      recoverable: true,
      retryable: true,
      retryDelay: 5000,
    }
  }
  
  // Default unknown error
  return {
    code: PracticeErrorCode.UNKNOWN_ERROR,
    message: error?.message || 'An unknown error occurred',
    userMessage: 'Something went wrong. Please try again.',
    recoverable: true,
    retryable: true,
    retryDelay: 2000,
  }
}

/**
 * Get user-friendly error message
 */
function getUserMessage(code: PracticeErrorCode, originalMessage: string): string {
  const messages: Record<PracticeErrorCode, string> = {
    [PracticeErrorCode.INSUFFICIENT_WORDS]: 'This wordlist needs at least 4 words to generate practice questions.',
    [PracticeErrorCode.GENERATION_FAILED]: 'Failed to generate practice questions. Please try again.',
    [PracticeErrorCode.GENERATION_TIMEOUT]: 'Question generation is taking longer than expected. Please try again.',
    [PracticeErrorCode.VALIDATION_ERROR]: 'The generated questions did not meet quality standards. Please try again.',
    [PracticeErrorCode.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
    [PracticeErrorCode.OFFLINE]: 'You appear to be offline. Please check your internet connection.',
    [PracticeErrorCode.TIMEOUT]: 'The request took too long. Please try again.',
    [PracticeErrorCode.SESSION_NOT_FOUND]: 'Practice session not found. Please start a new session.',
    [PracticeErrorCode.SESSION_EXPIRED]: 'Your practice session has expired. Please start a new session.',
    [PracticeErrorCode.SAVE_FAILED]: 'Failed to save your progress. Your answers are stored locally.',
    [PracticeErrorCode.UNAUTHORIZED]: 'You do not have access to this resource.',
    [PracticeErrorCode.MISSING_SESSION_ID]: 'Session ID is missing. Please refresh the page.',
    [PracticeErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again.',
    [PracticeErrorCode.INTERNAL_ERROR]: 'An internal error occurred. Please try again later.',
  }
  
  return messages[code] || originalMessage
}

/**
 * Check if error is recoverable
 */
function isRecoverable(code: PracticeErrorCode): boolean {
  const nonRecoverableErrors = [
    PracticeErrorCode.INSUFFICIENT_WORDS,
    PracticeErrorCode.UNAUTHORIZED,
    PracticeErrorCode.MISSING_SESSION_ID,
  ]
  
  return !nonRecoverableErrors.includes(code)
}

/**
 * Check if error is retryable
 */
function isRetryable(code: PracticeErrorCode): boolean {
  const retryableErrors = [
    PracticeErrorCode.GENERATION_FAILED,
    PracticeErrorCode.GENERATION_TIMEOUT,
    PracticeErrorCode.NETWORK_ERROR,
    PracticeErrorCode.OFFLINE,
    PracticeErrorCode.TIMEOUT,
    PracticeErrorCode.SAVE_FAILED,
    PracticeErrorCode.INTERNAL_ERROR,
  ]
  
  return retryableErrors.includes(code)
}

/**
 * Get retry delay for error code
 */
function getRetryDelay(code: PracticeErrorCode): number {
  const delays: Partial<Record<PracticeErrorCode, number>> = {
    [PracticeErrorCode.GENERATION_TIMEOUT]: 5000,
    [PracticeErrorCode.OFFLINE]: 5000,
    [PracticeErrorCode.NETWORK_ERROR]: 2000,
    [PracticeErrorCode.TIMEOUT]: 3000,
  }
  
  return delays[code] || 2000
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options
  
  let lastError: PracticeError | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = parsePracticeError(error)
      
      // Don't retry if error is not retryable
      if (!lastError.retryable) {
        throw lastError
      }
      
      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Calculate delay with exponential backoff
      const delay = (lastError.retryDelay || retryDelay) * Math.pow(backoffMultiplier, attempt)
      
      // Notify about retry
      onRetry?.(attempt + 1, lastError)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Create a timeout promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ])
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Wait for device to come online
 */
export function waitForOnline(timeoutMs = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (navigator.onLine) {
      resolve()
      return
    }
    
    const timeout = setTimeout(() => {
      window.removeEventListener('online', handleOnline)
      reject(new Error('Timeout waiting for online status'))
    }, timeoutMs)
    
    const handleOnline = () => {
      clearTimeout(timeout)
      window.removeEventListener('online', handleOnline)
      resolve()
    }
    
    window.addEventListener('online', handleOnline)
  })
}

/**
 * Graceful degradation handler
 */
export interface DegradationOptions {
  fallbackData?: any
  offlineMode?: boolean
  localStorageKey?: string
}

export async function withGracefulDegradation<T>(
  fn: () => Promise<T>,
  options: DegradationOptions = {}
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const practiceError = parsePracticeError(error)
    
    // If offline and offline mode is enabled, return fallback
    if (practiceError.code === PracticeErrorCode.OFFLINE && options.offlineMode) {
      console.warn('Operating in offline mode')
      
      // Try to load from local storage
      if (options.localStorageKey) {
        const cached = localStorage.getItem(options.localStorageKey)
        if (cached) {
          return JSON.parse(cached) as T
        }
      }
      
      // Return fallback data if available
      if (options.fallbackData !== undefined) {
        return options.fallbackData as T
      }
    }
    
    throw practiceError
  }
}
