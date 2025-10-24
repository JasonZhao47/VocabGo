<template>
  <div 
    :class="['loading-spinner', sizeClass]"
    role="status"
    aria-live="polite"
    :aria-label="ariaLabel"
  >
    <div class="spinner-ring" aria-hidden="true"></div>
    <span v-if="label" class="spinner-label">{{ label }}</span>
    <span class="sr-only">{{ ariaLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  label: '',
  ariaLabel: 'Loading...',
})

const sizeClass = computed(() => `spinner-${props.size}`)
</script>

<style scoped>
/* Loading Spinner - ElevenLabs styling */
.loading-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner-ring {
  border-radius: 50%;
  border: 3px solid rgb(242, 242, 242);
  border-top-color: rgb(0, 0, 0);
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Size variants */
.spinner-sm .spinner-ring {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner-md .spinner-ring {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.spinner-lg .spinner-ring {
  width: 64px;
  height: 64px;
  border-width: 4px;
}

.spinner-label {
  font-size: 14px;
  font-weight: 400;
  color: rgb(115, 115, 115);
  letter-spacing: -0.005em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .spinner-ring {
    animation: none;
    border-top-color: rgb(0, 0, 0);
    border-right-color: rgb(0, 0, 0);
  }
}
</style>
