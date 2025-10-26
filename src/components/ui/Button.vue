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
  
  // Font styling - ElevenLabs: 13px font size, medium weight (500), 20px line height
  classes.push('text-[13px]', 'font-medium', 'leading-[20px]')
  
  // Border radius - ElevenLabs: 8px
  classes.push('rounded-lg')
  
  // Transitions - ElevenLabs: 75ms duration, no scale transforms
  classes.push('transition-all', 'duration-75', 'ease-in-out')
  
  // No scale transforms on hover (ElevenLabs style)
  // Only opacity and color transitions
  
  // Focus visible styles
  classes.push('focus-visible:outline-2', 'focus-visible:outline-offset-2')
  
  // Disabled state - cursor only (opacity handled per variant)
  classes.push('disabled:cursor-not-allowed')
  
  // Variant-specific styles - ElevenLabs colors
  switch (props.variant) {
    case 'primary':
      classes.push('bg-black', 'text-white')
      if (!props.disabled && !props.loading) {
        classes.push('hover:bg-gray-800')
      } else {
        classes.push('disabled:opacity-50')
      }
      classes.push('focus-visible:outline-black')
      break
    case 'secondary':
      // ElevenLabs: white background with black border
      classes.push('bg-white', 'text-black', 'border', 'border-solid', 'border-black')
      if (!props.disabled && !props.loading) {
        classes.push('hover:bg-gray-50')
      } else {
        // Keep border visible, only reduce text opacity
        classes.push('disabled:opacity-50', 'disabled:border-gray-300')
      }
      classes.push('focus-visible:outline-black')
      break
    case 'ghost':
      // ElevenLabs: transparent background, no border
      classes.push('bg-transparent', 'text-[rgb(15,15,16)]')
      if (!props.disabled && !props.loading) {
        classes.push('hover:bg-gray-100')
      } else {
        classes.push('disabled:opacity-50')
      }
      classes.push('focus-visible:outline-black')
      break
    case 'destructive':
      classes.push('bg-red-600', 'text-white')
      if (!props.disabled && !props.loading) {
        classes.push('hover:bg-red-700')
      } else {
        classes.push('disabled:opacity-50')
      }
      classes.push('focus-visible:outline-red-600')
      break
  }
  
  // Size-specific styles - ElevenLabs specifications
  switch (props.size) {
    case 'sm':
      // 32px height, 10px horizontal padding
      classes.push('h-8', 'px-[10px]')
      break
    case 'md':
      // 36px height, 12px horizontal padding
      classes.push('h-9', 'px-3')
      break
    case 'lg':
      // 40px height, 16px horizontal padding
      classes.push('h-10', 'px-4')
      break
  }
  
  // Full width
  if (props.fullWidth) {
    classes.push('w-full')
  }
  
  return classes.join(' ')
})
</script>
