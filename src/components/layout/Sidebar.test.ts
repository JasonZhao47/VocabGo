import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Sidebar from './Sidebar.vue'
import type { NavigationItem } from './Sidebar.vue'

// Mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/upload', name: 'upload', component: { template: '<div>Upload</div>' } },
    { path: '/wordlists', name: 'wordlists', component: { template: '<div>Wordlists</div>' } },
  ],
})

const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '<svg><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
    route: '/',
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: '<svg><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>',
    route: '/upload',
  },
  {
    id: 'wordlists',
    label: 'Saved Wordlists',
    icon: '<svg><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    route: '/wordlists',
    badge: '3',
  },
]

describe('Sidebar', () => {
  beforeEach(async () => {
    await router.push('/')
    await router.isReady()
  })

  it('renders navigation items', () => {
    const wrapper = mount(Sidebar, {
      props: {
        items: mockNavigationItems,
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Upload')
    expect(wrapper.text()).toContain('Saved Wordlists')
  })

  it('applies collapsed class when collapsed prop is true', () => {
    const wrapper = mount(Sidebar, {
      props: {
        items: mockNavigationItems,
        collapsed: true,
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('.sidebar--collapsed').exists()).toBe(true)
  })

  it('hides labels when collapsed', () => {
    const wrapper = mount(Sidebar, {
      props: {
        items: mockNavigationItems,
        collapsed: true,
      },
      global: {
        plugins: [router],
      },
    })

    const labels = wrapper.findAll('.sidebar__label')
    labels.forEach(label => {
      expect(label.isVisible()).toBe(false)
    })
  })

  it('displays badges when provided', () => {
    const wrapper = mount(Sidebar, {
      props: {
        items: mockNavigationItems,
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('3')
  })

  it('renders collapsible groups', () => {
    const itemsWithGroups: NavigationItem[] = [
      {
        id: 'settings',
        label: 'Settings',
        icon: '<svg><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
        route: '/settings',
        children: [
          {
            id: 'profile',
            label: 'Profile',
            icon: '<svg><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
            route: '/settings/profile',
          },
          {
            id: 'preferences',
            label: 'Preferences',
            icon: '<svg><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>',
            route: '/settings/preferences',
          },
        ],
      },
    ]

    const wrapper = mount(Sidebar, {
      props: {
        items: itemsWithGroups,
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('.sidebar__link--group').exists()).toBe(true)
    expect(wrapper.find('.sidebar__chevron').exists()).toBe(true)
  })

  it('toggles group expansion on click', async () => {
    const itemsWithGroups: NavigationItem[] = [
      {
        id: 'settings',
        label: 'Settings',
        icon: '<svg></svg>',
        route: '/settings',
        children: [
          {
            id: 'profile',
            label: 'Profile',
            icon: '<svg></svg>',
            route: '/settings/profile',
          },
        ],
      },
    ]

    const wrapper = mount(Sidebar, {
      props: {
        items: itemsWithGroups,
      },
      global: {
        plugins: [router],
      },
    })

    const groupButton = wrapper.find('.sidebar__link--group')
    
    // Initially collapsed
    expect(groupButton.attributes('aria-expanded')).toBe('false')
    
    // Click to expand
    await groupButton.trigger('click')
    expect(groupButton.attributes('aria-expanded')).toBe('true')
    
    // Click to collapse
    await groupButton.trigger('click')
    expect(groupButton.attributes('aria-expanded')).toBe('false')
  })

  it('emits update:modelValue when sidebar is toggled on mobile', async () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    const wrapper = mount(Sidebar, {
      props: {
        items: mockNavigationItems,
        modelValue: false,
      },
      global: {
        plugins: [router],
      },
    })

    // Trigger resize to detect mobile
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()

    // Open sidebar
    const component = wrapper.vm as any
    component.openSidebar()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('has proper ARIA labels for accessibility', () => {
    const wrapper = mount(Sidebar, {
      props: {
        items: mockNavigationItems,
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('aside').attributes('aria-label')).toBe('Main navigation')
    expect(wrapper.find('nav').attributes('role')).toBe('navigation')
  })
})
