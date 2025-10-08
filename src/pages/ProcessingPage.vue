<template>
  <div>
    <h2>Processing</h2>
    <ul>
      <li v-for="item in uploads" :key="item.id">
        <span>{{ item.file.name }} - {{ item.status }}</span>
      </li>
    </ul>
    <button v-if="isDone" @click="goToResult">View Result</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import uploadState, { allCompleted } from '@/state/uploadState'

const router = useRouter()
const uploads = computed(() => uploadState.uploads)
const isDone = computed(() => allCompleted.value)

function goToResult() {
  router.push({ name: 'result' })
}
</script>

