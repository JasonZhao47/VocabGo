import { ref, computed, watch } from 'vue'
import { useMotionPreference } from './useMotionPreference'
import { animationConfig } from '@/config/animations'

export interface ValidationRule {
  validator: (value: any) => boolean
  message: string
}

export interface FieldValidation {
  value: any
  rules: ValidationRule[]
  touched: boolean
  error: string | null
  success: boolean
}

export interface FormValidationOptions {
  validateOnBlur?: boolean
  validateOnChange?: boolean
  showSuccessState?: boolean
  immediateValidation?: boolean
}

/**
 * Form validation composable with smooth feedback animations
 * 
 * Provides:
 * - Inline error messages with smooth fade-in
 * - Success state animations for completed forms
 * - Immediate feedback within 100ms
 * - Styled validation messages with appropriate colors
 */
export function useFormValidation(options: FormValidationOptions = {}) {
  const {
    validateOnBlur = true,
    validateOnChange = false,
    showSuccessState = true,
    immediateValidation = false
  } = options

  const { shouldAnimate, getDuration } = useMotionPreference()
  
  const fields = ref<Map<string, FieldValidation>>(new Map())
  const isSubmitting = ref(false)
  const submitAttempted = ref(false)

  /**
   * Register a field for validation
   */
  function registerField(
    name: string,
    initialValue: any = '',
    rules: ValidationRule[] = []
  ) {
    fields.value.set(name, {
      value: initialValue,
      rules,
      touched: false,
      error: null,
      success: false
    })
  }

  /**
   * Unregister a field
   */
  function unregisterField(name: string) {
    fields.value.delete(name)
  }

  /**
   * Validate a single field
   * Returns validation result within 100ms for immediate feedback
   */
  function validateField(name: string): boolean {
    const field = fields.value.get(name)
    if (!field) return true

    // Clear previous error
    field.error = null
    field.success = false

    // Run validation rules
    for (const rule of field.rules) {
      if (!rule.validator(field.value)) {
        field.error = rule.message
        return false
      }
    }

    // Show success state if enabled
    if (showSuccessState && field.touched) {
      field.success = true
    }

    return true
  }

  /**
   * Validate all fields
   */
  function validateAll(): boolean {
    let isValid = true
    
    fields.value.forEach((field, name) => {
      field.touched = true
      if (!validateField(name)) {
        isValid = false
      }
    })

    return isValid
  }

  /**
   * Update field value
   */
  function updateField(name: string, value: any) {
    const field = fields.value.get(name)
    if (!field) return

    field.value = value

    // Validate on change if enabled
    if (validateOnChange && (field.touched || submitAttempted.value)) {
      // Use setTimeout to ensure feedback is immediate (within 100ms)
      setTimeout(() => {
        validateField(name)
      }, 0)
    }
  }

  /**
   * Mark field as touched (on blur)
   */
  function touchField(name: string) {
    const field = fields.value.get(name)
    if (!field) return

    field.touched = true

    // Validate on blur if enabled
    if (validateOnBlur) {
      // Use setTimeout to ensure feedback is immediate (within 100ms)
      setTimeout(() => {
        validateField(name)
      }, 0)
    }
  }

  /**
   * Get field error message
   */
  function getFieldError(name: string): string | null {
    return fields.value.get(name)?.error || null
  }

  /**
   * Get field success state
   */
  function getFieldSuccess(name: string): boolean {
    return fields.value.get(name)?.success || false
  }

  /**
   * Check if field has been touched
   */
  function isFieldTouched(name: string): boolean {
    return fields.value.get(name)?.touched || false
  }

  /**
   * Get field value
   */
  function getFieldValue(name: string): any {
    return fields.value.get(name)?.value
  }

  /**
   * Reset a single field
   */
  function resetField(name: string) {
    const field = fields.value.get(name)
    if (!field) return

    field.touched = false
    field.error = null
    field.success = false
  }

  /**
   * Reset all fields
   */
  function resetForm() {
    fields.value.forEach((field) => {
      field.touched = false
      field.error = null
      field.success = false
    })
    submitAttempted.value = false
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(
    onSubmit: () => Promise<void> | void
  ): Promise<boolean> {
    submitAttempted.value = true
    
    // Validate all fields
    const isValid = validateAll()
    
    if (!isValid) {
      return false
    }

    // Execute submit handler
    isSubmitting.value = true
    try {
      await onSubmit()
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Check if form is valid
   */
  const isFormValid = computed(() => {
    let valid = true
    fields.value.forEach((field, name) => {
      if (!validateField(name)) {
        valid = false
      }
    })
    return valid
  })

  /**
   * Check if any field has errors
   */
  const hasErrors = computed(() => {
    return Array.from(fields.value.values()).some(field => field.error !== null)
  })

  /**
   * Get all form values
   */
  const formValues = computed(() => {
    const values: Record<string, any> = {}
    fields.value.forEach((field, name) => {
      values[name] = field.value
    })
    return values
  })

  return {
    // State
    isSubmitting,
    submitAttempted,
    isFormValid,
    hasErrors,
    formValues,
    
    // Methods
    registerField,
    unregisterField,
    validateField,
    validateAll,
    updateField,
    touchField,
    getFieldError,
    getFieldSuccess,
    isFieldTouched,
    getFieldValue,
    resetField,
    resetForm,
    handleSubmit
  }
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validator: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return value !== null && value !== undefined
    },
    message
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true // Allow empty, use required rule separately
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true // Allow empty, use required rule separately
      return value.length >= min
    },
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true // Allow empty, use required rule separately
      return value.length <= max
    },
    message: message || `Must be no more than ${max} characters`
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validator: (value: string) => {
      if (!value) return true // Allow empty, use required rule separately
      return regex.test(value)
    },
    message
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validator: (value: number) => {
      if (value === null || value === undefined) return true
      return value >= min
    },
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validator: (value: number) => {
      if (value === null || value === undefined) return true
      return value <= max
    },
    message: message || `Must be no more than ${max}`
  }),

  custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
    validator,
    message
  })
}
