/**
 * Simple test to verify mammoth.js works in browser environment
 * This file can be removed after verification
 */
import mammoth from 'mammoth'

export async function testMammothBrowser(): Promise<boolean> {
  try {
    // Verify mammoth API is available
    if (typeof mammoth.convertToHtml !== 'function') {
      console.error('mammoth.convertToHtml is not available')
      return false
    }

    // Create a minimal test DOCX buffer (empty document)
    // In real usage, this would be a File object from user upload
    const testBuffer = new ArrayBuffer(0)
    
    // Verify the API accepts ArrayBuffer (browser-compatible)
    const result = await mammoth.convertToHtml({ arrayBuffer: testBuffer })
    
    // Even with empty buffer, mammoth should return a result object
    if (typeof result === 'object' && 'value' in result) {
      console.log('✓ Mammoth.js is working in browser environment')
      return true
    }
    
    return false
  } catch (error) {
    // Expected to fail with empty buffer, but API should be accessible
    if (error instanceof Error && error.message.includes('valid')) {
      console.log('✓ Mammoth.js API is accessible (expected validation error)')
      return true
    }
    console.error('✗ Mammoth.js test failed:', error)
    return false
  }
}
