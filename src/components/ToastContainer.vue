<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <TransitionGroup name="toast" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :ref="el => setToastRef(toast.id, el)"
        :class="['toast', `toast-${toast.type}`, {
          'toast-entering': toast.isEntering,
          'toast-leaving': toast.isLeaving
        }]"
        :role="toast.type === 'error' ? 'alert' : 'status'"
        :aria-label="`${toast.type} notification: ${toast.message}`"
        @click="removeToast(toast.id)"
      >
        <div class="toast-content">
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
        
        <!-- Progress bar for auto-dismiss -->
        <div v-if="toast.duration > 0" class="toast-progress-container">
          <div 
            class="toast-progress-bar"
            :class="`toast-progress-${toast.type}`"
            :style="{ width: `${toast.progress}%` }"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useToast } from '@/composables/useToast'
import { useMotionPreference } from '@/composables/useMotionPreference'
import { animationConfig } from '@/config/animations'
import gsap from 'gsap'

const { toasts, removeToast } = useToast()
const { shouldAnimate, getDuration } = useMotionPreference()

// Store refs to toast elements for GSAP animations
const toastRefs = ref<Map<string, HTMLElement>>(new Map())

function setToastRef(id: string, el: any) {
  if (el) {
    toastRefs.value.set(id, el as HTMLElement)
  } else {
    toastRefs.value.delete(id)
  }
}

// Slide-in animation from right
function onBeforeEnter(el: Element) {
  if (!shouldAnimate.value) return
  
  gsap.set(el, {
    opacity: 0,
    x: 100,
    scale: 0.95,
  })
}

function onEnter(el: Element, done: () => void) {
  if (!shouldAnimate.value) {
    done()
    return
  }
  
  gsap.to(el, {
    opacity: 1,
    x: 0,
    scale: 1,
    duration: getDuration(300) / 1000,
    ease: animationConfig.easing.spring,
    onComplete: done,
  })
}

// Slide-out animation to right
function onLeave(el: Element, done: () => void) {
  if (!shouldAnimate.value) {
    done()
    return
  }
  
  gsap.to(el, {
    opacity: 0,
    x: 100,
    scale: 0.9,
    duration: getDuration(250) / 1000,
    ease: animationConfig.easing.easeIn,
    onComplete: done,
  })
}

// Cleanup
onBeforeUnmount(() => {
  toastRefs.value.clear()
})
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
  position: relative;
  overflow: hidden;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  pointer-events: auto;
  cursor: pointer;
  border-left: 4px solid;
  will-change: transform, opacity;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  transition: transform 0.15s ease;
}

.toast:hover .toast-content {
  transform: translateX(-4px);
}

.toast:hover {
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
  transition: all 0.15s ease;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.toast-close:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Progress bar container */
.toast-progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  transition: width 0.016s linear; /* ~60fps */
  will-change: width;
}

.toast-progress-success {
  background-color: #10b981;
}

.toast-progress-error {
  background-color: #ef4444;
}

.toast-progress-info {
  background-color: #3b82f6;
}

/* Smooth position transitions for stacking */
.toast-move {
  transition: transform 0.2s cubic-bezier(0, 0, 0.2, 1);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .toast,
  .toast-content,
  .toast-close,
  .toast-move {
    transition: none;
  }
  
  .toast-progress-bar {
    transition: none;
  }
}

@media (max-width: 640px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
  
  .toast-content {
    padding: 0.75rem;
  }
  
  .toast-message {
    font-size: 0.8125rem;
  }
}
</style>
