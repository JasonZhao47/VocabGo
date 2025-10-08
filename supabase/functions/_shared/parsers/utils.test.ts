/**
 * Unit tests for parser utility functions
 */

import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import {
  cleanText,
  removeCommonNoise,
  processExtractedText,
  validateExtractedText,
  createMetadata,
} from './utils.ts'

Deno.test('cleanText - normalizes line endings', () => {
  const input = 'Line 1\r\nLine 2\rLine 3\nLine 4'
  const result = cleanText(input)
  assertEquals(result, 'Line 1\nLine 2\nLine 3\nLine 4')
})

Deno.test('cleanText - collapses multiple line breaks', () => {
  const input = 'Line 1\n\n\n\nLine 2'
  const result = cleanText(input)
  assertEquals(result, 'Line 1\n\nLine 2')
})

Deno.test('cleanText - collapses multiple spaces', () => {
  const input = 'Word1    Word2\t\tWord3'
  const result = cleanText(input)
  assertEquals(result, 'Word1 Word2 Word3')
})

Deno.test('cleanText - trims lines and overall text', () => {
  const input = '  Line 1  \n  Line 2  \n  '
  const result = cleanText(input)
  assertEquals(result, 'Line 1\nLine 2')
})

Deno.test('removeCommonNoise - removes page numbers', () => {
  const input = 'Content here\nPage 1\nMore content\n- 2 -\nEven more'
  const result = removeCommonNoise(input)
  assertEquals(result.includes('Page 1'), false)
})

Deno.test('removeCommonNoise - removes separator lines', () => {
  const input = 'Content\n---\nMore content\n===\nEven more'
  const result = removeCommonNoise(input)
  assertEquals(result.includes('---'), false)
  assertEquals(result.includes('==='), false)
})

Deno.test('processExtractedText - applies all cleaning', () => {
  const input = '  Text  \r\n\r\n\r\nPage 1\r\n  More text  '
  const result = processExtractedText(input)
  assertEquals(result, 'Text\n\nMore text')
})

Deno.test('validateExtractedText - accepts valid text', () => {
  validateExtractedText('Valid text content')
  // Should not throw
})

Deno.test('validateExtractedText - throws on empty text', () => {
  assertThrows(
    () => validateExtractedText(''),
    Error,
    'No text content extracted'
  )
})

Deno.test('validateExtractedText - throws on whitespace-only text', () => {
  assertThrows(
    () => validateExtractedText('   \n\n  '),
    Error,
    'No text content extracted'
  )
})

Deno.test('createMetadata - includes timestamp and document type', () => {
  const metadata = createMetadata('pdf')
  assertEquals(metadata.documentType, 'pdf')
  assertEquals(typeof metadata.extractedAt, 'string')
})

Deno.test('createMetadata - merges additional metadata', () => {
  const metadata = createMetadata('pdf', { pageCount: 10, author: 'Test' })
  assertEquals(metadata.documentType, 'pdf')
  assertEquals(metadata.pageCount, 10)
  assertEquals(metadata.author, 'Test')
})
