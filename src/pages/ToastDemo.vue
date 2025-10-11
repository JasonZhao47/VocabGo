<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Toast Notification Demo</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Test Toast Types</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            @click="showSuccessToast"
            class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Show Success Toast
          </button>
          
          <button
            @click="showErrorToast"
            class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Show Error Toast
          </button>
          
          <button
            @click="showInfoToast"
            class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Show Info Toast
          </button>
        </div>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Test Multiple Toasts</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            @click="showMultipleToasts"
            class="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Show 3 Toasts
          </button>
          
          <button
            @click="showRapidToasts"
            class="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Show 5 Rapid Toasts
          </button>
        </div>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Test Duration & Progress</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            @click="showShortToast"
            class="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Short (1s)
          </button>
          
          <button
            @click="showMediumToast"
            class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Medium (3s)
          </button>
          
          <button
            @click="showLongToast"
            class="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Long (5s)
          </button>
        </div>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Test Stacking</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            @click="showStackedToasts"
            class="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Show Stacked Toasts (No Auto-dismiss)
          </button>
          
          <button
            @click="clearAllToasts"
            class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear All Toasts
          </button>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Test Checklist</h2>
        
        <ul class="space-y-3 text-gray-700">
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>All toast types (success, error, info) render with correct styling</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Toasts slide in from the right with smooth animation</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Toasts slide out to the right when dismissed</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Multiple toasts stack vertically with proper spacing</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Progress bar animates smoothly from 100% to 0%</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Progress bar color matches toast type</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Toasts auto-dismiss after specified duration</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Clicking toast dismisses it with animation</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Clicking close button dismisses toast</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Remaining toasts smoothly reposition when one is removed</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Hover effect works on toasts</span>
          </li>
          <li class="flex items-start">
            <span class="text-green-500 mr-2">✓</span>
            <span>Accessibility: ARIA labels and roles are correct</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { success, error, info, clearAll } = useToast()

function showSuccessToast() {
  success('Operation completed successfully!', 3000)
}

function showErrorToast() {
  error('An error occurred. Please try again.', 5000)
}

function showInfoToast() {
  info('This is an informational message.', 3000)
}

function showMultipleToasts() {
  success('First toast', 3000)
  setTimeout(() => error('Second toast', 3000), 200)
  setTimeout(() => info('Third toast', 3000), 400)
}

function showRapidToasts() {
  for (let i = 1; i <= 5; i++) {
    success(`Toast #${i}`, 2000)
  }
}

function showShortToast() {
  info('Short duration toast', 1000)
}

function showMediumToast() {
  success('Medium duration toast', 3000)
}

function showLongToast() {
  error('Long duration toast', 5000)
}

function showStackedToasts() {
  success('Persistent toast 1', 0)
  error('Persistent toast 2', 0)
  info('Persistent toast 3', 0)
}

function clearAllToasts() {
  clearAll()
}
</script>
