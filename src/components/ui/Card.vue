<template>
  <component
    :is="tag"
    ref="cardRef"
    :role="interactive ? 'button' : (tag === 'article' ? 'article' : undefined)"
    :tabindex="interactive ? 0 : undefined"
    :aria-label="ariaLabel"
    :class="cardClasses"
    @click="handleClick"
    @keydown.enter="interactive ? handleClick : undefined"
    @keydown.space.prevent="interactive ? handleClick : undefined"
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
  borderRadius?: 'sm' | 'md'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  interactive: false,
  padding: 'medium',
  tag: 'div',
  hover: true,
  animateOnMount: true,
  borderRadius: 'sm'
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
    'transition-transform-opacity',
    'duration-200',
    'ease-in-out',
    'theme-transition'
  ]

  // Border radius classes - ElevenLabs uses 8px or 12px
  const radiusClasses = {
    sm: 'rounded-lg', // 8px
    md: 'rounded-xl', // 12px
  }

  // Variant classes - ElevenLabs uses subtle shadows
  const variantClasses = {
    default: [
      'border',
      'border-gray-200'
    ],
    outlined: [
      'border',
      'border-gray-300'
    ],
    elevated: [
      'elevenlabs-shadow-sm'
    ],
    'gradient-border': [
      'gradient-border',
      'elevenlabs-shadow-sm'
    ]
  }

  // Padding classes - ElevenLabs uses 24px-32px for cards
  const paddingClasses = {
    none: [],
    small: ['p-4'], // 16px
    medium: ['p-6'], // 24px - ElevenLabs standard
    large: ['p-8'], // 32px - ElevenLabs large
  }

  // Interactive classes
  const interactiveClasses = props.interactive ? [
    'cursor-pointer',
    'select-none'
  ] : []

  // Hover classes - ElevenLabs increases shadow on hover for interactive cards
  // Add will-change hint for frequently animated elements
  const hoverClasses = (props.interactive && props.hover) ? [
    'hover:elevenlabs-shadow-md',
    'hover:will-change-transform',
  ] : []

  return [
    ...baseClasses,
    radiusClasses[props.borderRadius],
    ...variantClasses[props.variant],
    ...paddingClasses[props.padding],
    ...interactiveClasses,
    ...hoverClasses
  ]
})
</script>

<style scoped>
/* ElevenLabs shadow system - subtle elevation */
.elevenlabs-shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.elevenlabs-shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

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