<template>
  <div class="data-table-container">
    <table v-if="!isMobile" class="data-table">
      <thead class="table-header">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="['table-header-cell', `align-${column.align || 'left'}`]"
            :style="column.width ? { width: column.width } : undefined"
          >
            {{ column.label }}
          </th>
          <th v-if="(actions && actions.length > 0) || $slots.actions" class="table-header-cell align-right">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="error">
          <tr>
            <td :colspan="columns.length + ((actions && actions.length > 0) || $slots.actions ? 1 : 0)" class="table-cell-empty">
              <div class="error-state">
                <slot name="error" :error="error">
                  <p class="error-state-icon">⚠️</p>
                  <p class="error-state-text">{{ error }}</p>
                  <p class="error-state-hint">Please try again later</p>
                </slot>
              </div>
            </td>
          </tr>
        </template>
        <template v-else-if="loading">
          <tr v-for="i in 5" :key="`skeleton-${i}`" class="table-row">
            <td v-for="column in columns" :key="column.key" class="table-cell">
              <div class="skeleton-loader"></div>
            </td>
            <td v-if="(actions && actions.length > 0) || $slots.actions" class="table-cell">
              <div class="skeleton-loader"></div>
            </td>
          </tr>
        </template>
        <template v-else-if="data.length === 0">
          <tr>
            <td :colspan="columns.length + ((actions && actions.length > 0) || $slots.actions ? 1 : 0)" class="table-cell-empty">
              <div class="empty-state">
                <slot name="empty">
                  <p class="empty-state-text">No data available</p>
                </slot>
              </div>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="(row, index) in data"
            :key="index"
            class="table-row"
            :class="{ 'clickable': onRowClick }"
            @click="handleRowClick(row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="['table-cell', `align-${column.align || 'left'}`]"
            >
              <component
                v-if="column.render"
                :is="column.render(row[column.key], row)"
              />
              <template v-else>
                {{ row[column.key] }}
              </template>
            </td>
            <td v-if="(actions && actions.length > 0) || $slots.actions" class="table-cell table-cell-actions align-right">
              <div class="table-actions">
                <slot name="actions" :row="row">
                  <button
                    v-for="action in actions"
                    :key="action.label"
                    :class="['action-button', action.variant || 'default']"
                    :disabled="action.disabled?.(row)"
                    :title="action.label"
                    @click.stop="action.onClick(row)"
                  >
                    <span class="action-icon">{{ action.icon }}</span>
                  </button>
                </slot>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Mobile Card Layout -->
    <div v-else class="card-layout">
      <template v-if="error">
        <div class="error-state">
          <slot name="error" :error="error">
            <p class="error-state-icon">⚠️</p>
            <p class="error-state-text">{{ error }}</p>
            <p class="error-state-hint">Please try again later</p>
          </slot>
        </div>
      </template>
      <template v-else-if="loading">
        <div v-for="i in 3" :key="`skeleton-card-${i}`" class="data-card">
          <div class="skeleton-loader skeleton-card"></div>
        </div>
      </template>
      <template v-else-if="data.length === 0">
        <div class="empty-state">
          <slot name="empty">
            <p class="empty-state-text">No data available</p>
          </slot>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(row, index) in data"
          :key="index"
          class="data-card"
          :class="{ 'clickable': onRowClick }"
          @click="handleRowClick(row)"
        >
          <div
            v-for="column in columns"
            :key="column.key"
            class="card-row"
          >
            <div class="card-label">{{ column.label }}</div>
            <div class="card-value">
              <component
                v-if="column.render"
                :is="column.render(row[column.key], row)"
              />
              <template v-else>
                {{ row[column.key] }}
              </template>
            </div>
          </div>
          <div v-if="actions && actions.length > 0" class="card-row card-actions-row">
            <div class="card-label">Actions</div>
            <div class="card-actions">
              <slot name="actions" :row="row">
                <button
                  v-for="action in actions"
                  :key="action.label"
                  :class="['action-button', action.variant || 'default']"
                  :disabled="action.disabled?.(row)"
                  :title="action.label"
                  @click.stop="action.onClick(row)"
                >
                  <span class="action-icon">{{ action.icon }}</span>
                </button>
              </slot>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { VNode } from 'vue'

interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: T) => string | VNode
}

interface TableAction {
  icon: string
  label: string
  onClick: (row: T) => void
  variant?: 'default' | 'danger'
  disabled?: (row: T) => boolean
}

