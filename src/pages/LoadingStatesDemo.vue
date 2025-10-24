<template>
  <div class="demo-page">
    <div class="demo-container">
      <h1 class="demo-title">Loading & Empty States Demo</h1>
      <p class="demo-subtitle">
        Comprehensive loading, empty, and error state components with ElevenLabs styling
      </p>

      <!-- Loading Spinners -->
      <section class="demo-section">
        <h2 class="section-title">Loading Spinners</h2>
        <div class="demo-grid">
          <div class="demo-card">
            <h3 class="card-title">Small</h3>
            <LoadingSpinner size="sm" />
          </div>
          <div class="demo-card">
            <h3 class="card-title">Medium</h3>
            <LoadingSpinner size="md" />
          </div>
          <div class="demo-card">
            <h3 class="card-title">Large</h3>
            <LoadingSpinner size="lg" />
          </div>
          <div class="demo-card">
            <h3 class="card-title">With Label</h3>
            <LoadingSpinner size="md" label="Loading data..." />
          </div>
        </div>
      </section>

      <!-- Empty States -->
      <section class="demo-section">
        <h2 class="section-title">Empty States</h2>
        <div class="demo-stack">
          <div class="demo-card-full">
            <h3 class="card-title">No Data</h3>
            <EmptyState
              variant="no-data"
              title="No wordlists found"
              description="Upload a document to create your first wordlist"
              action-label="Upload Document"
              @action="handleAction('upload')"
            />
          </div>
          
          <div class="demo-card-full">
            <h3 class="card-title">Search Results</h3>
            <EmptyState
              variant="search"
              title="No results found"
              description="Try adjusting your search query"
            />
          </div>
          
          <div class="demo-card-full">
            <h3 class="card-title">Custom Icon</h3>
            <EmptyState
              variant="custom"
              title="No practice sessions"
              description="Start practicing to see your progress here"
              action-label="Start Practice"
              @action="handleAction('practice')"
            >
              <template #icon>
                <svg 
                  class="w-20 h-20 text-gray-300"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="1.5" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
                  />
                </svg>
              </template>
            </EmptyState>
          </div>
        </div>
      </section>

      <!-- Error States -->
      <section class="demo-section">
        <h2 class="section-title">Error States</h2>
        <div class="demo-stack">
          <div class="demo-card-full">
            <h3 class="card-title">Basic Error</h3>
            <ErrorState
              title="Failed to load data"
              message="Unable to fetch wordlists. Please check your connection and try again."
              @retry="handleAction('retry')"
            />
          </div>
          
          <div class="demo-card-full">
            <h3 class="card-title">Error with Cancel</h3>
            <ErrorState
              title="Upload failed"
              message="The file could not be processed. Please try a different file or contact support."
              :show-retry="true"
              :show-cancel="true"
              retry-label="Try Again"
              cancel-label="Go Back"
              @retry="handleAction('retry')"
              @cancel="handleAction('cancel')"
            />
          </div>
        </div>
      </section>

      <!-- Content Loader -->
      <section class="demo-section">
        <h2 class="section-title">Content Loader</h2>
        <div class="demo-controls">
          <button 
            @click="loaderState = 'loading'"
            :class="['control-button', { active: loaderState === 'loading' }]"
          >
            Loading
          </button>
          <button 
            @click="loaderState = 'error'"
            :class="['control-button', { active: loaderState === 'error' }]"
          >
            Error
          </button>
          <button 
            @click="loaderState = 'empty'"
            :class="['control-button', { active: loaderState === 'empty' }]"
          >
            Empty
          </button>
          <button 
            @click="loaderState = 'content'"
            :class="['control-button', { active: loaderState === 'content' }]"
          >
            Content
          </button>
        </div>
        
        <div class="demo-card-full">
          <ContentLoader
            :loading="loaderState === 'loading'"
            :error="loaderState === 'error' ? 'Failed to load content' : null"
            :empty="loaderState === 'empty'"
            loading-label="Loading content..."
            error-title="Content Error"
            empty-title="No content available"
            empty-description="There is no content to display at this time"
            empty-action-label="Refresh"
            @retry="handleAction('retry')"
            @empty-action="handleAction('refresh')"
          >
            <div class="demo-content">
              <h3 class="content-title">Sample Content</h3>
              <p class="content-text">
                This is the actual content that appears when data is loaded successfully.
                The content fades in smoothly with a subtle animation.
              </p>
              <div class="content-grid">
                <div class="content-item">Item 1</div>
                <div class="content-item">Item 2</div>
                <div class="content-item">Item 3</div>
                <div class="content-item">Item 4</div>
              </div>
            </div>
          </ContentLoader>
        </div>
      </section>

      <!-- Skeleton Screens -->
      <section class="demo-section">
        <h2 class="section-title">Skeleton Screens</h2>
        <div class="demo-stack">
          <div class="demo-card-full">
            <h3 class="card-title">Table Skeleton</h3>
            <WordlistTableSkeleton :rows="5" />
          </div>
          
          <div class="demo-card-full">
            <h3 class="card-title">Card Skeleton</h3>
            <WordlistCardSkeleton />
          </div>
        </div>
      </section>

      <!-- Action Log -->
      <section v-if="actionLog.length > 0" class="demo-section">
        <h2 class="section-title">Action Log</h2>
        <div class="demo-card-full">
          <div class="action-log">
            <div 
              v-for="(action, index) in actionLog" 
              :key="index"
              class="log-entry"
            >
              <span class="log-time">{{ action.time }}</span>
              <span class="log-action">{{ action.action }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  LoadingSpinner, 
  EmptyState, 
  ErrorState, 
  ContentLoader,
  WordlistTableSkeleton,
  WordlistCardSkeleton
} from '@/components/ui'

