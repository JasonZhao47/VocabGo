<template>
  <div class="content-loader">
    <!-- Loading State -->
    <Transition
      name="fade"
      mode="out-in"
    >
      <div v-if="loading" key="loading" class="loader-state">
        <slot name="loading">
          <LoadingSpinner 
            :size="spinnerSize"
            :label="loadingLabel"
          />
        </slot>
      </div>

      <!-- Error State -->
      <div v-else-if="error" key="error" class="loader-state">
        <slot name="error" :error="error" :retry="handleRetry">
          <ErrorState
            :title="errorTitle"
            :message="error"
            :show-retry="showRetry"
            :show-cancel="showCancel"
            @retry="handleRetry"
            @cancel="handleCancel"
          />
        </slot>
      </div>

      <!-- Empty State -->
      <div v-else-if="empty" key="empty" class="loader-state">
        <slot name="empty">
          <EmptyState
            :variant="emptyVariant"
            :title="emptyTitle"
            :description="emptyDescription"
            :action-label="emptyActionLabel"
            @action="handleEmptyAction"
          />
        </slot>
      </div>

      <!-- Content with fade-in animation -->
      <div v-else key="content" class="loader-content">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorState from './ErrorState.vue'
import EmptyState from './EmptyState.vue'

interface Props {
  loading?: boolean
  error?: string | null
  empty?: boolean
  loadingLabel?: string
  spinnerSize?: 'sm' | 'md' | 'lg'
  errorTitle?: string
  showRetry?: boolean
  showCancel?: boolean
  emptyVariant?: 'no-data' | 'search' | 'empty' | 'custom'
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  empty: false,
  loadingLabel: '',
  spinnerSize: 'md',
  errorTitle: 'Something went wrong',
  showRetry: true,
  showCancel: false,
  emptyVariant: 'no-data',
  emptyTitle: 'No data available',
  emptyDescription: '',
  emptyActionLabel: '',
})

const emit = defineEmits<{
  retry: []
  cancel: []
  emptyAction: []
}>()

function handleRetry() {
  emit('retry')
}

function handleCancel() {
  emit('cancel')
}

function handleEmptyAction() {
  emit('emptyAction')
}
</script>

<style scoped>
/* Content Loader Container */
.content-loader {
  position: relative;
  min-height: 200px;
}

.loader-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loader-content {
  animation: contentFadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Content fade-in animation */
@keyframes contentFadeIn {
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
  .loader-content,
  .fade-enter-active,
  .fade-leave-active {
    animation: none !important;
    transition: none !important;
  }
  
  .loader-content {
    opacity: 1;
    transform: none;
  }
}
</style>
