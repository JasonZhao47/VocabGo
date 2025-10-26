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
        class="modal-overlay"
        @click="handleBackdropClick"
        @keydown.esc="handleEscape"
      >
        <!-- Backdrop -->
        <div
          ref="backdropRef"
          class="modal-backdrop"
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
          <div v-if="$slots.header || title || closable" class="modal-header" data-animate-child>
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
                class="modal-close-button"
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
          <div class="modal-content" data-animate-child>
            <div v-if="description" :id="descriptionId" class="text-gray-600 mb-4">
              {{ description }}
            </div>
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer" data-animate-child>
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useModalAnimation } from '@/composables/useModalAnimation'
import { animationConfig } from '@/config/animations'
import { useMotionPreference } from '@/composables/useMotionPreference'
import { useFocusTrap, getFocusableElements } from '@/composables/useKeyboardNavigation'

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
const backdropRef = ref<HTMLElement>()
const isActive = ref(false)

// Initialize modal animation composable
const modalAnimation = useModalAnimation({ duration: 300, backdropBlur: true })
const { shouldAnimate, getDuration } = useMotionPreference()

// Initialize focus trap (Requirements: 13.1, 13.4)
const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap({
  element: modalContentRef,
  active: isActive,
})

// Generate unique IDs for accessibility
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)
const descriptionId = computed(() => `modal-description-${Math.random().toString(36).substr(2, 9)}`)

const modalClasses = computed(() => {
  const baseClasses = [
    'modal-card'
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
    // Trigger close animation if elements are available
    if (modalContentRef.value && backdropRef.value) {
      modalAnimation.close(modalContentRef.value, backdropRef.value, () => {
        emit('update:modelValue', false)
        emit('close')
      })
    } else {
      emit('update:modelValue', false)
      emit('close')
    }
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

// Focus management (Requirements: 13.1, 13.4)
const setInitialFocus = async () => {
  await nextTick()
  if (modalContentRef.value) {
    const focusableElements = getFocusableElements(modalContentRef.value)
    focusableElements[0]?.focus()
  }
}

// Stagger animation for modal content
const animateModalContent = () => {
  if (!shouldAnimate.value || !modalContentRef.value) return
  
  const children = modalContentRef.value.querySelectorAll('[data-animate-child]')
  if (children.length === 0) return
  
  gsap.from(children, {
    opacity: 0,
    y: 10,
    duration: getDuration(animationConfig.duration.normal) / 1000,
    stagger: animationConfig.stagger.fast / 1000,
    ease: animationConfig.easing.easeOut,
  })
}

// Transition handlers
const onEnter = () => {
  emit('before-open')
  isActive.value = true
  document.body.style.overflow = 'hidden'
  
  // Activate focus trap
  activateFocusTrap()
  
  // Trigger modal animation
  if (modalContentRef.value && backdropRef.value) {
    modalAnimation.open(modalContentRef.value, backdropRef.value)
  }
}

const onAfterEnter = () => {
  emit('after-open')
  setInitialFocus()
  animateModalContent()
}

const onLeave = () => {
  emit('before-close')
  isActive.value = false
}

const onAfterLeave = () => {
  emit('after-close')
  document.body.style.overflow = ''
  
  // Deactivate focus trap (restores previous focus)
  deactivateFocusTrap()
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
  isActive.value = false
})
</script>

<style scoped>
/* Modal overlay - full screen container */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

@media (max-width: 767px) {
  .modal-overlay {
    padding: 0.5rem; /* Reduced padding on mobile */
  }
}

/* Close button with touch-friendly sizing (Requirements: 6.3) */
.modal-close-button {
  margin-left: 1rem;
  padding: 0.5rem;
  color: rgb(156, 163, 175); /* gray-400 */
  border-radius: 0.5rem;
  transition: all 150ms ease-in-out;
  min-width: 44px; /* Touch-friendly minimum */
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-button:hover {
  color: rgb(75, 85, 99); /* gray-600 */
  background-color: rgb(243, 244, 246); /* gray-100 */
}

@media (max-width: 767px) {
  .modal-close-button {
    margin-left: 0.5rem;
  }
}

/* Modal backdrop - dark overlay with smooth opacity transition */
.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Modal card - the white content box with ElevenLabs styling */
.modal-card {
  position: relative;
  z-index: 10;
  background: rgb(255, 255, 255);
  border-radius: 12px; /* 12px border radius per requirements */
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  padding: 32px; /* 32px padding using spacing scale */
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1); /* 300ms smooth fade-in */
}

/* Responsive modal adjustments for mobile (Requirements: 6.1, 6.2, 6.4) */
@media (max-width: 767px) {
  .modal-card {
    padding: 24px; /* Reduced padding on mobile */
    max-width: calc(100vw - 32px); /* Ensure modal fits on small screens */
    margin: 16px;
  }
}

.modal-header {
  @apply mb-4 flex-shrink-0;
}

@media (max-width: 767px) {
  .modal-header {
    @apply mb-3;
  }
}

.modal-content {
  @apply flex-1;
}

.modal-footer {
  @apply mt-6 flex-shrink-0;
  padding-top: 24px;
  border-top: 1px solid rgb(242, 242, 242);
}

@media (max-width: 767px) {
  .modal-footer {
    @apply mt-4;
    padding-top: 16px;
  }
}

/* Transition styles with 300ms duration and smooth easing */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-backdrop,
.modal-leave-active .modal-backdrop {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-backdrop,
.modal-leave-to .modal-backdrop {
  opacity: 0;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.modal-enter-to .modal-card,
.modal-leave-from .modal-card {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>