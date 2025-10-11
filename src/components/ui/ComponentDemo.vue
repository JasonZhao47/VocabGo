<template>
  <div class="p-8 space-y-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">UI Component Library Demo</h1>

    <!-- Button Demo -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800">Buttons</h2>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
      </div>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary" :loading="true">Loading</Button>
        <Button variant="primary" :disabled="true">Disabled</Button>
        <Button variant="primary" full-width>Full Width</Button>
      </div>
    </section>

    <!-- Input Demo -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800">Inputs</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Input
          v-model="inputValue"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          helper-text="We'll never share your email"
        />
        <Input
          v-model="passwordValue"
          label="Password"
          type="password"
          placeholder="Enter password"
          required
        />
        <Input
          v-model="errorValue"
          label="Input with Error"
          placeholder="This has an error"
          error="This field is required"
        />
        <Input
          label="Disabled Input"
          placeholder="This is disabled"
          :disabled="true"
        />
      </div>
      
      <Textarea
        v-model="textareaValue"
        label="Message"
        placeholder="Enter your message here..."
        helper-text="Maximum 500 characters"
        :max-length="500"
        :rows="4"
      />
    </section>

    <!-- Card Demo -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800">Cards</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 class="font-semibold text-lg mb-2">Default Card</h3>
          <p class="text-gray-600">This is a default card with subtle shadow and border.</p>
        </Card>
        
        <Card variant="outlined">
          <h3 class="font-semibold text-lg mb-2">Outlined Card</h3>
          <p class="text-gray-600">This card has a border but no shadow.</p>
        </Card>
        
        <Card variant="elevated">
          <h3 class="font-semibold text-lg mb-2">Elevated Card</h3>
          <p class="text-gray-600">This card has more prominent shadow.</p>
        </Card>
      </div>
      
      <Card :interactive="true" @click="handleCardClick">
        <template #header>
          <h3 class="font-semibold text-lg">Interactive Card</h3>
        </template>
        <p class="text-gray-600">Click me! I have hover effects and emit click events.</p>
        <template #footer>
          <div class="flex justify-end">
            <Button variant="ghost" size="sm">Action</Button>
          </div>
        </template>
      </Card>
    </section>

    <!-- Modal Demo -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800">Modal</h2>
      <div class="flex gap-4">
        <Button @click="showModal = true">Open Modal</Button>
        <Button @click="showLargeModal = true">Open Large Modal</Button>
      </div>
    </section>

    <!-- Modals -->
    <Modal
      v-model="showModal"
      title="Example Modal"
      description="This is a modal dialog with backdrop blur and focus management."
    >
      <div class="space-y-4">
        <Input
          v-model="modalInput"
          label="Name"
          placeholder="Enter your name"
        />
        <p class="text-gray-600">
          This modal demonstrates proper focus management and keyboard navigation.
          Try pressing Tab to navigate between elements, or Escape to close.
        </p>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showModal = false">Cancel</Button>
          <Button variant="primary" @click="showModal = false">Save</Button>
        </div>
      </template>
    </Modal>

    <Modal
      v-model="showLargeModal"
      title="Large Modal"
      size="large"
    >
      <div class="space-y-6">
        <p class="text-gray-600">This is a larger modal that can contain more content.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" placeholder="John" />
          <Input label="Last Name" placeholder="Doe" />
          <Input label="Email" type="email" placeholder="john@example.com" />
          <Input label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
        </div>
        
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself..."
          :rows="4"
        />
      </div>
      
      <template #footer>
        <div class="flex justify-between">
          <Button variant="ghost">Reset</Button>
          <div class="flex gap-3">
            <Button variant="secondary" @click="showLargeModal = false">Cancel</Button>
            <Button variant="primary" @click="showLargeModal = false">Save Changes</Button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'
import Input from './Input.vue'
import Textarea from './Textarea.vue'
import Card from './Card.vue'
import Modal from './Modal.vue'

// Demo state
const inputValue = ref('')
const passwordValue = ref('')
const errorValue = ref('')
const textareaValue = ref('')
const modalInput = ref('')
const showModal = ref(false)
const showLargeModal = ref(false)

const handleCardClick = () => {
  alert('Interactive card clicked!')
}
</script>