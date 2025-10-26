<template>
  <Modal
    :model-value="modelValue"
    :closable="false"
    :close-on-backdrop="false"
    :close-on-escape="false"
    :persistent="true"
    size="small"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="nickname-entry-modal">
      <!-- Logo -->
      <div class="modal-logo" data-animate-child>
        <span class="logo-text">VocabGo</span>
      </div>

      <!-- Header -->
      <div class="modal-header-content" data-animate-child>
        <h1 class="modal-title">
          Welcome
        </h1>
        <p class="modal-subtitle">
          Enter your name to begin
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="nickname-form" data-animate-child>
        <div class="input-wrapper">
          <Input
            ref="inputRef"
            v-model="localNickname"
            placeholder="Your name"
            :error="validationError"
            :disabled="isSubmitting"
            class="nickname-input"
            @input="handleInput"
            @keydown="handleKeydown"
          />

          <!-- Character count hint -->
          <div v-if="characterCount > 0" class="character-count-wrapper">
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
          {{ isSubmitting ? 'Starting...' : 'Continue' }}
        </Button>
      </form>

      <!-- Privacy note -->
      <div class="privacy-note" data-animate-child>
        <span class="privacy-text">
          Your teacher will see your name and practice results
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

// Expose methods and state for parent component and tests
defineExpose({
  setSubmitting: (value: boolean) => {
    isSubmitting.value = value
  },
  setError: (error: string) => {
    validationError.value = error
    isSubmitting.value = false
  },
  // Expose state for testing
  isSubmitting,
  validationError,
  inputRef,
})
</script>

<style scoped>
.nickname-entry-modal {
  @apply flex flex-col;
  gap: 32px;
  padding: 12px 0;
}

.modal-logo {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #18181b;
  letter-spacing: -0.03em;
  line-height: 1;
}

.modal-header-content {
  @apply text-center;
}

.modal-title {
  font-size: 28px;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 15px;
  color: #71717a;
  font-weight: 400;
  line-height: 1.5;
}

.nickname-form {
  @apply flex flex-col;
  gap: 16px;
}

.input-wrapper {
  @apply w-full relative;
}

.nickname-input :deep(input) {
  @apply w-full;
  height: 48px;
  padding: 0 16px;
  border: 1.5px solid #e4e4e7;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  font-weight: 400;
  background: #fafafa;
  color: #18181b;
}

.nickname-input :deep(input::placeholder) {
  color: #a1a1aa;
  font-weight: 400;
}

.nickname-input :deep(input:hover:not(:disabled)) {
  background: #ffffff;
  border-color: #d4d4d8;
}

.nickname-input :deep(input:focus) {
  background: #ffffff;
  border-color: #18181b;
  box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.05);
  outline: none;
}

.nickname-input :deep(input:disabled) {
  background: #f4f4f5;
  border-color: #e4e4e7;
  color: #a1a1aa;
  cursor: not-allowed;
}

.character-count-wrapper {
  @apply absolute right-4 top-1/2;
  transform: translateY(-50%);
  pointer-events: none;
}

.character-count-wrapper span {
  font-size: 12px;
  font-weight: 500;
  color: #a1a1aa;
}

.submit-button {
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 15px;
  background: #18181b;
  color: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.submit-button:hover:not(:disabled) {
  background: #27272a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
  background: #f4f4f5;
  color: #a1a1aa;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.privacy-note {
  @apply text-center;
  padding-top: 4px;
}

.privacy-text {
  font-size: 13px;
  color: #a1a1aa;
  font-weight: 400;
  line-height: 1.6;
}

/* Enhanced animations for modal content */
@media (prefers-reduced-motion: no-preference) {
  .modal-title {
    @apply transition-all duration-300;
  }
  
  .nickname-input :deep(input) {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .submit-button {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .nickname-entry-modal {
    gap: 28px;
    padding: 8px 0;
  }
  
  .modal-title {
    font-size: 24px;
  }
  
  .modal-subtitle {
    font-size: 14px;
  }
  
  .nickname-input :deep(input) {
    height: 46px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .submit-button {
    height: 46px;
  }
}
</style>
