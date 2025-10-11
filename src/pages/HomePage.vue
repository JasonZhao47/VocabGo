<template>
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <!-- Header -->
    <header style="border-bottom: 1px solid #F5F5F5;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; height: 64px;">
          <!-- Logo -->
          <router-link to="/" style="font-size: 20px; font-weight: 700; color: #000000; text-decoration: none; transition: color 150ms;">
            VocabGo
          </router-link>
          
          <!-- Navigation -->
          <nav style="display: flex; align-items: center; gap: 24px;">
            <router-link to="/saved" style="font-size: 14px; color: #6B7280; text-decoration: none; transition: color 150ms;">
              Saved Wordlists
            </router-link>
          </nav>
          
          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            style="display: none; padding: 8px; color: #6B7280; background: none; border: none; cursor: pointer;"
            aria-label="Toggle menu"
          >
            <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <!-- Mobile menu -->
        <div v-if="isMobileMenuOpen" style="padding: 16px 0; border-top: 1px solid #F5F5F5;">
          <router-link
            to="/saved"
            @click="closeMobileMenu"
            style="display: block; padding: 8px 0; font-size: 14px; color: #6B7280; text-decoration: none;"
          >
            Saved Wordlists
          </router-link>
        </div>
      </div>
    </header>
    
    <!-- Hero Section -->
    <div style="flex: 1; display: flex; align-items: center; justify-center; padding: 0 24px;">
      <div style="max-width: 672px; margin: 0 auto; text-align: center; padding: 80px 0;">
        <!-- Heading -->
        <h1 style="font-size: 56px; line-height: 1.1; font-weight: 700; color: #000000; margin-bottom: 24px; letter-spacing: -0.02em;">
          VocabGo
        </h1>
        
        <!-- Subtitle -->
        <p style="font-size: 20px; line-height: 1.6; color: #6B7280; margin-bottom: 48px; max-width: 576px; margin-left: auto; margin-right: auto;">
          Generate bilingual wordlists from your documents
        </p>
        
        <!-- CTA Button -->
        <div style="margin-bottom: 32px;">
          <button
            @click="goToUpload"
            style="display: inline-flex; align-items: center; justify-content: center; height: 56px; padding: 0 32px; background: #000000; color: #ffffff; border: none; border-radius: 9999px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 150ms;"
            @mouseover="$event.target.style.background = '#1A1A1A'"
            @mouseout="$event.target.style.background = '#000000'"
          >
            Generate Wordlist
          </button>
        </div>
        
        <!-- Secondary link -->
        <div>
          <button
            @click="goToWordlists"
            style="font-size: 14px; color: #6B7280; background: none; border: none; cursor: pointer; transition: color 150ms;"
            @mouseover="$event.target.style.color = '#000000'"
            @mouseout="$event.target.style.color = '#6B7280'"
          >
            View Saved Wordlists
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function goToUpload() {
  router.push({ name: 'upload' })
}

function goToWordlists() {
  router.push({ name: 'wordlists' })
}
</script>
