/**
 * Unit tests for PDF parser
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { parsePDF } from './pdf.ts'

// Helper to create a minimal valid PDF
function createMinimalPDF(text: string): ArrayBuffer {
  // This is a minimal PDF structure with text content
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length ${text.length + 20}
>>
stream
BT
/F1 12 Tf
100 700 Td
(${text}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${400 + text.length}
%%EOF`
  
  return new TextEncoder().encode(pdfContent).buffer
}

Deno.test('parsePDF - parses simple PDF', async () => {
  const pdfBuffer = createMinimalPDF('Hello World Test')
  
  const result = await parsePDF(pdfBuffer)
  
  assertEquals(result.documentType, 'pdf')
  assertEquals(typeof result.text, 'string')
  assertEquals(result.pageCount, 1)
})

Deno.test('parsePDF - extracts metadata', async () => {
  const pdfBuffer = createMinimalPDF('Test content')
  
  const result = await parsePDF(pdfBuffer)
  
  assertEquals(result.metadata.pageCount, 1)
  assertEquals(typeof result.metadata.extractedAt, 'string')
})

Deno.test('parsePDF - handles corrupted PDF', async () => {
  const corruptedBuffer = new TextEncoder().encode('Not a valid PDF').buffer
  
  await assertRejects(
    async () => await parsePDF(corruptedBuffer),
    Error,
    'Failed to parse PDF'
  )
})

Deno.test('parsePDF - handles empty buffer', async () => {
  const emptyBuffer = new ArrayBuffer(0)
  
  await assertRejects(
    async () => await parsePDF(emptyBuffer),
    Error,
    'Failed to parse PDF'
  )
})

Deno.test('parsePDF - handles PDF with no text', async () => {
  const pdfBuffer = createMinimalPDF('')
  
  await assertRejects(
    async () => await parsePDF(pdfBuffer),
    Error
  )
})

Deno.test('parsePDF - cleans extracted text', async () => {
  const pdfBuffer = createMinimalPDF('Text with    spaces\n\n\nand lines')
  
  const result = await parsePDF(pdfBuffer)
  
  // Should clean excessive whitespace
  assertEquals(result.text.includes('    '), false)
})
