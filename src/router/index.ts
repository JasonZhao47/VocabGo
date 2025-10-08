import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import UploadPage from '@/pages/UploadPage.vue'
import ProcessingPage from '@/pages/ProcessingPage.vue'
import ResultPage from '@/pages/ResultPage.vue'
import SavedWordlistsPage from '@/pages/SavedWordlistsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/upload', name: 'upload', component: UploadPage },
    { path: '/processing', name: 'processing', component: ProcessingPage },
    { path: '/result', name: 'result', component: ResultPage },
    { path: '/wordlists', name: 'wordlists', component: SavedWordlistsPage }
  ]
})

export default router

