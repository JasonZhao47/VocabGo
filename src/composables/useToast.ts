/**
 * useToast Composable
 * 
 * Provides toast notification functionality for success and error messages.
 */

import { reactive, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
}

interface ToastState {
  toasts: Toast[]
}

const state = reactive<ToastState>({
  toasts: [],
})

let toastIdCounter = 0

/**
 * Shows a toast notification
 */
function showToast(message: string, type: ToastType = 'info', duration: number = 3000): string {
  const id = `toast-${++toastIdCounter}`
  
  const toast: Toast = {
    id,
    type,
    message,
    duration,
  }
  
  state.toasts.push(toast)
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  
  return id
}

/**
 * Removes a toast by ID
 */
function removeToast(id: string): void {
  const index = state.toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    state.toasts.splice(index, 1)
  }
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
 * Clears all toasts
 */
function clearAll(): void {
  state.toasts = []
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
