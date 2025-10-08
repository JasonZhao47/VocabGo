/**
 * Unit tests for XLSX parser
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { parseXLSX } from './xlsx.ts'
import * as XLSX from 'npm:xlsx@0.18.5'

// Helper to create a minimal valid XLSX
function createMinimalXLSX(data: any[][]): ArrayBuffer {
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  return buffer.buffer
}

Deno.test('parseXLSX - parses simple spreadsheet', async () => {
  const xlsxBuffer = createMinimalXLSX([
    ['Hello', 'World'],
    ['Test', 'Data']
  ])
  
  const result = await parseXLSX(xlsxBuffer)
  
  assertEquals(result.documentType, 'xlsx')
  assertEquals(result.text.includes('Hello'), true)
  assertEquals(result.text.includes('World'), true)
  assertEquals(result.text.includes('Test'), true)
  assertEquals(result.text.includes('Data'), true)
})

Deno.test('parseXLSX - extracts text from all cells', async () => {
  const xlsxBuffer = createMinimalXLSX([
    ['Cell A1', 'Cell B1', 'Cell C1'],
    ['Cell A2', 'Cell B2', 'Cell C2']
  ])
  
  const result = await parseXLSX(xlsxBuffer)
  
  assertEquals(result.text.includes('Cell A1'), true)
  assertEquals(result.text.includes('Cell B2'), true)
  assertEquals(result.text.includes('Cell C1'), true)
})

Deno.test('parseXLSX - handles numbers and mixed types', async () => {
  const xlsxBuffer = createMinimalXLSX([
    ['Text', 123, 45.67],
    [true, false, 'More text']
  ])
  
  const result = await parseXLSX(xlsxBuffer)
  
  assertEquals(result.text.includes('Text'), true)
  assertEquals(result.text.includes('123'), true)
  assertEquals(result.text.includes('45.67'), true)
  assertEquals(result.text.includes('true'), true)
})

Deno.test('parseXLSX - handles UTF-8 characters', async () => {
  const xlsxBuffer = createMinimalXLSX([
    ['English', '中文', 'Français'],
    ['🎉', 'émoji', 'test']
  ])
  
  const result = await parseXLSX(xlsxBuffer)
  
  assertEquals(result.text.includes('中文'), true)
  assertEquals(result.text.includes('Français'), true)
  assertEquals(result.text.includes('🎉'), true)
})

Deno.test('parseXLSX - skips empty cells', async () => {
  const xlsxBuffer = createMinimalXLSX([
    ['A', '', 'C'],
    ['', 'B', '']
  ])
  
  const result = await parseXLSX(xlsxBuffer)
  
  assertEquals(result.text.includes('A'), true)
  assertEquals(result.text.includes('B'), true)
  assertEquals(result.text.includes('C'), true)
})

Deno.test('parseXLSX - handles multiple sheets', async () => {
  const worksheet1 = XLSX.utils.aoa_to_sheet([['Sheet1 Data']])
  const worksheet2 = XLSX.utils.aoa_to_sheet([['Sheet2 Data']])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet1, 'Sheet1')
  XLSX.utils.book_append_sheet(workbook, worksheet2, 'Sheet2')
  
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  const xlsxBuffer = buffer.buffer
  
  const result = await parseXLSX(xlsxBuffer)
  
  assertEquals(result.text.includes('Sheet1 Data'), true)
  assertEquals(result.text.includes('Sheet2 Data'), true)
  assertEquals(result.metadata.sheetCount, 2)
  assertEquals(result.metadata.sheetNames.length, 2)
})

Deno.test('parseXLSX - includes metadata', async () => {
  const xlsxBuffer = createMinimalXLSX([['Test']])
  
  const result = await parseXLSX(xlsxBuffer)
  
  assertEquals(result.metadata.sheetCount, 1)
  assertEquals(result.metadata.sheetNames[0], 'Sheet1')
  assertEquals(result.metadata.totalCells, 1)
  assertEquals(typeof result.metadata.extractedAt, 'string')
})

Deno.test('parseXLSX - handles corrupted XLSX', async () => {
  const corruptedBuffer = new TextEncoder().encode('Not a valid XLSX').buffer
  
  await assertRejects(
    async () => await parseXLSX(corruptedBuffer),
    Error,
    'Failed to parse XLSX'
  )
})

Deno.test('parseXLSX - handles empty buffer', async () => {
  const emptyBuffer = new ArrayBuffer(0)
  
  await assertRejects(
    async () => await parseXLSX(emptyBuffer),
    Error,
    'Failed to parse XLSX'
  )
})

Deno.test('parseXLSX - handles spreadsheet with no text', async () => {
  const xlsxBuffer = createMinimalXLSX([[]])
  
  await assertRejects(
    async () => await parseXLSX(xlsxBuffer),
    Error,
    'No text content extracted'
  )
})

Deno.test('parseXLSX - handles large spreadsheet', async () => {
  // Create a large spreadsheet with 100 rows
  const largeData = Array.from({ length: 100 }, (_, i) => [
    `Row ${i}`,
    `Data ${i}`,
    `Value ${i}`
  ])
  const xlsxBuffer = createMinimalXLSX(largeData)
  
  const result = await parseXLSX(xlsxBuffer)
  
  assertEquals(result.documentType, 'xlsx')
  assertEquals(result.metadata.totalCells, 300)
  assertEquals(result.text.includes('Row 0'), true)
  assertEquals(result.text.includes('Row 99'), true)
})

Deno.test('parseXLSX - cleans extracted text', async () => {
  const xlsxBuffer = createMinimalXLSX([
    ['Text with    spaces'],
    ['More   text']
  ])
  
  const result = await parseXLSX(xlsxBuffer)
  
  // Should clean excessive whitespace
  assertEquals(result.text.includes('    '), false)
})
