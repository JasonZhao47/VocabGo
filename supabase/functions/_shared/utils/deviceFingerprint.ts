/**
 * Device fingerprinting utilities for student session identification
 * 
 * Generates consistent session tokens based on device characteristics
 * without requiring authentication or storing PII.
 */

/**
 * Device information interface
 */
export interface DeviceInfo {
  userAgent: string
  screenResolution: string
  timezone: string
}

/**
 * Generate a session token from device information
 * 
 * Creates a consistent hash-based token from device characteristics.
 * The same device will generate the same token, allowing session persistence
 * without authentication.
 * 
 * @param deviceInfo - Device characteristics (userAgent, screen, timezone)
 * @returns A 64-character hexadecimal session token
 */
export async function generateSessionToken(deviceInfo: DeviceInfo): Promise<string> {
  // Normalize and concatenate device info
  const fingerprint = [
    deviceInfo.userAgent || '',
    deviceInfo.screenResolution || '',
    deviceInfo.timezone || ''
  ].join('|')
  
  // Convert to Uint8Array for hashing
  const encoder = new TextEncoder()
  const data = encoder.encode(fingerprint)
  
  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate session token format
 * 
 * Ensures the token is exactly 64 hexadecimal characters (SHA-256 hash)
 * 
 * @param token - The session token to validate
 * @returns true if valid, false otherwise
 */
export function validateSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Must be exactly 64 characters (SHA-256 produces 32 bytes = 64 hex chars)
  if (token.length !== 64) {
    return false
  }
  
  // Must contain only hexadecimal characters (0-9, a-f)
  const hexPattern = /^[0-9a-f]{64}$/
  return hexPattern.test(token)
}

/**
 * Validate device info completeness
 * 
 * Ensures all required device information fields are present
 * 
 * @param deviceInfo - Device information to validate
 * @returns true if valid, false otherwise
 */
export function validateDeviceInfo(deviceInfo: DeviceInfo): boolean {
  if (!deviceInfo || typeof deviceInfo !== 'object') {
    return false
  }
  
  // All fields must be present and non-empty strings
  return Boolean(
    deviceInfo.userAgent &&
    typeof deviceInfo.userAgent === 'string' &&
    deviceInfo.userAgent.trim().length > 0 &&
    deviceInfo.screenResolution &&
    typeof deviceInfo.screenResolution === 'string' &&
    deviceInfo.screenResolution.trim().length > 0 &&
    deviceInfo.timezone &&
    typeof deviceInfo.timezone === 'string' &&
    deviceInfo.timezone.trim().length > 0
  )
}

/**
 * Validate session token format and throw error if invalid
 * 
 * @param token - The session token to validate
 * @throws Error if token is invalid
 */
export function assertValidSessionToken(token: string): void {
  if (!validateSessionToken(token)) {
    throw new Error('Invalid session token format. Expected 64 hexadecimal characters.')
  }
}
