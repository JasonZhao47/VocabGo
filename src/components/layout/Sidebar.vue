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
    :class="[
      'sidebar',
      { 
        'sidebar--collapsed': collapsed,
        'sidebar--mobile': isMobile,
        'sidebar--mobile-open': isMobile && isOpen,
        'sidebar--mobile-closed': isMobile && !isOpen
      }
    ]"
    :aria-label="collapsed ? 'Collapsed navigation' : 'Main navigation'"
    :aria-hidden="isMobile && !isOpen"
  >
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
              :aria-label="item.label"
            >
              <span class="sidebar__icon" v-html="item.icon"></span>
              <span v-if="!collapsed" class="sidebar__label">{{ item.label }}</span>
              <span v-if="item.badge && !collapsed" class="sidebar__badge">{{ item.badge }}</span>
            </router-link>
          </li>

          <!-- Navigation item with children (collapsible section) -->
          <li
            v-else
            class="sidebar__item sidebar__item--group"
          >
            <button
              class="sidebar__link sidebar__link--group"
              :aria-expanded="expandedGroups.has(item.id)"
              :aria-label="`${item.label} section`"
              @click="toggleGroup(item.id)"
            >
              <span class="sidebar__icon" v-html="item.icon"></span>
              <span v-if="!collapsed" class="sidebar__label">{{ item.label }}</span>
              <span
                v-if="!collapsed"
                class="sidebar__chevron"
                :class="{ 'sidebar__chevron--expanded': expandedGroups.has(item.id) }"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>

            <!-- Collapsible children -->
            <Transition name="sidebar-expand">
              <ul
                v-if="!collapsed && expandedGroups.has(item.id)"
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
                  :aria-label="child.label"
                >
                  <span class="sidebar__icon" v-html="child.icon"></span>
                  <span class="sidebar__label">{{ child.label }}</span>
                  <span v-if="child.badge" class="sidebar__badge">{{ child.badge }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSwipeGesture } from '@/composables/useSwipeGesture'

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
 * Track which groups are expanded
 */
const expandedGroups = ref<Set<string>>(new Set())

/**
 * Mobile state management
 */
const isMobile = ref(false)
const isOpen = ref(props.modelValue)

/**
 * Check if viewport is mobile
 */
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  // Auto-close sidebar when switching to mobile
  if (isMobile.value && !props.modelValue) {
    isOpen.value = false
  }
}

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
  }
}

/**
 * Lifecycle hooks
 */
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleEscapeKey)
  
  // Sync with modelValue prop
  isOpen.value = props.modelValue
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleEscapeKey)
})

/**
 * Watch for modelValue changes
 */
import { watch } from 'vue'
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
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
.sidebar {
  width: 260px;
  height: 100vh;
  background: #FAFAFA;
  border-right: 1px solid #F0F0F0;
  transition: width 200ms ease-out;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar--collapsed {
  width: 72px;
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
  border: none;
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

/* Separator between sections */
.sidebar__item--group::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 16px;
  right: 16px;
  height: 1px;
  background: #E5E7EB;
}

.sidebar__item--group:first-child::before {
  display: none;
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
</style>
