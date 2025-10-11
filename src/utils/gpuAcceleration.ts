/**
 * GPU Acceleration Utilities
 * 
 * Manages will-change hints for animated elements to enable GPU acceleration.
 * Automatically adds and removes will-change to prevent memory issues.
 * 
 * Best practices:
 * - Only use will-change during animations
 * - Remove will-change after animations complete
 * - Use transform and opacity for GPU-accelerated properties
 */

/**
 * Properties that benefit from GPU acceleration
 */
export type GPUAcceleratedProperty = 'transform' | 'opacity' | 'filter';

/**
 * Applies will-change hint to an element for GPU acceleration
 * Should be called before starting an animation
 * 
 * @param element - The element to optimize
 * @param properties - CSS properties that will be animated
 * 
 * @example
 * ```ts
 * const el = document.querySelector('.animated');
 * applyWillChange(el, ['transform', 'opacity']);
 * // ... perform animation
 * removeWillChange(el);
 * ```
 */
export function applyWillChange(
  element: Element | null,
  properties: GPUAcceleratedProperty[] = ['transform', 'opacity']
): void {
  if (!element || !(element instanceof HTMLElement)) return;
  
  // Apply will-change hint
  element.style.willChange = properties.join(', ');
}

/**
 * Removes will-change hint from an element
 * Should be called after animation completes to free GPU resources
 * 
 * @param element - The element to clean up
 */
export function removeWillChange(element: Element | null): void {
  if (!element || !(element instanceof HTMLElement)) return;
  
  element.style.willChange = 'auto';
}

/**
 * Applies will-change to multiple elements
 * Useful for batch operations like stagger animations
 * 
 * @param elements - Array or NodeList of elements
 * @param properties - CSS properties that will be animated
 */
export function applyWillChangeToMultiple(
  elements: Element[] | NodeListOf<Element>,
  properties: GPUAcceleratedProperty[] = ['transform', 'opacity']
): void {
  Array.from(elements).forEach(el => applyWillChange(el, properties));
}

/**
 * Removes will-change from multiple elements
 * 
 * @param elements - Array or NodeList of elements
 */
export function removeWillChangeFromMultiple(
  elements: Element[] | NodeListOf<Element>
): void {
  Array.from(elements).forEach(el => removeWillChange(el));
}

/**
 * Wraps an animation function with automatic will-change management
 * Applies will-change before animation, removes after completion
 * 
 * @param element - The element to animate
 * @param properties - CSS properties that will be animated
 * @param animationFn - Function that performs the animation and returns a Promise
 * @returns Promise that resolves when animation completes
 * 
 * @example
 * ```ts
 * await withGPUAcceleration(
 *   element,
 *   ['transform', 'opacity'],
 *   async () => {
 *     await gsap.to(element, { x: 100, opacity: 0.5 });
 *   }
 * );
 * ```
 */
export async function withGPUAcceleration(
  element: Element | null,
  properties: GPUAcceleratedProperty[],
  animationFn: () => Promise<void> | void
): Promise<void> {
  if (!element) return;
  
  try {
    applyWillChange(element, properties);
    await animationFn();
  } finally {
    // Use setTimeout to ensure will-change is removed after paint
    setTimeout(() => removeWillChange(element), 0);
  }
}

/**
 * Forces GPU acceleration by applying a 3D transform
 * Use sparingly - prefer will-change for modern browsers
 * 
 * @param element - The element to force onto GPU
 */
export function forceGPUAcceleration(element: Element | null): void {
  if (!element || !(element instanceof HTMLElement)) return;
  
  // Apply translateZ(0) to force GPU layer
  element.style.transform = element.style.transform 
    ? `${element.style.transform} translateZ(0)`
    : 'translateZ(0)';
}

/**
 * Checks if an element is currently being animated
 * Useful to avoid applying will-change to already-optimized elements
 * 
 * @param element - The element to check
 * @returns true if element has will-change applied
 */
export function hasWillChange(element: Element | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;
  
  return element.style.willChange !== '' && element.style.willChange !== 'auto';
}

/**
 * Ensures all animations use GPU-accelerated properties
 * Validates that only transform, opacity, and filter are being animated
 * 
 * @param properties - Array of CSS properties being animated
 * @returns true if all properties are GPU-accelerated
 */
export function arePropertiesGPUAccelerated(properties: string[]): boolean {
  const gpuProps = ['transform', 'opacity', 'filter'];
  return properties.every(prop => gpuProps.includes(prop));
}
