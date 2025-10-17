import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNavigation, type NavigationItem } from './useNavigation'
import { ref } from 'vue'

// Create a reactive path ref that can be updated
const mockPath = ref('/')

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: mockPath,
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Create shared mock state for useSidebarToggle
const mockCollapsed = ref(false)
const mockIsDesktop = ref(true)
const mockIsMobile = ref(false)

// Mock useSidebarToggle
vi.mock('./useSidebarToggle', () => ({
  useSidebarToggle: () => ({
    collapsed: mockCollapsed,
    isDesktop: mockIsDesktop,
    isMobile: mockIsMobile,
    toggle: () => {
      mockCollapsed.value = !mockCollapsed.value
    },
    setCollapsed: (value: boolean) => {
      mockCollapsed.value = value
    },
    announceStateChange: vi.fn(),
  }),
}))

describe('useNavigation', () => {
  beforeEach(() => {
    // Reset state between tests
    mockCollapsed.value = false
    mockIsDesktop.value = true
    mockIsMobile.value = false
    
    const nav = useNavigation()
    nav.setNavigationItems([
      {
        id: 'home',
        label: 'Home',
        icon: 'home',
        route: '/',
        tooltip: 'Go to Home',
      },
      {
        id: 'upload',
        label: 'Upload',
        icon: 'upload',
        route: '/upload',
        tooltip: 'Upload Documents',
      },
      {
        id: 'saved-wordlists',
        label: 'Saved Wordlists',
        icon: 'bookmark',
        route: '/saved-wordlists',
        tooltip: 'View Saved Wordlists',
      },
    ])
  })

  describe('sidebar state', () => {
    it('should initialize with sidebar not collapsed', () => {
      const { sidebarCollapsed } = useNavigation()
      expect(sidebarCollapsed.value).toBe(false)
    })

    it('should toggle sidebar collapsed state', () => {
      const { toggleSidebar } = useNavigation()
      expect(mockCollapsed.value).toBe(false)
      
      toggleSidebar()
      expect(mockCollapsed.value).toBe(true)
      
      toggleSidebar()
      expect(mockCollapsed.value).toBe(false)
    })

    it('should set sidebar collapsed state explicitly', () => {
      const { setSidebarCollapsed } = useNavigation()
      
      setSidebarCollapsed(true)
      expect(mockCollapsed.value).toBe(true)
      
      setSidebarCollapsed(false)
      expect(mockCollapsed.value).toBe(false)
    })
    
    it('should expand sidebar programmatically', () => {
      const { expandSidebar, setSidebarCollapsed } = useNavigation()
      
      setSidebarCollapsed(true)
      expect(mockCollapsed.value).toBe(true)
      
      expandSidebar()
      expect(mockCollapsed.value).toBe(false)
    })
    
    it('should collapse sidebar programmatically', () => {
      const { collapseSidebar } = useNavigation()
      
      expect(mockCollapsed.value).toBe(false)
      
      collapseSidebar()
      expect(mockCollapsed.value).toBe(true)
    })
    
    it('should expose desktop and mobile state', () => {
      const { isDesktop, isMobile } = useNavigation()
      
      expect(isDesktop.value).toBe(true)
      expect(isMobile.value).toBe(false)
    })
  })

  describe('navigation items', () => {
    it('should provide default navigation items', () => {
      const { navigationItems } = useNavigation()
      
      expect(navigationItems.value).toHaveLength(3)
      expect(navigationItems.value[0].id).toBe('home')
      expect(navigationItems.value[1].id).toBe('upload')
      expect(navigationItems.value[2].id).toBe('saved-wordlists')
    })

    it('should allow setting custom navigation items', () => {
      const { navigationItems, setNavigationItems } = useNavigation()
      
      const customItems: NavigationItem[] = [
        {
          id: 'custom',
          label: 'Custom',
          icon: 'star',
          route: '/custom',
        },
      ]
      
      setNavigationItems(customItems)
      expect(navigationItems.value).toHaveLength(1)
      expect(navigationItems.value[0].id).toBe('custom')
    })

    it('should add navigation item', () => {
      const { navigationItems, addNavigationItem } = useNavigation()
      
      const newItem: NavigationItem = {
        id: 'new',
        label: 'New',
        icon: 'plus',
        route: '/new',
      }
      
      addNavigationItem(newItem)
      expect(navigationItems.value).toHaveLength(4)
      expect(navigationItems.value[3].id).toBe('new')
    })

    it('should add child navigation item', () => {
      const { navigationItems, addNavigationItem, setNavigationItems } = useNavigation()
      
      setNavigationItems([
        {
          id: 'parent',
          label: 'Parent',
          icon: 'folder',
          route: '/parent',
        },
      ])
      
      const childItem: NavigationItem = {
        id: 'child',
        label: 'Child',
        icon: 'file',
        route: '/parent/child',
      }
      
      addNavigationItem(childItem, 'parent')
      expect(navigationItems.value[0].children).toBeDefined()
      expect(navigationItems.value[0].children).toHaveLength(1)
      expect(navigationItems.value[0].children![0].id).toBe('child')
    })

    it('should remove navigation item', () => {
      const { navigationItems, removeNavigationItem } = useNavigation()
      
      removeNavigationItem('upload')
      expect(navigationItems.value).toHaveLength(2)
      expect(navigationItems.value.find((item) => item.id === 'upload')).toBeUndefined()
    })

    it('should update navigation badge', () => {
      const { navigationItems, updateNavigationBadge } = useNavigation()
      
      updateNavigationBadge('home', 5)
      expect(navigationItems.value[0].badge).toBe(5)
      
      updateNavigationBadge('home', 'new')
      expect(navigationItems.value[0].badge).toBe('new')
      
      updateNavigationBadge('home', undefined)
      expect(navigationItems.value[0].badge).toBeUndefined()
    })
    
    it('should have default tooltips for navigation items', () => {
      const { navigationItems } = useNavigation()
      
      expect(navigationItems.value[0].tooltip).toBe('Go to Home')
      expect(navigationItems.value[1].tooltip).toBe('Upload Documents')
      expect(navigationItems.value[2].tooltip).toBe('View Saved Wordlists')
    })
    
    it('should update navigation tooltip', () => {
      const { navigationItems, updateNavigationTooltip } = useNavigation()
      
      updateNavigationTooltip('home', 'Custom Home Tooltip')
      expect(navigationItems.value[0].tooltip).toBe('Custom Home Tooltip')
      
      updateNavigationTooltip('home', undefined)
      expect(navigationItems.value[0].tooltip).toBeUndefined()
    })
    
    it('should get navigation tooltip with fallback to label', () => {
      const { getNavigationTooltip, setNavigationItems } = useNavigation()
      
      const itemWithTooltip: NavigationItem = {
        id: 'test1',
        label: 'Test 1',
        icon: 'test',
        route: '/test1',
        tooltip: 'Custom Tooltip',
      }
      
      const itemWithoutTooltip: NavigationItem = {
        id: 'test2',
        label: 'Test 2',
        icon: 'test',
        route: '/test2',
      }
      
      expect(getNavigationTooltip(itemWithTooltip)).toBe('Custom Tooltip')
      expect(getNavigationTooltip(itemWithoutTooltip)).toBe('Test 2')
    })
    
    it('should determine when to show tooltips based on collapsed state and desktop view', () => {
      const { shouldShowTooltips, setSidebarCollapsed } = useNavigation()
      
      // Desktop + expanded = no tooltips
      setSidebarCollapsed(false)
      expect(shouldShowTooltips.value).toBe(false)
      
      // Desktop + collapsed = show tooltips
      setSidebarCollapsed(true)
      expect(shouldShowTooltips.value).toBe(true)
    })
  })

  describe('route tracking', () => {
    it('should track active route', () => {
      const { activeRoute } = useNavigation()
      expect(activeRoute.value).toBe('/')
    })

    it('should check if route is active', () => {
      const { isRouteActive } = useNavigation()
      
      expect(isRouteActive('/')).toBe(true)
      expect(isRouteActive('/upload')).toBe(false)
    })

    it('should find navigation item by route', () => {
      const { findNavigationItem } = useNavigation()
      
      const item = findNavigationItem('/upload')
      expect(item).toBeDefined()
      expect(item?.id).toBe('upload')
      
      const notFound = findNavigationItem('/nonexistent')
      expect(notFound).toBeUndefined()
    })

    it('should find navigation item in nested children', () => {
      const { setNavigationItems, findNavigationItem } = useNavigation()
      
      setNavigationItems([
        {
          id: 'parent',
          label: 'Parent',
          icon: 'folder',
          route: '/parent',
          children: [
            {
              id: 'child',
              label: 'Child',
              icon: 'file',
              route: '/parent/child',
            },
          ],
        },
      ])
      
      const item = findNavigationItem('/parent/child')
      expect(item).toBeDefined()
      expect(item?.id).toBe('child')
    })

    it('should get active navigation item', () => {
      const { activeNavigationItem } = useNavigation()
      
      expect(activeNavigationItem.value).toBeDefined()
      expect(activeNavigationItem.value?.id).toBe('home')
    })
  })
})
