/**
 * Share token generation and validation utilities
 * 
 * Provides cryptographically secure token generation for wordlist sharing
 * and format validation to ensure token integrity.
 */

/**
 * Generate a cryptographically secure share token
 * 
 * Uses crypto.getRandomValues to generate 48 hexadecimal characters
 * (24 bytes = 192 bits of entropy)
 * 
 * @returns A 48-character hexadecimal string
 */
export function generateShareToken(): string {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate share token format
 * 
 * Ensures the token is exactly 48 hexadecimal characters
 * 
 * @param token - The token to validate
 * @returns true if valid, false otherwise
 */
export function validateShareToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Must be exactly 48 characters
  if (token.length !== 48) {
    return false
  }
  
  // Must contain only hexadecimal characters (0-9, a-f)
  const hexPattern = /^[0-9a-f]{48}$/
  return hexPattern.test(token)
}

/**
 * Validate share token format and throw error if invalid
 * 
 * @param token - The token to validate
 * @throws Error if token is invalid
 */
export function assertValidShareToken(token: string): void {
  if (!validateShareToken(token)) {
    throw new Error('Invalid share token format. Expected 48 hexadecimal characters.')
  }
}
