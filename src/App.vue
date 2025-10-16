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
    
    <!-- Main layout with sidebar offset -->
    <div :class="['app-layout', { 'app-layout--collapsed': sidebarCollapsed }]">
      <!-- Header -->
      <Header 
        @toggle-mobile-menu="toggleMobileSidebar"
        @toggle-sidebar="toggleDesktopSidebar"
        :sidebar-collapsed="sidebarCollapsed"
      />
      
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
import { usePageTransition } from '@/composables/usePageTransition'
import { useNavigation } from '@/composables/useNavigation'
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

// Mobile sidebar state
const isMobileSidebarOpen = ref(false)

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

/* App layout with sidebar */
.app-layout {
  margin-left: 260px;
  min-height: 100vh;
  transition: margin-left 200ms ease-out;
}

.app-layout--collapsed {
  margin-left: 72px;
}

.app-content {
  /* Content area styling */
}

/* Mobile responsive - no sidebar offset */
@media (max-width: 767px) {
  .app-layout {
    margin-left: 0;
  }
  
  .app-layout--collapsed {
    margin-left: 0;
  }
}
</style>
