<template>
  <!-- Ultra-minimal header with ElevenLabs aesthetic (Task 3.1) -->
  <!-- NO fixed positioning - flows naturally with content -->
  <!-- NO shadow - completely flat, clean design -->
  <header class="header">
    <div class="header-container">
      <!-- Minimal height, auto-based on content (~60px) -->
      <div class="header-content">
        <!-- Logo: 24px font, bold, black, clickable -->
        <router-link to="/">
          VocabGo
        </router-link>

        <!-- Minimal navigation - only essential items on desktop -->
        <nav class="hidden tablet:flex" aria-label="Main navigation">
          <router-link to="/saved">
            Saved Wordlists
          </router-link>
        </nav>

        <!-- Mobile menu button with touch-friendly size -->
        <button
          @click="toggleMobileMenu"
          class="tablet:hidden"
          aria-label="Toggle menu"
        >
          <svg 
            class="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              v-if="!isMobileMenuOpen"
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path 
              v-else
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile navigation with smooth animation -->
      <div 
        v-if="isMobileMenuOpen"
        class="mobile-nav tablet:hidden"
      >
        <nav aria-label="Mobile navigation">
          <router-link 
            to="/saved" 
            @click="closeMobileMenu"
          >
            Saved Wordlists
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<style scoped>
/* Ultra-minimal header styling (Task 3.1) */
/* NO fixed positioning - flows naturally with content */
/* NO shadow - completely flat, clean design */

.header {
  background-color: #ffffff;
  /* NO position: fixed */
  /* NO box-shadow */
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
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
  justify-content: space-between;
  padding: 16px 0;
}

@media (min-width: 768px) {
  .header-content {
    padding: 20px 0;
  }
}

/* Remove default link styling */
a {
  text-decoration: none !important;
}

/* Logo styling: 24px font, bold, black */
.header a[href="/"] {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  transition: color 150ms ease-out;
}

@media (min-width: 768px) {
  .header a[href="/"] {
    font-size: 24px;
  }
}

.header a[href="/"]:hover {
  color: #6b7280;
}

/* Navigation links - minimal styling */
nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

nav a {
  font-size: 15px;
  font-weight: 400;
  color: #6b7280;
  transition: color 150ms ease-out;
  padding: 4px 8px;
  border-radius: 4px;
}

nav a:hover {
  color: #000000;
}

nav a:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

/* Mobile menu button */
button {
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
}

button:hover {
  color: #000000;
}

button:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Mobile navigation */
.mobile-nav {
  border-top: 1px solid #F3F4F6;
  background: #ffffff;
  padding: 8px 0;
}

.mobile-nav nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-nav a {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 12px 16px;
  font-size: 15px;
  color: #6b7280;
  transition: all 150ms ease-out;
  border-radius: 8px;
}

.mobile-nav a:hover {
  color: #000000;
  background: #F9FAFB;
}

/* Hide mobile menu on tablet+ */
@media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }
}
</style>
