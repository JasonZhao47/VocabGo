<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        :role="toast.type === 'error' ? 'alert' : 'status'"
        :aria-label="`${toast.type} notification: ${toast.message}`"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <!-- Success Icon -->
          <svg
            v-if="toast.type === 'success'"
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          
          <!-- Error Icon -->
          <svg
            v-else-if="toast.type === 'error'"
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          
          <!-- Info Icon -->
          <svg
            v-else
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        
        <div class="toast-message">{{ toast.message }}</div>
        
        <button
          class="toast-close"
          @click.stop="removeToast(toast.id)"
          aria-label="Close"
        >
          <svg class="icon-small" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 24rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid;
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.toast-success {
  border-left-color: #10b981;
  background-color: #f0fdf4;
}

.toast-error {
  border-left-color: #ef4444;
  background-color: #fef2f2;
}

.toast-info {
  border-left-color: #3b82f6;
  background-color: #eff6ff;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-success .icon {
  color: #10b981;
}

.toast-error .icon {
  color: #ef4444;
}

.toast-info .icon {
  color: #3b82f6;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.icon-small {
  width: 1rem;
  height: 1rem;
}

.toast-message {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #374151;
}

.toast-close {
  flex-shrink: 0;
  padding: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #374151;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
  
  .toast {
    padding: 0.75rem;
  }
  
  .toast-message {
    font-size: 0.8125rem;
  }
}
</style>
