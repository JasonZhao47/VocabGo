<template>
  <div class="wordlist-table-skeleton">
    <!-- Table header skeleton -->
    <div class="table-header">
      <Skeleton variant="text" width="80px" height="12px" />
      <Skeleton variant="text" width="100px" height="12px" />
    </div>
    
    <!-- Table rows skeleton -->
    <div 
      v-for="i in rows" 
      :key="i" 
      class="table-row"
      :style="{ animationDelay: `${i * 50}ms` }"
    >
      <div class="cell">
        <Skeleton variant="text" width="120px" height="16px" />
      </div>
      <div class="cell">
        <Skeleton variant="text" width="100px" height="16px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from './Skeleton.vue'

interface Props {
  rows?: number
}

withDefaults(defineProps<Props>(), {
  rows: 5,
})
</script>

<style scoped>
.wordlist-table-skeleton {
  background: white;
  border-radius: 12px;
  border: 1px solid #F3F4F6;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 16px 20px;
  border-bottom: 1px solid #F9FAFB;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 16px 20px;
  border-bottom: 1px solid #F9FAFB;
  opacity: 0;
  animation: fadeIn 250ms ease-out forwards;
}

.table-row:last-child {
  border-bottom: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .table-row {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

.cell {
  display: flex;
  align-items: center;
}
</style>
