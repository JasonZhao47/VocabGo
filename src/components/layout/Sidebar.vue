<template>
  <!-- Mobile overlay -->
  <Transition name="sidebar-overlay">
    <div
      v-if="isMobile && isOpen"
      class="sidebar__overlay"
      @click="closeSidebar"
      aria-hidden="true"
    ></div>
  </Transition>

  <aside
    ref="sidebarRef"
    id="main-sidebar"
    :class="[
      'sidebar',
      { 
        'sidebar--collapsed': isCollapsed,
        'sidebar--mobile': isMobile,
        'sidebar--mobile-open': isMobile && isOpen,
        'sidebar--mobile-closed': isMobile && !isOpen
      }
    ]"
    :aria-label="isCollapsed ? 'Collapsed navigation' : 'Main navigation'"
    :aria-hidden="isMobile && !isOpen"
  >
    <!-- Toggle button in sidebar header (desktop only) -->
    <div v-if="!isMobile" class="sidebar__header">
      <SidebarToggle
        :collapsed="isCollapsed"
        position="sidebar"
        aria-controls="main-sidebar"
        @toggle="handleToggle"
      />
    </div>

    <nav class="sidebar__nav" role="navigation">
      <ul class="sidebar__list" role="list">
        <template v-for="item in items" :key="item.id">
          <!-- Top-level navigation item -->
          <li
            v-if="!item.children || item.children.length === 0"
            class="sidebar__item"
          >
            <router-link
              :to="item.route"
              class="sidebar__link"
              :class="{ 'sidebar__link--active': isActive(item.route) }"
              :aria-label="isCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined"
              :title="isCollapsed ? item.label : undefined"
            >
              <span class="sidebar__icon" v-html="item.icon" aria-hidden="true"></span>
              <Transition name="label-fade" mode="out-in">
                <span v-if="!isCollapsed" class="sidebar__label">{{ item.label }}</span>
              </Transition>
              <Transition name="label-fade" mode="out-in">
                <span v-if="item.badge && !isCollapsed" class="sidebar__badge" :aria-label="`${item.badge} items`">{{ item.badge }}</span>
              </Transition>
              
              <!-- Tooltip for collapsed state -->
              <span
                v-if="isCollapsed"
                class="sidebar__tooltip"
                role="tooltip"
                aria-hidden="true"
              >
                {{ item.label }}
                <span v-if="item.badge" class="sidebar__tooltip-badge">{{ item.badge }}</span>
              </span>
            </router-link>
          </li>

          <!-- Navigation item with children (collapsible section) -->
          <li
            v-else
            class="sidebar__item sidebar__item--group"
          >
            <button
              class="sidebar__link sidebar__link--group"
              :aria-expanded="!isCollapsed && expandedGroups.has(item.id)"
              :aria-label="isCollapsed ? item.label : `${item.label} section, ${expandedGroups.has(item.id) ? 'expanded' : 'collapsed'}`"
              :title="isCollapsed ? item.label : undefined"
              @click="toggleGroup(item.id)"
            >
              <span class="sidebar__icon" v-html="item.icon" aria-hidden="true"></span>
              <Transition name="label-fade" mode="out-in">
                <span v-if="!isCollapsed" class="sidebar__label">{{ item.label }}</span>
              </Transition>
              <Transition name="label-fade" mode="out-in">
                <span
                  v-if="!isCollapsed"
                  class="sidebar__chevron"
                  :class="{ 'sidebar__chevron--expanded': expandedGroups.has(item.id) }"
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </Transition>
              
              <!-- Tooltip for collapsed state -->
              <span
                v-if="isCollapsed"
                class="sidebar__tooltip"
                role="tooltip"
                aria-hidden="true"
              >
                {{ item.label }}
              </span>
            </button>

            <!-- Collapsible children -->
            <Transition name="sidebar-expand">
              <ul
                v-if="!isCollapsed && expandedGroups.has(item.id)"
                class="sidebar__sublist"
                role="list"
              >
              <li
                v-for="child in item.children"
                :key="child.id"
                class="sidebar__item sidebar__item--child"
              >
                <router-link
                  :to="child.route"
                  class="sidebar__link sidebar__link--child"
                  :class="{ 'sidebar__link--active': isActive(child.route) }"
                  :aria-label="`${child.label}${child.badge ? ` (${child.badge})` : ''}`"
                >
                  <span class="sidebar__icon" v-html="child.icon" aria-hidden="true"></span>
                  <Transition name="label-fade" mode="out-in">
                    <span class="sidebar__label">{{ child.label }}</span>
                  </Transition>
                  <Transition name="label-fade" mode="out-in">
                    <span v-if="child.badge" class="sidebar__badge" :aria-label="`${child.badge} items`">{{ child.badge }}</span>
                  </Transition>
                </router-link>
              </li>
            </ul>
            </Transition>
          </li>
        </template>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSwipeGesture } from '@/composables/useSwipeGesture'
