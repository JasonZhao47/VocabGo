<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Input Field -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <!-- Success Indicator -->
      <div
        v-if="success && !$slots.icon"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <svg 
          class="w-5 h-5 text-green-500 animate-[fadeIn_0.3s_ease-out]" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Icon Slot -->
      <div
        v-if="$slots.icon"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <slot name="icon" />
      </div>
    </div>

    <!-- Helper Text -->
    <p
      v-if="helperText && !error"
      :id="`${inputId}-helper`"
      class="mt-2 text-sm text-gray-500"
    >
      {{ helperText }}
    </p>

    <!-- Error Message -->
    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="mt-2 text-sm text-red-600 flex items-center gap-1"
      role="alert"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, useSlots, watch } from 'vue'
import { useMotionPreference } from '@/composables/useMotionPreference'
import { animationConfig } from '@/config/animations'
import gsap from 'gsap'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  success?: boolean
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  success: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
}>()

const slots = useSlots()
const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const { shouldAnimate, getDuration } = useMotionPreference()

// Generate unique ID for accessibility
const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

// Shake animation for error state
watch(() => props.error, (newError, oldError) => {
  if (newError && !oldError && shouldAnimate.value && inputRef.value) {
    gsap.fromTo(
      inputRef.value,
      { x: -10 },
      {
        x: 0,
        duration: getDuration(animationConfig.duration.normal) / 1000,
        ease: 'elastic.out(3, 0.3)',
        clearProps: 'x'
      }
    )
  }
})

const inputClasses = computed(() => {
  const baseClasses = [
    'block',
    'w-full',
    'h-11',
    'px-4',
    'text-base',
    'bg-white',
    'border',
    'rounded-xl',
    'transition-all',
    'duration-200',
    'ease-out',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-0',
    'theme-transition'
  ]

  // State-based classes with enhanced focus animations
  if (props.error) {
    baseClasses.push(
      'border-red-300',
      'focus:border-red-500',
      'focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
      'bg-red-50'
    )
  } else if (props.success) {
    baseClasses.push(
      'border-green-300',
      'focus:border-green-500',
      'focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]',
      'bg-green-50'
    )
  } else if (isFocused.value) {
    baseClasses.push(
      'border-black',
      'bg-white',
      'shadow-[0_0_0_3px_rgba(0,0,0,0.05)]'
    )
  } else {
    baseClasses.push(
      'border-gray-300',
      'hover:border-gray-400',
      'bg-gray-50'
    )
  }

  // Disabled state
  if (props.disabled) {
    baseClasses.push(
      'bg-gray-100',
      'text-gray-500',
      'cursor-not-allowed',
      'border-gray-200'
    )
  }

  // Readonly state
  if (props.readonly) {
    baseClasses.push(
      'bg-gray-50',
      'cursor-default'
    )
  }

  // Icon padding
  if (slots.icon) {
    baseClasses.push('pr-10')
  }

  return baseClasses
})

// Expose focus method for parent components
const focus = async () => {
  await nextTick()
  inputRef.value?.focus()
}

defineExpose({
  focus,
  inputRef
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>