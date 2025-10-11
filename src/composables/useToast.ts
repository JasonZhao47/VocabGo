/**
 * useToast Composable
 * 
 * Provides toast notification functionality with smooth animations.
 * Supports slide-in/out animations, stacking transitions, and progress bars.
 */

import { reactive, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
  progress?: number // Progress percentage for auto-dismiss animation (0-100)
  isEntering?: boolean // Animation state flag
  isLeaving?: boolean // Animation state flag
}

interface ToastState {
  toasts: Toast[]
}

const state = reactive<ToastState>({
  toasts: [],
})

let toastIdCounter = 0
const progressIntervals = new Map<string, ReturnType<typeof setInterval>>()

/**
 * Shows a toast notification with slide-in animation
 */
function showToast(message: string, type: ToastType = 'info', duration: number = 3000): string {
  const id = `toast-${++toastIdCounter}`
  
  const toast: Toast = {
    id,
    type,
    message,
    duration,
    progress: 100, // Start at 100% for countdown
    isEntering: true,
    isLeaving: false,
  }
  
  state.toasts.push(toast)
  
  // Clear entering state after animation completes (300ms slide-in)
  setTimeout(() => {
    const toastItem = state.toasts.find(t => t.id === id)
    if (toastItem) {
      toastItem.isEntering = false
    }
  }, 300)
  
  // Auto-remove after duration with progress bar animation
  if (duration > 0) {
    // Animate progress bar
    const startTime = Date.now()
    const interval = setInterval(() => {
      const toastItem = state.toasts.find(t => t.id === id)
      if (!toastItem) {
        clearInterval(interval)
        progressIntervals.delete(id)
        return
      }
      
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      toastItem.progress = (remaining / duration) * 100
      
      if (remaining === 0) {
        clearInterval(interval)
        progressIntervals.delete(id)
      }
    }, 16) // ~60fps
    
    progressIntervals.set(id, interval)
    
    // Trigger removal
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  
  return id
}

/**
 * Removes a toast by ID with slide-out animation
 */
function removeToast(id: string): void {
  const toast = state.toasts.find(t => t.id === id)
  if (!toast) return
  
  // Clear progress interval if exists
  const interval = progressIntervals.get(id)
  if (interval) {
    clearInterval(interval)
    progressIntervals.delete(id)
  }
  
  // Trigger leaving animation
  toast.isLeaving = true
  
  // Remove from DOM after animation completes (250ms slide-out)
  setTimeout(() => {
    const index = state.toasts.findIndex(t => t.id === id)
    if (index !== -1) {
      state.toasts.splice(index, 1)
    }
  }, 250)
}

/**
 * Shows a success toast
 */
function success(message: string, duration: number = 3000): string {
  return showToast(message, 'success', duration)
}

/**
 * Shows an error toast
 */
function error(message: string, duration: number = 5000): string {
  return showToast(message, 'error', duration)
}

/**
 * Shows an info toast
 */
function info(message: string, duration: number = 3000): string {
  return showToast(message, 'info', duration)
}

/**
 * Clears all toasts with animations
 */
function clearAll(): void {
  // Clear all progress intervals
  progressIntervals.forEach((interval) => clearInterval(interval))
  progressIntervals.clear()
  
  // Trigger leaving animation for all toasts
  state.toasts.forEach(toast => {
    toast.isLeaving = true
  })
  
  // Clear after animation completes
  setTimeout(() => {
    state.toasts = []
  }, 250)
}

export function useToast() {
  return {
    toasts: readonly(state.toasts),
    showToast,
    removeToast,
    success,
    error,
    info,
    clearAll,
  }
}
