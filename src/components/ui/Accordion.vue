<template>
  <div class="accordion" :class="accordionClasses">
    <button
      ref="triggerRef"
      type="button"
      :aria-expanded="isOpen"
      :aria-controls="contentId"
      :disabled="disabled"
      class="accordion-trigger"
      :class="triggerClasses"
      @click="toggle"
    >
      <!-- Header content -->
      <div class="accordion-header">
        <slot name="header">
          {{ title }}
        </slot>
      </div>
      
      <!-- Expand icon -->
      <div class="accordion-icon" :class="iconClasses">
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>
    
    <!-- Content panel -->
    <div
      :id="contentId"
      ref="contentRef"
      class="accordion-content"
      :class="contentClasses"
      :aria-hidden="!isOpen"
    >
      <div ref="innerContentRef" class="accordion-content-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import { animationConfig } from '@/config/animations'
import { useMotionPreference } from '@/composables/useMotionPreference'

interface Props {
  title?: string
  modelValue?: boolean
  disabled?: boolean
  variant?: 'default' | 'bordered' | 'filled'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  variant: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'close': []
}>()

const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const innerContentRef = ref<HTMLElement | null>(null)
const isOpen = ref(props.modelValue)
const contentId = `accordion-content-${Math.random().toString(36).substr(2, 9)}`

const { shouldAnimate, getDuration } = useMotionPreference()

// Toggle accordion
const toggle = () => {
  if (props.disabled) return
  
  const newValue = !isOpen.value
  isOpen.value = newValue
  emit('update:modelValue', newValue)
  
  if (newValue) {
    emit('open')
    animateOpen()
  } else {
    emit('close')
    animateClose()
  }
}

// Animate accordion open
const animateOpen = async () => {
  if (!contentRef.value || !innerContentRef.value) return
  
  await nextTick()
  
  const content = contentRef.value
  const innerContent = innerContentRef.value
  const height = innerContent.scrollHeight
  
  if (shouldAnimate.value) {
    gsap.fromTo(
      content,
      {
        height: 0,
        opacity: 0
      },
      {
        height,
        opacity: 1,
        duration: getDuration(animationConfig.duration.normal) / 1000,
        ease: animationConfig.easing.easeOut,
        onComplete: () => {
          // Set to auto after animation for dynamic content
          gsap.set(content, { height: 'auto' })
        }
      }
    )
  } else {
    gsap.set(content, { height: 'auto', opacity: 1 })
  }
}

// Animate accordion close
const animateClose = () => {
  if (!contentRef.value) return
  
  const content = contentRef.value
  const currentHeight = content.scrollHeight
  
  if (shouldAnimate.value) {
    gsap.fromTo(
      content,
      {
        height: currentHeight,
        opacity: 1
      },
      {
        height: 0,
        opacity: 0,
        duration: getDuration(animationConfig.duration.normal) / 1000,
        ease: animationConfig.easing.easeIn
      }
    )
  } else {
    gsap.set(content, { height: 0, opacity: 0 })
  }
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== isOpen.value) {
    isOpen.value = newValue
    if (newValue) {
      animateOpen()
    } else {
      animateClose()
    }
  }
})

// Initialize state on mount
onMounted(() => {
  if (isOpen.value) {
    animateOpen()
  }
})

const accordionClasses = computed(() => {
  const classes = ['theme-transition']
  
  // Variant classes
  if (props.variant === 'bordered') {
    classes.push('border', 'border-gray-200', 'rounded-lg')
  } else if (props.variant === 'filled') {
    classes.push('bg-gray-50', 'rounded-lg')
  }
  
  return classes
})

const triggerClasses = computed(() => {
  const classes = [
    'w-full',
    'flex',
    'items-center',
    'justify-between',
    'text-left',
    'transition-colors',
    'duration-200',
    'theme-transition'
  ]
  
  // Variant-specific padding
  if (props.variant === 'bordered' || props.variant === 'filled') {
    classes.push('px-4', 'py-3')
  } else {
    classes.push('py-3')
  }
  
  // Hover state
  if (!props.disabled) {
    classes.push('hover:bg-gray-50', 'cursor-pointer')
  } else {
    classes.push('opacity-50', 'cursor-not-allowed')
  }
  
  // Focus state
  classes.push('focus-visible:outline-2', 'focus-visible:outline-offset-2', 'focus-visible:outline-black')
  
  return classes
})

const iconClasses = computed(() => {
  const classes = [
    'transition-transform',
    'duration-300',
    'ease-out',
    'text-gray-500'
  ]
  
  if (isOpen.value) {
    classes.push('rotate-180')
  }
  
  return classes
})

const contentClasses = computed(() => {
  const classes = ['overflow-hidden']
  
  if (!isOpen.value) {
    classes.push('h-0', 'opacity-0')
  }
  
  return classes
})
</script>

<style scoped>
.accordion {
  @apply w-full;
}

.accordion-trigger {
  @apply rounded-lg;
}

.accordion-header {
  @apply flex-1 font-medium text-gray-900;
}

.accordion-icon {
  @apply flex-shrink-0 ml-3;
  will-change: transform;
}

.accordion-content {
  will-change: height, opacity;
}

.accordion-content-inner {
  @apply py-3;
}

/* Variant-specific content padding */
.accordion.border .accordion-content-inner,
.accordion.bg-gray-50 .accordion-content-inner {
  @apply px-4 pb-4 pt-0;
}
</style>
