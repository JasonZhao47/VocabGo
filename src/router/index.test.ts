import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import * as session from '@/lib/session'

// Mock the session module
vi.mock('@/lib/session', () => ({
  getSessionId: vi.fn(),
  clearSession: vi.fn()
}))

// Import routes configuration
const routes = [
  { 
    path: '/', 
    name: 'home', 
    component: { template: '<div>Home</div>' }
  },
  { 
    path: '/dashboard/:wordlistId', 
    name: 'practice-dashboard', 
    component: { template: '<div>Dashboard</div>' },
    meta: { requiresSession: true }
  },
  { 
    path: '/practice/:shareToken', 
    name: 'student-practice', 
    component: { template: '<div>Practice</div>' }
  }
]

describe('Router Configuration', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes
    })

    // Add the same beforeEach guard as in the actual router
    router.beforeEach((to, from, next) => {
      if (to.meta.requiresSession) {
        const sessionId = session.getSessionId()
        if (!sessionId) {
          next({ name: 'home' })
        } else {
          next()
        }
      } else {
        next()
      }
    })

    vi.clearAllMocks()
  })

  describe('Student Practice Route', () => {
    it('should navigate to student practice view with share token', async () => {
      const shareToken = 'abc123xyz'
      await router.push(`/practice/${shareToken}`)
      
      expect(router.currentRoute.value.name).toBe('student-practice')
      expect(router.currentRoute.value.params.shareToken).toBe(shareToken)
    })

    it('should handle different share token formats', async () => {
      const tokens = ['short', 'very-long-token-with-dashes', '123456789']
      
      for (const token of tokens) {
        await router.push(`/practice/${token}`)
        expect(router.currentRoute.value.params.shareToken).toBe(token)
      }
    })

    it('should not require session for student practice', async () => {
      vi.mocked(session.getSessionId).mockReturnValue('')
      
      await router.push('/practice/test-token')
      
      expect(router.currentRoute.value.name).toBe('student-practice')
    })
  })

  describe('Practice Dashboard Route', () => {
    it('should navigate to dashboard with wordlist ID when session exists', async () => {
      vi.mocked(session.getSessionId).mockReturnValue('valid-session-id')
      
      const wordlistId = 'wordlist-123'
      await router.push(`/dashboard/${wordlistId}`)
      
      expect(router.currentRoute.value.name).toBe('practice-dashboard')
      expect(router.currentRoute.value.params.wordlistId).toBe(wordlistId)
    })

    it('should redirect to home when no session exists', async () => {
      vi.mocked(session.getSessionId).mockReturnValue('')
      
      await router.push('/dashboard/wordlist-123')
      
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('should handle UUID format wordlist IDs', async () => {
      vi.mocked(session.getSessionId).mockReturnValue('valid-session-id')
      
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      await router.push(`/dashboard/${uuid}`)
      
      expect(router.currentRoute.value.params.wordlistId).toBe(uuid)
    })
  })

  describe('Route Guards', () => {
    it('should allow navigation to routes without requiresSession meta', async () => {
      vi.mocked(session.getSessionId).mockReturnValue('')
      
      await router.push('/')
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('should block navigation to protected routes without session', async () => {
      vi.mocked(session.getSessionId).mockReturnValue('')
      
      await router.push('/dashboard/test-id')
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('should allow navigation to protected routes with valid session', async () => {
      vi.mocked(session.getSessionId).mockReturnValue('valid-session-123')
      
      await router.push('/dashboard/test-id')
      expect(router.currentRoute.value.name).toBe('practice-dashboard')
    })
  })

  describe('Parameter Passing', () => {
    it('should correctly pass shareToken parameter to student practice route', async () => {
      const shareToken = 'test-share-token-456'
      await router.push({ name: 'student-practice', params: { shareToken } })
      
      expect(router.currentRoute.value.params.shareToken).toBe(shareToken)
    })

    it('should correctly pass wordlistId parameter to dashboard route', async () => {
      vi.mocked(session.getSessionId).mockReturnValue('valid-session')
      
      const wordlistId = 'test-wordlist-789'
      await router.push({ name: 'practice-dashboard', params: { wordlistId } })
      
      expect(router.currentRoute.value.params.wordlistId).toBe(wordlistId)
    })

    it('should handle navigation with query parameters', async () => {
      const shareToken = 'token-with-query'
      await router.push({ 
        name: 'student-practice', 
        params: { shareToken },
        query: { ref: 'email' }
      })
      
      expect(router.currentRoute.value.params.shareToken).toBe(shareToken)
      expect(router.currentRoute.value.query.ref).toBe('email')
    })
  })
})
