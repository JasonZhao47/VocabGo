/**
 * Keyboard Navigation Composable
 * 
 * Provides utilities for managing keyboard navigation and accessibility
 * Requirements: 13.1, 13.4, 9.2
 */

import { onMounted, onUnmounted, ref, Ref } from 'vue'

export interface KeyboardNavigationOptions {
  /**
   * Enable arrow key navigation
   */
  enableArrowKeys?: boolean
  
  /**
   * Enable escape key to close/cancel
   */
  enableEscape?: boolean
  
  /**
   * Enable enter key to activate
   */
  enableEnter?: boolean
  
  /**
   * Enable home/end keys for first/last navigation
   */
  enableHomeEnd?: boolean
  
  /**
   * Callback when escape is pressed
   */
  onEscape?: () => void
  
  /**
   * Callback when enter is pressed
   */
  onEnter?: () => void
}

export interface FocusTrapOptions {
  /**
   * Element to trap focus within
   */
  element: Ref<HTMLElement | undefined>
  
  /**
   * Whether the trap is active
   */
  active: Ref<boolean>
  
  /**
   * Initial element to focus
   */
  initialFocus?: Ref<HTMLElement | undefined>
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')
  
  return Array.from(container.querySelectorAll(selector))
}

/**
 * Focus trap composable for modals and dialogs
 */
export function useFocusTrap(options: FocusTrapOptions) {
  const previousActiveElement = ref<HTMLElement>()
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!options.active.value || !options.element.value) return
    
    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements(options.element.value)
      
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }
      
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
  }
  
  const activate = () => {
    if (!options.element.value) return
    
    // Store current focus
    previousActiveElement.value = document.activeElement as HTMLElement
    
    // Set initial focus
    const focusTarget = options.initialFocus?.value || getFocusableElements(options.element.value)[0]
    focusTarget?.focus()
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown)
  }
  
  const deactivate = () => {
    // Remove event listener
    document.removeEventListener('keydown', handleKeyDown)
    
    // Restore previous focus
    previousActiveElement.value?.focus()
  }
  
  return {
    activate,
    deactivate,
  }
}

/**
 * Keyboard navigation composable for lists and menus
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const currentIndex = ref(0)
  
  const handleKeyDown = (event: KeyboardEvent, items: HTMLElement[]) => {
    if (items.length === 0) return
    
    let handled = false
    
    // Arrow key navigation
    if (options.enableArrowKeys) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        currentIndex.value = Math.min(currentIndex.value + 1, items.length - 1)
        items[currentIndex.value]?.focus()
        handled = true
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        currentIndex.value = Math.max(currentIndex.value - 1, 0)
        items[currentIndex.value]?.focus()
        handled = true
      }
    }
    
    // Home/End navigation
    if (options.enableHomeEnd) {
      if (event.key === 'Home') {
        event.preventDefault()
        currentIndex.value = 0
        items[0]?.focus()
        handled = true
      } else if (event.key === 'End') {
        event.preventDefault()
        currentIndex.value = items.length - 1
        items[items.length - 1]?.focus()
        handled = true
      }
    }
    
    // Escape key
    if (options.enableEscape && event.key === 'Escape') {
      event.preventDefault()
      options.onEscape?.()
      handled = true
    }
    
    // Enter key
    if (options.enableEnter && event.key === 'Enter') {
      event.preventDefault()
      options.onEnter?.()
      handled = true
    }
    
    return handled
  }
  
  return {
    currentIndex,
    handleKeyDown,
  }
}

/**
 * Roving tabindex composable for managing focus in component groups
 */
export function useRovingTabindex(containerRef: Ref<HTMLElement | undefined>) {
  const currentIndex = ref(0)
  
  const updateTabindices = (items: HTMLElement[]) => {
    items.forEach((item, index) => {
      if (index === currentIndex.value) {
        item.setAttribute('tabindex', '0')
      } else {
        item.setAttribute('tabindex', '-1')
      }
    })
  }
  
  const focusItem = (index: number) => {
    if (!containerRef.value) return
    
    const items = getFocusableElements(containerRef.value)
    if (index >= 0 && index < items.length) {
      currentIndex.value = index
      updateTabindices(items)
      items[index]?.focus()
    }
  }
  
  const focusNext = () => {
    if (!containerRef.value) return
    
    const items = getFocusableElements(containerRef.value)
    const nextIndex = Math.min(currentIndex.value + 1, items.length - 1)
    focusItem(nextIndex)
  }
  
  const focusPrevious = () => {
    if (!containerRef.value) return
    
    const items = getFocusableElements(containerRef.value)
    const prevIndex = Math.max(currentIndex.value - 1, 0)
    focusItem(prevIndex)
  }
  
  const focusFirst = () => {
    focusItem(0)
  }
  
  const focusLast = () => {
    if (!containerRef.value) return
    
    const items = getFocusableElements(containerRef.value)
    focusItem(items.length - 1)
  }
  
  onMounted(() => {
    if (containerRef.value) {
      const items = getFocusableElements(containerRef.value)
      updateTabindices(items)
    }
  })
  
  return {
    currentIndex,
    focusItem,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    updateTabindices,
  }
}

/**
 * Skip link composable for accessibility
 */
export function useSkipLink() {
  const skipToElement = (targetId: string, event?: Event) => {
    event?.preventDefault()
    
    const target = document.getElementById(targetId)
    if (target) {
      // Make element focusable if it isn't already
      const originalTabindex = target.getAttribute('tabindex')
      if (!originalTabindex) {
        target.setAttribute('tabindex', '-1')
      }
      
      // Focus and scroll to element
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Remove temporary tabindex after focus
      if (!originalTabindex) {
        target.addEventListener('blur', () => {
          target.removeAttribute('tabindex')
        }, { once: true })
      }
    }
  }
  
  return {
    skipToElement,
  }
}

/**
 * Keyboard shortcut composable
 */
export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: (event: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = (event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatches = shortcut.alt ? event.altKey : !event.altKey
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey
      
      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault()
        shortcut.callback(event)
        break
      }
    }
  }
  
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
  
  return {
    shortcuts,
  }
}
