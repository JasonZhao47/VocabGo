<template>
  <!-- Fixed navbar with ElevenLabs styling -->
  <header 
    class="navbar"
    :class="{ 'navbar--sidebar-collapsed': sidebarCollapsed }"
  >
    <div class="navbar__left">
      <!-- Mobile menu toggle button (for sidebar drawer) -->
      <button
        v-if="showMobileToggle"
        @click="handleToggleMobileMenu"
        @keydown.enter.prevent="handleToggleMobileMenu"
        @keydown.space.prevent="handleToggleMobileMenu"
        class="navbar__toggle navbar__toggle--mobile"
        type="button"
        aria-label="Toggle navigation menu"
        aria-controls="main-sidebar"
      >
        <svg 
          class="navbar__icon" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Desktop sidebar collapse/expand toggle -->
      <button
        v-if="showDesktopToggle"
        @click="handleToggleSidebar"
        @keydown.enter.prevent="handleToggleSidebar"
        @keydown.space.prevent="handleToggleSidebar"
        class="navbar__toggle navbar__toggle--desktop"
        type="button"
        :aria-expanded="!sidebarCollapsed"
        :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        aria-controls="main-sidebar"
      >
        <svg 
          class="navbar__icon" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- Page title (optional slot) -->
      <h1 v-if="pageTitle" class="navbar__title">{{ pageTitle }}</h1>
      <slot name="title"></slot>
    </div>

    <div class="navbar__right">
      <!-- Action buttons slot (Feedback, Documentation, etc.) -->
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSidebarToggle } from '@/composables/useSidebarToggle'

interface Props {
  sidebarCollapsed?: boolean
  pageTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false,
  pageTitle: '',
})

// Get responsive state from composable
const { isMobile, isDesktop } = useSidebarToggle()

// Emit events to parent (App.vue)
const emit = defineEmits<{
  'toggle-mobile-menu': []
  'toggle-sidebar': []
}>()

const handleToggleMobileMenu = () => {
  emit('toggle-mobile-menu')
}

const handleToggleSidebar = () => {
  emit('toggle-sidebar')
}

// Show appropriate toggle button based on viewport
const showMobileToggle = computed(() => isMobile.value)
const showDesktopToggle = computed(() => isDesktop.value)
</script>

<style scoped>
/* Fixed navbar with ElevenLabs styling */
/* Matches design requirements: white background, bottom border, fixed positioning */

.navbar {
  position: fixed;
  top: 0;
  left: 0; /* Full width from left edge */
  right: 0;
  height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  z-index: 80; /* Below sidebar (100), below modals (100+) */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: calc(260px + 24px); /* Sidebar width + padding */
  padding-right: 24px;
  transition: padding-left 200ms ease-out;
}

/* Adjust padding when sidebar is collapsed */
.navbar--sidebar-collapsed {
  padding-left: calc(72px + 24px); /* Collapsed sidebar width + padding */
}

/* Mobile: no sidebar offset */
@media (max-width: 767px) {
  .navbar {
    padding-left: 24px;
  }
  
  .navbar--sidebar-collapsed {
    padding-left: 24px;
  }
}

/* Left section: toggle button + title */
.navbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

/* Right section: action buttons */
.navbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Toggle buttons */
.navbar__toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6B7280;
  transition: all 150ms ease-out;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
}

.navbar__toggle:hover {
  color: #000000;
  background: #F5F5F5;
}

.navbar__toggle:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

.navbar__toggle:active {
  background: #E5E7EB;
}

/* Toggle buttons - visibility controlled by v-if directives based on viewport state */
.navbar__toggle--mobile,
.navbar__toggle--desktop {
  display: flex;
}

/* Icon styling */
.navbar__icon {
  width: 20px;
  height: 20px;
  transition: transform 200ms ease-out;
}

/* Rotate icon when sidebar is collapsed */
.navbar--sidebar-collapsed .navbar__toggle--desktop .navbar__icon {
  transform: rotate(180deg);
}

/* Page title */
.navbar__title {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .navbar,
  .navbar__icon {
    transition: none;
  }
}
</style>