import { useSidebarToggle } from '@/composables/useSidebarToggle'
import SidebarToggle from './SidebarToggle.vue'

/**
 * Navigation item interface
 */
interface NavigationItem {
  id: string
  label: string
  icon: string // SVG string
  route: string
  badge?: string | number
  children?: NavigationItem[]
}

// Export type for external use
export type { NavigationItem }

/**
 * Component props
 */
interface Props {
  collapsed?: boolean
  items: NavigationItem[]
  modelValue?: boolean // For mobile drawer open/close state
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  modelValue: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const route = useRoute()
const sidebarRef = ref<HTMLElement | null>(null)

/**
 * Sidebar toggle state management
 */
const { 
  collapsed: sidebarCollapsed, 
  toggle: toggleSidebar, 
  isDesktop, 
  isMobile: isMobileViewport 
} = useSidebarToggle()

/**
 * Use composable's mobile state directly
 */
const isMobile = computed(() => isMobileViewport.value)

/**
 * Computed collapsed state - use composable state on desktop, always false on mobile
 */
const isCollapsed = computed(() => {
  // On mobile, always use expanded state (drawer behavior)
  if (isMobile.value) return false
  // On desktop, use composable state
  return sidebarCollapsed.value
})

/**
 * Handle toggle button click
 */
const handleToggle = () => {
  if (!isMobile.value) {
    toggleSidebar()
  }
}

/**
 * Track which groups are expanded
 */
const expandedGroups = ref<Set<string>>(new Set())

/**
 * Mobile drawer state management
 */
const isOpen = ref(props.modelValue)

/**
 * Close sidebar (mobile only)
 */
const closeSidebar = () => {
  if (isMobile.value) {
    isOpen.value = false
    emit('update:modelValue', false)
  }
}

/**
 * Open sidebar (mobile only)
 */
const openSidebar = () => {
  if (isMobile.value) {
    isOpen.value = true
    emit('update:modelValue', true)
  }
}

/**
 * Setup swipe gestures for mobile
 */
useSwipeGesture(sidebarRef, {
  threshold: 50,
  onSwipeLeft: () => {
    if (isMobile.value && isOpen.value) {
      closeSidebar()
    }
  },
  onSwipeRight: () => {
    if (isMobile.value && !isOpen.value) {
      openSidebar()
    }
  },
})

/**
 * Check if a route is currently active
 */
const isActive = (itemRoute: string): boolean => {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/')
}

/**
 * Toggle group expansion
 */
const toggleGroup = (groupId: string): void => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

/**
 * Handle Escape key to close mobile sidebar
 */
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobile.value && isOpen.value) {
    closeSidebar()
    // Return focus to the element that opened the sidebar
    if (lastFocusedElement) {
      lastFocusedElement.focus()
    }
  }
}

/**
 * Store the last focused element before opening mobile sidebar
 */
let lastFocusedElement: HTMLElement | null = null

/**
 * Focus management for mobile sidebar
 */
const manageFocus = () => {
  if (!isMobile.value) return
  
  if (isOpen.value) {
    // Store the currently focused element
    lastFocusedElement = document.activeElement as HTMLElement
    
    // Focus the first focusable element in the sidebar
    setTimeout(() => {
      const firstLink = sidebarRef.value?.querySelector('.sidebar__link') as HTMLElement
      firstLink?.focus()
    }, 100)
  } else {
    // Return focus to the element that opened the sidebar
    if (lastFocusedElement) {
      lastFocusedElement.focus()
      lastFocusedElement = null
    }
  }
}

/**
 * Watch for viewport changes to handle state transitions
 */
watch(isMobile, (newIsMobile, oldIsMobile) => {
  // When transitioning from desktop to mobile
  if (newIsMobile && !oldIsMobile) {
    // Close the drawer by default
    isOpen.value = false
    emit('update:modelValue', false)
  }
  // When transitioning from mobile to desktop
  else if (!newIsMobile && oldIsMobile) {
    // Ensure drawer is closed (desktop uses collapse/expand instead)
    isOpen.value = false
    emit('update:modelValue', false)
  }
})

/**
 * Handle Tab key for focus trap in mobile sidebar
 */
const handleTabKey = (event: KeyboardEvent) => {
  if (!isMobile.value || !isOpen.value) return
  if (event.key !== 'Tab') return
  
  const focusableElements = sidebarRef.value?.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  if (!focusableElements || focusableElements.length === 0) return
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  // If shift+tab on first element, focus last element
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  }
  // If tab on last element, focus first element
  else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

/**
 * Lifecycle hooks
 */
