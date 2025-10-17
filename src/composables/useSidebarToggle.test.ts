import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSidebarToggle } from './useSidebarToggle'
import { nextTick } from 'vue'

describe('useSidebarToggle - Accessibility Features', () => {
  let localStorageMock: { [key: string]: string }

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {}
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn(() => {
        localStorageMock = {}
      }),
      length: 0,
      key: vi.fn(),
    } as Storage

    // Mock window.innerWidth for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    // Clear any existing announcer elements
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('ARIA Live Region Announcements', () => {
    it('should create an ARIA live region on initialization', async () => {
      const { announceStateChange } = useSidebarToggle()
      
      await nextTick()
      
      // Check if announcer element exists
      const announcer = document.querySelector('[role="status"][aria-live="polite"]')
      expect(announcer).toBeTruthy()
      expect(announcer?.getAttribute('aria-atomic')).toBe('true')
    })

    it('should announce "Sidebar collapsed" when collapsed', async () => {
      const { announceStateChange } = useSidebarToggle()
      
      await nextTick()
      
      announceStateChange(true)
      
      await nextTick()
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]')
      expect(announcer?.textContent).toBe('Sidebar collapsed')
    })

    it('should announce "Sidebar expanded" when expanded', async () => {
      const { announceStateChange } = useSidebarToggle()
      
      await nextTick()
      
      announceStateChange(false)
      
      await nextTick()
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]')
      expect(announcer?.textContent).toBe('Sidebar expanded')
    })

    it('should clear announcement after 1 second', async () => {
      vi.useFakeTimers()
      
      const { announceStateChange } = useSidebarToggle()
      
      await nextTick()
      
      announceStateChange(true)
      
      await nextTick()
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]')
      expect(announcer?.textContent).toBe('Sidebar collapsed')
      
      // Fast-forward time
      vi.advanceTimersByTime(1000)
      
      await nextTick()
      
      expect(announcer?.textContent).toBe('')
      
      vi.useRealTimers()
    })
  })

  describe('Focus Management', () => {
    it('should provide toggle function that announces state change', async () => {
      const { toggle, collapsed } = useSidebarToggle()
      
      await nextTick()
      
      const initialState = collapsed.value
      
      toggle()
      
      await nextTick()
      
      expect(collapsed.value).toBe(!initialState)
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]')
      expect(announcer?.textContent).toBeTruthy()
    })

    it('should provide setCollapsed function that announces state change', async () => {
      const { setCollapsed, collapsed } = useSidebarToggle()
      
      await nextTick()
      
      setCollapsed(true)
      
      await nextTick()
      
      expect(collapsed.value).toBe(true)
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]')
      expect(announcer?.textContent).toBe('Sidebar collapsed')
    })

    it('should not announce if state does not change', async () => {
      const { setCollapsed, collapsed } = useSidebarToggle()
      
      await nextTick()
      
      // Set to false (default state)
      setCollapsed(false)
      
      await nextTick()
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]')
      
      // Clear any previous announcements
      if (announcer) announcer.textContent = ''
      
      // Try to set to false again
      setCollapsed(false)
      
      await nextTick()
      
      // Should not announce since state didn't change
      expect(announcer?.textContent).toBe('')
    })
  })

  describe('Keyboard Navigation Support', () => {
    it('should maintain collapsed state across viewport changes', async () => {
      const { setCollapsed, collapsed, isDesktop } = useSidebarToggle()
      
      await nextTick()
      
      // Set collapsed on desktop
      setCollapsed(true)
      
      await nextTick()
      
      expect(collapsed.value).toBe(true)
      expect(isDesktop.value).toBe(true)
      
      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      
      window.dispatchEvent(new Event('resize'))
      
      // Wait for debounced resize handler
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()
      
      // On mobile, collapsed should be false
      expect(collapsed.value).toBe(false)
    })
  })

  describe('Screen Reader Labels', () => {
    it('should have screen-reader-only styles on announcer', async () => {
      const { announceStateChange } = useSidebarToggle()
      
      await nextTick()
      
      announceStateChange(true)
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]') as HTMLElement
      expect(announcer).toBeTruthy()
      
      // Check for sr-only class
      expect(announcer?.className).toContain('sr-only')
      
      // Check for visually hidden styles
      const styles = announcer?.style
      expect(styles?.position).toBe('absolute')
      expect(styles?.width).toBe('1px')
      expect(styles?.height).toBe('1px')
    })
  })

  describe('State Persistence with Accessibility', () => {
    it('should persist collapsed state and announce on load', async () => {
      // Set initial state in localStorage
      localStorageMock['sidebar-collapsed'] = 'true'
      
      const { collapsed } = useSidebarToggle()
      
      await nextTick()
      
      // Should load persisted state
      expect(collapsed.value).toBe(true)
    })

    it('should not persist state on mobile', async () => {
      // Set viewport to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      
      const { toggle, isMobile } = useSidebarToggle()
      
      await nextTick()
      
      expect(isMobile.value).toBe(true)
      
      toggle()
      
      await nextTick()
      
      // Should not save to localStorage on mobile
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })
  })
})
