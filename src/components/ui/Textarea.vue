<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="textareaId"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Textarea Container -->
    <div class="relative">
      <!-- Textarea Field -->
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        :class="textareaClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <!-- Character Count -->
      <div
        v-if="maxLength"
        class="absolute bottom-2 right-3 text-xs text-gray-400"
      >
        {{ characterCount }}/{{ maxLength }}
      </div>
    </div>

    <!-- Helper Text -->
    <p
      v-if="helperText && !error"
      class="mt-2 text-sm text-gray-500"
    >
      {{ helperText }}
    </p>

    <!-- Error Message -->
    <p
      v-if="error"
      class="mt-2 text-sm text-red-600 flex items-center gap-1"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
import { computed, ref, nextTick } from 'vue'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  rows?: number
  maxLength?: number
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  required: false,
  rows: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const isFocused = ref(false)

// Generate unique ID for accessibility
const textareaId = computed(() => props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`)

const characterCount = computed(() => {
  return props.modelValue?.length || 0
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  let value = target.value
  
  // Enforce max length if specified
  if (props.maxLength && value.length > props.maxLength) {
    value = value.slice(0, props.maxLength)
    target.value = value
  }
  
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

const textareaClasses = computed(() => {
  const baseClasses = [
    'block',
    'w-full',
    'px-4',
    'py-3',
    'text-base',
    'bg-white',
    'border',
    'rounded-xl',
    // Task 9.2: Enhanced transitions for all interactive elements
    'transition-all',
    'duration-150',
    'ease-out',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-0',
    'resize-vertical'
  ]

  // State-based classes with enhanced focus states (Task 9.2)
  if (props.error) {
    baseClasses.push(
      'border-red-300',
      'focus:border-red-500',
      'focus:shadow-sm',
      'bg-red-50'
    )
  } else if (isFocused.value) {
    baseClasses.push(
      'border-black',
      'bg-white',
      // Task 9.2: Proper accessibility indicators
      'shadow-sm'
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

  // Character count padding
  if (props.maxLength) {
    baseClasses.push('pb-8')
  }

  return baseClasses
})

// Expose focus method for parent components
const focus = async () => {
  await nextTick()
  textareaRef.value?.focus()
}

defineExpose({
  focus,
  textareaRef
})
</script>