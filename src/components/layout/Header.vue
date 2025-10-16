<template>
  <!-- Simplified header for sidebar integration -->
  <!-- NO fixed positioning - flows naturally with content -->
  <!-- NO shadow - completely flat, clean design -->
  <header class="header">
    <div class="header-container">
      <div class="header-content">
        <!-- Mobile menu toggle button (for sidebar) -->
        <button
          @click="handleToggleMobileMenu"
          class="mobile-menu-toggle tablet:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg 
            class="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <!-- Logo: 24px font, bold, black, clickable (visible on mobile) -->
        <router-link to="/" class="header-logo tablet:hidden">
          VocabGo
        </router-link>

        <!-- Desktop sidebar collapse/expand toggle -->
        <button
          @click="handleToggleSidebar"
          class="sidebar-collapse-toggle hidden tablet:flex"
          :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg 
            class="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            :style="{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- Spacer for mobile layout -->
        <div class="flex-1"></div>

        <!-- Optional: Add user profile, settings, or other global actions here -->
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  sidebarCollapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false,
})

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
</script>

<style scoped>
/* Simplified header styling for sidebar integration */
/* NO fixed positioning - flows naturally with content */
/* NO shadow - completely flat, clean design */

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #F0F0F0;
}

.header-container {
  max-width: 100%;
  padding: 0 24px;
}

@media (min-width: 768px) {
  .header-container {
    padding: 0 32px;
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  min-height: 60px;
}

/* Mobile menu toggle button */
.mobile-menu-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: color 150ms ease-out;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
}

.mobile-menu-toggle:hover {
  color: #000000;
  background: #F5F5F5;
}

.mobile-menu-toggle:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Logo styling for mobile */
.header-logo {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  text-decoration: none;
  transition: color 150ms ease-out;
}

.header-logo:hover {
  color: #6b7280;
}

.header-logo:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Desktop sidebar collapse toggle */
.sidebar-collapse-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: all 150ms ease-out;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
}

.sidebar-collapse-toggle:hover {
  color: #000000;
  background: #F5F5F5;
}

.sidebar-collapse-toggle:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

.sidebar-collapse-toggle svg {
  transition: transform 200ms ease-out;
}

/* Hide mobile elements on tablet+ */
@media (min-width: 768px) {
  .mobile-menu-toggle {
    display: none;
  }
  
  .header-logo {
    display: none;
  }
}
</style>
