<template>
  <div
    ref="wrapperRef"
    class="tooltip-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Trigger element -->
    <slot />
    
    <!-- Tooltip content -->
    <Teleport to="body">
      <div
        v-if="isVisible"
        ref="tooltipRef"
        :class="tooltipClasses"
        :style="tooltipStyles"
        role="tooltip"
        :aria-hidden="!isVisible"
      >
        <div class="tooltip-content">
          <slot name="content">
            {{ content }}
          </slot>
        </div>
        
        <!-- Arrow -->
        <div v-if="showArrow" class="tooltip-arrow" :class="arrowClasses" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { animationConfig } from '@/config/animations'
import { useMotionPreference } from '@/composables/useMotionPreference'

interface Props {
  content?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  showArrow?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: 200,
  showArrow: true,
  disabled: false
})

const wrapperRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const tooltipStyles = ref<Record<string, string>>({})
let showTimeout: ReturnType<typeof setTimeout> | null = null

const { shouldAnimate, getDuration } = useMotionPreference()

// Handle mouse enter
const handleMouseEnter = () => {
  if (props.disabled) return
  
  showTimeout = setTimeout(() => {
    show()
  }, props.delay)
}

// Handle mouse leave
const handleMouseLeave = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  hide()
}

// Handle focus (for keyboard navigation)
const handleFocus = () => {
  if (props.disabled) return
  show()
}

// Handle blur
const handleBlur = () => {
  hide()
}

// Show tooltip
const show = async () => {
  isVisible.value = true
  
  await nextTick()
  
  if (!tooltipRef.value || !wrapperRef.value) return
  
  // Calculate position
  calculatePosition()
  
  // Animate in
  if (shouldAnimate.value) {
    const { x, y } = getAnimationOffset()
    
    gsap.fromTo(
      tooltipRef.value,
      {
        opacity: 0,
        scale: 0.95,
        x,
        y
      },
      {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        duration: getDuration(animationConfig.duration.fast) / 1000,
        ease: animationConfig.easing.easeOut
      }
    )
  } else {
    gsap.set(tooltipRef.value, { opacity: 1, scale: 1 })
  }
}

// Hide tooltip
const hide = () => {
  if (!tooltipRef.value) {
    isVisible.value = false
    return
  }
  
  if (shouldAnimate.value) {
    const { x, y } = getAnimationOffset()
    
    gsap.to(tooltipRef.value, {
      opacity: 0,
      scale: 0.95,
      x,
      y,
      duration: getDuration(animationConfig.duration.fast) / 1000,
      ease: animationConfig.easing.easeIn,
      onComplete: () => {
        isVisible.value = false
      }
    })
  } else {
    isVisible.value = false
  }
}

// Calculate tooltip position
const calculatePosition = () => {
  if (!tooltipRef.value || !wrapperRef.value) return
  
  const wrapperRect = wrapperRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  
  const spacing = 8 // Gap between trigger and tooltip
  let top = 0
  let left = 0
  
  switch (props.position) {
    case 'top':
      top = wrapperRect.top - tooltipRect.height - spacing
      left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = wrapperRect.bottom + spacing
      left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = wrapperRect.top + (wrapperRect.height - tooltipRect.height) / 2
      left = wrapperRect.left - tooltipRect.width - spacing
      break
    case 'right':
      top = wrapperRect.top + (wrapperRect.height - tooltipRect.height) / 2
      left = wrapperRect.right + spacing
      break
  }
  
  // Keep tooltip within viewport
  const padding = 8
  top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))
  left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))
  
  tooltipStyles.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

// Get animation offset based on position
const getAnimationOffset = () => {
  const offset = 8
  
  switch (props.position) {
    case 'top':
      return { x: 0, y: offset }
    case 'bottom':
      return { x: 0, y: -offset }
    case 'left':
      return { x: offset, y: 0 }
    case 'right':
      return { x: -offset, y: 0 }
    default:
      return { x: 0, y: 0 }
  }
}

const tooltipClasses = computed(() => {
  return [
    'tooltip',
    'fixed',
    'z-tooltip',
    'px-3',
    'py-2',
    'bg-gray-900',
    'text-white',
    'text-sm',
    'rounded-lg',
    'shadow-lg',
    'pointer-events-none',
    'max-w-xs'
  ]
})

const arrowClasses = computed(() => {
  const classes = ['absolute']
  
  switch (props.position) {
    case 'top':
      classes.push('bottom-[-4px]', 'left-1/2', '-translate-x-1/2', 'border-t-gray-900')
      break
    case 'bottom':
      classes.push('top-[-4px]', 'left-1/2', '-translate-x-1/2', 'border-b-gray-900')
      break
    case 'left':
      classes.push('right-[-4px]', 'top-1/2', '-translate-y-1/2', 'border-l-gray-900')
      break
    case 'right':
      classes.push('left-[-4px]', 'top-1/2', '-translate-y-1/2', 'border-r-gray-900')
      break
  }
  
  return classes
})

// Clean up on unmount
watch(() => isVisible.value, (visible) => {
  if (!visible && showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
})
</script>

<style scoped>
.tooltip-wrapper {
  @apply inline-block;
}

.tooltip {
  will-change: opacity, transform;
}

.tooltip-content {
  @apply relative z-10;
}

.tooltip-arrow {
  @apply w-0 h-0;
  border-style: solid;
  border-width: 4px;
  border-color: transparent;
}
</style>
