import { createRouter, createWebHistory } from 'vue-router'

// Lazy load all route components for code-splitting
// HomePage is loaded eagerly as it's the landing page
import HomePage from '@/pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      name: 'home', 
      component: HomePage 
    },
    { 
      path: '/upload', 
      name: 'upload', 
      component: () => import('@/pages/UploadPage.vue')
    },
    { 
      path: '/processing', 
      name: 'processing', 
      component: () => import('@/pages/ProcessingPage.vue')
    },
    { 
      path: '/result', 
      name: 'result', 
      component: () => import('@/pages/ResultPage.vue')
    },
    { 
      path: '/wordlists', 
      name: 'wordlists', 
      component: () => import('@/pages/SavedWordlistsPage.vue')
    }
  ]
})

export default router

