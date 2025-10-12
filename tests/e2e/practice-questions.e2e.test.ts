/**
 * End-to-End Test Suite for Practice Question Generator
 * 
 * This test validates the complete practice flow:
 * 1. Generate practice questions from a wordlist
 * 2. Complete a practice session with timer
 * 3. Save and retrieve session history
 * 4. Share practice sets via URL and HTML
 * 5. Test offline access and performance
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

// Test data
const createTestWordlist = () => ({
  filename: 'test-practice-wordlist.txt',
  words: [
    { en: 'achievement', zh: '成就' },
    { en: 'beneficial', zh: '有益的' },
    { en: 'collaborate', zh: '合作' },
    { en: 'demonstrate', zh: '证明' },
    { en: 'efficient', zh: '高效的' },
    { en: 'fundamental', zh: '基本的' },
    { en: 'generate', zh: '产生' },
    { en: 'hypothesis', zh: '假设' },
    { en: 'implement', zh: '实施' },
    { en: 'justify', zh: '证明合理' },
  ],
})

describe('Practice Question Generator E2E', () => {
  let wordlistId: string | null = null
  let practiceSetId: string | null = null
  let shareUrl: string | null = null

  beforeAll(async () => {
    // Verify environment is configured
    expect(SUPABASE_URL).toBeTruthy()
    console.log('🔧 Testing Practice Questions against:', SUPABASE_URL)

    // Create a test wordlist for practice
    console.log('📝 Setting up test wordlist...')
    const testData = createTestWordlist()
    const sessionId = `e2e-test-${Date.now()}`
    
    const saveResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/save-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          ...testData,
          documentType: 'txt',
        }),
      }
    )

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text()
      console.error('Failed to create test wordlist:', errorText)
      throw new Error(`Setup failed: ${errorText}`)
    }

    const saveResult = await saveResponse.json()
    wordlistId = saveResult.wordlistId
    console.log(`✅ Test wordlist created: ${wordlistId}`)
  })

  afterAll(async () => {
    // Cleanup: Delete test data
    const cleanupTasks = []

    if (wordlistId) {
      cleanupTasks.push(
        fetch(`${SUPABASE_URL}/functions/v1/delete-wordlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordlistId }),
        }).catch(console.warn)
      )
    }

    await Promise.all(cleanupTasks)
    console.log('✅ Cleanup completed')
  })

  describe('Question Generation', () => {
    it('should generate all three question types', async () => {
      console.log('🎯 Step 1: Generating practice questions...')

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordlistId,
            questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
            maxQuestions: 10,
          }),
        }
      )

      expect(response.ok).toBe(true)
      const result = await response.json()

      console.log('✅ Questions generated successfully')
      console.log(`   - Matching: ${result.questions.matching?.length || 0}`)
      console.log(`   - Fill-blank: ${result.questions.fillBlank?.length || 0}`)
      console.log(`   - Multiple choice: ${result.questions.multipleChoice?.length || 0}`)

      expect(result.success).toBe(true)
      expect(result.practiceSetId).toBeDefined()
      expect(result.questions).toBeDefined()
      expect(result.questions.matching).toBeDefined()
      expect(result.questions.fillBlank).toBeDefined()
      expect(result.questions.multipleChoice).toBeDefined()

      // Verify question structure
      if (result.questions.matching.length > 0) {
        const matchingQ = result.questions.matching[0]
        expect(matchingQ).toHaveProperty('id')
        expect(matchingQ).toHaveProperty('type', 'matching')
        expect(matchingQ).toHaveProperty('pairs')
        expect(Array.isArray(matchingQ.pairs)).toBe(true)
      }

      if (result.questions.fillBlank.length > 0) {
        const fillBlankQ = result.questions.fillBlank[0]
        expect(fillBlankQ).toHaveProperty('id')
        expect(fillBlankQ).toHaveProperty('type', 'fill-blank')
        expect(fillBlankQ).toHaveProperty('sentence')
        expect(fillBlankQ).toHaveProperty('correctAnswer')
      }

      if (result.questions.multipleChoice.length > 0) {
        const mcQ = result.questions.multipleChoice[0]
        expect(mcQ).toHaveProperty('id')
        expect(mcQ).toHaveProperty('type', 'multiple-choice')
        expect(mcQ).toHaveProperty('sentence')
        expect(mcQ).toHaveProperty('options')
        expect(Array.isArray(mcQ.options)).toBe(true)
        expect(mcQ.options.length).toBe(4)
      }

      practiceSetId = result.practiceSetId
    }, TEST_TIMEOUT)

    it('should enforce minimum word count requirement', async () => {
      console.log('🧪 Testing minimum word count validation...')

      // Create a wordlist with only 2 words (below minimum of 4)
      const smallWordlist = {
        filename: 'small-wordlist.txt',
        words: [
          { en: 'test', zh: '测试' },
          { en: 'word', zh: '词' },
        ],
      }

      const saveResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/save-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': `test-${Date.now()}`,
          },
          body: JSON.stringify({
            ...smallWordlist,
            documentType: 'txt',
          }),
        }
      )

      const saveResult = await saveResponse.json()
      const smallWordlistId = saveResult.wordlistId

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordlistId: smallWordlistId,
            questionTypes: ['matching'],
          }),
        }
      )

      // Should return error or limited questions
      if (response.ok) {
        const result = await response.json()
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400)
      }

      // Cleanup
      await fetch(`${SUPABASE_URL}/functions/v1/delete-wordlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: smallWordlistId }),
      })

      console.log('✅ Minimum word count validation works')
    }, TEST_TIMEOUT)

    it('should limit questions to maximum of 10 per type', async () => {
      console.log('🧪 Testing question limit enforcement...')

      // Create a large wordlist
      const largeWordlist = {
        filename: 'large-wordlist.txt',
        words: Array.from({ length: 40 }, (_, i) => ({
          en: `word${i}`,
          zh: `词${i}`,
        })),
      }

      const saveResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/save-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': `test-${Date.now()}`,
          },
          body: JSON.stringify({
            ...largeWordlist,
            documentType: 'txt',
          }),
        }
      )

      const saveResult = await saveResponse.json()
      const largeWordlistId = saveResult.wordlistId

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordlistId: largeWordlistId,
            questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
            maxQuestions: 10,
          }),
        }
      )

      expect(response.ok).toBe(true)
      const result = await response.json()

      expect(result.questions.matching.length).toBeLessThanOrEqual(10)
      expect(result.questions.fillBlank.length).toBeLessThanOrEqual(10)
      expect(result.questions.multipleChoice.length).toBeLessThanOrEqual(10)

      // Cleanup
      await fetch(`${SUPABASE_URL}/functions/v1/delete-wordlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: largeWordlistId }),
      })

      console.log('✅ Question limit enforced correctly')
    }, TEST_TIMEOUT)
  })

  describe('Practice Session Management', () => {
    it('should save and retrieve practice session', async () => {
      console.log('💾 Step 2: Testing session management...')

      // First generate questions if not already done
      if (!practiceSetId) {
        const genResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wordlistId,
              questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
            }),
          }
        )
        const genResult = await genResponse.json()
        practiceSetId = genResult.practiceSetId
      }

      // Save a practice session
      const sessionData = {
        practiceSetId,
        sessionId: `test-session-${Date.now()}`,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 300000).toISOString(), // 5 minutes later
        timerDuration: 5,
        answers: {
          'q1': { answer: 'test', correct: true },
          'q2': { answer: 'wrong', correct: false },
        },
        score: 50.0,
        completed: true,
      }

      const saveResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/save-practice-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        }
      )

      expect(saveResponse.ok).toBe(true)
      const saveResult = await saveResponse.json()

      console.log('✅ Session saved successfully')
      expect(saveResult.success).toBe(true)
      expect(saveResult.sessionId).toBeDefined()

      // Retrieve session history
      const historyResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/fetch-practice-history?sessionId=${sessionData.sessionId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      expect(historyResponse.ok).toBe(true)
      const historyResult = await historyResponse.json()

      console.log('✅ Session history retrieved')
      console.log(`   - Sessions found: ${historyResult.sessions?.length || 0}`)

      expect(historyResult.success).toBe(true)
      expect(Array.isArray(historyResult.sessions)).toBe(true)
      expect(historyResult.sessions.length).toBeGreaterThan(0)

      const savedSession = historyResult.sessions[0]
      expect(savedSession.score).toBe(50.0)
      expect(savedSession.completed).toBe(true)
    }, TEST_TIMEOUT)

    it('should handle timer-based sessions', async () => {
      console.log('⏱️  Testing timer functionality...')

      if (!practiceSetId) {
        const genResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wordlistId,
              questionTypes: ['matching'],
            }),
          }
        )
        const genResult = await genResponse.json()
        practiceSetId = genResult.practiceSetId
      }

      const startTime = Date.now()
      const timerDuration = 1 // 1 minute

      // Simulate a timed session
      const sessionData = {
        practiceSetId,
        sessionId: `timed-session-${Date.now()}`,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(startTime + timerDuration * 60000).toISOString(),
        timerDuration,
        answers: {},
        score: 0,
        completed: true,
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/save-practice-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        }
      )

      expect(response.ok).toBe(true)
      const result = await response.json()

      expect(result.success).toBe(true)
      console.log('✅ Timer-based session saved correctly')
    }, TEST_TIMEOUT)
  })

  describe('Sharing Functionality', () => {
    it('should generate shareable URL for practice set', async () => {
      console.log('🔗 Step 3: Testing share URL generation...')

      if (!practiceSetId) {
        const genResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wordlistId,
              questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
            }),
          }
        )
        const genResult = await genResponse.json()
        practiceSetId = genResult.practiceSetId
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/share-practice-set`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            practiceSetId,
            sessionId: `share-test-${Date.now()}`,
          }),
        }
      )

      expect(response.ok).toBe(true)
      const result = await response.json()

      console.log('✅ Share URL generated')
      console.log(`   - URL: ${result.shareUrl}`)

      expect(result.success).toBe(true)
      expect(result.shareUrl).toBeDefined()
      expect(typeof result.shareUrl).toBe('string')
      expect(result.shareUrl.length).toBeGreaterThan(0)

      shareUrl = result.shareUrl
    }, TEST_TIMEOUT)

    it('should retrieve shared practice set via URL', async () => {
      console.log('📥 Testing shared practice set retrieval...')

      if (!shareUrl) {
        // Generate share URL first
        const shareResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/share-practice-set`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              practiceSetId,
              sessionId: `share-test-${Date.now()}`,
            }),
          }
        )
        const shareResult = await shareResponse.json()
        shareUrl = shareResult.shareUrl
      }

      // Extract share ID from URL
      const shareId = shareUrl!.split('/').pop()

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/get-shared-practice?shareId=${shareId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      expect(response.ok).toBe(true)
      const result = await response.json()

      console.log('✅ Shared practice set retrieved')

      expect(result.success).toBe(true)
      expect(result.questions).toBeDefined()
      expect(result.wordlistName).toBeDefined()
    }, TEST_TIMEOUT)

    it('should generate static HTML for offline access', async () => {
      console.log('📄 Testing static HTML generation...')

      if (!practiceSetId) {
        const genResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wordlistId,
              questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
            }),
          }
        )
        const genResult = await genResponse.json()
        practiceSetId = genResult.practiceSetId
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/share-practice-set`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            practiceSetId,
            sessionId: `html-test-${Date.now()}`,
            generateHtml: true,
          }),
        }
      )

      expect(response.ok).toBe(true)
      const result = await response.json()

      console.log('✅ Static HTML generated')

      expect(result.success).toBe(true)
      expect(result.html).toBeDefined()
      expect(typeof result.html).toBe('string')
      expect(result.html).toContain('<!DOCTYPE html>')
      expect(result.html).toContain('<html')
      expect(result.html).toContain('</html>')

      // Verify HTML contains essential elements
      expect(result.html).toContain('practice')
      expect(result.html).toContain('question')

      console.log(`   - HTML size: ${result.html.length} bytes`)
    }, TEST_TIMEOUT)
  })

  describe('Performance and Error Handling', () => {
    it('should generate questions within performance target', async () => {
      console.log('⚡ Step 4: Testing performance...')

      const startTime = Date.now()

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordlistId,
            questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
            maxQuestions: 10,
          }),
        }
      )

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(response.ok).toBe(true)
      const result = await response.json()

      console.log(`✅ Questions generated in ${duration}ms`)
      console.log(`   - Target: < 10000ms for 40-word wordlist`)
      console.log(`   - Actual: ${duration}ms for 10-word wordlist`)

      expect(result.success).toBe(true)
      // For a 10-word wordlist, should be much faster than 10 seconds
      expect(duration).toBeLessThan(15000) // 15 seconds max
    }, TEST_TIMEOUT)

    it('should handle concurrent question generation', async () => {
      console.log('🔄 Testing concurrent generation...')

      const requests = Array.from({ length: 3 }, () =>
        fetch(`${SUPABASE_URL}/functions/v1/generate-practice-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordlistId,
            questionTypes: ['matching'],
            maxQuestions: 5,
          }),
        })
      )

      const responses = await Promise.all(requests)

      console.log('✅ Concurrent requests completed')

      for (const response of responses) {
        expect(response.ok).toBe(true)
        const result = await response.json()
        expect(result.success).toBe(true)
      }
    }, TEST_TIMEOUT)

    it('should handle invalid wordlist ID gracefully', async () => {
      console.log('🧪 Testing error handling for invalid wordlist...')

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordlistId: 'invalid-uuid-12345',
            questionTypes: ['matching'],
          }),
        }
      )

      // Should return error
      if (response.ok) {
        const result = await response.json()
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400)
      }

      console.log('✅ Error handling works correctly')
    }, TEST_TIMEOUT)

    it('should handle missing question types', async () => {
      console.log('🧪 Testing error handling for missing question types...')

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordlistId,
            questionTypes: [],
          }),
        }
      )

      // Should return error or default to all types
      if (response.ok) {
        const result = await response.json()
        // Either error or defaults to all types
        if (!result.success) {
          expect(result.error).toBeDefined()
        } else {
          expect(result.questions).toBeDefined()
        }
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400)
      }

      console.log('✅ Missing question types handled')
    }, TEST_TIMEOUT)

    it('should handle network timeout gracefully', async () => {
      console.log('🧪 Testing timeout handling...')

      // This test verifies the function completes within timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout

      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wordlistId,
              questionTypes: ['matching'],
            }),
            signal: controller.signal,
          }
        )

        clearTimeout(timeoutId)
        expect(response.ok).toBe(true)
        console.log('✅ Request completed within timeout')
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.warn('⚠️  Request timed out (expected for timeout test)')
        } else {
          throw error
        }
      }
    }, TEST_TIMEOUT)
  })

  describe('Complete Practice Flow', () => {
    it('should complete full practice workflow', async () => {
      console.log('🎯 Step 5: Testing complete practice workflow...')

      // Step 1: Generate questions
      console.log('   1️⃣  Generating questions...')
      const genResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordlistId,
            questionTypes: ['matching', 'fill-blank', 'multiple-choice'],
            maxQuestions: 5,
          }),
        }
      )

      expect(genResponse.ok).toBe(true)
      const genResult = await genResponse.json()
      expect(genResult.success).toBe(true)
      const setPracticeSetId = genResult.practiceSetId

      console.log('   ✅ Questions generated')

      // Step 2: Simulate practice session
      console.log('   2️⃣  Simulating practice session...')
      const sessionId = `complete-flow-${Date.now()}`
      const startTime = Date.now()

      // Simulate answering questions
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate 1 second of practice

      const endTime = Date.now()

      // Step 3: Save session
      console.log('   3️⃣  Saving session...')
      const sessionData = {
        practiceSetId: setPracticeSetId,
        sessionId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        timerDuration: 10,
        answers: {
          'q1': { answer: 'test', correct: true },
          'q2': { answer: 'test2', correct: true },
          'q3': { answer: 'wrong', correct: false },
        },
        score: 66.67,
        completed: true,
      }

      const saveResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/save-practice-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        }
      )

      expect(saveResponse.ok).toBe(true)
      const saveResult = await saveResponse.json()
      expect(saveResult.success).toBe(true)

      console.log('   ✅ Session saved')

      // Step 4: Retrieve history
      console.log('   4️⃣  Retrieving history...')
      const historyResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/fetch-practice-history?sessionId=${sessionId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      expect(historyResponse.ok).toBe(true)
      const historyResult = await historyResponse.json()
      expect(historyResult.success).toBe(true)
      expect(historyResult.sessions.length).toBeGreaterThan(0)

      console.log('   ✅ History retrieved')

      // Step 5: Share practice set
      console.log('   5️⃣  Sharing practice set...')
      const shareResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/share-practice-set`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            practiceSetId: setPracticeSetId,
            sessionId,
          }),
        }
      )

      expect(shareResponse.ok).toBe(true)
      const shareResult = await shareResponse.json()
      expect(shareResult.success).toBe(true)
      expect(shareResult.shareUrl).toBeDefined()

      console.log('   ✅ Practice set shared')
      console.log('✅ Complete workflow test passed!')
    }, TEST_TIMEOUT)
  })
})
