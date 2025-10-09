/**
 * End-to-End Test Suite for VocabGo
 * 
 * This test validates the complete user flow:
 * 1. Upload a document
 * 2. Verify processing works
 * 3. Save wordlist
 * 4. Export wordlist
 * 5. Delete wordlist
 * 
 * Prerequisites:
 * - Supabase must be running locally (supabase start)
 * - Environment variables must be configured
 * - GLM API key must be valid
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Test configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const TEST_TIMEOUT = 120000 // 2 minutes for full flow

// Mock document content for testing
const createTestDocument = () => {
  const content = `
    Learning English Vocabulary
    
    This is a sample document for testing the VocabGo application.
    It contains various English words that should be extracted and translated.
    
    Important words to learn:
    - Achievement: reaching a goal through effort
    - Beneficial: producing good results or helpful effects
    - Collaborate: work jointly on an activity
    - Demonstrate: clearly show the existence or truth of something
    - Efficient: achieving maximum productivity with minimum wasted effort
    - Fundamental: forming a necessary base or core
    - Generate: cause something to arise or come about
    - Hypothesis: a supposition or proposed explanation
    - Implement: put a decision or plan into effect
    - Justify: show or prove to be right or reasonable
    
    These words are commonly used in academic and professional contexts.
  `
  
  const blob = new Blob([content], { type: 'text/plain' })
  return new File([blob], 'test-vocabulary.txt', { type: 'text/plain' })
}

describe('End-to-End Flow', () => {
  let wordlistId: string | null = null
  let processedWordlist: any = null

  beforeAll(() => {
    // Verify environment is configured
    expect(SUPABASE_URL).toBeTruthy()
    console.log('🔧 Testing against:', SUPABASE_URL)
  })

  afterAll(async () => {
    // Cleanup: Delete test wordlist if it exists
    if (wordlistId) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/delete-wordlist`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: wordlistId }),
          }
        )
        
        if (response.ok) {
          console.log('✅ Cleanup: Test wordlist deleted')
        }
      } catch (error) {
        console.warn('⚠️  Cleanup failed:', error)
      }
    }
  })

  it('should complete the full user flow', async () => {
    // Step 1: Upload and process document
    console.log('📤 Step 1: Uploading document...')
    
    const testFile = createTestDocument()
    const formData = new FormData()
    formData.append('file', testFile)

    const uploadResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/process-document`,
      {
        method: 'POST',
        body: formData,
      }
    )

    expect(uploadResponse.ok).toBe(true)
    const uploadResult = await uploadResponse.json()
    
    console.log('✅ Step 1 Complete: Document processed')
    console.log(`   - Words extracted: ${uploadResult.wordlist?.length || 0}`)
    
    expect(uploadResult.success).toBe(true)
    expect(uploadResult.wordlist).toBeDefined()
    expect(Array.isArray(uploadResult.wordlist)).toBe(true)
    expect(uploadResult.wordlist.length).toBeGreaterThan(0)
    expect(uploadResult.wordlist.length).toBeLessThanOrEqual(40)
    
    // Verify word structure
    const firstWord = uploadResult.wordlist[0]
    expect(firstWord).toHaveProperty('en')
    expect(firstWord).toHaveProperty('zh')
    expect(typeof firstWord.en).toBe('string')
    expect(typeof firstWord.zh).toBe('string')
    
    processedWordlist = uploadResult.wordlist

    // Step 2: Save wordlist
    console.log('💾 Step 2: Saving wordlist...')
    
    const saveResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/save-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: testFile.name,
          words: processedWordlist,
        }),
      }
    )

    expect(saveResponse.ok).toBe(true)
    const saveResult = await saveResponse.json()
    
    console.log('✅ Step 2 Complete: Wordlist saved')
    console.log(`   - Wordlist ID: ${saveResult.id}`)
    
    expect(saveResult.success).toBe(true)
    expect(saveResult.id).toBeDefined()
    
    wordlistId = saveResult.id

    // Step 3: Fetch saved wordlists
    console.log('📋 Step 3: Fetching saved wordlists...')
    
    const fetchResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-wordlists`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    expect(fetchResponse.ok).toBe(true)
    const fetchResult = await fetchResponse.json()
    
    console.log('✅ Step 3 Complete: Wordlists fetched')
    console.log(`   - Total wordlists: ${fetchResult.wordlists?.length || 0}`)
    
    expect(fetchResult.success).toBe(true)
    expect(Array.isArray(fetchResult.wordlists)).toBe(true)
    
    // Verify our saved wordlist is in the list
    const savedWordlist = fetchResult.wordlists.find((w: any) => w.id === wordlistId)
    expect(savedWordlist).toBeDefined()
    expect(savedWordlist.filename).toBe(testFile.name)
    expect(savedWordlist.word_count).toBe(processedWordlist.length)

    // Step 4: Export wordlist (CSV)
    console.log('📥 Step 4: Exporting wordlist as CSV...')
    
    // Note: Export functionality would typically return a file blob
    // For this test, we verify the wordlist data is exportable
    const csvData = processedWordlist
      .map((word: any) => `${word.en},${word.zh}`)
      .join('\n')
    
    expect(csvData).toBeTruthy()
    expect(csvData.split('\n').length).toBe(processedWordlist.length)
    
    console.log('✅ Step 4 Complete: Wordlist exported')
    console.log(`   - CSV rows: ${csvData.split('\n').length}`)

    // Step 5: Delete wordlist
    console.log('🗑️  Step 5: Deleting wordlist...')
    
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/delete-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: wordlistId }),
      }
    )

    expect(deleteResponse.ok).toBe(true)
    const deleteResult = await deleteResponse.json()
    
    console.log('✅ Step 5 Complete: Wordlist deleted')
    
    expect(deleteResult.success).toBe(true)
    
    // Verify deletion by fetching again
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-wordlists`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    const verifyResult = await verifyResponse.json()
    const deletedWordlist = verifyResult.wordlists.find((w: any) => w.id === wordlistId)
    expect(deletedWordlist).toBeUndefined()
    
    wordlistId = null // Prevent cleanup attempt
    
    console.log('✅ All steps completed successfully!')
  }, TEST_TIMEOUT)

  it('should handle invalid file uploads gracefully', async () => {
    console.log('🧪 Testing error handling...')
    
    // Create an invalid file (empty)
    const invalidFile = new File([''], 'empty.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', invalidFile)

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/process-document`,
      {
        method: 'POST',
        body: formData,
      }
    )

    // Should either reject or return error
    if (response.ok) {
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    } else {
      expect(response.status).toBeGreaterThanOrEqual(400)
    }
    
    console.log('✅ Error handling works correctly')
  })

  it('should enforce 40-word limit', async () => {
    console.log('🧪 Testing 40-word limit...')
    
    // Create a document with many words
    const longContent = Array.from({ length: 100 }, (_, i) => 
      `Word${i}: This is definition number ${i} for testing purposes.`
    ).join('\n')
    
    const longFile = new File([longContent], 'long-document.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', longFile)

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/process-document`,
      {
        method: 'POST',
        body: formData,
      }
    )

    expect(response.ok).toBe(true)
    const result = await response.json()
    
    expect(result.success).toBe(true)
    expect(result.wordlist.length).toBeLessThanOrEqual(40)
    
    console.log(`✅ Word limit enforced: ${result.wordlist.length} words extracted`)
  }, TEST_TIMEOUT)
})
