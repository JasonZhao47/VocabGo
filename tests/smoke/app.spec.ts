import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import HomePage from '@/pages/HomePage.vue'

describe('App smoke', () => {
  it('renders HomePage', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', name: 'home', component: HomePage }]
    })
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.html()).toContain('VocabGo')
  })
})

