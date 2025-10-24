<template>
  <component
    :is="tag"
    ref="buttonRef"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled || loading"
    :aria-label="ariaLabel"
    :class="buttonClasses"
    v-bind="$attrs"
    @click="handleClick"
  >
    <!-- Ripple effect container -->
    <span
      v-if="ripple && rippleActive"
      :style="rippleStyle"
      class="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
    />
    
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-5 w-5 relative z-10"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    
    <!-- Icon (left) -->
    <span v-if="$slots.icon" class="mr-2 relative z-10">
      <slot name="icon" />
    </span>
    
    <!-- Button text -->
    <span class="relative z-10">
      <slot />
    </span>
    
    <!-- Icon (right) -->
    <span v-if="$slots.iconRight" class="ml-2 relative z-10">
      <slot name="iconRight" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  tag?: 'button' | 'a'
  type?: 'button' | 'submit' | 'reset'
  ripple?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  tag: 'button',
  type: 'button',
  ripple: false,
})

const buttonRef = ref<HTMLElement | null>(null)
const rippleActive = ref(false)
const rippleStyle = ref({})

const handleClick = (event: MouseEvent) => {
  if (props.ripple && !props.disabled && !props.loading && buttonRef.value) {
    const button = buttonRef.value
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    rippleStyle.value = {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
    }
    
    rippleActive.value = true
    
    setTimeout(() => {
      rippleActive.value = false
    }, 300)
  }
}

const buttonClasses = computed(() => {
  const classes: string[] = []
  
  // Base styles - inline flex, items center, justify center
  classes.push('inline-flex', 'items-center', 'justify-center')
  
  // Position relative for ripple effect
  classes.push('relative', 'overflow-hidden')
  
  // Font styling - 14px font size, normal weight
  classes.push('text-sm', 'font-normal')
  
  // Border radius - full rounded (9999px)
  classes.push('rounded-full')
  
  // Transitions - optimized for GPU acceleration (transform + opacity only)
  classes.push('transition-transform-opacity', 'duration-200', 'ease-in-out')
  
  // Micro-interactions - subtle scale on hover with will-change hint
  if (!props.disabled && !props.loading) {
    classes.push('hover:scale-[1.02]', 'hover:will-change-transform')
  }
  
  // Focus visible styles
  classes.push('focus-visible:outline-2', 'focus-visible:outline-offset-2')
  
  // Disabled state
  classes.push('disabled:opacity-50', 'disabled:cursor-not-allowed')
  
  // Variant-specific styles
  switch (props.variant) {
    case 'primary':
      classes.push('bg-black', 'text-white')
      if (!props.disabled && !props.loading) {
        classes.push('hover:opacity-90', 'active:opacity-80', 'active:scale-[0.98]')
      }
      classes.push('focus-visible:outline-black')
      break
    case 'secondary':
      classes.push('bg-[rgb(242,242,242)]', 'text-black')
      if (!props.disabled && !props.loading) {
        classes.push('hover:bg-[rgb(229,229,229)]', 'active:bg-[rgb(212,212,212)]', 'active:scale-[0.98]')
      }
      classes.push('focus-visible:outline-black')
      break
    case 'ghost':
      classes.push('bg-transparent', 'text-black')
      if (!props.disabled && !props.loading) {
        classes.push('hover:bg-[rgb(242,242,242)]', 'active:bg-[rgb(229,229,229)]', 'active:scale-[0.98]')
      }
      classes.push('focus-visible:outline-black')
      break
    case 'destructive':
      classes.push('bg-[rgb(239,68,68)]', 'text-white')
      if (!props.disabled && !props.loading) {
        classes.push('hover:opacity-90', 'active:opacity-80', 'active:scale-[0.98]')
      }
      classes.push('focus-visible:outline-[rgb(239,68,68)]')
      break
  }
  
  // Size-specific styles
  switch (props.size) {
    case 'sm':
      classes.push('px-3', 'py-1.5', 'h-8')
      break
    case 'md':
      classes.push('px-4', 'py-2', 'h-10')
      break
    case 'lg':
      classes.push('px-6', 'py-3', 'h-12')
      break
  }
  
  // Full width
  if (props.fullWidth) {
    classes.push('w-full')
  }
  
  return classes.join(' ')
})
</script>
