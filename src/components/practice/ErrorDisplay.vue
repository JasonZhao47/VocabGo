<template>
  <div class="error-display" :class="severityClass">
    <div class="error-icon">
      <svg
        v-if="severity === 'error'"
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <svg
        v-else-if="severity === 'warning'"
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <svg
        v-else
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <div class="error-content">
      <h3 v-if="title" class="error-title">{{ title }}</h3>
      <p class="error-message">{{ message }}</p>
      
      <div v-if="details" class="error-details">
        <button
          @click="showDetails = !showDetails"
          class="details-toggle"
          type="button"
        >
          {{ showDetails ? 'Hide' : 'Show' }} details
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': showDetails }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        <Transition name="slide">
          <div v-if="showDetails" class="details-content">
            {{ details }}
          </div>
        </Transition>
      </div>
    </div>

    <div v-if="retryable || dismissible" class="error-actions">
      <button
        v-if="retryable"
        @click="handleRetry"
        class="btn-retry"
        type="button"
        :disabled="retrying"
      >
        <svg
          v-if="!retrying"
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ retrying ? 'Retrying...' : 'Try Again' }}
      </button>
      
      <button
        v-if="dismissible"
        @click="handleDismiss"
        class="btn-dismiss"
        type="button"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title?: string;
  message: string;
  details?: string;
  severity?: 'error' | 'warning' | 'info';
  retryable?: boolean;
  dismissible?: boolean;
}

interface Emits {
  (e: 'retry'): void;
  (e: 'dismiss'): void;
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'error',
  retryable: false,
  dismissible: true,
});

const emit = defineEmits<Emits>();

const showDetails = ref(false);
const retrying = ref(false);

const severityClass = computed(() => {
  return `error-${props.severity}`;
});

async function handleRetry() {
  retrying.value = true;
  try {
    emit('retry');
  } finally {
    // Reset after a short delay to allow the retry to process
    setTimeout(() => {
      retrying.value = false;
    }, 1000);
  }
}

function handleDismiss() {
  emit('dismiss');
}
</script>

<script lang="ts">
import { computed } from 'vue';
export default {
  name: 'ErrorDisplay',
};
</script>

<style scoped>
.error-display {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid;
  background: white;
}

.error-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.error-info {
  border-color: #3b82f6;
  background: #eff6ff;
}

.error-icon {
  flex-shrink: 0;
}

.error-error .error-icon {
  color: #ef4444;
}

.error-warning .error-icon {
  color: #f59e0b;
}

.error-info .error-icon {
  color: #3b82f6;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.error-error .error-title {
  color: #991b1b;
}

.error-warning .error-title {
  color: #92400e;
}

.error-info .error-title {
  color: #1e40af;
}

.error-message {
  font-size: 14px;
  line-height: 1.5;
}

.error-error .error-message {
  color: #7f1d1d;
}

.error-warning .error-message {
  color: #78350f;
}

.error-info .error-message {
  color: #1e3a8a;
}

.error-details {
  margin-top: 12px;
}

.details-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 150ms ease-out;
}

.error-error .details-toggle {
  color: #991b1b;
}

.error-warning .details-toggle {
  color: #92400e;
}

.error-info .details-toggle {
  color: #1e40af;
}

.details-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.details-content {
  margin-top: 8px;
  padding: 12px;
  font-size: 13px;
  font-family: monospace;
  border-radius: 6px;
  overflow-x: auto;
}

.error-error .details-content {
  background: rgba(239, 68, 68, 0.1);
  color: #7f1d1d;
}

.error-warning .details-content {
  background: rgba(245, 158, 11, 0.1);
  color: #78350f;
}

.error-info .details-content {
  background: rgba(59, 130, 246, 0.1);
  color: #1e3a8a;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.btn-retry,
.btn-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 150ms ease-out;
  white-space: nowrap;
}

.btn-retry {
  color: white;
  background: #000000;
}

.btn-retry:hover:not(:disabled) {
  background: #1f2937;
}

.btn-retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-dismiss {
  color: #374151;
  background: transparent;
  border: 1px solid #d1d5db;
}

.btn-dismiss:hover {
  background: #f9fafb;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 200ms ease-out;
  max-height: 200px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .error-display {
    flex-direction: column;
  }

  .error-actions {
    flex-direction: row;
  }

  .btn-retry,
  .btn-dismiss {
    flex: 1;
  }
}
</style>
