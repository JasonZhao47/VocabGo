<template>
  <!-- Fixed navbar with ElevenLabs styling -->
  <header 
    class="header"
    :class="{ 'header--sidebar-collapsed': sidebarCollapsed }"
  >
    <div class="header__left">
      <!-- Mobile menu toggle button (for sidebar drawer) -->
      <button
        v-if="showMobileToggle"
        @click="handleToggleMobileMenu"
        @keydown.enter.prevent="handleToggleMobileMenu"
        @keydown.space.prevent="handleToggleMobileMenu"
        class="header__toggle header__toggle--mobile"
        type="button"
        aria-label="Toggle navigation menu"
        aria-controls="main-sidebar"
      >
        <svg 
          class="header__icon" 
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
        class="header__toggle header__toggle--desktop"
        type="button"
        :aria-expanded="!sidebarCollapsed"
        :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        aria-controls="main-sidebar"
      >
        <svg 
          class="header__icon" 
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
      <h1 v-if="pageTitle" class="header__title">{{ pageTitle }}</h1>
      <slot name="title"></slot>
    </div>

    <div class="header__right">
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
/* Fixed header with ElevenLabs styling */
/* Requirements: 9.1, 9.2, 9.3, 9.5, 2.1, 2.2, 2.3 */

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px; /* Consistent height using 8px base unit (8 * 8 = 64px) */
  background: rgb(255, 255, 255); /* Pure white background */
  border-bottom: 1px solid rgb(229, 229, 229); /* Subtle border */
  z-index: 80; /* Below sidebar (100), below modals (100+) */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: calc(260px + 24px); /* Sidebar width + 24px padding (3 * 8px) */
  padding-right: 24px; /* 24px padding (3 * 8px) */
  transition: padding-left 200ms cubic-bezier(0.4, 0, 0.2, 1); /* ElevenLabs easing */
}

/* Adjust padding when sidebar is collapsed */
.header--sidebar-collapsed {
  padding-left: calc(72px + 24px); /* Collapsed sidebar width + padding */
}

/* Mobile: no sidebar offset */
@media (max-width: 767px) {
  .header {
    padding-left: 24px;
  }
  
  .header--sidebar-collapsed {
    padding-left: 24px;
  }
}

/* Left section: toggle button + title */
.header__left {
  display: flex;
  align-items: center;
  gap: 16px; /* 16px gap (2 * 8px) */
  flex: 1;
}

/* Right section: action buttons */
.header__right {
  display: flex;
  align-items: center;
  gap: 16px; /* 16px gap (2 * 8px) for consistency */
}

/* Toggle buttons with ElevenLabs styling */
.header__toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgb(115, 115, 115); /* Gray-500 for inactive state */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1); /* ElevenLabs transition */
  min-width: 44px; /* Minimum touch target size */
  min-height: 44px; /* Minimum touch target size */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px; /* 8px padding (1 * 8px) */
  border-radius: 8px; /* 8px border radius */
}

/* Hover state with smooth transition */
.header__toggle:hover {
  color: rgb(0, 0, 0); /* Black on hover */
  background: rgb(242, 242, 242); /* Light gray background */
}

/* Focus visible state for keyboard navigation */
.header__toggle:focus-visible {
  outline: 2px solid rgb(0, 0, 0); /* Black outline */
  outline-offset: 2px;
}

/* Active state */
.header__toggle:active {
  background: rgb(229, 229, 229); /* Slightly darker gray */
  opacity: 0.8;
}

/* Toggle buttons - visibility controlled by v-if directives based on viewport state */
.header__toggle--mobile,
.header__toggle--desktop {
  display: flex;
}

/* Icon styling */
.header__icon {
  width: 20px;
  height: 20px;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Rotate icon when sidebar is collapsed */
.header--sidebar-collapsed .header__toggle--desktop .header__icon {
  transform: rotate(180deg);
}

/* Page title with ElevenLabs typography */
.header__title {
  font-size: 18px; /* Base font size from typography scale */
  font-weight: 700; /* Bold weight */
  line-height: 1.4; /* Normal line height */
  color: rgb(0, 0, 0); /* Pure black */
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .header,
  .header__icon,
  .header__toggle {
    transition: none;
  }
}
</style>
