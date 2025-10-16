<template>
  <div
    class="category-card"
    :class="{ 'category-card--clickable': onClick }"
    :style="cardStyle"
    role="button"
    :tabindex="onClick ? 0 : -1"
    :aria-label="title"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Background Image or Gradient -->
    <div
      v-if="!image"
      class="category-card__background"
      :style="backgroundStyle"
      :aria-hidden="true"
    />
    
    <!-- Image with lazy loading support -->
    <img
      v-else
      class="category-card__background category-card__image"
      :src="image"
      :alt="title"
      loading="lazy"
      :aria-hidden="true"
    />

    <!-- Semi-transparent Overlay for Text Readability -->
    <div class="category-card__overlay" :aria-hidden="true" />

    <!-- Content -->
    <div class="category-card__content">
      <h3 class="category-card__title">{{ title }}</h3>
      <p v-if="description" class="category-card__description">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { designTokens } from '@/config/designTokens'

/**
 * CategoryCard Component
 * 
 * Displays a category card with aesthetic background (image or gradient)
 * and text overlay. Supports hover interactions and keyboard accessibility.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

interface CategoryCardProps {
  /** Card title */
  title: string
  /** Optional description text */
  description?: string
  /** Background image URL (supports lazy loading) */
  image?: string
  /** CSS gradient string (e.g., 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') */
  gradient?: string
  /** Click handler */
  onClick?: () => void
}

const props = defineProps<CategoryCardProps>()

/**
 * Handle click and keyboard activation
 */
const handleClick = () => {
  if (props.onClick) {
    props.onClick()
  }
}

/**
 * Card container styles
 */
const cardStyle = computed(() => ({
  borderRadius: designTokens.borderRadius.xl, // 12px
}))

/**
 * Background styles (gradient only, images use <img> tag for lazy loading)
 */
const backgroundStyle = computed(() => {
  if (props.gradient) {
    return {
      background: props.gradient,
    }
  }
  
  // Default gradient if neither image nor gradient provided
  if (!props.image) {
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }
  }
  
  return {}
})
</script>

<style scoped>
.category-card {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
  box-shadow: v-bind('designTokens.shadows.md');
}

.category-card--clickable {
  cursor: pointer;
}

.category-card--clickable:hover {
  transform: scale(1.02);
  box-shadow: v-bind('designTokens.shadows.lg');
}

.category-card--clickable:focus {
  outline: 2px solid v-bind('designTokens.colors.accent');
  outline-offset: 2px;
}

.category-card--clickable:active {
  transform: scale(0.98);
}

.category-card__background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.category-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.category-card__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.category-card__content {
  position: relative;
  z-index: 2;
  padding: v-bind('designTokens.spacing.xl');
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: v-bind('designTokens.colors.white');
}

.category-card__title {
  font-size: v-bind('designTokens.typography.fontSize.xl');
  font-weight: v-bind('designTokens.typography.fontWeight.semibold');
  line-height: v-bind('designTokens.typography.lineHeight.tight');
  margin: 0 0 v-bind('designTokens.spacing.sm') 0;
  color: v-bind('designTokens.colors.white');
}

.category-card__description {
  font-size: v-bind('designTokens.typography.fontSize.base');
  font-weight: v-bind('designTokens.typography.fontWeight.normal');
  line-height: v-bind('designTokens.typography.lineHeight.normal');
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .category-card__content {
    padding: v-bind('designTokens.spacing.lg');
  }
  
  .category-card__title {
    font-size: v-bind('designTokens.typography.fontSize.lg');
  }
  
  .category-card__description {
    font-size: v-bind('designTokens.typography.fontSize.sm');
  }
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .category-card {
    transition-duration: 0.01ms;
  }
  
  .category-card--clickable:hover {
    transform: none;
  }
}
</style>
