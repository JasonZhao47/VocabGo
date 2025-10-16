# Component Examples

## ActionButton Examples

### Basic Usage

```vue
<script setup lang="ts">
import ActionButton from '@/components/ui/ActionButton.vue'

const handleClick = () => {
  console.log('Button clicked!')
}
</script>

<template>
  <ActionButton
    icon="download"
    label="Download file"
    @click="handleClick"
  />
</template>
```

### All Variants

```vue
<template>
  <div class="flex gap-4">
    <!-- Default variant -->
    <ActionButton
      icon="edit"
      label="Edit item"
      @click="handleEdit"
    />
    
    <!-- Danger variant -->
    <ActionButton
      icon="trash"
      label="Delete item"
      variant="danger"
      @click="handleDelete"
    />
  </div>
</template>
```

### States

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ActionButton from '@/components/ui/ActionButton.vue'

const isLoading = ref(false)
const isDisabled = ref(false)

const handleSave = async () => {
  isLoading.value = true
  await saveData()
  isLoading.value = false
}
</script>

<template>
  <div class="flex gap-4">
    <!-- Normal state -->
    <ActionButton
      icon="save"
      label="Save"
      @click="handleSave"
    />
    
    <!-- Loading state -->
    <ActionButton
      icon="save"
      label="Saving..."
      :loading="isLoading"
      :disabled="isLoading"
      @click="handleSave"
    />
    
    <!-- Disabled state -->
    <ActionButton
      icon="save"
      label="Save (disabled)"
      :disabled="true"
    />
  </div>
</template>
```

### In a Toolbar

```vue
<template>
  <div class="flex items-center justify-between p-4 border-b">
    <h2 class="text-xl font-semibold">My Documents</h2>
    
    <div class="flex gap-2">
      <ActionButton
        icon="refresh"
        label="Refresh list"
        @click="refreshList"
      />
      <ActionButton
        icon="filter"
        label="Filter documents"
        @click="openFilters"
      />
      <ActionButton
        icon="download"
        label="Download all"
        @click="downloadAll"
      />
    </div>
  </div>
</template>
```

---

## DataTable Examples

### Basic Table

```vue
<script setup lang="ts">
import { ref } from 'vue'
import DataTable from '@/components/ui/DataTable.vue'

const columns = [
  { key: 'name', label: 'Name', width: '40%' },
  { key: 'email', label: 'Email', width: '40%' },
  { key: 'role', label: 'Role', width: '20%' }
]

const data = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
])
</script>

<template>
  <DataTable
    :columns="columns"
    :data="data"
  />
</template>
```

### Table with Actions

```vue
<script setup lang="ts">
import { ref } from 'vue'
import DataTable from '@/components/ui/DataTable.vue'

const columns = [
  { key: 'filename', label: 'Filename', width: '50%' },
  { key: 'size', label: 'Size', width: '20%', align: 'right' },
  { key: 'modified', label: 'Modified', width: '30%' }
]

const actions = [
  {
    icon: 'eye',
    label: 'View file',
    onClick: (row) => viewFile(row.id)
  },
  {
    icon: 'download',
    label: 'Download file',
    onClick: (row) => downloadFile(row.id)
  },
  {
    icon: 'trash',
    label: 'Delete file',
    variant: 'danger',
    onClick: (row) => deleteFile(row.id)
  }
]

const files = ref([
  { id: 1, filename: 'document.pdf', size: '2.4 MB', modified: '2025-01-15' },
  { id: 2, filename: 'report.docx', size: '1.1 MB', modified: '2025-01-14' }
])
</script>

<template>
  <DataTable
    :columns="columns"
    :data="files"
    :actions="actions"
  />
</template>
```

### Table with Loading State

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/ui/DataTable.vue'

const loading = ref(true)
const data = ref([])

onMounted(async () => {
  loading.value = true
  data.value = await fetchData()
  loading.value = false
})
</script>

<template>
  <DataTable
    :columns="columns"
    :data="data"
    :loading="loading"
  />
</template>
```

