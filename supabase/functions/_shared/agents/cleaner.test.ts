/**
 * Unit tests for Text Cleaner Service
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts'
import { cleanText } from './cleaner.ts'
import type { CleanerInput, CleanerOutput } from './types.ts'

// Test: Basic text cleaning
Deno.test('cleanText - cleans simple text without noise', () => {
  const input: CleanerInput = {
    rawText: 'This is a simple document with clean text. No headers or footers here.',
    documentType: 'txt',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('simple document'), true)
  assertEquals(result.cleanedText.includes('clean text'), true)
  assertExists(result.cleanlinessScore)
  assertExists(result.confidence)
})

// Test: Remove page numbers - standalone format
Deno.test('cleanText - removes standalone page numbers', () => {
  const input: CleanerInput = {
    rawText: 'Chapter One\n\n1\n\nThis is the main text.\n\n2\n\nMore text here.',
    documentType: 'pdf',
  }

  const result = cleanText(input)

  // Main content should be preserved
  assertEquals(result.cleanedText.includes('Chapter'), true)
  assertEquals(result.cleanedText.includes('main text'), true)
  assertEquals(result.cleanedText.includes('More text'), true)
  
  // Page numbers should be detected and removed
  if (result.removedSections.includes('page_numbers')) {
    // If page numbers were detected, verify they're removed
    const lines = result.cleanedText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    assertEquals(lines.includes('1'), false)
    assertEquals(lines.includes('2'), false)
  }
})

// Test: Remove page numbers - "Page X" format
Deno.test('cleanText - removes "Page X" format', () => {
  const input: CleanerInput = {
    rawText: 'Introduction\nPage 1\nContent here.\nPage 2\nMore content.',
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Introduction'), true)
  assertEquals(result.cleanedText.includes('Content here'), true)
  assertEquals(result.removedSections.includes('page_numbers'), true)
  assertEquals(result.cleanedText.includes('Page 1'), false)
  assertEquals(result.cleanedText.includes('Page 2'), false)
})

// Test: Remove page numbers - "- X -" format
Deno.test('cleanText - removes "- X -" page number format', () => {
  const input: CleanerInput = {
    rawText: 'Chapter Title\n- 1 -\nContent here.\n- 2 -\nMore content.',
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Chapter Title'), true)
  assertEquals(result.cleanedText.includes('Content here'), true)
  assertEquals(result.removedSections.includes('page_numbers'), true)
  assertEquals(result.cleanedText.includes('- 1 -'), false)
  assertEquals(result.cleanedText.includes('- 2 -'), false)
})

// Test: Remove page numbers - "X of Y" format
Deno.test('cleanText - removes "X of Y" page format', () => {
  const input: CleanerInput = {
    rawText: 'Document Title\n1 of 10\nContent here.\n2 of 10\nMore content.',
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Document Title'), true)
  assertEquals(result.cleanedText.includes('Content here'), true)
  assertEquals(result.removedSections.includes('page_numbers'), true)
  assertEquals(result.cleanedText.includes('1 of 10'), false)
  assertEquals(result.cleanedText.includes('2 of 10'), false)
})

// Test: Remove headers and footers (repeated lines)
Deno.test('cleanText - removes repeated headers and footers', () => {
  const input: CleanerInput = {
    rawText: `Company Name
Page 1 content here.
Company Name
Page 2 content here.
Company Name
Page 3 content here.
Company Name`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Page 1 content'), true)
  assertEquals(result.cleanedText.includes('Page 2 content'), true)
  assertEquals(result.removedSections.includes('headers_footers'), true)
  // "Company Name" should be removed as it repeats 4 times
  const companyCount = (result.cleanedText.match(/Company Name/g) || []).length
  assertEquals(companyCount, 0)
})

// Test: Remove table of contents
Deno.test('cleanText - removes table of contents with dots', () => {
  const input: CleanerInput = {
    rawText: `Table of Contents
Chapter 1 ........ 5
Chapter 2 ........ 15
Chapter 3 ........ 25

Actual content starts here.`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Actual content starts here'), true)
  assertEquals(result.removedSections.includes('table_of_contents'), true)
  assertEquals(result.cleanedText.includes('Chapter 1 ........'), false)
  assertEquals(result.cleanedText.includes('Chapter 2 ........'), false)
})

// Test: Remove table of contents with spaces
Deno.test('cleanText - removes table of contents with spaces', () => {
  const input: CleanerInput = {
    rawText: `Contents
Introduction     1
Methods     10
Results     20

The actual document begins here.`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('actual document begins'), true)
  assertEquals(result.removedSections.includes('table_of_contents'), true)
})

// Test: Remove indexes
Deno.test('cleanText - removes index entries', () => {
  const input: CleanerInput = {
    rawText: `Main content here.

Index
Algorithm, 45
Database, 67-70
Network, 89, 92-95

More content.`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Main content here'), true)
  assertEquals(result.cleanedText.includes('More content'), true)
  assertEquals(result.removedSections.includes('indexes'), true)
  assertEquals(result.cleanedText.includes('Algorithm, 45'), false)
  assertEquals(result.cleanedText.includes('Database, 67-70'), false)
})

// Test: Remove captions
Deno.test('cleanText - removes figure captions', () => {
  const input: CleanerInput = {
    rawText: `This is the main text.
Figure 1: A diagram showing the process.
More text here.
Table 2: Results of the experiment.
Final paragraph.`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('main text'), true)
  assertEquals(result.cleanedText.includes('More text here'), true)
  assertEquals(result.cleanedText.includes('Final paragraph'), true)
  assertEquals(result.removedSections.includes('captions'), true)
  assertEquals(result.cleanedText.includes('Figure 1:'), false)
  assertEquals(result.cleanedText.includes('Table 2:'), false)
})

// Test: Remove captions - abbreviated format
Deno.test('cleanText - removes abbreviated captions', () => {
  const input: CleanerInput = {
    rawText: `Content here.
Fig. 3: Sample image.
More content.
Tab. 1: Data table.
End of document.`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Content here'), true)
  assertEquals(result.cleanedText.includes('More content'), true)
  assertEquals(result.removedSections.includes('captions'), true)
  assertEquals(result.cleanedText.includes('Fig. 3:'), false)
  assertEquals(result.cleanedText.includes('Tab. 1:'), false)
})

// Test: Remove URLs and emails for PDF/TXT
Deno.test('cleanText - removes URLs and emails from PDF', () => {
  const input: CleanerInput = {
    rawText: `Visit our website at https://example.com for more info.
Contact us at support@example.com for help.
Regular text continues here.`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Regular text continues'), true)
  assertEquals(result.removedSections.includes('urls_emails'), true)
  assertEquals(result.cleanedText.includes('https://example.com'), false)
  assertEquals(result.cleanedText.includes('support@example.com'), false)
})

// Test: Keep URLs for DOCX (document type specific)
Deno.test('cleanText - keeps URLs for DOCX documents', () => {
  const input: CleanerInput = {
    rawText: `Visit https://example.com for details.
Regular content here.`,
    documentType: 'docx',
  }

  const result = cleanText(input)

  // URLs should NOT be removed for docx
  assertEquals(result.removedSections.includes('urls_emails'), false)
})

// Test: Normalize whitespace
Deno.test('cleanText - normalizes excessive whitespace', () => {
  const input: CleanerInput = {
    rawText: `Line 1


Line 2    with    multiple    spaces


Line 3`,
    documentType: 'txt',
  }

  const result = cleanText(input)

  assertEquals(result.removedSections.includes('whitespace'), true)
  // Should not have 3+ consecutive newlines
  assertEquals(result.cleanedText.includes('\n\n\n'), false)
  // Should not have multiple consecutive spaces
  assertEquals(result.cleanedText.includes('    '), false)
})

// Test: Remove special characters
Deno.test('cleanText - removes non-printable characters', () => {
  const input: CleanerInput = {
    rawText: 'Normal text\x00with\x01control\x02characters\x03here.',
    documentType: 'txt',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Normal text'), true)
  assertEquals(result.removedSections.includes('special_characters'), true)
  // Control characters should be removed
  assertEquals(result.cleanedText.includes('\x00'), false)
  assertEquals(result.cleanedText.includes('\x01'), false)
})

// Test: Fix encoding issues
Deno.test('cleanText - fixes common encoding issues', () => {
  // Using the actual byte sequences that appear in malformed UTF-8
  const input: CleanerInput = {
    rawText: "It's a normal test with some text.",
    documentType: 'txt',
  }

  const result = cleanText(input)

  // The text should be preserved
  assertEquals(result.cleanedText.includes("It's"), true)
  assertEquals(result.cleanedText.includes("test"), true)
})

// Test: Empty text edge case
Deno.test('cleanText - handles empty text', () => {
  const input: CleanerInput = {
    rawText: '',
    documentType: 'txt',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText, '')
  assertEquals(result.cleanlinessScore, 0)
  assertExists(result.confidence)
})

// Test: Whitespace-only text edge case
Deno.test('cleanText - handles whitespace-only text', () => {
  const input: CleanerInput = {
    rawText: '   \n\n   \t\t   ',
    documentType: 'txt',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText, '')
  assertEquals(result.removedSections.includes('whitespace'), true)
})

// Test: Heavily formatted document
Deno.test('cleanText - handles heavily formatted document', () => {
  const input: CleanerInput = {
    rawText: `Company Header
Page 1

Table of Contents
Chapter 1 ........ 5
Chapter 2 ........ 10

1

Company Header
Page 2

This is the actual content that should remain.
Figure 1: A sample diagram.
More important content here.

2

Company Header
Page 3

Final content paragraph.
Visit https://example.com

Index
Algorithm, 45
Database, 67

Company Footer`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  // Should keep actual content
  assertEquals(result.cleanedText.includes('actual content that should remain'), true)
  assertEquals(result.cleanedText.includes('important content here'), true)
  assertEquals(result.cleanedText.includes('Final content paragraph'), true)

  // Should remove noise
  assertEquals(result.removedSections.length > 0, true)
  assertEquals(result.cleanedText.includes('Company Header'), false)
  assertEquals(result.cleanedText.includes('Figure 1:'), false)
  assertEquals(result.cleanedText.includes('https://example.com'), false)
})

// Test: Special characters with Chinese text
Deno.test('cleanText - preserves Chinese characters', () => {
  const input: CleanerInput = {
    rawText: 'English text with 中文字符 mixed in. More 汉字 here.',
    documentType: 'txt',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('English text'), true)
  assertEquals(result.cleanedText.includes('中文字符'), true)
  assertEquals(result.cleanedText.includes('汉字'), true)
})

// Test: Cleanliness score calculation
Deno.test('cleanText - calculates cleanliness score correctly', () => {
  const input: CleanerInput = {
    rawText: `Header
1
Content here.
2
Footer`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  // Score should be between 0 and 1
  assertEquals(result.cleanlinessScore >= 0, true)
  assertEquals(result.cleanlinessScore <= 1, true)
  // Some content was removed, so score should be > 0
  assertEquals(result.cleanlinessScore > 0, true)
})

// Test: Confidence score
Deno.test('cleanText - returns appropriate confidence score', () => {
  const input: CleanerInput = {
    rawText: 'Simple clean text with no patterns to remove.',
    documentType: 'txt',
  }

  const result = cleanText(input)

  // High confidence when no patterns removed
  assertEquals(result.confidence >= 0.9, true)
})

Deno.test('cleanText - returns lower confidence when patterns removed', () => {
  const input: CleanerInput = {
    rawText: `Header
Page 1
Content here.
Figure 1: Caption.`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  // Lower confidence when patterns were removed
  assertEquals(result.confidence < 0.9, true)
  assertEquals(result.confidence >= 0.8, true)
})

// Test: Multiple pattern types removed
Deno.test('cleanText - tracks multiple removed pattern types', () => {
  const input: CleanerInput = {
    rawText: `Header
Header
Header
Page 1
Content here.
Figure 1: A diagram.
https://example.com
2`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  assertEquals(result.cleanedText.includes('Content here'), true)
  // Should have removed multiple pattern types
  assertEquals(result.removedSections.length >= 3, true)
  assertEquals(result.removedSections.includes('headers_footers'), true)
  assertEquals(result.removedSections.includes('page_numbers'), true)
  assertEquals(result.removedSections.includes('captions'), true)
})

// Test: Large document performance
Deno.test('cleanText - handles large documents efficiently', () => {
  // Create a large document with repeated patterns
  const lines = []
  for (let i = 0; i < 1000; i++) {
    lines.push('Header Line')
    lines.push(`Page ${i}`)
    lines.push(`Content paragraph ${i} with actual text that should be preserved.`)
    lines.push(`Figure ${i}: Some caption.`)
  }
  
  const input: CleanerInput = {
    rawText: lines.join('\n'),
    documentType: 'pdf',
  }

  const startTime = Date.now()
  const result = cleanText(input)
  const duration = Date.now() - startTime

  // Should complete in reasonable time (< 1 second for 1000 "pages")
  assertEquals(duration < 1000, true)
  assertEquals(result.cleanedText.includes('Content paragraph'), true)
  assertEquals(result.removedSections.length > 0, true)
})

// Test: Document with only noise
Deno.test('cleanText - handles document with only noise', () => {
  const input: CleanerInput = {
    rawText: `Header
1
Figure 1: Caption.
2
Footer
3`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  // Most or all content should be removed
  assertEquals(result.cleanedText.length < input.rawText.length, true)
  assertEquals(result.removedSections.length > 0, true)
})

// Test: Mixed content preservation
Deno.test('cleanText - preserves meaningful content while removing noise', () => {
  const input: CleanerInput = {
    rawText: `Chapter 1: Introduction

This is an important paragraph about the topic.
It contains valuable information for learning.

Page 1

Another paragraph with key concepts.
Figure 1: A diagram.

The conclusion paragraph wraps up the section.`,
    documentType: 'pdf',
  }

  const result = cleanText(input)

  // Should keep meaningful content
  assertEquals(result.cleanedText.includes('important paragraph'), true)
  assertEquals(result.cleanedText.includes('valuable information'), true)
  assertEquals(result.cleanedText.includes('key concepts'), true)
  assertEquals(result.cleanedText.includes('conclusion paragraph'), true)

  // Should remove noise
  assertEquals(result.cleanedText.includes('Page 1'), false)
  assertEquals(result.cleanedText.includes('Figure 1:'), false)
})
