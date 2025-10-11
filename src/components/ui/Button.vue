<template>
  <component
    :is="tag"
    ref="buttonRef"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled || loading"
    :class="buttonClasses"
    v-bind="$attrs"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-5 w-5"
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
    <span v-if="$slots.icon" class="mr-2">
      <slot name="icon" />
    </span>
    
    <!-- Button text -->
    <slot />
    
    <!-- Icon (right) -->
    <span v-if="$slots.iconRight" class="ml-2">
      <slot name="iconRight" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useInteractiveAnimation } from '@/composables/useInteractiveAnimation'
import { animationConfig } from '@/config/animations'
import gsap from 'gsap'
import { useMotionPreference } from '@/composables/useMotionPreference'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  tag?: 'button' | 'a'
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  tag: 'button',
  type: 'button',
})

const buttonRef = ref<HTMLElement | null>(null)
const { getDuration } = useMotionPreference()

// Apply interactive animations only when not disabled or loading
const shouldApplyAnimation = computed(() => !props.disabled && !props.loading)

// Initialize interactive animation
const { isHovered, isActive } = useInteractiveAnimation(buttonRef, {
  hoverScale: animationConfig.scale.hover,
  activeScale: animationConfig.scale.active,
  duration: animationConfig.duration.fast,
})

// Handle disabled state opacity transition
watch(() => props.disabled, (isDisabled) => {
  if (!buttonRef.value) return
  
  gsap.to(buttonRef.value, {
    opacity: isDisabled ? 0.5 : 1,
    duration: getDuration(animationConfig.duration.normal) / 1000,
    ease: animationConfig.easing.easeOut,
  })
})

// Handle loading state - reset scale when loading starts
watch(() => props.loading, (isLoading) => {
  if (!buttonRef.value) return
  
  if (isLoading) {
    gsap.to(buttonRef.value, {
      scale: 1,
      duration: getDuration(animationConfig.duration.fast) / 1000,
      ease: animationConfig.easing.easeOut,
    })
  }
})

const buttonClasses = computed(() => {
  const classes = []
  
  // Base button class
  classes.push('btn')
  
  // Variant classes
  switch (props.variant) {
    case 'primary':
      classes.push('btn-primary')
      break
    case 'secondary':
      classes.push('btn-secondary')
      break
    case 'ghost':
      classes.push('btn-ghost')
      break
    case 'destructive':
      classes.push('btn-destructive')
      break
  }
  
  // Size classes
  if (props.size === 'lg' && props.variant === 'primary') {
    classes.push('btn-primary-lg')
  }
  
  // Full width
  if (props.fullWidth) {
    classes.push('w-full')
  }
  
  // Add transition class for smooth state changes
  classes.push('transition-opacity')
  
  // Add theme transition class for color changes
  classes.push('theme-transition')
  
  return classes.join(' ')
})
</script>
