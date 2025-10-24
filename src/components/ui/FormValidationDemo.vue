<template>
  <div class="max-w-2xl mx-auto p-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold mb-2">Form Validation Demo</h1>
      <p class="text-gray-600">
        Demonstrates inline error messages with smooth fade-in, success state animations,
        and immediate feedback within 100ms.
      </p>
    </div>

    <!-- Basic Form Example -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-bold mb-4">Contact Form</h2>
      
      <form @submit.prevent="handleContactSubmit" class="space-y-4">
        <!-- Name Field -->
        <Input
          v-model="contactForm.name"
          label="Name"
          placeholder="Enter your name"
          :error="getFieldError('name') || undefined"
          :success="getFieldSuccess('name')"
          required
          @blur="touchField('name')"
        />

        <!-- Email Field -->
        <Input
          v-model="contactForm.email"
          type="email"
          label="Email"
          placeholder="your.email@example.com"
          :error="getFieldError('email') || undefined"
          :success="getFieldSuccess('email')"
          required
          @blur="touchField('email')"
        />

        <!-- Message Field -->
        <Textarea
          v-model="contactForm.message"
          label="Message"
          placeholder="Enter your message"
          :error="getFieldError('message') || undefined"
          :success="getFieldSuccess('message')"
          :rows="4"
          required
          @blur="touchField('message')"
        />

        <!-- Submit Button -->
        <div class="flex gap-3">
          <Button
            type="submit"
            :loading="isSubmitting"
            :disabled="!isFormValid && submitAttempted"
          >
            Submit Form
          </Button>
          <Button
            variant="ghost"
            type="button"
            @click="handleReset"
          >
            Reset
          </Button>
        </div>

        <!-- Success Message -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="showSuccess"
            class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-medium">Form submitted successfully!</span>
          </div>
        </Transition>
      </form>
    </div>

    <!-- Advanced Validation Example -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-bold mb-4">Registration Form</h2>
      
      <form @submit.prevent="handleRegisterSubmitForm" class="space-y-4">
        <!-- Username Field -->
        <Input
          v-model="registerForm.username"
          label="Username"
          placeholder="Choose a username"
          helper-text="Must be at least 3 characters"
          :error="getRegisterFieldError('username') || undefined"
          :success="getRegisterFieldSuccess('username')"
          required
          @blur="touchRegisterField('username')"
        />

        <!-- Password Field -->
        <Input
          v-model="registerForm.password"
          type="password"
          label="Password"
          placeholder="Create a password"
          helper-text="Must be at least 8 characters"
          :error="getRegisterFieldError('password') || undefined"
          :success="getRegisterFieldSuccess('password')"
          required
          @blur="touchRegisterField('password')"
        />

        <!-- Confirm Password Field -->
        <Input
          v-model="registerForm.confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          :error="getRegisterFieldError('confirmPassword') || undefined"
          :success="getRegisterFieldSuccess('confirmPassword')"
          required
          @blur="touchRegisterField('confirmPassword')"
        />

        <!-- Submit Button -->
        <div class="flex gap-3">
          <Button
            type="submit"
            :loading="isRegisterSubmitting"
            :disabled="!isRegisterFormValid && registerSubmitAttempted"
          >
            Create Account
          </Button>
          <Button
            variant="ghost"
            type="button"
            @click="handleRegisterReset"
          >
            Reset
          </Button>
        </div>

        <!-- Success Message -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="showRegisterSuccess"
            class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-medium">Account created successfully!</span>
          </div>
        </Transition>
      </form>
    </div>

    <!-- Validation Features -->
    <div class="bg-gray-50 rounded-lg p-6">
      <h3 class="font-bold mb-3">Validation Features</h3>
      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span><strong>Inline error messages</strong> with smooth fade-in animation (200ms)</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span><strong>Success state animations</strong> with checkmark icon (300ms scale)</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span><strong>Immediate feedback</strong> within 100ms on blur</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span><strong>Styled validation messages</strong> with appropriate colors (red for errors, green for success)</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span><strong>Shake animation</strong> on error state for visual feedback</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span><strong>Form-level success message</strong> with smooth slide-up animation</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Input from './Input.vue'