### Table with Row Click

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import DataTable from '@/components/ui/DataTable.vue'

const router = useRouter()

const handleRowClick = (row) => {
  router.push(`/details/${row.id}`)
}
</script>

<template>
  <DataTable
    :columns="columns"
    :data="data"
    @row-click="handleRowClick"
  />
</template>
```

### Table with Custom Rendering

```vue
<script setup lang="ts">
import { h } from 'vue'
import DataTable from '@/components/ui/DataTable.vue'

const columns = [
  { key: 'name', label: 'Name' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => {
      const colors = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800'
      }
      return h('span', {
        class: `px-2 py-1 rounded-full text-xs font-medium ${colors[value]}`
      }, value)
    }
  },
  { 
    key: 'progress', 
    label: 'Progress',
    render: (value) => {
      return h('div', { class: 'w-full bg-gray-200 rounded-full h-2' }, [
        h('div', {
          class: 'bg-blue-600 h-2 rounded-full',
          style: { width: `${value}%` }
        })
      ])
    }
  }
]
</script>

<template>
  <DataTable
    :columns="columns"
    :data="data"
  />
</template>
```

### Table with Conditional Actions

```vue
<script setup lang="ts">
const actions = [
  {
    icon: 'edit',
    label: 'Edit',
    onClick: (row) => editItem(row),
    disabled: (row) => !row.editable
  },
  {
    icon: 'lock',
    label: 'Lock',
    onClick: (row) => lockItem(row),
    disabled: (row) => row.locked
  },
  {
    icon: 'trash',
    label: 'Delete',
    variant: 'danger',
    onClick: (row) => deleteItem(row),
    disabled: (row) => row.protected
  }
]
</script>

<template>
  <DataTable
    :columns="columns"
    :data="data"
    :actions="actions"
  />
</template>
```

---

## Sidebar Examples

### Basic Sidebar

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'

const collapsed = ref(false)

const items = [
  { id: 'home', label: 'Home', icon: 'home', route: '/' },
  { id: 'upload', label: 'Upload', icon: 'upload', route: '/upload' },
  { id: 'wordlists', label: 'Wordlists', icon: 'list', route: '/wordlists' }
]
</script>

<template>
  <Sidebar
    :collapsed="collapsed"
    :items="items"
    @toggle="collapsed = !collapsed"
  />
</template>
```

### Sidebar with Nested Items

```vue
<script setup lang="ts">
const items = [
  { id: 'home', label: 'Home', icon: 'home', route: '/' },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'folder',
    route: '/documents',
    children: [
      { id: 'recent', label: 'Recent', icon: 'clock', route: '/documents/recent' },
      { id: 'starred', label: 'Starred', icon: 'star', route: '/documents/starred' },
      { id: 'archived', label: 'Archived', icon: 'archive', route: '/documents/archived' }
    ]
  },
  { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings' }
]
</script>

<template>
  <Sidebar :items="items" />
</template>
```

### Sidebar with Badges

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const unreadCount = ref(5)
const pendingCount = ref(12)

const items = computed(() => [
  { 
    id: 'inbox', 
    label: 'Inbox', 
    icon: 'inbox', 
    route: '/inbox',
    badge: unreadCount.value > 0 ? unreadCount.value : undefined
  },
  { 
    id: 'pending', 
    label: 'Pending', 
    icon: 'clock', 
    route: '/pending',
    badge: pendingCount.value
  },
  { id: 'completed', label: 'Completed', icon: 'check', route: '/completed' }
])
</script>

<template>
  <Sidebar :items="items" />
</template>
```

### Full Layout with Sidebar

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import { useNavigation } from '@/composables/useNavigation'

const { collapsed, navigationItems, toggleSidebar } = useNavigation()
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <Sidebar
      :collapsed="collapsed"
      :items="navigationItems"
      @toggle="toggleSidebar"
    />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header (mobile only) -->
      <header class="lg:hidden flex items-center justify-between p-4 border-b">
        <h1 class="text-xl font-bold">VocabGo</h1>
        <button
          @click="toggleSidebar"
          class="p-2"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>
      </header>
      
      <!-- Page Content -->
      <main class="flex-1 overflow-auto bg-gray-50">
        <router-view />
      </main>
    </div>
  </div>
</template>
```

