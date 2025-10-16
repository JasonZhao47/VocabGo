<script setup lang="ts">
import Tooltip from './Tooltip.vue'

interface ActionButtonProps {
  icon: string
  label: string
  variant?: 'default' | 'danger'
  disabled?: boolean
  loading?: boolean
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<ActionButtonProps>(), {
  variant: 'default',
  disabled: false,
  loading: false,
  tooltipPosition: 'top',
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click')
  }
}
</script>

<template>
  <Tooltip :content="label" :position="tooltipPosition" :disabled="disabled || loading">
    <button
      type="button"
      class="action-button"
      :class="[
        `action-button--${variant}`,
        {
          'action-button--disabled': disabled,
          'action-button--loading': loading,
        },
      ]"
      :disabled="disabled || loading"
      :aria-label="label"
      @click="handleClick"
    >
      <span v-if="loading" class="action-button__spinner" aria-hidden="true">
        <svg
          class="action-button__spinner-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </span>
      <span v-else class="action-button__icon" aria-hidden="true">
        {{ icon }}
      </span>
    </button>
  </Tooltip>
</template>

<style scoped>
.action-button {
  /* Size: 36x36px with 6px border radius */
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #6b7280;
  cursor: pointer;
  /* Optimize transitions for GPU acceleration - only animate transform and colors */
  transition: transform 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out, background 150ms ease-out;
  font-size: 16px;
  padding: 0;
  position: relative;
}

/* Default variant hover state */
.action-button--default:hover:not(:disabled) {
  transform: scale(1.05);
  border-color: #d1d5db;
  color: #000000;
}

/* Danger variant */
.action-button--danger {
  border-color: #e5e7eb;
  color: #6b7280;
}

.action-button--danger:hover:not(:disabled) {
  transform: scale(1.05);
  border-color: #fca5a5;
  color: #dc2626;
  background: #fef2f2;
}

/* Disabled state */
.action-button--disabled,
.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .action-button {
    transition-duration: 0.01ms;
  }
  
  .action-button--default:hover:not(:disabled),
  .action-button--danger:hover:not(:disabled) {
    transform: none;
  }
}

/* Loading state */
.action-button--loading {
  cursor: wait;
}

/* Focus state for accessibility (WCAG AA compliant) */
.action-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Icon styling */
.action-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Spinner styling */
.action-button__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button__spinner-icon {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
