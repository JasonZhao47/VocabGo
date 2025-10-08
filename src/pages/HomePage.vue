<template>
  <div>
    <h1>VocabGo</h1>
    <p>Generate bilingual wordlists from your documents.</p>
    <button @click="goToUpload">Generate Wordlist</button>
    <button @click="goToWordlists">Saved Wordlists</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goToUpload() { router.push({ name: 'upload' }) }
function goToWordlists() { router.push({ name: 'wordlists' }) }
</script>

