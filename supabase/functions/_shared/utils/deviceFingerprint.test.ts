import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import {
  generateSessionToken,
  validateSessionToken,
  validateDeviceInfo,
  assertValidSessionToken,
  type DeviceInfo
} from './deviceFingerprint.ts'

Deno.test('generateSessionToken - generates 64-character hex token', async () => {
  const deviceInfo: DeviceInfo = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    screenResolution: '1920x1080',
    timezone: 'America/New_York'
  }
  
  const token = await generateSessionToken(deviceInfo)
  
  assertExists(token)
  assertEquals(token.length, 64)
  assertEquals(/^[0-9a-f]{64}$/.test(token), true)
})

Deno.test('generateSessionToken - generates consistent tokens for same device', async () => {
  const deviceInfo: DeviceInfo = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    screenResolution: '2560x1440',
    timezone: 'Asia/Shanghai'
  }
  
  const token1 = await generateSessionToken(deviceInfo)
  const token2 = await generateSessionToken(deviceInfo)
  
  assertEquals(token1, token2)
})

Deno.test('generateSessionToken - generates different tokens for different devices', async () => {
  const device1: DeviceInfo = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    screenResolution: '1920x1080',
    timezone: 'America/New_York'
  }
  
  const device2: DeviceInfo = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    screenResolution: '2560x1440',
    timezone: 'Asia/Shanghai'
  }
  
  const token1 = await generateSessionToken(device1)
  const token2 = await generateSessionToken(device2)
  
  assertEquals(token1 === token2, false)
})

Deno.test('generateSessionToken - handles empty strings gracefully', async () => {
  const deviceInfo: DeviceInfo = {
    userAgent: '',
    screenResolution: '',
    timezone: ''
  }
  
  const token = await generateSessionToken(deviceInfo)
  
  assertExists(token)
  assertEquals(token.length, 64)
})

Deno.test('generateSessionToken - different userAgent produces different token', async () => {
  const device1: DeviceInfo = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    screenResolution: '1920x1080',
    timezone: 'America/New_York'
  }
  
  const device2: DeviceInfo = {
    userAgent: 'Mozilla/5.0 (Macintosh)',
    screenResolution: '1920x1080',
    timezone: 'America/New_York'
  }
  
  const token1 = await generateSessionToken(device1)
  const token2 = await generateSessionToken(device2)
  
  assertEquals(token1 === token2, false)
})

Deno.test('validateSessionToken - accepts valid 64-char hex token', () => {
  const validToken = 'a'.repeat(64)
  assertEquals(validateSessionToken(validToken), true)
})

Deno.test('validateSessionToken - accepts mixed hex characters', () => {
  const validToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  assertEquals(validateSessionToken(validToken), true)
})

Deno.test('validateSessionToken - rejects token with wrong length', () => {
  assertEquals(validateSessionToken('a'.repeat(63)), false)
  assertEquals(validateSessionToken('a'.repeat(65)), false)
  assertEquals(validateSessionToken(''), false)
})

Deno.test('validateSessionToken - rejects non-hex characters', () => {
  const invalidToken = 'g'.repeat(64)
  assertEquals(validateSessionToken(invalidToken), false)
})

Deno.test('validateSessionToken - rejects uppercase hex', () => {
  const invalidToken = 'A'.repeat(64)
  assertEquals(validateSessionToken(invalidToken), false)
})

Deno.test('validateSessionToken - rejects null/undefined', () => {
  assertEquals(validateSessionToken(null as any), false)
  assertEquals(validateSessionToken(undefined as any), false)
})

Deno.test('validateSessionToken - rejects non-string types', () => {
  assertEquals(validateSessionToken(123 as any), false)
  assertEquals(validateSessionToken({} as any), false)
  assertEquals(validateSessionToken([] as any), false)
})

Deno.test('validateDeviceInfo - accepts valid device info', () => {
  const validInfo: DeviceInfo = {
    userAgent: 'Mozilla/5.0',
    screenResolution: '1920x1080',
    timezone: 'UTC'
  }
  assertEquals(validateDeviceInfo(validInfo), true)
})

Deno.test('validateDeviceInfo - rejects missing fields', () => {
  assertEquals(validateDeviceInfo({
    userAgent: 'Mozilla/5.0',
    screenResolution: '1920x1080'
  } as any), false)
  
  assertEquals(validateDeviceInfo({
    userAgent: 'Mozilla/5.0',
    timezone: 'UTC'
  } as any), false)
  
  assertEquals(validateDeviceInfo({
    screenResolution: '1920x1080',
    timezone: 'UTC'
  } as any), false)
})

Deno.test('validateDeviceInfo - rejects empty strings', () => {
  assertEquals(validateDeviceInfo({
    userAgent: '',
    screenResolution: '1920x1080',
    timezone: 'UTC'
  }), false)
  
  assertEquals(validateDeviceInfo({
    userAgent: 'Mozilla/5.0',
    screenResolution: '',
    timezone: 'UTC'
  }), false)
  
  assertEquals(validateDeviceInfo({
    userAgent: 'Mozilla/5.0',
    screenResolution: '1920x1080',
    timezone: ''
  }), false)
})

Deno.test('validateDeviceInfo - rejects whitespace-only strings', () => {
  assertEquals(validateDeviceInfo({
    userAgent: '   ',
    screenResolution: '1920x1080',
    timezone: 'UTC'
  }), false)
})

Deno.test('validateDeviceInfo - rejects null/undefined', () => {
  assertEquals(validateDeviceInfo(null as any), false)
  assertEquals(validateDeviceInfo(undefined as any), false)
})

Deno.test('validateDeviceInfo - rejects non-object types', () => {
  assertEquals(validateDeviceInfo('string' as any), false)
  assertEquals(validateDeviceInfo(123 as any), false)
  assertEquals(validateDeviceInfo([] as any), false)
})

Deno.test('assertValidSessionToken - does not throw for valid token', () => {
  const validToken = 'a'.repeat(64)
  assertValidSessionToken(validToken) // Should not throw
})

Deno.test('assertValidSessionToken - throws for invalid token', () => {
  let errorThrown = false
  try {
    assertValidSessionToken('invalid')
  } catch (error) {
    errorThrown = true
    assertEquals((error as Error).message.includes('Invalid session token'), true)
  }
  assertEquals(errorThrown, true)
})

Deno.test('integration - generate and validate token', async () => {
  const deviceInfo: DeviceInfo = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    screenResolution: '375x812',
    timezone: 'Asia/Tokyo'
  }
  
  const token = await generateSessionToken(deviceInfo)
  assertEquals(validateSessionToken(token), true)
  assertValidSessionToken(token) // Should not throw
})
