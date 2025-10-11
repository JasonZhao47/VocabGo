<template>
  <div 
    :class="[
      'skeleton',
      `skeleton-${variant}`,
      className
    ]"
    :style="customStyle"
    role="status"
    aria-label="Loading..."
  >
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  width: '100%',
  height: undefined,
  className: '',
})

const customStyle = computed(() => ({
  width: props.width,
  height: props.height,
}))
</script>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    #F3F4F6 0%,
    #E5E7EB 50%,
    #F3F4F6 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: #F3F4F6;
  }
}

.skeleton-text {
  height: 16px;
  border-radius: 4px;
}

.skeleton-circular {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.skeleton-rectangular {
  border-radius: 12px;
}

/* Screen reader only text */
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
</style>
