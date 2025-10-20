/**
 * End-to-End Test Suite for Student Tracking & Sharing System
 * 
 * This test validates the complete sharing workflow:
 * 1. Teacher creates and saves a wordlist
 * 2. Teacher enables sharing and gets share URL
 * 3. Student accesses via share link
 * 4. Student enters nickname and registers session
 * 5. Student practices and makes mistakes
 * 6. Teacher views dashboard with correct data
 * 
 * Prerequisites:
 * - Supabase must be running locally (supabase start)
 * - Environment variables must be configured (.env.local)
 * - Database migrations must be applied (including student_tracking)
 * 
 * To run these tests:
 * 1. Start Supabase: cd supabase && supabase start
 * 2. Verify migrations: supabase db reset
 * 3. Run tests: pnpm test tests/e2e/sharing-workflow.test.ts
 * 
 * Note: These tests require a running Supabase instance and will fail if
 * the backend is not available. They test the actual API endpoints and
 * database operations.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Test configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const TEST_TIMEOUT = 120000 // 2 minutes for full flow

// Helper to check if Supabase is running
async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-wordlists`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return response.status !== 0 // Any response means server is up
  } catch {
    return false
  }
}

// Test data
const TEST_WORDLIST = [
  { en: 'achievement', zh: '成就' },
  { en: 'beneficial', zh: '有益的' },
  { en: 'collaborate', zh: '合作' },
  { en: 'demonstrate', zh: '证明' },
  { en: 'efficient', zh: '高效的' },
]

const TEST_STUDENT_NICKNAME = '小明'
const TEST_DEVICE_INFO = {
  userAgent: 'Mozilla/5.0 (Test Browser)',
  screenResolution: '1920x1080',
  timezone: 'Asia/Shanghai',
}

describe('Student Tracking & Sharing E2E Flow', () => {
  let wordlistId: string | null = null
  let shareToken: string | null = null
  let shareUrl: string | null = null
  let sessionToken: string | null = null
  let sessionId: string | null = null

  beforeAll(async () => {
    // Verify environment is configured
    expect(SUPABASE_URL).toBeTruthy()
    console.log('🔧 Testing against:', SUPABASE_URL)
    
    // Check if Supabase is running
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      console.error('❌ Supabase is not running!')
      console.error('   Please start Supabase with: cd supabase && supabase start')
      throw new Error('Supabase is not running. Please start it before running E2E tests.')
    }
    console.log('✅ Supabase connection verified')
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

  it('should complete the full sharing workflow', async () => {
    // ========================================
    // STEP 1: Teacher creates and saves wordlist
    // ========================================
    console.log('📝 Step 1: Teacher creates and saves wordlist...')
    
    const saveResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/save-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'test-sharing-wordlist.txt',
          words: TEST_WORDLIST,
        }),
      }
    )

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text()
      console.error('❌ Save wordlist failed:', errorText)
      throw new Error(`Failed to save wordlist: ${saveResponse.status} ${errorText}`)
    }
    
    const saveResult = await saveResponse.json()
    
    console.log('✅ Step 1 Complete: Wordlist saved')
    console.log(`   - Wordlist ID: ${saveResult.id}`)
    
    expect(saveResult.success).toBe(true)
    expect(saveResult.id).toBeDefined()
    
    wordlistId = saveResult.id

    // ========================================
    // STEP 2: Teacher enables sharing
    // ========================================
    console.log('🔗 Step 2: Teacher enables sharing...')
    
    const shareResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/share-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordlistId,
          enable: true,
          settings: {
            anonymousMode: false,
            allowPractice: true,
          },
        }),
      }
    )

    expect(shareResponse.ok).toBe(true)
    const shareResult = await shareResponse.json()
    
    console.log('✅ Step 2 Complete: Sharing enabled')
    console.log(`   - Share Token: ${shareResult.shareToken}`)
    console.log(`   - Share URL: ${shareResult.shareUrl}`)
    
    expect(shareResult.success).toBe(true)
    expect(shareResult.shareToken).toBeDefined()
    expect(shareResult.shareUrl).toBeDefined()
    expect(shareResult.shareToken).toMatch(/^[a-f0-9]{48}$/) // 48 hex chars
    
    shareToken = shareResult.shareToken
    shareUrl = shareResult.shareUrl

    // ========================================
    // STEP 3: Student accesses via share link
    // ========================================
    console.log('👨‍🎓 Step 3: Student accesses via share link...')
    
    // Verify share token is valid by attempting to register
    expect(shareToken).toBeTruthy()
    console.log('✅ Step 3 Complete: Share link accessible')

    // ========================================
    // STEP 4: Student enters nickname and registers
    // ========================================
    console.log('✍️  Step 4: Student enters nickname and registers...')
    
    const registerResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/register-student-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareToken,
          nickname: TEST_STUDENT_NICKNAME,
          deviceInfo: TEST_DEVICE_INFO,
        }),
      }
    )

    expect(registerResponse.ok).toBe(true)
    const registerResult = await registerResponse.json()
    
    console.log('✅ Step 4 Complete: Student registered')
    console.log(`   - Session ID: ${registerResult.sessionId}`)
    console.log(`   - Session Token: ${registerResult.sessionToken?.substring(0, 16)}...`)
    
    expect(registerResult.success).toBe(true)
    expect(registerResult.sessionId).toBeDefined()
    expect(registerResult.sessionToken).toBeDefined()
    expect(registerResult.wordlist).toBeDefined()
    expect(registerResult.wordlist.id).toBe(wordlistId)
    expect(registerResult.wordlist.words).toHaveLength(TEST_WORDLIST.length)
    
    sessionToken = registerResult.sessionToken
    sessionId = registerResult.sessionId

    // ========================================
    // STEP 5: Student practices and makes mistakes
    // ========================================
    console.log('🎯 Step 5: Student practices and makes mistakes...')
    
    // Record multiple mistakes for different words
    const mistakes = [
      { word: 'achievement', translation: '成就', questionType: 'multiple_choice' },
      { word: 'achievement', translation: '成就', questionType: 'fill_blank' }, // Same word, different type
      { word: 'beneficial', translation: '有益的', questionType: 'multiple_choice' },
      { word: 'collaborate', translation: '合作', questionType: 'matching' },
      { word: 'achievement', translation: '成就', questionType: 'multiple_choice' }, // Repeat mistake
    ]

    for (const mistake of mistakes) {
      const mistakeResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/record-practice-mistake`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionToken,
            wordlistId,
            word: mistake.word,
            translation: mistake.translation,
            questionType: mistake.questionType,
          }),
        }
      )

      expect(mistakeResponse.ok).toBe(true)
      const mistakeResult = await mistakeResponse.json()
      expect(mistakeResult.success).toBe(true)
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('✅ Step 5 Complete: Mistakes recorded')
    console.log(`   - Total mistakes recorded: ${mistakes.length}`)
    console.log(`   - Unique words: ${new Set(mistakes.map(m => m.word)).size}`)

    // ========================================
    // STEP 6: Teacher views dashboard with correct data
    // ========================================
    console.log('📊 Step 6: Teacher views dashboard...')
    
    const statsResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-practice-stats?wordlistId=${wordlistId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    expect(statsResponse.ok).toBe(true)
    const statsResult = await statsResponse.json()
    
    console.log('✅ Step 6 Complete: Dashboard data fetched')
    console.log(`   - Total Students: ${statsResult.totalStudents}`)
    console.log(`   - Total Practices: ${statsResult.totalPractices}`)
    console.log(`   - Aggregate Mistakes: ${statsResult.aggregateMistakes?.length || 0}`)
    
    // Verify dashboard data accuracy
    expect(statsResult.wordlistId).toBe(wordlistId)
    expect(statsResult.totalStudents).toBe(1)
    expect(statsResult.totalPractices).toBeGreaterThan(0)
    
    // Verify student data
    expect(statsResult.students).toBeDefined()
    expect(statsResult.students).toHaveLength(1)
    
    const student = statsResult.students[0]
    expect(student.nickname).toBe(TEST_STUDENT_NICKNAME)
    expect(student.sessionId).toBe(sessionId)
    expect(student.totalMistakes).toBeGreaterThan(0)
    expect(student.topMistakes).toBeDefined()
    expect(Array.isArray(student.topMistakes)).toBe(true)
    
    // Verify aggregate mistakes
    expect(statsResult.aggregateMistakes).toBeDefined()
    expect(Array.isArray(statsResult.aggregateMistakes)).toBe(true)
    expect(statsResult.aggregateMistakes.length).toBeGreaterThan(0)
    
    // Find 'achievement' in aggregate (should have highest count)
    const achievementMistake = statsResult.aggregateMistakes.find(
      (m: any) => m.word === 'achievement'
    )
    expect(achievementMistake).toBeDefined()
    expect(achievementMistake.totalCount).toBeGreaterThanOrEqual(2) // We recorded it multiple times
    expect(achievementMistake.studentCount).toBe(1)
    
    console.log('✅ All steps completed successfully!')
    console.log('   Dashboard shows accurate student tracking data')
  }, TEST_TIMEOUT)

  it('should handle anonymous mode correctly', async () => {
    console.log('🔒 Testing anonymous mode...')
    
    // Create a new wordlist for anonymous testing
    const saveResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/save-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'test-anonymous-wordlist.txt',
          words: TEST_WORDLIST.slice(0, 3),
        }),
      }
    )

    const saveResult = await saveResponse.json()
    const anonWordlistId = saveResult.id

    try {
      // Enable sharing with anonymous mode
      const shareResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/share-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordlistId: anonWordlistId,
            enable: true,
            settings: {
              anonymousMode: true,
              allowPractice: true,
            },
          }),
        }
      )

      const shareResult = await shareResponse.json()
      const anonShareToken = shareResult.shareToken

      // Register two students
      const student1Response = await fetch(
        `${SUPABASE_URL}/functions/v1/register-student-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: anonShareToken,
            nickname: '张三',
            deviceInfo: TEST_DEVICE_INFO,
          }),
        }
      )

      const student1Result = await student1Response.json()

      const student2Response = await fetch(
        `${SUPABASE_URL}/functions/v1/register-student-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: anonShareToken,
            nickname: '李四',
            deviceInfo: { ...TEST_DEVICE_INFO, userAgent: 'Different Browser' },
          }),
        }
      )

      const student2Result = await student2Response.json()

      // Record mistakes for both students
      await fetch(
        `${SUPABASE_URL}/functions/v1/record-practice-mistake`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionToken: student1Result.sessionToken,
            wordlistId: anonWordlistId,
            word: 'achievement',
            translation: '成就',
            questionType: 'multiple_choice',
          }),
        }
      )

      await fetch(
        `${SUPABASE_URL}/functions/v1/record-practice-mistake`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionToken: student2Result.sessionToken,
            wordlistId: anonWordlistId,
            word: 'beneficial',
            translation: '有益的',
            questionType: 'multiple_choice',
          }),
        }
      )

      // Fetch stats and verify anonymous mode
      const statsResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/fetch-practice-stats?wordlistId=${anonWordlistId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const statsResult = await statsResponse.json()

      // In anonymous mode, nicknames should be replaced with "Student N"
      expect(statsResult.students).toHaveLength(2)
      
      const nicknames = statsResult.students.map((s: any) => s.nickname)
      expect(nicknames).toContain('Student 1')
      expect(nicknames).toContain('Student 2')
      expect(nicknames).not.toContain('张三')
      expect(nicknames).not.toContain('李四')

      console.log('✅ Anonymous mode working correctly')
      console.log(`   - Student nicknames anonymized: ${nicknames.join(', ')}`)
    } finally {
      // Cleanup
      await fetch(
        `${SUPABASE_URL}/functions/v1/delete-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: anonWordlistId }),
        }
      )
    }
  }, TEST_TIMEOUT)

  it('should prevent duplicate sessions for same nickname and device', async () => {
    console.log('🔄 Testing duplicate session prevention...')
    
    // Create a new wordlist
    const saveResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/save-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'test-duplicate-session.txt',
          words: TEST_WORDLIST.slice(0, 2),
        }),
      }
    )

    const saveResult = await saveResponse.json()
    const dupWordlistId = saveResult.id

    try {
      // Enable sharing
      const shareResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/share-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordlistId: dupWordlistId,
            enable: true,
          }),
        }
      )

      const shareResult = await shareResponse.json()
      const dupShareToken = shareResult.shareToken

      // Register same student twice with same device info
      const register1Response = await fetch(
        `${SUPABASE_URL}/functions/v1/register-student-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: dupShareToken,
            nickname: '重复测试',
            deviceInfo: TEST_DEVICE_INFO,
          }),
        }
      )

      const register1Result = await register1Response.json()
      const firstSessionId = register1Result.sessionId

      // Register again with same nickname and device
      const register2Response = await fetch(
        `${SUPABASE_URL}/functions/v1/register-student-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: dupShareToken,
            nickname: '重复测试',
            deviceInfo: TEST_DEVICE_INFO,
          }),
        }
      )

      const register2Result = await register2Response.json()
      const secondSessionId = register2Result.sessionId

      // Should return the same session
      expect(firstSessionId).toBe(secondSessionId)

      // Verify only one student in stats
      const statsResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/fetch-practice-stats?wordlistId=${dupWordlistId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const statsResult = await statsResponse.json()
      expect(statsResult.totalStudents).toBe(1)

      console.log('✅ Duplicate session prevention working')
      console.log(`   - Same session ID returned: ${firstSessionId}`)
    } finally {
      // Cleanup
      await fetch(
        `${SUPABASE_URL}/functions/v1/delete-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: dupWordlistId }),
        }
      )
    }
  }, TEST_TIMEOUT)

  it('should validate nickname requirements', async () => {
    console.log('✅ Testing nickname validation...')
    
    // Create a wordlist and enable sharing
    const saveResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/save-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'test-nickname-validation.txt',
          words: TEST_WORDLIST.slice(0, 2),
        }),
      }
    )

    const saveResult = await saveResponse.json()
    const valWordlistId = saveResult.id

    try {
      const shareResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/share-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordlistId: valWordlistId,
            enable: true,
          }),
        }
      )

      const shareResult = await shareResponse.json()
      const valShareToken = shareResult.shareToken

      // Test too short nickname (< 2 chars)
      const shortResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/register-student-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: valShareToken,
            nickname: 'A',
            deviceInfo: TEST_DEVICE_INFO,
          }),
        }
      )

      expect(shortResponse.ok).toBe(false)
      expect(shortResponse.status).toBe(400)

      // Test too long nickname (> 20 chars)
      const longResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/register-student-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: valShareToken,
            nickname: 'ThisNicknameIsWayTooLongForValidation',
            deviceInfo: TEST_DEVICE_INFO,
          }),
        }
      )

      expect(longResponse.ok).toBe(false)
      expect(longResponse.status).toBe(400)

      // Test valid Unicode nickname
      const unicodeResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/register-student-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: valShareToken,
            nickname: '小明😊',
            deviceInfo: TEST_DEVICE_INFO,
          }),
        }
      )

      expect(unicodeResponse.ok).toBe(true)
      const unicodeResult = await unicodeResponse.json()
      expect(unicodeResult.success).toBe(true)

      console.log('✅ Nickname validation working correctly')
    } finally {
      // Cleanup
      await fetch(
        `${SUPABASE_URL}/functions/v1/delete-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: valWordlistId }),
        }
      )
    }
  }, TEST_TIMEOUT)

  it('should disable sharing correctly', async () => {
    console.log('🔒 Testing disable sharing...')
    
    // Create and share a wordlist
    const saveResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/save-wordlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'test-disable-sharing.txt',
          words: TEST_WORDLIST.slice(0, 2),
        }),
      }
    )

    const saveResult = await saveResponse.json()
    const disableWordlistId = saveResult.id

    try {
      // Enable sharing
      const enableResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/share-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordlistId: disableWordlistId,
            enable: true,
          }),
        }
      )

      const enableResult = await enableResponse.json()
      const disableShareToken = enableResult.shareToken

      // Verify sharing is enabled
      expect(enableResult.success).toBe(true)
      expect(disableShareToken).toBeDefined()

      // Disable sharing
      const disableResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/share-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordlistId: disableWordlistId,
            enable: false,
          }),
        }
      )

      const disableResult = await disableResponse.json()
      expect(disableResult.success).toBe(true)

      // Try to register with disabled share token
      const registerResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/register-student-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken: disableShareToken,
            nickname: '测试学生',
            deviceInfo: TEST_DEVICE_INFO,
          }),
        }
      )

      // Should fail because sharing is disabled
      expect(registerResponse.ok).toBe(false)
      expect(registerResponse.status).toBe(403)

      console.log('✅ Disable sharing working correctly')
    } finally {
      // Cleanup
      await fetch(
        `${SUPABASE_URL}/functions/v1/delete-wordlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: disableWordlistId }),
        }
      )
    }
  }, TEST_TIMEOUT)
})
