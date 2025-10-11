import { defineAsyncComponent, type Component } from 'vue'

/**
 * Lazy load a component with loading and error states
 * @param loader - Function that returns a promise resolving to the component
 * @param options - Optional configuration for loading/error states
 */
export function lazyLoadComponent(
  loader: () => Promise<Component>,
  options?: {
    loadingComponent?: Component
    errorComponent?: Component
    delay?: number
    timeout?: number
  }
) {
  return defineAsyncComponent({
    loader,
    loadingComponent: options?.loadingComponent,
    errorComponent: options?.errorComponent,
    delay: options?.delay ?? 200, // Show loading after 200ms
    timeout: options?.timeout ?? 10000, // Timeout after 10s
  })
}

/**
 * Preload a component to improve perceived performance
 * @param loader - Function that returns a promise resolving to the component
 */
export function preloadComponent(loader: () => Promise<Component>) {
  // Trigger the import but don't wait for it
  loader().catch(() => {
    // Silently fail - component will be loaded when actually needed
  })
}

/**
 * Lazy load an image with optional placeholder
 * @param src - Image source URL
 * @param placeholder - Optional placeholder image
 */
export function lazyLoadImage(src: string, placeholder?: string) {
  return {
    src: placeholder || '',
    dataSrc: src,
    loading: 'lazy' as const,
  }
}