onMounted(() => {
  window.addEventListener('keydown', handleEscapeKey)
  window.addEventListener('keydown', handleTabKey)
  
  // Sync with modelValue prop
  isOpen.value = props.modelValue
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscapeKey)
  window.removeEventListener('keydown', handleTabKey)
})

/**
 * Watch for modelValue changes
 */
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

/**
 * Watch for isOpen changes to manage focus
 */
watch(isOpen, () => {
  manageFocus()
})

/**
 * Expose methods for parent components
 */
defineExpose({
  closeSidebar,
  openSidebar,
  isOpen,
  isMobile,
})
</script>

<style scoped>
/* ElevenLabs-inspired sidebar styling */
.sidebar {
  width: 260px;
  height: 100vh;
  background: #FFFFFF; /* White background per ElevenLabs design */
  /* No border - the border will be on the main content area instead */
  transition: width 200ms ease-out;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100; /* Above header to sit on top */
  will-change: width; /* GPU acceleration hint */
  transform: translateZ(0); /* Force GPU acceleration */
}

.sidebar--collapsed {
  width: 72px;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 0;
}

.sidebar__nav {
  padding: 16px 8px;
}

.sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__item {
  position: relative;
}

.sidebar__item--group {
  margin-top: 8px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 15px;
  color: #6B7280;
  text-decoration: none;
  border-radius: 6px;
  transition: all 150ms ease-out;
  cursor: pointer;
  border: none; /* No borders on navigation links */
  background: transparent;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.sidebar__link:hover {
  background: #F5F5F5;
  color: #000000;
}

.sidebar__link--active {
  background: #F0F0F0;
  color: #000000;
  font-weight: 600;
}

.sidebar__link--group {
  font-weight: 600;
  color: #374151;
}

.sidebar__link--child {
  padding-left: 48px;
  font-size: 14px;
}

.sidebar__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__icon :deep(svg) {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.sidebar__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__badge {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  background: #E5E7EB;
  color: #374151;
  border-radius: 12px;
  line-height: 1.4;
}

.sidebar__chevron {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 150ms ease-out;
  color: #9CA3AF;
}

.sidebar__chevron--expanded {
  transform: rotate(180deg);
}

.sidebar__sublist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__item--child {
  position: relative;
}

/* Remove internal borders between navigation items per ElevenLabs design */
.sidebar__item--group::before {
  display: none; /* No separator lines between sections */
}

/* Scrollbar styling */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Tooltip for collapsed state */
.sidebar__tooltip {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 12px;
  background: #1F2937;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 150ms ease-out;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sidebar__tooltip-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 11px;
}

/* Show tooltip on hover and focus */
.sidebar--collapsed .sidebar__link:hover .sidebar__tooltip,
.sidebar--collapsed .sidebar__link:focus-visible .sidebar__tooltip {
  opacity: 1;
}

/* Tooltip arrow */
.sidebar__tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #1F2937;
}

/* Focus styles for accessibility */
.sidebar__link:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: -2px;
}

/* Transition for collapsible sections */
.sidebar-expand-enter-active,
.sidebar-expand-leave-active {
  transition: all 200ms ease-out;
  overflow: hidden;
}

.sidebar-expand-enter-from,
.sidebar-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.sidebar-expand-enter-to,
.sidebar-expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Label fade transition */
.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 150ms ease-out;
}

.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
}

.label-fade-enter-to,
.label-fade-leave-from {
  opacity: 1;
}

/* Mobile overlay */
.sidebar__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  backdrop-filter: blur(2px);
}

.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 200ms ease-out;
}

.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}

/* Mobile responsive styles */
@media (max-width: 767px) {
  .sidebar--mobile {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 280px;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 250ms ease-out;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    background: #FFFFFF; /* Ensure white background on mobile */
  }

  .sidebar--mobile-open {
    transform: translateX(0);
  }

  .sidebar--mobile-closed {
    transform: translateX(-100%);
  }

  /* Ensure touch targets are large enough on mobile */
  .sidebar--mobile .sidebar__link {
    padding: 14px 16px;
    min-height: 44px;
  }

  .sidebar--mobile .sidebar__icon {
    width: 24px;
    height: 24px;
  }

  .sidebar--mobile .sidebar__icon :deep(svg) {
    width: 24px;
    height: 24px;
  }
}

/* Tablet and desktop - sidebar is always visible */
@media (min-width: 768px) {
  .sidebar {
    position: fixed;
  }

  .sidebar__overlay {
    display: none;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .sidebar__label,
  .sidebar__badge,
  .sidebar__chevron,
  .sidebar__link {
    transition: none;
  }
  
  .sidebar-expand-enter-active,
  .sidebar-expand-leave-active,
  .label-fade-enter-active,
  .label-fade-leave-active {
    transition: none;
  }
  
  /* Instant state changes without animation */
  .label-fade-enter-from,
  .label-fade-leave-to {
    opacity: 1;
  }
}
</style>
