import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFormValidation, validationRules } from './useFormValidation'

describe('useFormValidation', () => {
  describe('Field Registration', () => {
    it('should register a field', () => {
      const { registerField, getFieldValue } = useFormValidation()
      
      registerField('email', 'test@example.com', [])
      
      expect(getFieldValue('email')).toBe('test@example.com')
    })

    it('should unregister a field', () => {
      const { registerField, unregisterField, getFieldValue } = useFormValidation()
      
      registerField('email', 'test@example.com', [])
      unregisterField('email')
      
      expect(getFieldValue('email')).toBeUndefined()
    })
  })

  describe('Field Validation', () => {
    it('should validate required field', () => {
      const { registerField, validateField, getFieldError } = useFormValidation()
      
      registerField('name', '', [validationRules.required()])
      
      const isValid = validateField('name')
      
      expect(isValid).toBe(false)
      expect(getFieldError('name')).toBe('This field is required')
    })

    it('should pass validation for valid field', () => {
      const { registerField, validateField, getFieldError } = useFormValidation()
      
      registerField('name', 'John Doe', [validationRules.required()])
      
      const isValid = validateField('name')
      
      expect(isValid).toBe(true)
      expect(getFieldError('name')).toBeNull()
    })

    it('should validate email format', () => {
      const { registerField, validateField, getFieldError } = useFormValidation()
      
      registerField('email', 'invalid-email', [validationRules.email()])
      
      const isValid = validateField('email')
      
      expect(isValid).toBe(false)
      expect(getFieldError('email')).toBe('Please enter a valid email address')
    })

    it('should validate minimum length', () => {
      const { registerField, validateField, getFieldError } = useFormValidation()
      
      registerField('password', '123', [validationRules.minLength(8)])
      
      const isValid = validateField('password')
      
      expect(isValid).toBe(false)
      expect(getFieldError('password')).toBe('Must be at least 8 characters')
    })
  })

  describe('Field Updates', () => {
    it('should update field value', () => {
      const { registerField, updateField, getFieldValue } = useFormValidation()
      
      registerField('name', '', [])
      updateField('name', 'John Doe')
      
      expect(getFieldValue('name')).toBe('John Doe')
    })

    it('should validate on change when enabled', async () => {
      const { registerField, updateField, touchField, getFieldError } = useFormValidation({
        validateOnChange: true
      })
      
      registerField('name', '', [validationRules.required()])
      touchField('name')
      
      // Wait for setTimeout in updateField
      await new Promise(resolve => setTimeout(resolve, 10))
      
      updateField('name', '')
      
      // Wait for validation
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(getFieldError('name')).toBe('This field is required')
    })
  })

  describe('Touch Field', () => {
    it('should mark field as touched', () => {
      const { registerField, touchField, isFieldTouched } = useFormValidation()
      
      registerField('name', '', [])
      touchField('name')
      
      expect(isFieldTouched('name')).toBe(true)
    })

    it('should validate on blur when enabled', async () => {
      const { registerField, touchField, getFieldError } = useFormValidation({
        validateOnBlur: true
      })
      
      registerField('name', '', [validationRules.required()])
      
      touchField('name')
      
      // Wait for validation
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(getFieldError('name')).toBe('This field is required')
    })
  })

  describe('Success State', () => {
    it('should show success state when field is valid and touched', async () => {
      const { registerField, touchField, validateField, getFieldSuccess } = useFormValidation({
        showSuccessState: true
      })
      
      registerField('name', 'John Doe', [validationRules.required()])
      touchField('name')
      
      validateField('name')
      
      expect(getFieldSuccess('name')).toBe(true)
    })

    it('should not show success state when disabled', () => {
      const { registerField, touchField, validateField, getFieldSuccess } = useFormValidation({
        showSuccessState: false
      })
      
      registerField('name', 'John Doe', [validationRules.required()])
      touchField('name')
      
      validateField('name')
      
      expect(getFieldSuccess('name')).toBe(false)
    })
  })

  describe('Form Validation', () => {
    it('should validate all fields', () => {
      const { registerField, validateAll, getFieldError } = useFormValidation()
      
      registerField('name', '', [validationRules.required()])
      registerField('email', 'invalid', [validationRules.email()])
      
      const isValid = validateAll()
      
      expect(isValid).toBe(false)
      expect(getFieldError('name')).toBe('This field is required')
      expect(getFieldError('email')).toBe('Please enter a valid email address')
    })

    it('should return true when all fields are valid', () => {
      const { registerField, validateAll } = useFormValidation()
      
      registerField('name', 'John Doe', [validationRules.required()])
      registerField('email', 'john@example.com', [validationRules.email()])
      
      const isValid = validateAll()
      
      expect(isValid).toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('should handle successful submission', async () => {
      const { registerField, handleSubmit } = useFormValidation()
      
      registerField('name', 'John Doe', [validationRules.required()])
      
      const onSubmit = vi.fn()
      const success = await handleSubmit(onSubmit)
      
      expect(success).toBe(true)
      expect(onSubmit).toHaveBeenCalled()
    })

    it('should not submit when form is invalid', async () => {
      const { registerField, handleSubmit } = useFormValidation()
      
      registerField('name', '', [validationRules.required()])
      
      const onSubmit = vi.fn()
      const success = await handleSubmit(onSubmit)
      
      expect(success).toBe(false)
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Form Reset', () => {
    it('should reset all fields', () => {
      const { registerField, touchField, validateField, resetForm, getFieldError, isFieldTouched } = useFormValidation()
      
      registerField('name', '', [validationRules.required()])
      touchField('name')
      validateField('name')
      
      resetForm()
      
      expect(getFieldError('name')).toBeNull()
      expect(isFieldTouched('name')).toBe(false)
    })

    it('should reset single field', () => {
      const { registerField, touchField, validateField, resetField, getFieldError, isFieldTouched } = useFormValidation()
      
      registerField('name', '', [validationRules.required()])
      touchField('name')
      validateField('name')
      
      resetField('name')
      
      expect(getFieldError('name')).toBeNull()
      expect(isFieldTouched('name')).toBe(false)
    })
  })
})

describe('validationRules', () => {
  describe('required', () => {
    it('should validate non-empty string', () => {
      const rule = validationRules.required()
      expect(rule.validator('test')).toBe(true)
    })

    it('should fail for empty string', () => {
      const rule = validationRules.required()
      expect(rule.validator('')).toBe(false)
    })

    it('should fail for whitespace only', () => {
      const rule = validationRules.required()
      expect(rule.validator('   ')).toBe(false)
    })
  })

  describe('email', () => {
    it('should validate correct email', () => {
      const rule = validationRules.email()
      expect(rule.validator('test@example.com')).toBe(true)
    })

    it('should fail for invalid email', () => {
      const rule = validationRules.email()
      expect(rule.validator('invalid-email')).toBe(false)
    })

    it('should allow empty value', () => {
      const rule = validationRules.email()
      expect(rule.validator('')).toBe(true)
    })
  })

  describe('minLength', () => {
    it('should validate string meeting minimum length', () => {
      const rule = validationRules.minLength(5)
      expect(rule.validator('hello')).toBe(true)
    })

    it('should fail for string below minimum length', () => {
      const rule = validationRules.minLength(5)
      expect(rule.validator('hi')).toBe(false)
    })
  })

  describe('maxLength', () => {
    it('should validate string within maximum length', () => {
      const rule = validationRules.maxLength(5)
      expect(rule.validator('hello')).toBe(true)
    })

    it('should fail for string exceeding maximum length', () => {
      const rule = validationRules.maxLength(5)
      expect(rule.validator('hello world')).toBe(false)
    })
  })

  describe('pattern', () => {
    it('should validate string matching pattern', () => {
      const rule = validationRules.pattern(/^\d+$/, 'Must be numbers only')
      expect(rule.validator('12345')).toBe(true)
    })

    it('should fail for string not matching pattern', () => {
      const rule = validationRules.pattern(/^\d+$/, 'Must be numbers only')
      expect(rule.validator('abc')).toBe(false)
    })
  })

  describe('min', () => {
    it('should validate number meeting minimum', () => {
      const rule = validationRules.min(5)
      expect(rule.validator(10)).toBe(true)
    })

    it('should fail for number below minimum', () => {
      const rule = validationRules.min(5)
      expect(rule.validator(3)).toBe(false)
    })
  })

  describe('max', () => {
    it('should validate number within maximum', () => {
      const rule = validationRules.max(10)
      expect(rule.validator(5)).toBe(true)
    })

    it('should fail for number exceeding maximum', () => {
      const rule = validationRules.max(10)
      expect(rule.validator(15)).toBe(false)
    })
  })

  describe('custom', () => {
    it('should validate using custom validator', () => {
      const rule = validationRules.custom(
        (value) => value === 'test',
        'Must be "test"'
      )
      expect(rule.validator('test')).toBe(true)
    })

    it('should fail for custom validator', () => {
      const rule = validationRules.custom(
        (value) => value === 'test',
        'Must be "test"'
      )
      expect(rule.validator('other')).toBe(false)
    })
  })
})
