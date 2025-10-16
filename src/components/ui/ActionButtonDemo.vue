<script setup lang="ts">
import { ref } from 'vue'
import ActionButton from './ActionButton.vue'

const loading = ref(false)
const disabled = ref(false)

const handleDownload = () => {
  console.log('Download clicked')
}

const handleDelete = () => {
  console.log('Delete clicked')
}

const handleShare = () => {
  console.log('Share clicked')
}

const handleLoadingDemo = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div class="demo-container">
    <h2 class="demo-title">ActionButton Component Demo</h2>
    
    <div class="demo-section">
      <h3 class="demo-subtitle">Default Variant</h3>
      <div class="demo-buttons">
        <ActionButton
          icon="📥"
          label="Download"
          @click="handleDownload"
        />
        <ActionButton
          icon="📤"
          label="Share"
          @click="handleShare"
        />
        <ActionButton
          icon="✏️"
          label="Edit"
          @click="() => console.log('Edit clicked')"
        />
      </div>
    </div>

    <div class="demo-section">
      <h3 class="demo-subtitle">Danger Variant</h3>
      <div class="demo-buttons">
        <ActionButton
          icon="🗑️"
          label="Delete"
          variant="danger"
          @click="handleDelete"
        />
        <ActionButton
          icon="⚠️"
          label="Warning"
          variant="danger"
          @click="() => console.log('Warning clicked')"
        />
      </div>
    </div>

    <div class="demo-section">
      <h3 class="demo-subtitle">States</h3>
      <div class="demo-buttons">
        <ActionButton
          icon="⏳"
          label="Loading"
          :loading="loading"
          @click="handleLoadingDemo"
        />
        <ActionButton
          icon="🚫"
          label="Disabled"
          :disabled="disabled"
          @click="() => console.log('Should not fire')"
        />
      </div>
      <div class="demo-controls">
        <label>
          <input type="checkbox" v-model="disabled" />
          Toggle Disabled State
        </label>
      </div>
    </div>

    <div class="demo-section">
      <h3 class="demo-subtitle">Tooltip Positions</h3>
      <div class="demo-buttons">
        <ActionButton
          icon="⬆️"
          label="Tooltip Top"
          tooltip-position="top"
          @click="() => console.log('Top clicked')"
        />
        <ActionButton
          icon="⬇️"
          label="Tooltip Bottom"
          tooltip-position="bottom"
          @click="() => console.log('Bottom clicked')"
        />
        <ActionButton
          icon="⬅️"
          label="Tooltip Left"
          tooltip-position="left"
          @click="() => console.log('Left clicked')"
        />
        <ActionButton
          icon="➡️"
          label="Tooltip Right"
          tooltip-position="right"
          @click="() => console.log('Right clicked')"
        />
      </div>
    </div>

    <div class="demo-section">
      <h3 class="demo-subtitle">In Table Context</h3>
      <div class="demo-table">
        <div class="demo-table-row">
          <span class="demo-table-cell">Document 1.pdf</span>
          <span class="demo-table-cell">2025-01-16</span>
          <div class="demo-table-actions">
            <ActionButton
              icon="📥"
              label="Download"
              @click="handleDownload"
            />
            <ActionButton
              icon="📤"
              label="Share"
              @click="handleShare"
            />
            <ActionButton
              icon="🗑️"
              label="Delete"
              variant="danger"
              @click="handleDelete"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}

.demo-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #000000;
}

.demo-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.demo-subtitle {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #374151;
}

.demo-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-controls {
  margin-top: 16px;
}

.demo-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.demo-controls input[type="checkbox"] {
  cursor: pointer;
}

.demo-table {
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
}

.demo-table-row {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 150ms ease-out;
}

.demo-table-row:hover {
  background: #fafafa;
}

.demo-table-cell {
  flex: 1;
  font-size: 15px;
  color: #000000;
}

.demo-table-actions {
  display: flex;
  gap: 8px;
  opacity: 0.6;
  transition: opacity 150ms ease-out;
}

.demo-table-row:hover .demo-table-actions {
  opacity: 1;
}
</style>
