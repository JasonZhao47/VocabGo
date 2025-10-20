<template>
  <div class="share-wordlist-container">
    <!-- Enable Sharing Button (when not shared) -->
    <Button
      v-if="!isShared"
      @click="handleEnableSharing"
      variant="primary"
      :loading="loading"
      :disabled="disabled"
      class="share-enable-button"
    >
      <template #icon>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </template>
      Enable Sharing
    </Button>

    <!-- Share Active State (when shared) -->
    <div v-else class="share-active-state">
      <!-- Share URL Display with Copy Button -->
      <div class="share-url-container">
        <div class="share-url-wrapper">
          <Input
            :modelValue="shareUrl"
            readonly
            class="share-url-input"
            :success="copySuccess"
          >
            <template #icon>
              <svg
                v-if="copySuccess"
                class="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </template>
          </Input>
          <Button
            @click="handleCopyUrl"
            variant="secondary"
            size="sm"
            :disabled="loading"
            class="copy-button"
            ref="copyButtonRef"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
        </div>
        
        <!-- Error Message -->
        <p v-if="error" class="error-message" role="alert">
          {{ error }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="share-actions">
        <Button
          @click="handleViewStats"
          variant="ghost"
          :disabled="loading"
          class="view-stats-button"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </template>
          View Stats
        </Button>
        <Button
          @click="handleDisableSharing"
          variant="destructive"
          size="sm"
          :loading="loading"
          class="disable-button"
        >
          Disable
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { enableSharing, disableSharing, copyShareUrl } from '@/services/sharingService'
import { useToast } from '@/composables/useToast'
import gsap from 'gsap'
import { useMotionPreference } from '@/composables/useMotionPreference'
import { animationConfig } from '@/config/animations'

interface Props {
  wordlistId: string
  initialShareToken?: string
  initialIsShared?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialIsShared: false,
  disabled: false,
})

const emit = defineEmits<{
  'share-enabled': [shareToken: string, shareUrl: string]
  'share-disabled': []
  'view-stats': []
}>()

const router = useRouter()
const { showToast } = useToast()
const { shouldAnimate, getDuration } = useMotionPreference()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const shareToken = ref<string | undefined>(props.initialShareToken)
const isShared = ref(props.initialIsShared)
const copySuccess = ref(false)
const copyButtonRef = ref<InstanceType<typeof Button> | null>(null)

// Computed
const shareUrl = computed(() => {
  if (!shareToken.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/practice/${shareToken.value}`
})

// Watch for prop changes
watch(() => props.initialShareToken, (newToken) => {
  shareToken.value = newToken
})

watch(() => props.initialIsShared, (newIsShared) => {
  isShared.value = newIsShared
})

/**
 * Handle enabling sharing
 */
async function handleEnableSharing() {
  loading.value = true
  error.value = null

  try {
    const result = await enableSharing(props.wordlistId)
    
    shareToken.value = result.shareToken
    isShared.value = true
    
    emit('share-enabled', result.shareToken, result.shareUrl)
    
    showToast({
      type: 'success',
      message: 'Sharing enabled! Share link is ready to copy.',
      duration: 3000,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to enable sharing'
    error.value = errorMessage
    
    showToast({
      type: 'error',
      message: errorMessage,
      duration: 5000,
    })
  } finally {
    loading.value = false
  }
}

/**
 * Handle copying share URL to clipboard
 */
async function handleCopyUrl() {
  if (!shareToken.value) return

  try {
    await copyShareUrl(shareToken.value)
    
    // Show success state
    copySuccess.value = true
    
    // Animate copy button with scale effect
    if (shouldAnimate.value && copyButtonRef.value?.$el) {
      gsap.fromTo(
        copyButtonRef.value.$el,
        { scale: 1 },
        {
          scale: 1.1,
          duration: getDuration(animationConfig.duration.fast) / 1000,
          ease: animationConfig.easing.easeOut,
          yoyo: true,
          repeat: 1,
        }
      )
    }
    
    showToast({
      type: 'success',
      message: 'Share link copied to clipboard!',
      duration: 2000,
    })
    
    // Reset success state after 2 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to copy share URL'
    
    showToast({
      type: 'error',
      message: errorMessage,
      duration: 5000,
    })
  }
}

/**
 * Handle disabling sharing
 */
async function handleDisableSharing() {
  loading.value = true
  error.value = null

  try {
    await disableSharing(props.wordlistId)
    
    shareToken.value = undefined
    isShared.value = false
    
    emit('share-disabled')
    
    showToast({
      type: 'success',
      message: 'Sharing disabled successfully.',
      duration: 3000,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to disable sharing'
    error.value = errorMessage
    
    showToast({
      type: 'error',
      message: errorMessage,
      duration: 5000,
    })
  } finally {
    loading.value = false
  }
}

/**
 * Handle viewing stats dashboard
 */
function handleViewStats() {
  emit('view-stats')
  router.push(`/dashboard/${props.wordlistId}`)
}
</script>

<style scoped>
.share-wordlist-container {
  @apply w-full;
}

.share-enable-button {
  @apply w-full sm:w-auto;
}

.share-active-state {
  @apply space-y-4;
}

.share-url-container {
  @apply space-y-2;
}

.share-url-wrapper {
  @apply flex gap-2 items-start;
  @apply relative;
  @apply p-4 rounded-xl;
  @apply bg-gradient-to-r from-purple-50 to-pink-50;
  @apply border-2 border-transparent;
  @apply transition-all duration-300;
  background-image: 
    linear-gradient(white, white),
    linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}

.share-url-wrapper:hover {
  @apply shadow-lg;
  background-image: 
    linear-gradient(white, white),
    linear-gradient(135deg, #9333ea 0%, #db2777 100%);
}

.share-url-input {
  @apply flex-1;
}

.copy-button {
  @apply flex-shrink-0;
}

.error-message {
  @apply text-sm text-red-600 flex items-center gap-1;
}

.share-actions {
  @apply flex gap-2 flex-wrap;
}

.view-stats-button {
  @apply flex-1 sm:flex-initial;
}

.disable-button {
  @apply flex-shrink-0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .share-url-wrapper {
    @apply flex-col;
  }
  
  .copy-button {
    @apply w-full;
  }
  
  .share-actions {
    @apply flex-col;
  }
  
  .view-stats-button,
  .disable-button {
    @apply w-full;
  }
}
</style>
