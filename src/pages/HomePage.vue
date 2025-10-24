<template>
  <div class="home-page">
    <!-- Hero Section with proper semantic HTML and ARIA (Requirement 13.2) -->
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="hero-content">
        <!-- Main heading with stagger animation -->
        <h1 id="hero-title" :class="getStaggerClass(0)" class="hero-title">
          VocabGo
        </h1>
        
        <!-- Subtitle with stagger animation -->
        <p :class="getStaggerClass(1)" class="hero-subtitle">
          Generate bilingual wordlists from your documents
        </p>
        
        <!-- Action Buttons with stagger animation -->
        <nav :class="getStaggerClass(2)" class="hero-actions" aria-label="Primary navigation">
          <Button
            variant="primary"
            size="lg"
            aria-label="Navigate to upload document page"
            @click="goToUpload"
          >
            Upload Document
          </Button>
          <Button
            variant="secondary"
            size="lg"
            aria-label="Navigate to saved wordlists page"
            @click="goToWordlists"
          >
            View Saved Wordlists
          </Button>
        </nav>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePageEntranceAnimation } from '@/composables/usePageEntranceAnimation'
import Button from '@/components/ui/Button.vue'

const router = useRouter()

// Setup page entrance animations
const { getStaggerClass } = usePageEntranceAnimation({
  baseDelay: 100,
  staggerDelay: 80,
})

function goToUpload() {
  router.push({ name: 'upload' })
}

function goToWordlists() {
  router.push({ name: 'wordlists' })
}
</script>

<style scoped>
/* Home Page Container - using 8px base unit spacing */
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: rgb(255, 255, 255);
}

/* Hero Section - centered content with proper spacing */
.hero-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px; /* 3 * 8px base unit */
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 96px 0; /* 12 * 8px base unit */
}

/* Hero Title - ElevenLabs typography scale (48px) */
.hero-title {
  font-size: 48px;
  line-height: 1.1;
  font-weight: 700;
  color: rgb(0, 0, 0);
  margin-bottom: 16px; /* 2 * 8px base unit */
  letter-spacing: -0.02em;
}

/* Hero Subtitle - ElevenLabs typography scale (18px base) */
.hero-subtitle {
  font-size: 18px;
  line-height: 1.6;
  font-weight: 400;
  color: rgb(115, 115, 115); /* gray-500 for secondary text */
  margin-bottom: 48px; /* 6 * 8px base unit */
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Hero Actions - button group with proper spacing */
.hero-actions {
  display: flex;
  gap: 16px; /* 2 * 8px base unit */
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

/* Responsive: Mobile (< 768px) */
@media (max-width: 767px) {
  .hero-content {
    padding: 64px 0; /* 8 * 8px base unit */
  }
  
  .hero-title {
    font-size: 32px; /* Scale down to xl size */
  }
  
  .hero-subtitle {
    font-size: 16px;
    margin-bottom: 32px; /* 4 * 8px base unit */
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .hero-actions :deep(button) {
    width: 100%;
  }
}

/* Responsive: Tablet (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .hero-content {
    padding: 80px 0; /* 10 * 8px base unit */
  }
  
  .hero-title {
    font-size: 40px;
  }
}

/* Smooth scroll animations for content sections */
@media (prefers-reduced-motion: no-preference) {
  .hero-title,
  .hero-subtitle,
  .hero-actions {
    animation: fadeInUp 300ms ease-in-out;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .hero-title,
  .hero-subtitle,
  .hero-actions {
    animation: none;
  }
}
</style>
