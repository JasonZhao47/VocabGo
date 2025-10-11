<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- Skip link for accessibility -->
    <a href="#main-content" class="skip-link">
      Skip to main content
    </a>
    
    <!-- Main content -->
    <main id="main-content" tabindex="-1" class="focus:outline-none">
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
    
    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '@/components/ToastContainer.vue'
import { usePageTransition } from '@/composables/usePageTransition'

// Initialize page transition with default settings
const { enter, leave } = usePageTransition({
  duration: 300,
  slideDistance: 20,
  stagger: true,
  staggerDelay: 100,
})

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
</style>
