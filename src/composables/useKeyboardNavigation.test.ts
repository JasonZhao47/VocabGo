import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import {
  getFocusableElements,
  useFocusTrap,
  useKeyboardNavigation,
  useRovingTabindex,
  useSkipLink,
} from './useKeyboardNavigation'

describe('useKeyboardNavigation', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('getFocusableElements', () => {
    it('should find all focusable elements', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
        <button disabled>Disabled</button>
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Non-focusable div</div>
      `

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(4) // button, link, input, focusable div
    })

    it('should return empty array for container with no focusable elements', () => {
      container.innerHTML = '<div>No focusable elements</div>'
      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(0)
    })
  })

  describe('useFocusTrap', () => {
    it('should trap focus within element', async () => {
      container.innerHTML = `
        <div id="trap">
          <button id="first">First</button>
          <button id="last">Last</button>
        </div>
      `

      const trapElement = container.querySelector('#trap') as HTMLElement
      const elementRef = ref(trapElement)
      const activeRef = ref(true)

      const { activate, deactivate } = useFocusTrap({
        element: elementRef,
        active: activeRef,
      })

      activate()
      await nextTick()

      const firstButton = document.getElementById('first')
      const lastButton = document.getElementById('last')

      // Focus should be on first element
      expect(document.activeElement).toBe(firstButton)

      // Tab from last should go to first
      lastButton?.focus()
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      document.dispatchEvent(tabEvent)
      await nextTick()

      deactivate()
    })
  })

  describe('useKeyboardNavigation', () => {
    it('should handle arrow key navigation', () => {
      const items = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ]

      items.forEach(item => container.appendChild(item))

      const { currentIndex, handleKeyDown } = useKeyboardNavigation({
        enableArrowKeys: true,
      })

      // Arrow down
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      handleKeyDown(downEvent, items)
      expect(currentIndex.value).toBe(1)

      // Arrow up
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      handleKeyDown(upEvent, items)
      expect(currentIndex.value).toBe(0)
    })

    it('should handle home and end keys', () => {
      const items = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ]

      items.forEach(item => container.appendChild(item))

      const { currentIndex, handleKeyDown } = useKeyboardNavigation({
        enableHomeEnd: true,
      })

      // End key
      const endEvent = new KeyboardEvent('keydown', { key: 'End' })
      handleKeyDown(endEvent, items)
      expect(currentIndex.value).toBe(2)

      // Home key
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' })
      handleKeyDown(homeEvent, items)
      expect(currentIndex.value).toBe(0)
    })

    it('should call escape callback', () => {
      const onEscape = vi.fn()
      const { handleKeyDown } = useKeyboardNavigation({
        enableEscape: true,
        onEscape,
      })

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      handleKeyDown(escapeEvent, [])
      expect(onEscape).toHaveBeenCalled()
    })
  })

  describe('useSkipLink', () => {
    it('should skip to target element', async () => {
      container.innerHTML = '<div id="target">Target content</div>'
      const target = document.getElementById('target')

      const { skipToElement } = useSkipLink()
      skipToElement('target')

      await nextTick()
      expect(document.activeElement).toBe(target)
    })

    it('should add temporary tabindex if needed', async () => {
      container.innerHTML = '<div id="target">Target content</div>'
      const target = document.getElementById('target')

      const { skipToElement } = useSkipLink()
      skipToElement('target')

      await nextTick()
      expect(target?.getAttribute('tabindex')).toBe('-1')
    })
  })

  describe('useRovingTabindex', () => {
    it('should manage tabindex for items', async () => {
      container.innerHTML = `
        <div id="container">
          <button>Item 1</button>
          <button>Item 2</button>
          <button>Item 3</button>
        </div>
      `

      const containerRef = ref(container.querySelector('#container') as HTMLElement)
      const { focusItem, updateTabindices } = useRovingTabindex(containerRef)

      await nextTick()

      const items = getFocusableElements(containerRef.value!)
      updateTabindices(items)

      // First item should have tabindex 0
      expect(items[0].getAttribute('tabindex')).toBe('0')
      expect(items[1].getAttribute('tabindex')).toBe('-1')
      expect(items[2].getAttribute('tabindex')).toBe('-1')

      // Focus second item
      focusItem(1)
      await nextTick()

      expect(items[0].getAttribute('tabindex')).toBe('-1')
      expect(items[1].getAttribute('tabindex')).toBe('0')
      expect(items[2].getAttribute('tabindex')).toBe('-1')
    })
  })
})
