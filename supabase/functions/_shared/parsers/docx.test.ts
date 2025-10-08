/**
 * Unit tests for DOCX parser
 */

import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { parseDOCX } from './docx.ts'

// Helper to create a minimal valid DOCX (ZIP with XML)
async function createMinimalDOCX(text: string): Promise<ArrayBuffer> {
  // DOCX is a ZIP file with XML content
  // For testing, we'll use JSZip to create a valid structure
  const JSZip = (await import('npm:jszip@3.10.1')).default
  
  const zip = new JSZip()
  
  // Add required DOCX structure
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`)
  
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)
  
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`)
  
  const blob = await zip.generateAsync({ type: 'arraybuffer' })
  return blob
}

Deno.test('parseDOCX - parses simple DOCX', async () => {
  const docxBuffer = await createMinimalDOCX('Hello World Test')
  
  const result = await parseDOCX(docxBuffer)
  
  assertEquals(result.documentType, 'docx')
  assertEquals(result.text.includes('Hello World Test'), true)
})

Deno.test('parseDOCX - handles UTF-8 characters', async () => {
  const docxBuffer = await createMinimalDOCX('English with 中文 and émojis 🎉')
  
  const result = await parseDOCX(docxBuffer)
  
  assertEquals(result.text.includes('中文'), true)
  assertEquals(result.text.includes('émojis'), true)
})

Deno.test('parseDOCX - cleans extracted text', async () => {
  const docxBuffer = await createMinimalDOCX('Text with    spaces\n\n\nand lines')
  
  const result = await parseDOCX(docxBuffer)
  
  // Should clean excessive whitespace
  assertEquals(result.text.includes('    '), false)
})

Deno.test('parseDOCX - handles corrupted DOCX', async () => {
  const corruptedBuffer = new TextEncoder().encode('Not a valid DOCX').buffer
  
  await assertRejects(
    async () => await parseDOCX(corruptedBuffer),
    Error,
    'Failed to parse DOCX'
  )
})

Deno.test('parseDOCX - handles empty buffer', async () => {
  const emptyBuffer = new ArrayBuffer(0)
  
  await assertRejects(
    async () => await parseDOCX(emptyBuffer),
    Error,
    'Failed to parse DOCX'
  )
})

Deno.test('parseDOCX - handles DOCX with no text', async () => {
  const docxBuffer = await createMinimalDOCX('')
  
  await assertRejects(
    async () => await parseDOCX(docxBuffer),
    Error,
    'No text content extracted'
  )
})

Deno.test('parseDOCX - includes metadata', async () => {
  const docxBuffer = await createMinimalDOCX('Test content')
  
  const result = await parseDOCX(docxBuffer)
  
  assertEquals(typeof result.metadata.extractedAt, 'string')
  assertEquals(result.metadata.size > 0, true)
})

Deno.test('parseDOCX - handles large document', async () => {
  const largeText = 'Lorem ipsum dolor sit amet. '.repeat(1000)
  const docxBuffer = await createMinimalDOCX(largeText)
  
  const result = await parseDOCX(docxBuffer)
  
  assertEquals(result.documentType, 'docx')
  assertEquals(result.text.length > 0, true)
})
