<template>
  <component
    :is="tag"
    ref="cardRef"
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Header Slot -->
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <!-- Main Content -->
    <div v-if="$slots.default" class="card-content">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import gsap from 'gsap'
import { useInteractiveAnimation } from '@/composables/useInteractiveAnimation'
import { animationConfig } from '@/config/animations'
import { useMotionPreference } from '@/composables/useMotionPreference'

interface Props {
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient-border'
  interactive?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
  tag?: 'div' | 'article' | 'section'
  hover?: boolean
  animateOnMount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  interactive: false,
  padding: 'medium',
  tag: 'div',
  hover: true,
  animateOnMount: true
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const cardRef = ref<HTMLElement | null>(null)
const { shouldAnimate, getDuration } = useMotionPreference()

// Apply interactive animations when interactive and hover are enabled
if (props.interactive && props.hover) {
  useInteractiveAnimation(cardRef, {
    hoverScale: 1.02,
    activeScale: animationConfig.scale.active,
    duration: animationConfig.duration.normal,
  })
}

// Enter animation on mount
onMounted(() => {
  if (!props.animateOnMount || !shouldAnimate.value || !cardRef.value) return

  gsap.fromTo(
    cardRef.value,
    {
      opacity: 0,
      y: animationConfig.slide.medium,
    },
    {
      opacity: 1,
      y: 0,
      duration: getDuration(animationConfig.duration.slow) / 1000,
      ease: animationConfig.easing.easeOut,
    }
  )
})

const handleClick = (event: Event) => {
  if (props.interactive) {
    // Add click feedback animation
    if (shouldAnimate.value && cardRef.value) {
      gsap.to(cardRef.value, {
        scale: animationConfig.scale.active,
        duration: getDuration(100) / 1000,
        ease: animationConfig.easing.easeOut,
        yoyo: true,
        repeat: 1,
      })
    }
    emit('click', event)
  }
}

const cardClasses = computed(() => {
  const baseClasses = [
    'bg-white',
    'rounded-2xl',
    'transition-shadow',
    'duration-250',
    'ease-out',
    'theme-transition'
  ]

  // Variant classes
  const variantClasses = {
    default: [
      'shadow-sm',
      'border',
      'border-gray-100'
    ],
    outlined: [
      'border',
      'border-gray-200',
      'shadow-none'
    ],
    elevated: [
      'shadow-md',
      'border-none'
    ],
    'gradient-border': [
      'gradient-border',
      'shadow-sm'
    ]
  }

  // Padding classes
  const paddingClasses = {
    none: [],
    small: ['p-4'],
    medium: ['p-6'],
    large: ['p-8']
  }

  // Interactive classes
  const interactiveClasses = props.interactive ? [
    'cursor-pointer',
    'select-none'
  ] : []

  // Hover classes - elevation effect with box-shadow
  const hoverClasses = (props.interactive && props.hover) ? [
    'hover:shadow-xl',
  ] : []

  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...paddingClasses[props.padding],
    ...interactiveClasses,
    ...hoverClasses
  ]
})
</script>

<style scoped>
.card-header {
  @apply border-b border-gray-100 pb-4 mb-4;
}

.card-footer {
  @apply border-t border-gray-100 pt-4 mt-4;
}

.card-content {
  @apply flex-1;
}

/* Remove header/footer borders when no content */
.card-header:last-child,
.card-footer:first-child {
  @apply border-none pb-0 pt-0 mb-0 mt-0;
}
</style>