---

## CategoryCard Examples

### Basic Cards

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import CategoryCard from '@/components/ui/CategoryCard.vue'

const router = useRouter()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <CategoryCard
      title="Upload Document"
      description="Extract vocabulary from your documents"
      gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      @click="router.push('/upload')"
    />
    
    <CategoryCard
      title="Saved Wordlists"
      description="View and manage your collections"
      gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      @click="router.push('/wordlists')"
    />
  </div>
</template>
```

### Cards with Images

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <CategoryCard
      title="Business English"
      description="Professional vocabulary"
      image="/images/business.jpg"
      @click="selectCategory('business')"
    />
    
    <CategoryCard
      title="Academic Writing"
      description="Scholarly terms and phrases"
      image="/images/academic.jpg"
      @click="selectCategory('academic')"
    />
    
    <CategoryCard
      title="Everyday Conversation"
      description="Common expressions"
      image="/images/conversation.jpg"
      @click="selectCategory('conversation')"
    />
  </div>
</template>
```

### Cards with Custom Gradients

```vue
<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <CategoryCard
      title="Beginner"
      gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
      @click="selectLevel('beginner')"
    />
    
    <CategoryCard
      title="Intermediate"
      gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
      @click="selectLevel('intermediate')"
    />
    
    <CategoryCard
      title="Advanced"
      gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
      @click="selectLevel('advanced')"
    />
    
    <CategoryCard
      title="Expert"
      gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      @click="selectLevel('expert')"
    />
  </div>
</template>
```

### Responsive Grid

```vue
<template>
  <!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <CategoryCard
      v-for="category in categories"
      :key="category.id"
      :title="category.title"
      :description="category.description"
      :gradient="category.gradient"
      @click="selectCategory(category.id)"
    />
  </div>
</template>
```

---

## Combined Examples

### Complete Wordlists Page

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/ui/DataTable.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()
const wordlists = ref([])
const loading = ref(false)

const columns = [
  { key: 'filename', label: 'Filename', width: '40%' },
  { key: 'created_at', label: 'Date Created', width: '25%' },
  { key: 'word_count', label: 'Words', width: '15%', align: 'right' }
]

const actions = [
  {
    icon: 'eye',
    label: 'View wordlist',
    onClick: (row) => viewWordlist(row.id)
  },
  {
    icon: 'download',
    label: 'Download wordlist',
    onClick: async (row) => {
      await downloadWordlist(row.id)
      showToast('Downloaded successfully', 'success')
    }
  },
  {
    icon: 'trash',
    label: 'Delete wordlist',
    variant: 'danger',
    onClick: async (row) => {
      if (confirm('Are you sure?')) {
        await deleteWordlist(row.id)
        await loadWordlists()
        showToast('Deleted successfully', 'success')
      }
    }
  }
]

