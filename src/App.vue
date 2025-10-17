<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- Skip link for accessibility -->
    <a href="#main-content" class="skip-link">
      Skip to main content
    </a>
    
    <!-- Sidebar navigation -->
    <Sidebar
      v-model="isMobileSidebarOpen"
      :collapsed="sidebarCollapsed"
      :items="navigationItems"
    />
    
    <!-- Fixed top navbar -->
    <Header
      :sidebar-collapsed="sidebarCollapsed"
      :page-title="currentPageTitle"
      @toggle-mobile-menu="toggleMobileSidebar"
      @toggle-sidebar="toggleDesktopSidebar"
    >
      <template #actions>
        <!-- Future: Add action buttons like Feedback, Documentation -->
      </template>
    </Header>
    
    <!-- Main layout with sidebar and navbar offset -->
    <div :class="['app-layout', { 'app-layout--collapsed': sidebarCollapsed }]">
      <!-- Main content -->
      <main id="main-content" tabindex="-1" class="app-content focus:outline-none">
        <router-view v-slot="{ Component, route }">
          <transition
            :css="false"
            mode="out-in"
            @enter="onEnter"
            @leave="onLeave"
          >
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { usePageTransition } from '@/composables/usePageTransition'
import { useNavigation } from '@/composables/useNavigation'
import { useSidebarToggle } from '@/composables/useSidebarToggle'
import { useWebVitals } from '@/composables/useWebVitals'
import { usePerformanceMonitor } from '@/utils/performanceMonitor'

// Lazy load layout components for better initial load performance
const Sidebar = defineAsyncComponent(() => import('@/components/layout/Sidebar.vue'))
const Header = defineAsyncComponent(() => import('@/components/layout/Header.vue'))
const ToastContainer = defineAsyncComponent(() => import('@/components/ToastContainer.vue'))

// Initialize Web Vitals monitoring (Requirements: 6.3)
const { metrics: webVitals, logReport } = useWebVitals({
  enableLogging: import.meta.env.DEV,
  onMetric: (metric) => {
    // Log poor performance metrics in production
    if (metric.rating === 'poor' && !import.meta.env.DEV) {
      console.warn(`[Performance] Poor ${metric.metric.toUpperCase()}: ${metric.value.toFixed(2)}`)
    }
  }
})

// Initialize animation performance monitoring (Requirements: 6.3)
const { start: startPerfMonitor, stop: stopPerfMonitor, getMetrics: getPerfMetrics } = usePerformanceMonitor({
  targetFps: 60,
  lowFpsThreshold: 30,
  enableLogging: import.meta.env.DEV,
  onLowPerformance: (metrics) => {
    console.warn('[Performance] Low FPS detected:', metrics)
  }
})

// Initialize page transition with default settings
const { enter, leave } = usePageTransition({
  duration: 300,
  slideDistance: 20,
  stagger: true,
  staggerDelay: 100,
})

// Navigation state
const { sidebarCollapsed, navigationItems, setNavigationItems, toggleSidebar } = useNavigation()

// Get responsive state from sidebar toggle composable
const { isMobile, isDesktop } = useSidebarToggle()

// Mobile sidebar state
const isMobileSidebarOpen = ref(false)

// Current route for page title
const route = useRoute()

// Compute page title based on current route
const currentPageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/': 'Home',
    '/upload': 'Upload Document',
    '/processing': 'Processing',
    '/result': 'Results',
    '/wordlists': 'Saved Wordlists',
  }
  return titleMap[route.path] || 'VocabGo'
})

// Configure navigation items with proper icons
const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    route: '/',
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
    route: '/upload',
  },
  {
    id: 'wordlists',
    label: 'Saved Wordlists',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
    route: '/wordlists',
  },
]

// Set navigation items
setNavigationItems(navItems)

// Toggle mobile sidebar
const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

// Toggle desktop sidebar collapse/expand
const toggleDesktopSidebar = () => {
  toggleSidebar()
}

// Transition handlers
const onEnter = (el: Element, done: () => void) => {
  enter(el, done)
}

const onLeave = (el: Element, done: () => void) => {
  leave(el, done)
}
</script>

<style>
/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

/* Root app container with vertical divider line */
#app {
  position: relative;
}

/* Vertical divider line at sidebar edge - spans full height */
#app::before {
  content: '';
  position: fixed;
  left: 260px; /* Sidebar width */
  top: 0;
  bottom: 0;
  width: 1px;
  background: #E5E7EB;
  z-index: 90; /* Below sidebar (100), above content */
  transition: left 200ms ease-out;
}

/* Adjust divider position when sidebar is collapsed */
#app:has(.app-layout--collapsed)::before {
  left: 72px; /* Collapsed sidebar width */
}

/* App layout with sidebar and navbar offset */
.app-layout {
  margin-left: 260px; /* Expanded sidebar width */
  margin-top: 64px; /* Fixed navbar height */
  min-height: calc(100vh - 64px); /* Account for navbar */
  transition: margin-left 200ms ease-out;
}

/* Collapsed sidebar state */
.app-layout--collapsed {
  margin-left: 72px; /* Collapsed sidebar width */
}

/* Main content area */
.app-content {
  /* White background to match sidebar */
  background: #FFFFFF;
  min-height: calc(100vh - 64px);
  padding: 24px;
}

/* Mobile responsive - no sidebar offset, full width */
@media (max-width: 767px) {
  #app::before {
    display: none; /* Hide divider on mobile */
  }
  
  .app-layout {
    margin-left: 0;
    margin-top: 64px; /* Keep navbar offset on mobile */
  }
  
  .app-layout--collapsed {
    margin-left: 0;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .app-layout,
  #app::before {
    transition: none;
  }
}
</style>
