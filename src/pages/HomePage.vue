<template>
  <div class="home-page">
    <!-- Hero Section with proper semantic HTML and ARIA -->
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="hero-content">
        <!-- Workspace name -->
        <p :class="getStaggerClass(0)" class="workspace-name">
          My Workspace
        </p>
        
        <!-- Main greeting heading -->
        <div class="hero-header">
          <h1 id="hero-title" :class="getStaggerClass(1)" class="hero-title">
            Welcome to VocabGo
          </h1>
        </div>
        
        <!-- Subtitle with action -->
        <div :class="getStaggerClass(2)" class="hero-subtitle-section">
          <p class="hero-subtitle">
            Generate bilingual wordlists from your documents
          </p>
        </div>
        
        <!-- Action Cards Grid -->
        <nav :class="getStaggerClass(3)" class="action-cards" aria-label="Primary navigation">
          <button
            class="action-card"
            aria-label="Navigate to upload document page"
            @click="goToUpload"
          >
            <div class="card-icon upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p class="card-label">Upload Document</p>
          </button>
          
          <button
            class="action-card"
            aria-label="Navigate to saved wordlists page"
            @click="goToWordlists"
          >
            <div class="card-icon wordlists-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <p class="card-label">View Wordlists</p>
          </button>
        </nav>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePageEntranceAnimation } from '@/composables/usePageEntranceAnimation'

const router = useRouter()

// Setup page entrance animations with longer duration to prevent disappearing
const { getStaggerClass } = usePageEntranceAnimation({
  baseDelay: 0,
  staggerDelay: 100,
})

// Get time of day for greeting
const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
})

function goToUpload() {
  router.push({ name: 'upload' })
}

function goToWordlists() {
  router.push({ name: 'wordlists' })
}
</script>

<style scoped>
/* Home Page - ElevenLabs exact styling */
.home-page {
  min-height: 100vh;
  background-color: rgb(255, 255, 255);
}

/* Hero Section - matches ElevenLabs main content padding */
.hero-section {
  padding: 64px 20px 20px;
  max-width: 960px;
  margin: 0 auto;
}

.hero-content {
  max-width: 1024px;
  width: 100%;
}

/* Workspace Name - exact ElevenLabs styling */
.workspace-name {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: rgba(0, 0, 17, 0.53);
  margin: 0 0 4px 0;
}

/* Hero Header */
.hero-header {
  margin-bottom: 8px;
}

/* Hero Title - ElevenLabs h5 styling with proper font weight */
.hero-title {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 28px;
  font-weight: 600;
  line-height: 36px;
  color: rgba(0, 0, 1, 0.89);
  margin: 0;
  letter-spacing: -0.01em;
}

/* Hero Subtitle Section */
.hero-subtitle-section {
  margin-bottom: 32px;
}

.hero-subtitle {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: rgba(0, 0, 17, 0.53);
  margin: 0;
}

/* Action Cards Grid - exact ElevenLabs grid layout */
.action-cards {
  display: grid;
  grid-template-columns: repeat(2, 135px);
  gap: 12px;
  margin-bottom: 48px;
}

/* Action Card - exact ElevenLabs card styling */
.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.action-card:hover .card-icon {
  background-color: rgba(0, 0, 23, 0.075);
}

.action-card:focus {
  outline: 2px solid rgba(0, 0, 1, 0.2);
  outline-offset: 2px;
  border-radius: 20px;
}

/* Card Icon Container */
.card-icon {
  width: 135px;
  height: 135px;
  background-color: rgba(0, 0, 23, 0.043);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: background-color 0.2s;
  position: relative;
  overflow: hidden;
}

.card-icon svg {
  width: 48px;
  height: 48px;
  color: rgba(0, 0, 1, 0.7);
}

/* Upload icon - blue tint */
.upload-icon {
  background-color: rgba(59, 130, 246, 0.08);
}

.upload-icon svg {
  color: rgb(59, 130, 246);
}

.action-card:hover .upload-icon {
  background-color: rgba(59, 130, 246, 0.12);
}

/* Wordlists icon - purple tint */
.wordlists-icon {
  background-color: rgba(147, 51, 234, 0.08);
}

.wordlists-icon svg {
  color: rgb(147, 51, 234);
}

.action-card:hover .wordlists-icon {
  background-color: rgba(147, 51, 234, 0.12);
}

/* Card Label - exact ElevenLabs label styling */
.card-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: rgba(0, 0, 1, 0.89);
  margin: 0;
  text-align: center;
}

/* Animation fixes - prevent disappearing text */
@media (prefers-reduced-motion: no-preference) {
  .workspace-name,
  .hero-title,
  .hero-subtitle,
  .action-cards {
    animation: fadeInStay 0.4s ease-out forwards;
    animation-fill-mode: both;
  }
  
  .workspace-name {
    animation-delay: 0s;
  }
  
  .hero-title {
    animation-delay: 0.1s;
  }
  
  .hero-subtitle {
    animation-delay: 0.2s;
  }
  
  .action-cards {
    animation-delay: 0.3s;
  }
}

@keyframes fadeInStay {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .workspace-name,
  .hero-title,
  .hero-subtitle,
  .action-cards {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/* Responsive: Mobile */
@media (max-width: 767px) {
  .hero-section {
    padding: 24px 16px 16px;
  }
  
  .hero-title {
    font-size: 24px;
    line-height: 32px;
  }
  
  .action-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .card-icon {
    width: 100%;
    height: 120px;
  }
}

/* Responsive: Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .action-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
