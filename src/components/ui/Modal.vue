<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        ref="modalRef"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
        @keydown.esc="handleEscape"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        <!-- Modal Container -->
        <div
          ref="modalContentRef"
          :class="modalClasses"
          role="dialog"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div v-if="$slots.header || title || closable" class="modal-header">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h2
                  v-if="title"
                  :id="titleId"
                  class="text-xl font-semibold text-gray-900"
                >
                  {{ title }}
                </h2>
                <slot name="header" />
              </div>
              
              <button
                v-if="closable"
                type="button"
                class="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                @click="close"
                aria-label="Close modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <div v-if="description" :id="descriptionId" class="text-gray-600 mb-4">
              {{ description }}
            </div>
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  description?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  persistent: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
  'before-open': []
  'after-open': []
  'before-close': []
  'after-close': []
}>()

const modalRef = ref<HTMLElement>()
const modalContentRef = ref<HTMLElement>()
const previousActiveElement = ref<HTMLElement>()

// Generate unique IDs for accessibility
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)
const descriptionId = computed(() => `modal-description-${Math.random().toString(36).substr(2, 9)}`)

const modalClasses = computed(() => {
  const baseClasses = [
    'relative',
    'bg-white',
    'rounded-2xl',
    'shadow-xl',
    'max-h-[90vh]',
    'overflow-hidden',
    'flex',
    'flex-col'
  ]

  const sizeClasses = {
    small: ['w-full', 'max-w-md'],
    medium: ['w-full', 'max-w-lg'],
    large: ['w-full', 'max-w-2xl'],
    full: ['w-full', 'max-w-6xl', 'h-full', 'max-h-[90vh]']
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size]
  ]
})

const close = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const handleEscape = () => {
  if (props.closeOnEscape) {
    close()
  }
}

// Focus management
const trapFocus = (event: KeyboardEvent) => {
  if (!modalContentRef.value || event.key !== 'Tab') return

  const focusableElements = modalContentRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }
}

const setInitialFocus = async () => {
  await nextTick()
  if (modalContentRef.value) {
    const focusableElement = modalContentRef.value.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    
    focusableElement?.focus()
  }
}

// Transition handlers
const onEnter = () => {
  emit('before-open')
  previousActiveElement.value = document.activeElement as HTMLElement
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', trapFocus)
}

const onAfterEnter = () => {
  emit('after-open')
  setInitialFocus()
}

const onLeave = () => {
  emit('before-close')
}

const onAfterLeave = () => {
  emit('after-close')
  document.body.style.overflow = ''
  document.removeEventListener('keydown', trapFocus)
  previousActiveElement.value?.focus()
}

// Watch for model value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    emit('open')
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', trapFocus)
})
</script>

<style scoped>
.modal-header {
  @apply px-6 py-4 border-b border-gray-100 flex-shrink-0;
}

.modal-content {
  @apply px-6 py-4 flex-1 overflow-y-auto;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-100 flex-shrink-0;
}

/* Transition styles */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(-10px);
}

.modal-enter-to .relative,
.modal-leave-from .relative {
  transform: scale(1) translateY(0);
}
</style>