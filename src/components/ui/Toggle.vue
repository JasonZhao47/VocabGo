<template>
  <button
    ref="toggleRef"
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :class="toggleClasses"
    @click="handleToggle"
  >
    <!-- Background track -->
    <span class="toggle-track" :class="trackClasses">
      <!-- Toggle thumb -->
      <span class="toggle-thumb" :class="thumbClasses" />
    </span>
    
    <!-- Optional label -->
    <span v-if="label" class="toggle-label">
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import gsap from 'gsap'
import { animationConfig } from '@/config/animations'
import { useMotionPreference } from '@/composables/useMotionPreference'

interface Props {
  modelValue: boolean
  label?: string
  ariaLabel?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggleRef = ref<HTMLElement | null>(null)
const { shouldAnimate, getDuration } = useMotionPreference()

// Handle toggle click
const handleToggle = () => {
  if (props.disabled) return
  
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  
  // Add haptic feedback animation
  if (shouldAnimate.value && toggleRef.value) {
    gsap.to(toggleRef.value, {
      scale: 0.95,
      duration: getDuration(animationConfig.duration.fast) / 1000,
      ease: animationConfig.easing.easeOut,
      yoyo: true,
      repeat: 1
    })
  }
}

// Watch for value changes to animate thumb position
watch(() => props.modelValue, (newValue) => {
  if (!shouldAnimate.value || !toggleRef.value) return
  
  const thumb = toggleRef.value.querySelector('.toggle-thumb') as HTMLElement
  if (!thumb) return
  
  // Animate thumb position
  const translateX = newValue ? '100%' : '0%'
  gsap.to(thumb, {
    x: translateX,
    duration: getDuration(animationConfig.duration.normal) / 1000,
    ease: animationConfig.easing.spring
  })
})

const toggleClasses = computed(() => {
  const classes = [
    'inline-flex',
    'items-center',
    'gap-3',
    'cursor-pointer',
    'select-none',
    'theme-transition'
  ]
  
  if (props.disabled) {
    classes.push('opacity-50', 'cursor-not-allowed')
  }
  
  return classes
})

const trackClasses = computed(() => {
  const classes = [
    'relative',
    'inline-flex',
    'items-center',
    'rounded-full',
    'transition-colors',
    'duration-300',
    'ease-out'
  ]
  
  // Size classes
  const sizeClasses = {
    sm: ['w-8', 'h-5'],
    md: ['w-11', 'h-6'],
    lg: ['w-14', 'h-7']
  }
  
  classes.push(...sizeClasses[props.size])
  
  // Color classes based on state
  if (props.modelValue) {
    classes.push('bg-black')
  } else {
    classes.push('bg-gray-200')
  }
  
  if (props.disabled) {
    classes.push('opacity-50')
  }
  
  return classes
})

const thumbClasses = computed(() => {
  const classes = [
    'absolute',
    'bg-white',
    'rounded-full',
    'shadow-sm',
    'transition-transform',
    'duration-300',
    'ease-spring'
  ]
  
  // Size classes
  const sizeClasses = {
    sm: ['w-4', 'h-4', 'left-0.5'],
    md: ['w-5', 'h-5', 'left-0.5'],
    lg: ['w-6', 'h-6', 'left-0.5']
  }
  
  classes.push(...sizeClasses[props.size])
  
  // Position based on state
  if (props.modelValue) {
    classes.push('translate-x-full')
  }
  
  return classes
})
</script>

<style scoped>
.toggle-track {
  flex-shrink: 0;
}

.toggle-thumb {
  will-change: transform;
}

.toggle-label {
  @apply text-sm font-medium text-gray-700;
}

/* Hover effect for track */
.toggle-track:hover {
  @apply ring-2 ring-offset-2 ring-gray-300;
}

button:disabled .toggle-track:hover {
  @apply ring-0;
}

/* Focus visible state */
button:focus-visible .toggle-track {
  @apply ring-2 ring-offset-2 ring-black;
}
</style>