import Textarea from './Textarea.vue'
import Button from './Button.vue'
import { useFormValidation, validationRules } from '@/composables/useFormValidation'

// Contact Form
const contactForm = ref({
  name: '',
  email: '',
  message: ''
})

const showSuccess = ref(false)

const {
  isSubmitting,
  submitAttempted,
  isFormValid,
  registerField,
  updateField,
  touchField,
  getFieldError,
  getFieldSuccess,
  handleSubmit,
  resetForm
} = useFormValidation({
  validateOnBlur: true,
  showSuccessState: true
})

// Register contact form fields
registerField('name', '', [
  validationRules.required('Name is required'),
  validationRules.minLength(2, 'Name must be at least 2 characters')
])

registerField('email', '', [
  validationRules.required('Email is required'),
  validationRules.email()
])

registerField('message', '', [
  validationRules.required('Message is required'),
  validationRules.minLength(10, 'Message must be at least 10 characters')
])

// Watch form values and update validation
watch(() => contactForm.value.name, (value) => updateField('name', value))
watch(() => contactForm.value.email, (value) => updateField('email', value))
watch(() => contactForm.value.message, (value) => updateField('message', value))

const handleContactSubmit = async () => {
  const success = await handleSubmit(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Contact form submitted:', contactForm.value)
  })

  if (success) {
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      contactForm.value = { name: '', email: '', message: '' }
      resetForm()
    }, 3000)
  }
}

const handleReset = () => {
  contactForm.value = { name: '', email: '', message: '' }
  resetForm()
  showSuccess.value = false
}

// Registration Form
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const showRegisterSuccess = ref(false)

const {
  isSubmitting: isRegisterSubmitting,
  submitAttempted: registerSubmitAttempted,
  isFormValid: isRegisterFormValid,
  registerField: registerRegisterField,
  updateField: updateRegisterField,
  touchField: touchRegisterField,
  getFieldError: getRegisterFieldError,
  getFieldSuccess: getRegisterFieldSuccess,
  handleSubmit: handleRegisterSubmit,
  resetForm: resetRegisterForm
} = useFormValidation({
  validateOnBlur: true,
  showSuccessState: true
})

// Register registration form fields
registerRegisterField('username', '', [
  validationRules.required('Username is required'),
  validationRules.minLength(3, 'Username must be at least 3 characters'),
  validationRules.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
])

registerRegisterField('password', '', [
  validationRules.required('Password is required'),
  validationRules.minLength(8, 'Password must be at least 8 characters')
])

registerRegisterField('confirmPassword', '', [
  validationRules.required('Please confirm your password'),
  validationRules.custom(
    (value) => value === registerForm.value.password,
    'Passwords do not match'
  )
])

// Watch register form values
watch(() => registerForm.value.username, (value) => updateRegisterField('username', value))
watch(() => registerForm.value.password, (value) => {
  updateRegisterField('password', value)
  // Re-validate confirm password when password changes
  if (registerForm.value.confirmPassword) {
    updateRegisterField('confirmPassword', registerForm.value.confirmPassword)
  }
})
watch(() => registerForm.value.confirmPassword, (value) => updateRegisterField('confirmPassword', value))

const handleRegisterSubmitForm = async () => {
  const success = await handleRegisterSubmit(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Registration form submitted:', registerForm.value)
  })

  if (success) {
    showRegisterSuccess.value = true
    setTimeout(() => {
      showRegisterSuccess.value = false
      registerForm.value = { username: '', password: '', confirmPassword: '' }
      resetRegisterForm()
    }, 3000)
  }
}

const handleRegisterReset = () => {
  registerForm.value = { username: '', password: '', confirmPassword: '' }
  resetRegisterForm()
  showRegisterSuccess.value = false
}
</script>