const loaderState = ref<'loading' | 'error' | 'empty' | 'content'>('loading')
const actionLog = ref<Array<{ time: string; action: string }>>([])

function handleAction(action: string) {
  const time = new Date().toLocaleTimeString()
  actionLog.value.unshift({ time, action })
  
  // Keep only last 10 actions
  if (actionLog.value.length > 10) {
    actionLog.value = actionLog.value.slice(0, 10)
  }
}
</script>

<style scoped>
/* Demo Page Styling */
.demo-page {
  min-height: 100vh;
  background: rgb(255, 255, 255);
  padding: 64px 24px;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-title {
  font-size: 48px;
  font-weight: 700;
  color: rgb(0, 0, 0);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 12px;
}

.demo-subtitle {
  font-size: 18px;
  font-weight: 400;
  color: rgb(115, 115, 115);
  line-height: 1.6;
  margin-bottom: 48px;
}

.demo-section {
  margin-bottom: 64px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: rgb(0, 0, 0);
  letter-spacing: -0.01em;
  margin-bottom: 24px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.demo-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.demo-card {
  background: rgb(250, 250, 250);
  border: 1px solid rgb(242, 242, 242);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.demo-card-full {
  background: rgb(250, 250, 250);
  border: 1px solid rgb(242, 242, 242);
  border-radius: 12px;
  padding: 32px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: rgb(115, 115, 115);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.demo-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.control-button {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  color: rgb(0, 0, 0);
  background: rgb(255, 255, 255);
  border: 1px solid rgb(229, 229, 229);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.control-button:hover {
  background: rgb(250, 250, 250);
}

.control-button.active {
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  border-color: rgb(0, 0, 0);
}

.demo-content {
  padding: 32px;
  background: rgb(255, 255, 255);
  border-radius: 12px;
  border: 1px solid rgb(242, 242, 242);
}

.content-title {
  font-size: 20px;
  font-weight: 700;
  color: rgb(0, 0, 0);
  margin-bottom: 12px;
}

.content-text {
  font-size: 16px;
  font-weight: 400;
  color: rgb(115, 115, 115);
  line-height: 1.6;
  margin-bottom: 24px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.content-item {
  padding: 24px;
  background: rgb(250, 250, 250);
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: rgb(0, 0, 0);
}

.action-log {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: rgb(255, 255, 255);
  border-radius: 8px;
  font-size: 14px;
}

.log-time {
  color: rgb(115, 115, 115);
  font-weight: 400;
  min-width: 100px;
}

.log-action {
  color: rgb(0, 0, 0);
  font-weight: 600;
}

@media (max-width: 767px) {
  .demo-title {
    font-size: 32px;
  }
  
  .demo-subtitle {
    font-size: 16px;
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
