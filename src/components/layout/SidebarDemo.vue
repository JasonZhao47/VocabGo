<template>
  <div class="sidebar-demo">
    <div class="sidebar-demo__controls">
      <h2>Sidebar Component Demo</h2>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="collapsed" />
          Collapsed
        </label>
        
        <label>
          <input type="checkbox" v-model="mobileOpen" />
          Mobile Open (resize window to &lt;768px to see effect)
        </label>
      </div>

      <div class="control-group">
        <SidebarToggle :collapsed="collapsed" @toggle="collapsed = !collapsed" />
      </div>
    </div>

    <div class="sidebar-demo__preview">
      <Sidebar
        :collapsed="collapsed"
        :items="navigationItems"
        v-model="mobileOpen"
      />
      
      <div class="sidebar-demo__content">
        <h3>Main Content Area</h3>
        <p>This is where your main content would go. The sidebar is positioned fixed on the left.</p>
        <p>On mobile (&lt;768px), the sidebar becomes a slide-out drawer that can be toggled with the hamburger menu.</p>
        <p>Try resizing your browser window to see the responsive behavior!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar, { type NavigationItem } from './Sidebar.vue'
import SidebarToggle from './SidebarToggle.vue'

const collapsed = ref(false)
const mobileOpen = ref(false)

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
    route: '/',
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>',
    route: '/upload',
  },
  {
    id: 'wordlists',
    label: 'Saved Wordlists',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',
    route: '/wordlists',
    badge: '3',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
    route: '/settings',
    children: [
      {
        id: 'profile',
        label: 'Profile',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>',
        route: '/settings/profile',
      },
      {
        id: 'preferences',
        label: 'Preferences',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>',
        route: '/settings/preferences',
      },
    ],
  },
]
</script>

<style scoped>
.sidebar-demo {
  min-height: 100vh;
  background: #F9FAFB;
}

.sidebar-demo__controls {
  position: fixed;
  top: 16px;
  right: 16px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 200;
  max-width: 300px;
}

.sidebar-demo__controls h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.control-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.sidebar-demo__preview {
  display: flex;
  min-height: 100vh;
}

.sidebar-demo__content {
  flex: 1;
  padding: 40px;
  margin-left: 260px;
  transition: margin-left 200ms ease-out;
}

@media (max-width: 767px) {
  .sidebar-demo__content {
    margin-left: 0;
  }

  .sidebar-demo__controls {
    position: static;
    margin: 16px;
    max-width: none;
  }
}
</style>
