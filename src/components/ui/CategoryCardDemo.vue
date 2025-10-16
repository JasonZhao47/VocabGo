<template>
  <div class="category-card-demo">
    <h2 class="demo-title">CategoryCard Component Demo</h2>
    <p class="demo-description">
      Responsive grid layout with 2-4 columns, consistent spacing, and keyboard accessibility
    </p>

    <!-- Responsive Grid Container -->
    <div class="category-grid">
      <CategoryCard
        v-for="category in categories"
        :key="category.id"
        :title="category.title"
        :description="category.description"
        :image="category.image"
        :gradient="category.gradient"
        :onClick="() => handleCategoryClick(category)"
      />
    </div>

    <!-- Click Feedback -->
    <div v-if="selectedCategory" class="feedback">
      <p>Selected: <strong>{{ selectedCategory.title }}</strong></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CategoryCard from './CategoryCard.vue'

interface Category {
  id: string
  title: string
  description: string
  image?: string
  gradient?: string
}

const categories = ref<Category[]>([
  {
    id: '1',
    title: 'Upload Document',
    description: 'Extract vocabulary from your documents',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: '2',
    title: 'Saved Wordlists',
    description: 'Access your saved vocabulary lists',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: '3',
    title: 'Practice Questions',
    description: 'Test your knowledge with interactive exercises',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: '4',
    title: 'Learning Progress',
    description: 'Track your vocabulary growth over time',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
])

const selectedCategory = ref<Category | null>(null)

const handleCategoryClick = (category: Category) => {
  selectedCategory.value = category
  console.log('Category clicked:', category.title)
}
</script>

<style scoped>
.category-card-demo {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000000;
}

.demo-description {
  font-size: 15px;
  color: #6B7280;
  margin: 0 0 32px 0;
}

/**
 * Responsive Grid Layout
 * - Mobile (0-767px): 1 column
 * - Tablet (768-1023px): 2 columns
 * - Desktop (1024px+): 3-4 columns
 */
.category-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

/* Large Desktop: 4 columns (if needed) */
@media (min-width: 1440px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.feedback {
  margin-top: 24px;
  padding: 16px;
  background: #F5F5F5;
  border-radius: 8px;
  font-size: 15px;
  color: #374151;
}

.feedback strong {
  color: #000000;
  font-weight: 600;
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .category-card-demo {
    padding: 16px;
  }
  
  .demo-title {
    font-size: 20px;
  }
  
  .category-grid {
    gap: 16px;
  }
}
</style>
