import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface NavigationItem {
  id: string
  label: string
  icon: string
  route: string
  badge?: string | number
  children?: NavigationItem[]
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
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: 'upload',
    route: '/upload',
  },
  {
    id: 'saved-wordlists',
    label: 'Saved Wordlists',
    icon: 'bookmark',
    route: '/saved-wordlists',
  },
]

const navigationItems = ref<NavigationItem[]>(defaultNavigationItems)

/**
 * Composable for managing navigation state
 * Provides sidebar collapsed state, active route tracking, and navigation items configuration
 */
export function useNavigation() {
  const route = useRoute()
  const router = useRouter()

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

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // Set sidebar collapsed state explicitly
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
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

  return {
    // State
    sidebarCollapsed: computed(() => sidebarCollapsed.value),
    activeRoute: computed(() => activeRoute.value),
    navigationItems: computed(() => navigationItems.value),
    activeNavigationItem,

    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    navigateTo,
    isRouteActive,
    findNavigationItem,
    setNavigationItems,
    addNavigationItem,
    removeNavigationItem,
    updateNavigationBadge,
  }
}
