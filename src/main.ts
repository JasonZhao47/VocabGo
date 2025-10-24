import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { initializeMistakeRecording } from './services/practiceQuestionService'
import { initFontMonitoring } from './utils/fontLoadingPerformance'

// Initialize mistake recording system (processes queued mistakes)
initializeMistakeRecording()

// Initialize font loading monitoring (Task 27)
initFontMonitoring()

// Expose Supabase config to localStorage for HTML practice files
if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  localStorage.setItem('supabase_url', import.meta.env.VITE_SUPABASE_URL)
  localStorage.setItem('supabase_anon_key', import.meta.env.VITE_SUPABASE_ANON_KEY)
}

const app = createApp(App)
app.use(router)
app.mount('#app')

