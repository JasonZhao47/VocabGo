<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- Skip to content link for keyboard navigation (Requirements: 13.1, 13.4) -->
    <a
      href="#main-content"
      class="skip-to-content"
      @click="skipToContent"
    >
      Skip to main content
    </a>
    
    <!-- Sidebar navigation (hidden for student view) -->
    <Sidebar
      v-if="!isStudentView"
      v-model="isMobileSidebarOpen"
      :collapsed="sidebarCollapsed"
      :items="navigationItems"
    />
    
    <!-- Fixed top navbar (hidden for student view) -->
    <Header
      v-if="!isStudentView"
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
    <div :class="['app-layout', { 'app-layout--collapsed': sidebarCollapsed, 'app-layout--fullscreen': isStudentView }]">
      <!-- Main content -->
      <main id="main-content" tabindex="-1" class="app-content">
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

// Check if current route is student practice view (no sidebar/header needed)
const isStudentView = computed(() => {
  // Match /practice/:shareToken pattern (but not /dashboard/:wordlistId)
  return route.path.startsWith('/practice/') && route.name === 'student-practice'
})

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

// Skip to content functionality (Requirements: 13.1, 13.4)
const skipToContent = (event: Event) => {
  event.preventDefault()
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    mainContent.focus()
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
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

/* Hide divider for fullscreen student view */
#app:has(.app-layout--fullscreen)::before {
  display: none;
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

/* Fullscreen state for student view (no sidebar/header) */
.app-layout--fullscreen {
  margin-left: 0;
  margin-top: 0;
  min-height: 100vh;
}

/* Skip to content link - visible only on keyboard focus (Requirements: 13.1, 13.4) */
.skip-to-content {
  position: fixed;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: top 200ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.skip-to-content:focus {
  top: 16px;
  outline: 2px solid rgb(255, 255, 255);
  outline-offset: 2px;
}

/* Main content area */
.app-content {
  /* White background to match sidebar */
  background: #FFFFFF;
  min-height: calc(100vh - 64px);
  padding: 24px;
}

/* Focus styles for main content when skipped to */
.app-content:focus {
  outline: none;
}

/* Remove padding for fullscreen student view */
.app-layout--fullscreen .app-content {
  padding: 0;
  min-height: 100vh;
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
