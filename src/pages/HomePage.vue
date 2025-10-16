<template>
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <!-- Hero Section with gradient mesh background -->
    <div class="gradient-mesh theme-transition" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 24px;">
      <div style="max-width: 1024px; margin: 0 auto; text-align: center; padding: 80px 0;">
        <!-- Heading with gradient text hover effect -->
        <h1 data-animate-child class="gradient-text-hover" style="font-size: 56px; line-height: 1.1; font-weight: 700; margin-bottom: 24px; letter-spacing: -0.02em;">
          VocabGo
        </h1>
        
        <!-- Subtitle -->
        <p data-animate-child class="theme-transition" style="font-size: 20px; line-height: 1.6; color: #6B7280; margin-bottom: 48px; max-width: 576px; margin-left: auto; margin-right: auto;">
          Generate bilingual wordlists from your documents
        </p>
        
        <!-- Category Cards Grid -->
        <div data-animate-child class="category-cards-grid">
          <CategoryCard
            title="Upload Document"
            description="Generate a new wordlist from your document"
            :gradient="'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'"
            :onClick="goToUpload"
          />
          <CategoryCard
            title="Saved Wordlists"
            description="View and manage your saved wordlists"
            :gradient="'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'"
            :onClick="goToWordlists"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

// Lazy load CategoryCard for better initial load performance
const CategoryCard = defineAsyncComponent(() => import('@/components/ui/CategoryCard.vue'))

const router = useRouter()

function goToUpload() {
  router.push({ name: 'upload' })
}

function goToWordlists() {
  router.push({ name: 'wordlists' })
}
</script>

<style scoped>
.category-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

/* Responsive: Single column on mobile */
@media (max-width: 767px) {
  .category-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* Tablet: 2 columns */
@media (min-width: 768px) and (max-width: 1023px) {
  .category-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
</style>
