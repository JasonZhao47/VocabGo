import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'

export interface SidebarToggleState {
  collapsed: Ref<boolean>
  isDesktop: Ref<boolean>
  isMobile: Ref<boolean>
  toggle: () => void
  setCollapsed: (value: boolean) => void
  announceStateChange: (collapsed: boolean) => void
}

// Constants
const MOBILE_BREAKPOINT = 768
const STORAGE_KEY = 'sidebar-collapsed'

// Global state
const collapsed = ref(false)
const isDesktop = ref(true)
const isMobile = ref(false)

// Accessibility announcer element
let announcerElement: HTMLElement | null = null

/**
 * Initialize the accessibility announcer element
 * Creates an aria-live region for screen reader announcements
 */
const initializeAnnouncer = () => {
  if (typeof window === 'undefined') return
  
  if (!announcerElement) {
    announcerElement = document.createElement('div')
    announcerElement.setAttribute('role', 'status')
    announcerElement.setAttribute('aria-live', 'polite')
    announcerElement.setAttribute('aria-atomic', 'true')
    announcerElement.className = 'sr-only'
    announcerElement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    `
    document.body.appendChild(announcerElement)
  }
}

/**
 * Announce state change to screen readers
 */
const announceStateChange = (isCollapsed: boolean) => {
  if (!announcerElement) {
    initializeAnnouncer()
  }
  
  if (announcerElement) {
    const message = isCollapsed ? 'Sidebar collapsed' : 'Sidebar expanded'
    announcerElement.textContent = message
    
    // Clear the message after announcement
    setTimeout(() => {
      if (announcerElement) {
        announcerElement.textContent = ''
      }
    }, 1000)
  }
}

/**
 * Check viewport size and update responsive state
 * Debounced to avoid excessive updates during resize
 */
let resizeTimeout: number | null = null
const checkViewport = () => {
  if (typeof window === 'undefined') return
  
  // Clear existing timeout
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  
  // Debounce resize events
  resizeTimeout = window.setTimeout(() => {
    const width = window.innerWidth
    const isMobileView = width < MOBILE_BREAKPOINT
    
    isDesktop.value = !isMobileView
    isMobile.value = isMobileView
  }, 100) as unknown as number
}

/**
 * Load collapsed state from localStorage
 */
const loadCollapsedState = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  } catch (error) {
    console.warn('Failed to load sidebar state from localStorage:', error)
    return false
  }
}

/**
 * Save collapsed state to localStorage
 */
const saveCollapsedState = (value: boolean) => {
  if (typeof window === 'undefined') return
  
  // Only persist state on desktop
  if (!isDesktop.value) return
  
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch (error) {
    console.warn('Failed to save sidebar state to localStorage:', error)
  }
}

/**
 * Composable for managing sidebar toggle state
 * Provides state management, localStorage persistence, responsive detection, and accessibility
 */
export function useSidebarToggle(): SidebarToggleState {
  // Initialize viewport detection
  onMounted(() => {
    checkViewport()
    
    // Load persisted state on desktop
    if (isDesktop.value) {
      collapsed.value = loadCollapsedState()
    }
    
    // Initialize accessibility announcer
    initializeAnnouncer()
    
    // Add resize listener
    window.addEventListener('resize', checkViewport)
  })
  
  // Cleanup
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', checkViewport)
      
      // Clear any pending resize timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  })
  
  // Watch for viewport changes
  watch(isDesktop, (newIsDesktop) => {
    if (newIsDesktop) {
      // Restore persisted state when switching to desktop
      collapsed.value = loadCollapsedState()
    } else {
      // Reset to expanded when switching to mobile
      collapsed.value = false
    }
  })
  
  // Watch for collapsed state changes and persist
  watch(collapsed, (newCollapsed) => {
    saveCollapsedState(newCollapsed)
  })
  
  /**
   * Toggle the collapsed state
   */
  const toggle = () => {
    collapsed.value = !collapsed.value
    announceStateChange(collapsed.value)
  }
  
  /**
   * Set the collapsed state explicitly
   */
  const setCollapsed = (value: boolean) => {
    if (collapsed.value !== value) {
      collapsed.value = value
      announceStateChange(value)
    }
  }
  
  return {
    collapsed: computed(() => collapsed.value),
    isDesktop: computed(() => isDesktop.value),
    isMobile: computed(() => isMobile.value),
    toggle,
    setCollapsed,
    announceStateChange,
  }
}
