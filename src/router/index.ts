import { createRouter, createWebHistory } from 'vue-router'
import { getSessionId } from '@/lib/session'

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
      path: '/result', 
      name: 'result', 
      component: () => import('@/pages/ResultPage.vue')
    },
    { 
      path: '/wordlists', 
      name: 'wordlists', 
      component: () => import('@/pages/SavedWordlistsPage.vue')
    },
    { 
      path: '/dashboard/:wordlistId', 
      name: 'practice-dashboard', 
      component: () => import('@/pages/PracticeDashboard.vue')
    },
    { 
      path: '/practice/:shareToken', 
      name: 'student-practice', 
      component: () => import('@/pages/StudentPracticeView.vue')
    },
    { 
      path: '/practice', 
      redirect: '/wordlists'
    },
    { 
      path: '/toast-demo', 
      name: 'toast-demo', 
      component: () => import('@/pages/ToastDemo.vue')
    }
  ]
})

// Route guard for dashboard - requires session
router.beforeEach((to, from, next) => {
  if (to.meta.requiresSession) {
    const sessionId = getSessionId()
    if (!sessionId) {
      // Redirect to home if no session exists
      next({ name: 'home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

