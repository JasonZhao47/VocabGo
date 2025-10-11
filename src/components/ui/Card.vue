<template>
  <component
    :is="tag"
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
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'outlined' | 'elevated'
  interactive?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
  tag?: 'div' | 'article' | 'section'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  interactive: false,
  padding: 'medium',
  tag: 'div',
  hover: true
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const handleClick = (event: Event) => {
  if (props.interactive) {
    emit('click', event)
  }
}

const cardClasses = computed(() => {
  const baseClasses = [
    'bg-white',
    'rounded-2xl',
    'transition-all',
    'duration-250',
    'ease-out'
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

  // Hover classes
  const hoverClasses = (props.interactive && props.hover) ? [
    'hover:shadow-lg',
    'hover:-translate-y-0.5',
    'active:translate-y-0',
    'active:shadow-md'
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