<template>
  <div class="wordlist-card-skeleton">
    <!-- Card header -->
    <div class="card-header">
      <Skeleton variant="text" width="70%" height="20px" />
    </div>
    
    <!-- Metadata row -->
    <div class="card-metadata">
      <Skeleton variant="rectangular" width="60px" height="24px" />
      <Skeleton variant="text" width="80px" height="14px" />
    </div>
    
    <!-- Date -->
    <div class="card-date">
      <Skeleton variant="text" width="100px" height="14px" />
    </div>
    
    <!-- Action buttons -->
    <div class="card-actions">
      <Skeleton variant="rectangular" width="80px" height="36px" />
      <Skeleton variant="rectangular" width="80px" height="36px" />
      <Skeleton variant="rectangular" width="36px" height="36px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from './Skeleton.vue'
</script>

<style scoped>
.wordlist-card-skeleton {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 16px;
}

.card-metadata {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-date {
  margin-bottom: 20px;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #F3F4F6;
}
</style>
