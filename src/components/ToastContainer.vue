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
/* ElevenLabs-styled Toast Container */
.toast-container {
  position: fixed;
  top: 24px; /* 3 spacing units */
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 2 spacing units */
  max-width: 400px;
  pointer-events: none;
}

.toast {
  position: relative;
  overflow: hidden;
  background-color: rgb(255, 255, 255);
  border-radius: 8px; /* ElevenLabs sm border radius */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* ElevenLabs md shadow */
  pointer-events: auto;
  cursor: pointer;
  border: 1px solid rgb(229, 229, 229); /* gray-300 */
  will-change: transform, opacity;
  transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1); /* ElevenLabs normal transition */
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 16px; /* 2 spacing units */
  padding: 16px; /* 2 spacing units */
}

.toast:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); /* ElevenLabs lg shadow */
}

/* Success variant - subtle green accent */
.toast-success {
  border-left: 3px solid rgb(34, 197, 94); /* green-500 */
}

/* Error variant - subtle red accent */
.toast-error {
  border-left: 3px solid rgb(239, 68, 68); /* red-500 */
}

/* Info variant - subtle black accent */
.toast-info {
  border-left: 3px solid rgb(0, 0, 0); /* black */
}

.toast-icon {
  flex-shrink: 0;
}

.toast-success .icon {
  color: rgb(34, 197, 94); /* green-500 */
}

.toast-error .icon {
  color: rgb(239, 68, 68); /* red-500 */
}

.toast-info .icon {
  color: rgb(0, 0, 0); /* black */
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.toast-message {
  flex: 1;
  font-size: 14px; /* ElevenLabs sm font size */
  line-height: 1.4; /* ElevenLabs normal line height */
  color: rgb(0, 0, 0); /* black */
  font-weight: 400; /* normal */
}

.toast-close {
  flex-shrink: 0;
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: rgb(115, 115, 115); /* gray-500 */
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1); /* ElevenLabs fast transition */
}

.toast-close:hover {
  background-color: rgb(242, 242, 242); /* gray-200 */
  color: rgb(0, 0, 0); /* black */
}

.toast-close:focus-visible {
  outline: 2px solid rgb(0, 0, 0);
  outline-offset: 2px;
}

/* Progress bar container */
.toast-progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: rgb(242, 242, 242); /* gray-200 */
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  transition: width 0.016s linear; /* ~60fps */
  will-change: width;
}

.toast-progress-success {
  background-color: rgb(34, 197, 94); /* green-500 */
}

.toast-progress-error {
  background-color: rgb(239, 68, 68); /* red-500 */
}

.toast-progress-info {
  background-color: rgb(0, 0, 0); /* black */
}

/* Smooth position transitions for stacking */
.toast-move {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1); /* ElevenLabs normal transition */
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

/* Mobile responsive */
@media (max-width: 768px) {
  .toast-container {
    left: 16px; /* 2 spacing units */
    right: 16px;
    top: 16px;
    max-width: none;
  }
  
  .toast-content {
    padding: 12px; /* 1.5 spacing units */
    gap: 12px;
  }
  
  .toast-message {
    font-size: 14px; /* Keep same size on mobile */
  }
}
</style>
