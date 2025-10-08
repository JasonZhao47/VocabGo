/**
 * Unit tests for TXT parser
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { parseTXT } from './txt.ts'

Deno.test('parseTXT - parses simple text file', async () => {
  const text = 'Hello world\nThis is a test document.'
  const buffer = new TextEncoder().encode(text).buffer
  
  const result = await parseTXT(buffer)
  
  assertEquals(result.documentType, 'txt')
  assertEquals(result.text.includes('Hello world'), true)
  assertEquals(result.text.includes('test document'), true)
  assertEquals(result.metadata.encoding, 'utf-8')
})

Deno.test('parseTXT - handles UTF-8 characters', async () => {
  const text = 'English text with 中文字符 and émojis 🎉'
  const buffer = new TextEncoder().encode(text).buffer
  
  const result = await parseTXT(buffer)
  
  assertEquals(result.text.includes('中文字符'), true)
  assertEquals(result.text.includes('émojis'), true)
  assertEquals(result.text.includes('🎉'), true)
})

Deno.test('parseTXT - cleans excessive whitespace', async () => {
  const text = 'Line 1\n\n\n\nLine 2    with    spaces'
  const buffer = new TextEncoder().encode(text).buffer
  
  const result = await parseTXT(buffer)
  
  // Should collapse multiple newlines and spaces
  assertEquals(result.text.includes('\n\n\n'), false)
  assertEquals(result.text.includes('    '), false)
})

Deno.test('parseTXT - handles empty file', async () => {
  const buffer = new TextEncoder().encode('').buffer
  
  await assertRejects(
    async () => await parseTXT(buffer),
    Error,
    'No text content extracted'
  )
})

Deno.test('parseTXT - handles whitespace-only file', async () => {
  const text = '   \n\n   \t\t   '
  const buffer = new TextEncoder().encode(text).buffer
  
  await assertRejects(
    async () => await parseTXT(buffer),
    Error,
    'No text content extracted'
  )
})

Deno.test('parseTXT - handles large file', async () => {
  // Create a large text file (1MB)
  const largeText = 'Lorem ipsum dolor sit amet. '.repeat(40000)
  const buffer = new TextEncoder().encode(largeText).buffer
  
  const result = await parseTXT(buffer)
  
  assertEquals(result.documentType, 'txt')
  assertEquals(result.text.length > 0, true)
  assertEquals(result.metadata.size, buffer.byteLength)
})

Deno.test('parseTXT - normalizes line endings', async () => {
  const text = 'Line 1\r\nLine 2\rLine 3\nLine 4'
  const buffer = new TextEncoder().encode(text).buffer
  
  const result = await parseTXT(buffer)
  
  // All line endings should be normalized to \n
  assertEquals(result.text.includes('\r'), false)
})

Deno.test('parseTXT - includes metadata', async () => {
  const text = 'Test content'
  const buffer = new TextEncoder().encode(text).buffer
  
  const result = await parseTXT(buffer)
  
  assertEquals(result.metadata.encoding, 'utf-8')
  assertEquals(result.metadata.size, buffer.byteLength)
  assertEquals(typeof result.metadata.extractedAt, 'string')
})
