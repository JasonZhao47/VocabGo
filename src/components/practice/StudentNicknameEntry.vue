<template>
  <Modal
    :model-value="modelValue"
    :closable="false"
    :close-on-backdrop="false"
    :close-on-escape="false"
    :persistent="true"
    size="medium"
  >
    <div class="nickname-entry-modal">
      <!-- Header -->
      <div class="modal-header-content" data-animate-child>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">
          Welcome! 👋
        </h2>
        <p class="text-base text-gray-600">
          Enter your name to start practicing
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="nickname-form" data-animate-child>
        <div class="input-wrapper">
          <Input
            ref="inputRef"
            v-model="localNickname"
            placeholder="Your name (e.g., 小明, Amy, José)"
            :error="validationError"
            :disabled="isSubmitting"
            class="nickname-input"
            @input="handleInput"
            @keydown="handleKeydown"
          />

          <!-- Character count hint -->
          <div class="flex justify-between items-center mt-2 text-xs">
            <span class="text-gray-500">
              Unicode characters supported
            </span>
            <span :class="characterCountClasses">
              {{ characterCount }}/20
            </span>
          </div>
        </div>

        <!-- Submit button -->
        <Button
          type="submit"
          variant="primary"
          size="lg"
          :loading="isSubmitting"
          :disabled="!isValid || isSubmitting"
          full-width
          class="submit-button"
        >
          {{ isSubmitting ? 'Starting...' : 'Start Practicing' }}
        </Button>
      </form>

      <!-- Privacy note -->
      <div class="privacy-note" data-animate-child>
        <svg 
          class="privacy-icon" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
        <span class="text-sm text-gray-600">
          Your name will be visible to your teacher. Your practice data is private and secure.
        </span>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  modelValue: boolean
  shareToken: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', nickname: string): void
  (e: 'error', error: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state
const localNickname = ref('')
const validationError = ref('')
const isSubmitting = ref(false)
const inputRef = ref<InstanceType<typeof Input>>()

// Validation rules
const MIN_LENGTH = 2
const MAX_LENGTH = 20

/**
 * Count actual Unicode characters (not bytes)
 */
const characterCount = computed(() => {
  return Array.from(localNickname.value).length
})

/**
 * Character count styling based on length
 */
const characterCountClasses = computed(() => {
  const count = characterCount.value
  if (count === 0) return 'text-gray-400'
  if (count > MAX_LENGTH) return 'text-red-500 font-medium'
  if (count >= 18) return 'text-amber-500'
  return 'text-gray-500'
})

/**
 * Validate nickname
 */
function validateNickname(value: string): string | null {
  const trimmed = value.trim()
  const count = Array.from(trimmed).length
  
  if (count === 0) {
    return null // Don't show error for empty input
  }
  
  if (count < MIN_LENGTH) {
    return `Name must be at least ${MIN_LENGTH} characters`
  }
  
  if (count > MAX_LENGTH) {
    return `Name must be ${MAX_LENGTH} characters or less`
  }
  
  // Check for only whitespace
  if (trimmed.length === 0 && value.length > 0) {
    return 'Name cannot be only spaces'
  }
  
  return null
}

/**
 * Check if nickname is valid
 */
const isValid = computed(() => {
  const trimmed = localNickname.value.trim()
  const count = Array.from(trimmed).length
  return count >= MIN_LENGTH && 
         count <= MAX_LENGTH && 
         !validationError.value
})

/**
 * Handle input changes
 */
function handleInput() {
  // Validate on input
  const error = validateNickname(localNickname.value)
  validationError.value = error || ''
}

/**
 * Handle keydown events
 */
function handleKeydown(event: KeyboardEvent) {
  // Allow Enter to submit if valid
  if (event.key === 'Enter' && isValid.value && !isSubmitting.value) {
    handleSubmit()
  }
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  if (!isValid.value || isSubmitting.value) {
    return
  }

  const trimmed = localNickname.value.trim()
  const error = validateNickname(trimmed)
  
  if (error) {
    validationError.value = error
    return
  }

  isSubmitting.value = true
  validationError.value = ''

  try {
    // Emit submit event with trimmed nickname
    emit('submit', trimmed)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred'
    validationError.value = errorMessage
    emit('error', errorMessage)
    isSubmitting.value = false
  }
}

/**
 * Focus input when modal opens
 */
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    // Small delay to ensure modal animation completes
    setTimeout(() => {
      inputRef.value?.focus()
    }, 300)
  }
})

/**
 * Reset state when modal closes
 */
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    localNickname.value = ''
    validationError.value = ''
    isSubmitting.value = false
  }
})

// Expose methods for parent component
defineExpose({
  setSubmitting: (value: boolean) => {
    isSubmitting.value = value
  },
  setError: (error: string) => {
    validationError.value = error
    isSubmitting.value = false
  },
})
</script>

<style scoped>
.nickname-entry-modal {
  @apply flex flex-col gap-6 py-2;
}

.modal-header-content {
  @apply text-center;
}

.nickname-form {
  @apply flex flex-col gap-4;
}

.nickname-input {
  @apply text-lg;
}

.input-wrapper {
  @apply w-full;
}

.nickname-input :deep(input) {
  @apply h-14 text-lg px-5 text-center;
  /* Gradient border effect on focus */
  @apply focus:border-transparent;
  position: relative;
}

.nickname-input :deep(input:focus) {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
  border: 2px solid transparent;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-button {
  @apply mt-2;
}

.privacy-note {
  @apply flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100;
}

.privacy-icon {
  @apply w-4 h-4 text-gray-400 flex-shrink-0;
  min-width: 1rem;
  min-height: 1rem;
  max-width: 1rem;
  max-height: 1rem;
}

/* Enhanced animations for modal content */
@media (prefers-reduced-motion: no-preference) {
  .modal-header-content h2 {
    @apply transition-all duration-300;
  }
  
  .nickname-input :deep(input) {
    @apply transition-all duration-200;
  }
  
  .submit-button {
    @apply transition-all duration-200;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .nickname-entry-modal {
    @apply gap-5 py-1;
  }
  
  .modal-header-content h2 {
    @apply text-xl;
  }
  
  .nickname-input :deep(input) {
    @apply h-12 text-base;
  }
}
</style>