interface Props {
  columns: TableColumn[]
  data: T[]
  loading?: boolean
  error?: string | null
  onRowClick?: (row: T) => void
  actions?: TableAction[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  actions: () => []
})

// Responsive behavior
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const handleRowClick = (row: T) => {
  if (props.onRowClick) {
    props.onRowClick(row)
  }
}
</script>

<style scoped>
.data-table-container {
  width: 100%;
  overflow-x: auto;
}

/* Table Styles */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  background: #FAFAFA;
  border-bottom: 1px solid #F0F0F0;
}

.table-header-cell {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  text-align: left;
  white-space: nowrap;
}

.table-header-cell.align-left {
  text-align: left;
}

.table-header-cell.align-center {
  text-align: center;
}

.table-header-cell.align-right {
  text-align: right;
}

.table-row {
  border-bottom: 1px solid #F5F5F5;
  transition: background 150ms ease-out;
}

.table-row:nth-child(even) {
  background: #FAFAFA;
}

.table-row:hover {
  background: #F5F5F5;
}

.table-row.clickable {
  cursor: pointer;
}

.table-cell {
  padding: 16px;
  font-size: 15px;
  color: #000000;
  min-height: 56px;
  vertical-align: middle;
}

.table-cell.align-left {
  text-align: left;
}

.table-cell.align-center {
  text-align: center;
}

.table-cell.align-right {
  text-align: right;
}

.table-cell-actions {
  width: 120px;
  white-space: nowrap;
}

.table-cell-empty {
  padding: 48px 16px;
  text-align: center;
}

/* Action Buttons */
.table-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  opacity: 0.6;
  transition: opacity 150ms ease-out;
}

.table-row:hover .table-actions {
  opacity: 1;
}

.action-button {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #6B7280;
  cursor: pointer;
  /* Optimize transitions for GPU acceleration */
  transition: transform 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out, background 150ms ease-out;
  padding: 0;
}

/* Touch-friendly targets on mobile */
@media (max-width: 767px) {
  .action-button {
    width: 44px;
    height: 44px;
  }
}

.action-button:hover:not(:disabled) {
  transform: scale(1.05);
  border-color: #D1D5DB;
  color: #000000;
}

.action-button.danger:hover:not(:disabled) {
  border-color: #FCA5A5;
  color: #DC2626;
  background: #FEF2F2;
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.action-icon {
  font-size: 16px;
  line-height: 1;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-state-text {
  font-size: 15px;
  color: #6B7280;
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.error-state-icon {
  font-size: 48px;
  margin: 0 0 16px 0;
}

.error-state-text {
  font-size: 15px;
  font-weight: 600;
  color: #DC2626;
  margin: 0 0 8px 0;
}

.error-state-hint {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

/* Loading Skeleton */
.skeleton-loader {
  height: 20px;
  background: linear-gradient(
    90deg,
    #F5F5F5 0%,
    #E5E7EB 50%,
    #F5F5F5 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-card {
  height: 120px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Mobile Card Layout */
.card-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-card {
  background: #FFFFFF;
  border: 1px solid #F0F0F0;
  border-radius: 8px;
  padding: 16px;
  transition: all 150ms ease-out;
}

.data-card:hover {
  background: #FAFAFA;
  border-color: #E5E7EB;
}

.data-card.clickable {
  cursor: pointer;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  min-height: 44px; /* Touch-friendly minimum */
}

.card-row:not(:last-child) {
  border-bottom: 1px solid #F5F5F5;
}

.card-label {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  flex-shrink: 0;
  margin-right: 16px;
}

.card-value {
  font-size: 15px;
  color: #000000;
  text-align: right;
  flex-grow: 1;
}

.card-actions-row {
  border-top: 2px solid #F0F0F0;
  padding-top: 12px;
  margin-top: 4px;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .table-row,
  .table-actions,
  .action-button,
  .data-card {
    transition-duration: 0.01ms;
  }
  
  .action-button:hover:not(:disabled),
  .action-button.danger:hover:not(:disabled) {
    transform: none;
  }
  
  @keyframes skeleton-loading {
    0%, 100% {
      background-position: 0 0;
    }
  }
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 767px) {
  .data-table {
    display: none;
  }
}

@media (min-width: 768px) {
  .card-layout {
    display: none;
  }
}
</style>
