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
  studentId?: string // Optional student identifier from URL parameter
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
  // Include studentId if provided to differentiate students on same device
  const fingerprint = [
    deviceInfo.userAgent || '',
    deviceInfo.screenResolution || '',
    deviceInfo.timezone || '',
    deviceInfo.studentId || '' // Add student identifier to fingerprint
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
  
  // Required fields must be present and non-empty strings
  const hasRequiredFields = Boolean(
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
  
  // studentId is optional, but if provided must be a non-empty string
  // Note: undefined becomes null in JSON, so check for both
  if (deviceInfo.studentId !== undefined && deviceInfo.studentId !== null) {
    return hasRequiredFields && 
           typeof deviceInfo.studentId === 'string' &&
           deviceInfo.studentId.trim().length > 0
  }
  
  return hasRequiredFields
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
