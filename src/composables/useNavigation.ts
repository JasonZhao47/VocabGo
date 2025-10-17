import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidebarToggle } from './useSidebarToggle'

export interface NavigationItem {
  id: string
  label: string
  icon: string
  route: string
  badge?: string | number
  children?: NavigationItem[]
  tooltip?: string
}

interface NavigationState {
  sidebarCollapsed: boolean
  activeRoute: string
  navigationItems: NavigationItem[]
}

// Global state for navigation
const sidebarCollapsed = ref(false)
const activeRoute = ref('')

// Default navigation items configuration
const defaultNavigationItems: NavigationItem[] = [
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
]

const navigationItems = ref<NavigationItem[]>(defaultNavigationItems)

/**
 * Composable for managing navigation state
 * Provides sidebar collapsed state, active route tracking, and navigation items configuration
 * Integrates with useSidebarToggle for state synchronization
 */
export function useNavigation() {
  const route = useRoute()
  const router = useRouter()
  
  // Integrate with sidebar toggle state
  const sidebarToggle = useSidebarToggle()

  // Initialize active route from current route
  if (!activeRoute.value && route.path) {
    const pathValue = route.path
    activeRoute.value = typeof pathValue === 'string' ? pathValue : (pathValue as any).value || '/'
  }

  // Update active route when route changes
  watch(
    () => route.path,
    (newPath) => {
      activeRoute.value = typeof newPath === 'string' ? newPath : (newPath as any)?.value || '/'
    },
    { immediate: true }
  )
  
  // Synchronize local sidebarCollapsed with useSidebarToggle state
  watch(
    () => sidebarToggle.collapsed.value,
    (newCollapsed) => {
      sidebarCollapsed.value = newCollapsed
    },
    { immediate: true }
  )

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    sidebarToggle.toggle()
  }

  // Set sidebar collapsed state explicitly
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarToggle.setCollapsed(collapsed)
  }
  
  // Expand sidebar programmatically
  const expandSidebar = () => {
    sidebarToggle.setCollapsed(false)
  }
  
  // Collapse sidebar programmatically
  const collapseSidebar = () => {
    sidebarToggle.setCollapsed(true)
  }

  // Navigate to a route
  const navigateTo = (routePath: string) => {
    router.push(routePath)
  }

  // Check if a route is active
  const isRouteActive = (routePath: string): boolean => {
    return activeRoute.value === routePath
  }

  // Find navigation item by route
  const findNavigationItem = (routePath: string): NavigationItem | undefined => {
    const findInItems = (items: NavigationItem[]): NavigationItem | undefined => {
      for (const item of items) {
        if (item.route === routePath) {
          return item
        }
        if (item.children) {
          const found = findInItems(item.children)
          if (found) return found
        }
      }
      return undefined
    }
    return findInItems(navigationItems.value)
  }

  // Find navigation item by ID
  const findNavigationItemById = (itemId: string): NavigationItem | undefined => {
    const findInItems = (items: NavigationItem[]): NavigationItem | undefined => {
      for (const item of items) {
        if (item.id === itemId) {
          return item
        }
        if (item.children) {
          const found = findInItems(item.children)
          if (found) return found
        }
      }
      return undefined
    }
    return findInItems(navigationItems.value)
  }

  // Get active navigation item
  const activeNavigationItem = computed(() => {
    return findNavigationItem(activeRoute.value)
  })

  // Set navigation items (for customization)
  const setNavigationItems = (items: NavigationItem[]) => {
    navigationItems.value = items
  }

  // Add navigation item
  const addNavigationItem = (item: NavigationItem, parentId?: string) => {
    if (parentId) {
      const parent = findNavigationItemById(parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(item)
      }
    } else {
      navigationItems.value.push(item)
    }
  }

  // Remove navigation item
  const removeNavigationItem = (itemId: string) => {
    const removeFromItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.filter((item) => {
        if (item.id === itemId) {
          return false
        }
        if (item.children) {
          item.children = removeFromItems(item.children)
        }
        return true
      })
    }
    navigationItems.value = removeFromItems(navigationItems.value)
  }

  // Update navigation item badge
  const updateNavigationBadge = (itemId: string, badge?: string | number) => {
    const updateInItems = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.id === itemId) {
          item.badge = badge
          return true
        }
        if (item.children && updateInItems(item.children)) {
          return true
        }
      }
      return false
    }
    updateInItems(navigationItems.value)
  }
  
  // Update navigation item tooltip
  const updateNavigationTooltip = (itemId: string, tooltip?: string) => {
    const updateInItems = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.id === itemId) {
          item.tooltip = tooltip
          return true
        }
        if (item.children && updateInItems(item.children)) {
          return true
        }
      }
      return false
    }
    updateInItems(navigationItems.value)
  }
  
  // Get tooltip for navigation item (uses label as fallback)
  const getNavigationTooltip = (item: NavigationItem): string => {
    return item.tooltip || item.label
  }
  
  // Check if tooltips should be shown (when sidebar is collapsed on desktop)
  const shouldShowTooltips = computed(() => {
    return sidebarToggle.collapsed.value && sidebarToggle.isDesktop.value
  })

  return {
    // State
    sidebarCollapsed: computed(() => sidebarCollapsed.value),
    activeRoute: computed(() => activeRoute.value),
    navigationItems: computed(() => navigationItems.value),
    activeNavigationItem,
    isDesktop: sidebarToggle.isDesktop,
    isMobile: sidebarToggle.isMobile,
    shouldShowTooltips,

    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    expandSidebar,
    collapseSidebar,
    navigateTo,
    isRouteActive,
    findNavigationItem,
    setNavigationItems,
    addNavigationItem,
    removeNavigationItem,
    updateNavigationBadge,
    updateNavigationTooltip,
    getNavigationTooltip,
  }
}
