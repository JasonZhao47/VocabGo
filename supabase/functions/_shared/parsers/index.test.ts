/**
 * Unit tests for parser index (main entry point)
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import {
  parseDocument,
  getSupportedTypes,
  isTypeSupported,
} from './index.ts'

Deno.test('getSupportedTypes - returns all supported types', () => {
  const types = getSupportedTypes()
  
  assertEquals(types.includes('pdf'), true)
  assertEquals(types.includes('txt'), true)
  assertEquals(types.includes('docx'), true)
  assertEquals(types.includes('xlsx'), true)
  assertEquals(types.length, 4)
})

Deno.test('isTypeSupported - returns true for supported types', () => {
  assertEquals(isTypeSupported('pdf'), true)
  assertEquals(isTypeSupported('txt'), true)
  assertEquals(isTypeSupported('docx'), true)
  assertEquals(isTypeSupported('xlsx'), true)
})

Deno.test('isTypeSupported - returns false for unsupported types', () => {
  assertEquals(isTypeSupported('doc'), false)
  assertEquals(isTypeSupported('ppt'), false)
  assertEquals(isTypeSupported('jpg'), false)
  assertEquals(isTypeSupported(''), false)
})

Deno.test('parseDocument - parses TXT document', async () => {
  const text = 'Hello world test'
  const buffer = new TextEncoder().encode(text).buffer
  
  const result = await parseDocument(buffer, 'txt')
  
  assertEquals(result.documentType, 'txt')
  assertEquals(result.text.includes('Hello world'), true)
})

Deno.test('parseDocument - throws error for unsupported type', async () => {
  const buffer = new TextEncoder().encode('test').buffer
  
  await assertRejects(
    async () => await parseDocument(buffer, 'unsupported' as any),
    Error,
    'Unsupported document type'
  )
})

Deno.test('parseDocument - handles empty buffer for TXT', async () => {
  const buffer = new TextEncoder().encode('').buffer
  
  await assertRejects(
    async () => await parseDocument(buffer, 'txt'),
    Error,
    'No text content extracted'
  )
})
