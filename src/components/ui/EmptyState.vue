<template>
  <div 
    :class="['empty-state', variantClass]"
    role="status"
    :aria-label="ariaLabel"
  >
    <!-- Icon slot or default icon -->
    <div class="empty-state-icon">
      <slot name="icon">
        <svg 
          v-if="variant === 'no-data'"
          class="icon-svg"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="1.5" 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <svg 
          v-else-if="variant === 'search'"
          class="icon-svg"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
        <svg 
          v-else
          class="icon-svg"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="1.5" 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
          />
        </svg>
      </slot>
    </div>

    <!-- Title -->
    <h3 class="empty-state-title">
      <slot name="title">{{ title }}</slot>
    </h3>

    <!-- Description -->
    <p v-if="description || $slots.description" class="empty-state-description">
      <slot name="description">{{ description }}</slot>
    </p>

    <!-- Action button -->
    <div v-if="actionLabel || $slots.action" class="empty-state-action">
      <slot name="action">
        <button 
          v-if="actionLabel"
          @click="$emit('action')"
          class="empty-action-button"
          type="button"
        >
          {{ actionLabel }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'no-data' | 'search' | 'empty' | 'custom'
  title?: string
  description?: string
  actionLabel?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'no-data',
  title: 'No data available',
  description: '',
  actionLabel: '',
  ariaLabel: 'Empty state',
})

defineEmits<{
  action: []
}>()

const variantClass = computed(() => `empty-state-${props.variant}`)
</script>

<style scoped>
/* Empty State - ElevenLabs styling with smooth animations */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 24px;
  background: rgb(250, 250, 250);
  border-radius: 12px;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 767px) {
  .empty-state {
    padding: 64px 24px;
  }
}

/* Icon styling */
.empty-state-icon {
  margin-bottom: 32px;
  opacity: 0;
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) 100ms forwards;
}

@media (max-width: 767px) {
  .empty-state-icon {
    margin-bottom: 24px;
  }
}

.icon-svg {
  width: 80px;
  height: 80px;
  color: rgb(229, 229, 229);
}

@media (max-width: 767px) {
  .icon-svg {
    width: 64px;
    height: 64px;
  }
}

/* Title styling */
.empty-state-title {
  font-size: 24px;
  font-weight: 700;
  color: rgb(0, 0, 0);
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0 0 8px 0;
  text-align: center;
  opacity: 0;
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) 200ms forwards;
}

@media (max-width: 767px) {
  .empty-state-title {
    font-size: 20px;
  }
}

/* Description styling */
.empty-state-description {
  font-size: 18px;
  font-weight: 400;
  color: rgb(115, 115, 115);
  line-height: 1.6;
  letter-spacing: -0.005em;
  margin: 0 0 32px 0;
  text-align: center;
  max-width: 400px;
  opacity: 0;
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) 300ms forwards;
}

@media (max-width: 767px) {
  .empty-state-description {
    font-size: 16px;
    margin-bottom: 24px;
  }
}

/* Action button */
.empty-state-action {
  opacity: 0;
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) 400ms forwards;
}

.empty-action-button {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 32px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(255, 255, 255);
  background: rgb(0, 0, 0);
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 767px) {
  .empty-action-button {
    min-height: 44px;
  }
}

.empty-action-button:hover {
  background: rgb(38, 38, 38);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.empty-action-button:active {
  transform: scale(0.98);
}

.empty-action-button:focus-visible {
  outline: 2px solid rgb(0, 0, 0);
  outline-offset: 2px;
}

/* Fade in up animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .empty-state,
  .empty-state-icon,
  .empty-state-title,
  .empty-state-description,
  .empty-state-action,
  .empty-action-button {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
