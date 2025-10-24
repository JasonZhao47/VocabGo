<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * Container component for centered content with consistent spacing
 * 
 * Requirements:
 * - 2.5: Max-width 1200px with appropriate side margins
 * - 8.1: Responsive behavior at different breakpoints
 * - 8.3: Proportional spacing maintained across breakpoints
 */

interface Props {
  /** Remove vertical padding (useful for full-height layouts) */
  noPaddingY?: boolean;
  /** Remove horizontal padding (useful for edge-to-edge content) */
  noPaddingX?: boolean;
  /** Use smaller padding overall */
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  noPaddingY: false,
  noPaddingX: false,
  compact: false,
});

const containerClasses = computed(() => {
  const base = 'w-full max-w-[1200px] mx-auto';
  
  // Horizontal padding using 8px spacing scale
  // Desktop: 48px (6 * 8px), Tablet: 32px (4 * 8px), Mobile: 24px (3 * 8px), Small: 16px (2 * 8px)
  const paddingX = props.noPaddingX 
    ? '' 
    : props.compact
      ? 'px-4 md:px-6 lg:px-8'  // 32px, 48px, 64px
      : 'px-3 sm:px-3 md:px-4 lg:px-6';  // 24px, 24px, 32px, 48px
  
  // Vertical padding using 8px spacing scale
  // Desktop: 64px (8 * 8px), Tablet: 48px (6 * 8px), Mobile: 32px (4 * 8px)
  const paddingY = props.noPaddingY 
    ? '' 
    : props.compact
      ? 'py-4 md:py-6 lg:py-8'  // 32px, 48px, 64px
      : 'py-4 md:py-6 lg:py-8';  // 32px, 48px, 64px
  
  return `${base} ${paddingX} ${paddingY}`.trim();
});
</script>