const loadWordlists = async () => {
  loading.value = true
  try {
    wordlists.value = await fetchWordlists()
  } catch (error) {
    showToast('Failed to load wordlists', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWordlists()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Saved Wordlists</h1>
      
      <div class="flex gap-2">
        <ActionButton
          icon="refresh"
          label="Refresh list"
          @click="loadWordlists"
        />
        <ActionButton
          icon="upload"
          label="Upload new document"
          @click="$router.push('/upload')"
        />
      </div>
    </div>
    
    <!-- Table -->
    <DataTable
      :columns="columns"
      :data="wordlists"
      :loading="loading"
      :actions="actions"
    />
    
    <!-- Empty State -->
    <div v-if="!loading && wordlists.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">No wordlists yet</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg"
        @click="$router.push('/upload')"
      >
        Upload your first document
      </button>
    </div>
  </div>
</template>
```

### Complete Homepage with Categories

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import CategoryCard from '@/components/ui/CategoryCard.vue'

const router = useRouter()

const categories = [
  {
    id: 'upload',
    title: 'Upload Document',
    description: 'Extract vocabulary from PDFs, DOCX, TXT, and XLSX files',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    route: '/upload'
  },
  {
    id: 'wordlists',
    title: 'Saved Wordlists',
    description: 'View and manage your vocabulary collections',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    route: '/wordlists'
  },
  {
    id: 'practice',
    title: 'Practice Questions',
    description: 'Test your knowledge with interactive exercises',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    route: '/practice'
  },
  {
    id: 'stats',
    title: 'Statistics',
    description: 'Track your learning progress',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    route: '/stats'
  }
]
</script>

<template>
  <div class="p-6">
    <!-- Hero Section -->
    <div class="mb-12">
      <h1 class="text-4xl font-bold mb-4">Welcome to VocabGo</h1>
      <p class="text-xl text-gray-600">
        AI-powered bilingual wordlist generator for English learners
      </p>
    </div>
    
    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <CategoryCard
        v-for="category in categories"
        :key="category.id"
        :title="category.title"
        :description="category.description"
        :gradient="category.gradient"
        @click="router.push(category.route)"
      />
    </div>
    
    <!-- Quick Stats -->
    <div class="mt-12 grid grid-cols-3 gap-6 max-w-2xl">
      <div class="text-center">
        <div class="text-3xl font-bold text-blue-600">1,234</div>
        <div class="text-sm text-gray-600">Words Learned</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold text-green-600">56</div>
        <div class="text-sm text-gray-600">Wordlists Created</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold text-purple-600">89%</div>
        <div class="text-sm text-gray-600">Practice Score</div>
      </div>
    </div>
  </div>
</template>
```

---

## Design Token Examples

### Using Tokens in Components

```vue
<script setup lang="ts">
import { designTokens } from '@/config/designTokens'
</script>

<template>
  <div class="custom-component">
    <h2>Custom Component</h2>
    <p>Using design tokens for consistency</p>
  </div>
</template>

<style scoped>
.custom-component {
  padding: v-bind('designTokens.spacing.lg');
  border-radius: v-bind('designTokens.borderRadius.lg');
  background: v-bind('designTokens.colors.white');
  box-shadow: v-bind('designTokens.shadows.md');
}

.custom-component h2 {
  font-size: v-bind('designTokens.typography.fontSize.xl');
  font-weight: v-bind('designTokens.typography.fontWeight.semibold');
  margin-bottom: v-bind('designTokens.spacing.md');
  color: v-bind('designTokens.colors.black');
}

.custom-component p {
  font-size: v-bind('designTokens.typography.fontSize.base');
  color: v-bind('designTokens.colors.gray[600]');
  line-height: v-bind('designTokens.typography.lineHeight.normal');
}
</style>
```

### Creating Custom Buttons with Tokens

```vue
<script setup lang="ts">
import { designTokens } from '@/config/designTokens'
</script>

<template>
  <button class="custom-button">
    Click Me
  </button>
</template>

<style scoped>
.custom-button {
  padding: v-bind('designTokens.spacing.md') v-bind('designTokens.spacing.lg');
  border-radius: v-bind('designTokens.borderRadius.md');
  font-size: v-bind('designTokens.typography.fontSize.base');
  font-weight: v-bind('designTokens.typography.fontWeight.medium');
  background: v-bind('designTokens.colors.gray[900]');
  color: v-bind('designTokens.colors.white');
  border: none;
  cursor: pointer;
  transition: all v-bind('designTokens.transitions.fast') v-bind('designTokens.transitions.easing');
}

.custom-button:hover {
  background: v-bind('designTokens.colors.gray[800]');
  transform: translateY(-1px);
  box-shadow: v-bind('designTokens.shadows.md');
}

.custom-button:active {
  transform: translateY(0);
}
</style>
```
