<template>
  <div 
    class="error-state"
    role="alert"
    :aria-label="ariaLabel"
  >
    <!-- Error Icon -->
    <div class="error-state-icon">
      <slot name="icon">
        <svg 
          class="icon-svg"
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fill-rule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clip-rule="evenodd" 
          />
        </svg>
      </slot>
    </div>

    <!-- Title -->
    <h3 class="error-state-title">
      <slot name="title">{{ title }}</slot>
    </h3>

    <!-- Error Message -->
    <div v-if="message || $slots.message" class="error-state-message">
      <slot name="message">{{ message }}</slot>
    </div>

    <!-- Recovery Actions -->
    <div v-if="showRetry || $slots.actions" class="error-state-actions">
      <slot name="actions">
        <button 
          v-if="showRetry"
          @click="$emit('retry')"
          class="error-action-button error-action-primary"
          type="button"
        >
          {{ retryLabel }}
        </button>
        <button 
          v-if="showCancel"
          @click="$emit('cancel')"
          class="error-action-button error-action-secondary"
          type="button"
        >
          {{ cancelLabel }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  showRetry?: boolean
  showCancel?: boolean
  retryLabel?: string
  cancelLabel?: string
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  message: 'An error occurred. Please try again.',
  showRetry: true,
  showCancel: false,
  retryLabel: 'Try Again',
  cancelLabel: 'Cancel',
  ariaLabel: 'Error occurred',
})

defineEmits<{
  retry: []
  cancel: []
}>()
</script>

<style scoped>
/* Error State - ElevenLabs styling */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 24px;
  background: rgb(250, 250, 250);
  border-radius: 12px;
  animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 767px) {
  .error-state {
    padding: 64px 24px;
  }
}

/* Icon styling with shake animation */
.error-state-icon {
  margin-bottom: 24px;
  animation: errorShake 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-svg {
  width: 64px;
  height: 64px;
  color: rgb(220, 38, 38);
}

@media (max-width: 767px) {
  .icon-svg {
    width: 48px;
    height: 48px;
  }
}

/* Title styling */
.error-state-title {
  font-size: 24px;
  font-weight: 700;
  color: rgb(220, 38, 38);
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0 0 12px 0;
  text-align: center;
}

@media (max-width: 767px) {
  .error-state-title {
    font-size: 20px;
  }
}

/* Message styling */
.error-state-message {
  font-size: 16px;
  font-weight: 400;
  color: rgb(115, 115, 115);
  line-height: 1.6;
  letter-spacing: -0.005em;
  margin: 0 0 32px 0;
  text-align: center;
  max-width: 400px;
  padding: 16px 24px;
  background: rgb(254, 242, 242);
  border: 1px solid rgb(254, 226, 226);
  border-radius: 8px;
}

@media (max-width: 767px) {
  .error-state-message {
    font-size: 14px;
    margin-bottom: 24px;
  }
}

/* Actions */
.error-state-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.error-action-button {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 32px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 767px) {
  .error-action-button {
    min-height: 44px;
    width: 100%;
  }
}

.error-action-primary {
  color: rgb(255, 255, 255);
  background: rgb(220, 38, 38);
}

.error-action-primary:hover {
  background: rgb(185, 28, 28);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.error-action-primary:active {
  transform: scale(0.98);
}

.error-action-secondary {
  color: rgb(0, 0, 0);
  background: rgb(255, 255, 255);
  border: 1px solid rgb(229, 229, 229);
}

.error-action-secondary:hover {
  background: rgb(250, 250, 250);
}

.error-action-secondary:active {
  background: rgb(242, 242, 242);
}

.error-action-button:focus-visible {
  outline: 2px solid rgb(220, 38, 38);
  outline-offset: 2px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .error-state,
  .error-state-icon,
  .error-action-button {
    animation: none !important;
    transition: none !important;
  }
  
  .error-action-button:hover,
  .error-action-button:active {
    transform: none !important;
  }
}
</style>
