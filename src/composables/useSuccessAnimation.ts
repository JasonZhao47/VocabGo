/**
 * Success animation composable
 * Provides subtle celebration effects for successful actions
 */

import { ref } from 'vue'

export function useSuccessAnimation() {
  const isAnimating = ref(false)

  /**
   * Trigger a success animation
   * Returns a promise that resolves when animation completes
   */
  function triggerSuccess(duration = 1000): Promise<void> {
    return new Promise((resolve) => {
      isAnimating.value = true
      
      setTimeout(() => {
        isAnimating.value = false
        resolve()
      }, duration)
    })
  }

  return {
    isAnimating,
    triggerSuccess,
  }
}

/**
 * Create a checkmark animation element
 * Can be used to show success feedback
 */
export function createCheckmarkAnimation(container: HTMLElement) {
  const checkmark = document.createElement('div')
  checkmark.className = 'success-checkmark'
  checkmark.innerHTML = `
    <svg class="checkmark-icon" viewBox="0 0 52 52">
      <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
    </svg>
  `
  
  container.appendChild(checkmark)
  
  // Remove after animation
  setTimeout(() => {
    checkmark.remove()
  }, 1000)
}

/**
 * Add success animation styles to document
 * Call this once in your app initialization
 */
export function injectSuccessAnimationStyles() {
  if (document.getElementById('success-animation-styles')) {
    return // Already injected
  }

  const style = document.createElement('style')
  style.id = 'success-animation-styles'
  style.textContent = `
    .success-checkmark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      pointer-events: none;
      animation: successFadeIn 300ms ease-out;
    }

    .checkmark-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: block;
      stroke-width: 3;
      stroke: #10B981;
      stroke-miterlimit: 10;
      box-shadow: inset 0px 0px 0px #10B981;
      animation: successFill 0.4s ease-in-out 0.4s forwards, successScale 0.3s ease-in-out 0.9s both;
    }

    .checkmark-circle {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 3;
      stroke-miterlimit: 10;
      stroke: #10B981;
      fill: white;
      animation: successStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark-check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      stroke: #10B981;
      stroke-width: 3;
      animation: successStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes successStroke {
      100% {
        stroke-dashoffset: 0;
      }
    }

    @keyframes successScale {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: scale3d(1.1, 1.1, 1);
      }
    }

    @keyframes successFill {
      100% {
        box-shadow: inset 0px 0px 0px 30px #10B981;
      }
    }

    @keyframes successFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    /* Respect reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      .success-checkmark,
      .checkmark-icon,
      .checkmark-circle,
      .checkmark-check {
        animation: none;
      }
      
      .checkmark-circle {
        stroke-dashoffset: 0;
      }
      
      .checkmark-check {
        stroke-dashoffset: 0;
      }
    }
  `
  
  document.head.appendChild(style)
}
