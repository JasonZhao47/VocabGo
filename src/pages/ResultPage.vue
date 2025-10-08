<template>
  <div>
    <h2>Result</h2>
    <p>Each document yields ≤40 words.</p>
    <table>
      <thead>
        <tr><th>English</th><th>Mandarin</th></tr>
      </thead>
      <tbody>
        <tr v-for="pair in wordPairs" :key="pair.en">
          <td>{{ pair.en }}</td>
          <td>{{ pair.zh }}</td>
        </tr>
      </tbody>
    </table>
    <button @click="saveList">Save to My Wordlists</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import uploadState from '@/state/uploadState'
import wordlistsState, { saveCurrent } from '@/state/wordlistsState'

const wordPairs = computed(() => uploadState.latestWordPairs)

function saveList() {
  saveCurrent(uploadState.latestFilename, wordPairs.value)
}
</script>

