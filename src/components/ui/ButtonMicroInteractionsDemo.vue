<template>
  <div class="p-8 space-y-8 max-w-4xl mx-auto bg-white">
    <div class="space-y-4">
      <h1 class="text-3xl font-bold text-gray-900">Button Micro-interactions Demo</h1>
      <p class="text-gray-600">
        This demo showcases the button micro-interactions implemented for Task 18.
        Hover over buttons to see the scale transform, click to see the active state.
      </p>
    </div>

    <!-- Hover Scale Transform Demo -->
    <section class="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-800">1. Hover Scale Transform (scale-[1.02])</h2>
      <p class="text-sm text-gray-600">Hover over these buttons to see the subtle scale-up effect</p>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
    </section>

    <!-- Active State Demo -->
    <section class="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-800">2. Active State (reduced opacity & scale-[0.98])</h2>
      <p class="text-sm text-gray-600">Click and hold these buttons to see the active state</p>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary">Click & Hold</Button>
        <Button variant="secondary">Click & Hold</Button>
        <Button variant="ghost">Click & Hold</Button>
        <Button variant="destructive">Click & Hold</Button>
      </div>
    </section>

    <!-- Transition Duration Demo -->
    <section class="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-800">3. Transition Duration (200ms with ease-in-out)</h2>
      <p class="text-sm text-gray-600">All transitions use 200ms duration (within 150-300ms range)</p>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary" size="sm">Small (200ms)</Button>
        <Button variant="primary" size="md">Medium (200ms)</Button>
        <Button variant="primary" size="lg">Large (200ms)</Button>
      </div>
    </section>

    <!-- Ripple Effect Demo -->
    <section class="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-800">4. Ripple Effect (Optional)</h2>
      <p class="text-sm text-gray-600">Click these buttons to see the ripple effect animation</p>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary" :ripple="true">Primary with Ripple</Button>
        <Button variant="secondary" :ripple="true">Secondary with Ripple</Button>
        <Button variant="ghost" :ripple="true">Ghost with Ripple</Button>
        <Button variant="destructive" :ripple="true">Destructive with Ripple</Button>
      </div>
    </section>

    <!-- Disabled State Demo -->
    <section class="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-800">5. Disabled State (no micro-interactions)</h2>
      <p class="text-sm text-gray-600">Disabled buttons should not have hover or active effects</p>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary" :disabled="true">Disabled Primary</Button>
        <Button variant="secondary" :disabled="true">Disabled Secondary</Button>
        <Button variant="ghost" :disabled="true">Disabled Ghost</Button>
      </div>
    </section>

    <!-- Loading State Demo -->
    <section class="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-800">6. Loading State (no micro-interactions)</h2>
      <p class="text-sm text-gray-600">Loading buttons should not have hover or active effects</p>
      <div class="flex flex-wrap gap-4">
        <Button variant="primary" :loading="true">Loading Primary</Button>
        <Button variant="secondary" :loading="true">Loading Secondary</Button>
        <Button variant="ghost" :loading="true">Loading Ghost</Button>
      </div>
    </section>

    <!-- Requirements Summary -->
    <section class="space-y-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
      <h2 class="text-xl font-semibold text-blue-900">✅ Requirements Met</h2>
      <ul class="space-y-2 text-sm text-blue-800">
        <li class="flex items-start gap-2">
          <span class="text-green-600 font-bold">✓</span>
          <span><strong>Requirement 12.1:</strong> Visual feedback within 100ms (immediate CSS transitions)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-600 font-bold">✓</span>
          <span><strong>Requirement 12.2:</strong> Show state changes on hover (scale and opacity)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-600 font-bold">✓</span>
          <span><strong>Requirement 6.1:</strong> Transitions between 150-300ms (using 200ms)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-600 font-bold">✓</span>
          <span><strong>Requirement 6.2:</strong> Use ease-in-out for transitions</span>
        </li>
      </ul>
    </section>

    <!-- Technical Details -->
    <section class="space-y-4 p-6 bg-gray-100 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-800">Technical Implementation</h2>
      <div class="space-y-2 text-sm text-gray-700 font-mono">
        <p>• Hover: <code class="bg-white px-2 py-1 rounded">hover:scale-[1.02]</code></p>
        <p>• Active: <code class="bg-white px-2 py-1 rounded">active:scale-[0.98]</code> + <code class="bg-white px-2 py-1 rounded">active:opacity-80</code></p>
        <p>• Duration: <code class="bg-white px-2 py-1 rounded">duration-200</code> (200ms)</p>
        <p>• Easing: <code class="bg-white px-2 py-1 rounded">ease-in-out</code></p>
        <p>• Ripple: <code class="bg-white px-2 py-1 rounded">animate-ripple</code> (300ms ease-out)</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
</script>
