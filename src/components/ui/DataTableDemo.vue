<template>
  <div class="demo-container">
    <h1>DataTable Component Demo</h1>
    
    <section class="demo-section">
      <h2>Basic Table</h2>
      <DataTable
        :columns="columns"
        :data="sampleData"
        :actions="actions"
        :on-row-click="handleRowClick"
      />
    </section>

    <section class="demo-section">
      <h2>Loading State</h2>
      <DataTable
        :columns="columns"
        :data="[]"
        :loading="true"
      />
    </section>

    <section class="demo-section">
      <h2>Empty State</h2>
      <DataTable
        :columns="columns"
        :data="[]"
      >
        <template #empty>
          <div style="text-align: center; padding: 24px;">
            <p style="font-size: 18px; margin: 0 0 8px 0;">📋</p>
            <p style="margin: 0; color: #6B7280;">No wordlists found</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #9CA3AF;">
              Upload a document to get started
            </p>
          </div>
        </template>
      </DataTable>
    </section>

    <section class="demo-section">
      <h2>Error State</h2>
      <DataTable
        :columns="columns"
        :data="[]"
        error="Failed to load wordlists"
      />
    </section>

    <section class="demo-section">
      <h2>With Custom Render</h2>
      <DataTable
        :columns="columnsWithRender"
        :data="sampleData"
        :actions="actions"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import DataTable from './DataTable.vue'

interface Wordlist {
  filename: string
  date: string
  wordCount: number
  status: string
}

const columns = [
  { key: 'filename', label: 'Filename', align: 'left' as const },
  { key: 'date', label: 'Date', align: 'left' as const },
  { key: 'wordCount', label: 'Word Count', align: 'right' as const },
  { key: 'status', label: 'Status', align: 'center' as const }
]

const columnsWithRender = [
  { 
    key: 'filename', 
    label: 'Filename', 
    align: 'left' as const,
    render: (value: string) => h('strong', { style: 'color: #3B82F6;' }, value)
  },
  { key: 'date', label: 'Date', align: 'left' as const },
  { 
    key: 'wordCount', 
    label: 'Word Count', 
    align: 'right' as const,
    render: (value: number) => h('span', { 
      style: 'background: #F0F0F0; padding: 4px 8px; border-radius: 4px; font-weight: 600;' 
    }, value.toString())
  },
  { 
    key: 'status', 
    label: 'Status', 
    align: 'center' as const,
    render: (value: string) => h('span', {
      style: value === 'Active' 
        ? 'color: #10B981; background: #D1FAE5; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;'
        : 'color: #6B7280; background: #F3F4F6; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;'
    }, value)
  }
]

const sampleData: Wordlist[] = [
  { filename: 'business-terms.pdf', date: '2025-01-15', wordCount: 35, status: 'Active' },
  { filename: 'science-vocab.docx', date: '2025-01-14', wordCount: 40, status: 'Active' },
  { filename: 'history-chapter.txt', date: '2025-01-13', wordCount: 28, status: 'Inactive' },
  { filename: 'literature-notes.pdf', date: '2025-01-12', wordCount: 32, status: 'Active' },
  { filename: 'economics-101.xlsx', date: '2025-01-11', wordCount: 25, status: 'Inactive' }
]

const actions = [
  {
    icon: '📥',
    label: 'Download',
    onClick: (row: Wordlist) => {
      console.log('Download:', row.filename)
      alert(`Downloading ${row.filename}`)
    }
  },
  {
    icon: '📝',
    label: 'Practice',
    onClick: (row: Wordlist) => {
      console.log('Practice:', row.filename)
      alert(`Starting practice with ${row.filename}`)
    }
  },
  {
    icon: '🗑️',
    label: 'Delete',
    variant: 'danger' as const,
    onClick: (row: Wordlist) => {
      console.log('Delete:', row.filename)
      if (confirm(`Delete ${row.filename}?`)) {
        alert(`Deleted ${row.filename}`)
      }
    },
    disabled: (row: Wordlist) => row.status === 'Inactive'
  }
]

const handleRowClick = (row: Wordlist) => {
  console.log('Row clicked:', row)
  alert(`Clicked on ${row.filename}`)
}
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 48px 0;
  color: #000000;
}

.demo-section {
  margin-bottom: 64px;
}

.demo-section h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #374151;
}
</style>
