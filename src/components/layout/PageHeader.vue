<template>
  <header class="page-header">
    <!-- Small label (optional) -->
    <div v-if="label" class="page-label">
      {{ label }}
    </div>
    
    <!-- Main title -->
    <h1 class="page-title">
      {{ title }}
    </h1>
    
    <!-- Subtitle (optional) -->
    <p v-if="subtitle" class="page-subtitle">
      {{ subtitle }}
    </p>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  label?: string
}

defineProps<Props>()
</script>