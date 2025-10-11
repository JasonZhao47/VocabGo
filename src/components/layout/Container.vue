<template>
  <div class="container-main">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Container component for centered content with generous spacing (Task 3.2)
// Max-width 700px, massive vertical padding, minimal horizontal padding
</script>

<style scoped>
.container-main {
  /* Centered content with max-width 700px (narrower for better focus) */
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  /* Mobile padding: 60px top, 40px bottom */
  padding-top: 60px;
  padding-bottom: 40px;
  
  /* Minimal horizontal padding: 24px on mobile */
  padding-left: 24px;
  padding-right: 24px;
  
  /* Minimum height to fill viewport */
  min-height: calc(100vh - 120px);
}

/* Tablet responsive padding (768px+) */
@media (min-width: 768px) {
  .container-main {
    /* Slightly more horizontal padding on tablet */
    padding-left: 32px;
    padding-right: 32px;
    
    /* Increase vertical padding on tablet */
    padding-top: 80px;
    padding-bottom: 60px;
  }
}

/* Desktop: MASSIVE vertical padding (120px+ top, 80px+ bottom) */
@media (min-width: 1024px) {
  .container-main {
    /* MASSIVE vertical padding on desktop */
    padding-top: 120px;
    padding-bottom: 80px;
    
    /* Keep minimal horizontal padding */
    padding-left: 32px;
    padding-right: 32px;
  }
}
</style>