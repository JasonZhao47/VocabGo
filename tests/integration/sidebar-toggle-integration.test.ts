import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import SidebarToggle from '@/components/layout/SidebarToggle.vue'
import { useSidebarToggle } from '@/composables/useSidebarToggle'
import { useNavigation } from '@/composables/useNavigation'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/upload', name: 'upload', component: { template: '<div>Upload</div>' } },
  ],
})

describe('Sidebar Toggle Integration Tests', () => {
  let localStorageMock: { [key: string]: string }

  beforeEach(async () => {
    await router.push('/')
    await router.isReady()

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

    // Set desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    // Clear DOM
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Requirement 1: Toggle Functionality in Desktop View', () => {
    it('should display toggle button and transition between states', async () => {
      const { collapsed, toggle } = useSidebarToggle()
      
      await nextTick()
      
      const initialState = collapsed.value
      
      toggle()
      await nextTick()
      
      expect(collapsed.value).toBe(!initialState)
      expect(collapsed.value).toBe(true)
      
      toggle()
      await nextTick()
      
      expect(collapsed.value).toBe(false)
    })

    it('should render SidebarToggle component with correct props', () => {
      const wrapper = mount(SidebarToggle, {
        props: {
          collapsed: false,
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('should emit toggle event when button is clicked', async () => {
      const wrapper = mount(SidebarToggle, {
        props: {
          collapsed: false,
        },
      })

      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('toggle')).toBeTruthy()
      expect(wrapper.emitted('toggle')).toHaveLength(1)
    })

    it('should update icon based on collapsed state', async () => {
      const wrapper = mount(SidebarToggle, {
        props: {
          collapsed: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Collapse sidebar')

      await wrapper.setProps({ collapsed: true })
      
      expect(button.attributes('aria-label')).toBe('Expand sidebar')
    })
  })

  describe('Requirement 2: Mobile Drawer Behavior Unchanged', () => {
    it('should use drawer behavior on mobile viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const { isMobile, collapsed } = useSidebarToggle()
      
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()

      expect(isMobile.value).toBe(true)
      expect(collapsed.value).toBe(false)
    })

    it('should not persist state on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const { toggle, isMobile } = useSidebarToggle()
      
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()

      expect(isMobile.value).toBe(true)

      toggle()
      await nextTick()

      expect(localStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Requirement 3: localStorage Persistence', () => {
    it('should save collapsed state to localStorage on desktop', async () => {
      const { setCollapsed, isDesktop } = useSidebarToggle()
      
      await nextTick()
      
      expect(isDesktop.value).toBe(true)
      
      setCollapsed(true)
      await nextTick()

      expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true')
    })

    it('should restore collapsed state from localStorage', async () => {
      localStorageMock['sidebar-collapsed'] = 'true'
      
      const { collapsed } = useSidebarToggle()
      
      await nextTick()
      
      expect(collapsed.value).toBe(true)
    })

    it('should default to expanded when localStorage is empty', async () => {
      const { collapsed } = useSidebarToggle()
      
      await nextTick()
      
      expect(collapsed.value).toBe(false)
    })

    it('should handle localStorage errors gracefully', async () => {
      global.localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage is full')
      })

      const { setCollapsed } = useSidebarToggle()
      
      await nextTick()
      
      // Should not throw
      expect(() => setCollapsed(true)).not.toThrow()
    })
  })

  describe('Requirement 4: Smooth Animations and Transitions', () => {
    it('should apply transition classes to sidebar', () => {
      const wrapper = mount(Sidebar, {
        props: {
          items: [
            {
              id: 'home',
              label: 'Home',
              icon: '<svg></svg>',
              route: '/',
            },
          ],
          collapsed: false,
        },
        global: {
          plugins: [router],
        },
      })

      const sidebar = wrapper.find('.sidebar')
      expect(sidebar.exists()).toBe(true)
      
      // Check for transition-related classes or styles
      const classes = sidebar.classes()
      expect(classes.some(c => c.includes('sidebar'))).toBe(true)
    })

    it('should hide labels when collapsed', async () => {
      const wrapper = mount(Sidebar, {
        props: {
          items: [
            {
              id: 'home',
              label: 'Home',
              icon: '<svg></svg>',
              route: '/',
            },
          ],
          collapsed: false,
        },
        global: {
          plugins: [router],
        },
      })

      expect(wrapper.find('.sidebar__label').isVisible()).toBe(true)

      await wrapper.setProps({ collapsed: true })
      
      expect(wrapper.find('.sidebar__label').isVisible()).toBe(false)
    })

    it('should respect prefers-reduced-motion', async () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { collapsed, toggle } = useSidebarToggle()
      
      await nextTick()
      
      toggle()
      await nextTick()
      
      // State should still change even with reduced motion
      expect(collapsed.value).toBe(true)
    })
  })

  describe('Requirement 5: Keyboard Accessibility', () => {
    it('should toggle on Enter key', async () => {
      const wrapper = mount(SidebarToggle, {
        props: {
          collapsed: false,
        },
      })

      const button = wrapper.find('button')
      await button.trigger('keydown.enter')
      
      expect(wrapper.emitted('toggle')).toBeTruthy()
    })

    it('should toggle on Space key', async () => {
      const wrapper = mount(SidebarToggle, {
        props: {
          collapsed: false,
        },
      })

      const button = wrapper.find('button')
      await button.trigger('keydown.space')
      
      expect(wrapper.emitted('toggle')).toBeTruthy()
    })

    it('should have visible focus indicator', () => {
      const wrapper = mount(SidebarToggle, {
        props: {
          collapsed: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('class')).toContain('focus:')
    })

    it('should have proper ARIA attributes', () => {
      const wrapper = mount(SidebarToggle, {
        props: {
          collapsed: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBeDefined()
      expect(button.attributes('aria-expanded')).toBe('true')
    })

    it('should announce state changes to screen readers', async () => {
      const { announceStateChange } = useSidebarToggle()
      
      await nextTick()
      
      announceStateChange(true)
      await nextTick()
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]')
      expect(announcer).toBeTruthy()
      expect(announcer?.textContent).toBe('Sidebar collapsed')
    })
  })

  describe('Requirement 6: Responsive Breakpoint Behavior', () => {
    it('should detect desktop viewport (≥768px)', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { isDesktop, isMobile } = useSidebarToggle()
      
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()

      expect(isDesktop.value).toBe(true)
      expect(isMobile.value).toBe(false)
    })

    it('should detect mobile viewport (<768px)', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const { isDesktop, isMobile } = useSidebarToggle()
      
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()

      expect(isDesktop.value).toBe(false)
      expect(isMobile.value).toBe(true)
    })

    it('should adapt behavior when crossing breakpoint', async () => {
      const { collapsed, isDesktop, setCollapsed } = useSidebarToggle()
      
      // Start on desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()

      expect(isDesktop.value).toBe(true)
      
      setCollapsed(true)
      await nextTick()
      
      expect(collapsed.value).toBe(true)

      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()

      // Should reset to expanded on mobile
      expect(collapsed.value).toBe(false)
    })

    it('should handle rapid viewport changes', async () => {
      const { isDesktop } = useSidebarToggle()
      
      // Rapid resize events
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      window.dispatchEvent(new Event('resize'))
      
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      window.dispatchEvent(new Event('resize'))
      
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      window.dispatchEvent(new Event('resize'))
      
      // Wait for debounced handler
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()

      // Should settle on final state
      expect(isDesktop.value).toBe(true)
    })
  })

  describe('Requirement 7: Integration with useNavigation', () => {
    it('should sync sidebar state with useNavigation', async () => {
      const { sidebarCollapsed, toggleSidebar } = useNavigation()
      const { collapsed } = useSidebarToggle()
      
      await nextTick()
      
      expect(sidebarCollapsed.value).toBe(collapsed.value)
      
      toggleSidebar()
      await nextTick()
      
      expect(sidebarCollapsed.value).toBe(collapsed.value)
    })

    it('should provide tooltip text for collapsed state', () => {
      const { getNavigationTooltip } = useNavigation()
      
      const item = {
        id: 'home',
        label: 'Home',
        icon: 'home',
        route: '/',
        tooltip: 'Go to Home',
      }
      
      expect(getNavigationTooltip(item)).toBe('Go to Home')
    })

    it('should show tooltips when sidebar is collapsed on desktop', async () => {
      const { shouldShowTooltips, setSidebarCollapsed } = useNavigation()
      
      await nextTick()
      
      setSidebarCollapsed(false)
      expect(shouldShowTooltips.value).toBe(false)
      
      setSidebarCollapsed(true)
      expect(shouldShowTooltips.value).toBe(true)
    })
  })

  describe('Cross-Component Integration', () => {
    it('should coordinate state between Sidebar and SidebarToggle', async () => {
      const { collapsed, toggle } = useSidebarToggle()
      
      const sidebarWrapper = mount(Sidebar, {
        props: {
          items: [
            {
              id: 'home',
              label: 'Home',
              icon: '<svg></svg>',
              route: '/',
            },
          ],
          collapsed: collapsed.value,
        },
        global: {
          plugins: [router],
        },
      })

      const toggleWrapper = mount(SidebarToggle, {
        props: {
          collapsed: collapsed.value,
        },
      })

      expect(sidebarWrapper.props('collapsed')).toBe(toggleWrapper.props('collapsed'))

      toggle()
      await nextTick()

      await sidebarWrapper.setProps({ collapsed: collapsed.value })
      await toggleWrapper.setProps({ collapsed: collapsed.value })

      expect(sidebarWrapper.props('collapsed')).toBe(toggleWrapper.props('collapsed'))
    })
  })
})
