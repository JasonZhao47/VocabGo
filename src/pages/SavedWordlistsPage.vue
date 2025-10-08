<template>
  <div>
    <h2>Saved Wordlists</h2>
    <ul>
      <li v-for="wl in lists" :key="wl.id">
        <span>{{ wl.filename }} — {{ wl.words.length }} words — {{ wl.createdAt.toLocaleString() }}</span>
        <button @click="remove(wl.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import wordlistsState, { remove } from '@/state/wordlistsState'

const lists = computed(() => wordlistsState.wordlists)
</script>

