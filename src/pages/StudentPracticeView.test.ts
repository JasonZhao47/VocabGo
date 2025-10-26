/**
 * StudentPracticeView Component Tests
 * 
 * Tests the student practice view page functionality including:
 * - Nickname entry modal display
 * - Session registration
 * - Wordlist display
 * - Progress tracking
 * - Personal mistakes display
 * 
 * Note: This file uses @ts-expect-error comments to access properties exposed via defineExpose().
 * This is a known limitation of Vue Test Utils + TypeScript where exposed properties
 * don't automatically update the component's type definition.
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import StudentPracticeView from './StudentPracticeView.vue'
import StudentNicknameEntry from '@/components/practice/StudentNicknameEntry.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Accordion from '@/components/ui/Accordion.vue'

// Mock composables
vi.mock('@/composables/useStudentSession', () => ({
  useStudentSession: vi.fn(() => ({
    nickname: { value: null },
    isLoading: { value: false },
    error: { value: null },
    registerSession: vi.fn(),
    hasActiveSession: vi.fn(() => false),
  })),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    showToast: vi.fn(),
  })),
}))

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: {
      shareToken: 'test-share-token-123',
    },
  })),
}))

describe('StudentPracticeView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component', () => {
    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('shows nickname entry modal on first visit', async () => {
    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    await flushPromises()
    await nextTick()

    const modal = wrapper.findComponent(StudentNicknameEntry)
    expect(modal.exists()).toBe(true)
  })

  it('displays loading state during session registration', async () => {
    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: null },
      isLoading: { value: true },
      error: { value: null },
      registerSession: vi.fn(),
      hasActiveSession: vi.fn(() => false),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.find('.loading-container').exists()).toBe(true)
    expect(wrapper.find('.loading-text').text()).toContain('Loading practice session')
  })

  it('displays error state when session registration fails', async () => {
    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: null },
      isLoading: { value: false },
      error: { value: 'Failed to register session' },
      registerSession: vi.fn(),
      hasActiveSession: vi.fn(() => false),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.find('.error-container').exists()).toBe(true)
    expect(wrapper.find('.error-text').text()).toContain('Failed to register session')
  })

  it('displays greeting with student nickname', async () => {
    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: '小明' },
      isLoading: { value: false },
      error: { value: null },
      registerSession: vi.fn(),
      hasActiveSession: vi.fn(() => true),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    // Set wordlist data
    await wrapper.vm.$nextTick()
    wrapper.vm.wordlist = {
      id: 'test-wordlist-id',
      title: 'Test Wordlist',
      words: [
        { en: 'hello', zh: '你好' },
        { en: 'world', zh: '世界' },
      ],
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.greeting').text()).toContain('小明')
  })

  it('displays wordlist title', async () => {
    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: 'Amy' },
      isLoading: { value: false },
      error: { value: null },
      registerSession: vi.fn(),
      hasActiveSession: vi.fn(() => true),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    // Set wordlist data
    await wrapper.vm.$nextTick()
    wrapper.vm.wordlist = {
      id: 'test-wordlist-id',
      title: 'My Vocabulary List',
      words: [
        { en: 'apple', zh: '苹果' },
      ],
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.wordlist-title').text()).toBe('My Vocabulary List')
  })

  it('displays progress indicator when questions are available', async () => {
    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: 'Test User' },
      isLoading: { value: false },
      error: { value: null },
      registerSession: vi.fn(),
      hasActiveSession: vi.fn(() => true),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    // Set wordlist and progress data
    await wrapper.vm.$nextTick()
    wrapper.vm.wordlist = {
      id: 'test-wordlist-id',
      title: 'Test Wordlist',
      words: [{ en: 'test', zh: '测试' }],
    }
    wrapper.vm.totalQuestions = 10
    wrapper.vm.answeredCount = 5
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.progress-indicator').exists()).toBe(true)
    expect(wrapper.find('.progress-text').text()).toBe('5 / 10')
  })

  it('calculates progress percentage correctly', async () => {
    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: 'Test User' },
      isLoading: { value: false },
      error: { value: null },
      registerSession: vi.fn(),
      hasActiveSession: vi.fn(() => true),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    // Set progress data
    await wrapper.vm.$nextTick()
    wrapper.vm.wordlist = {
      id: 'test-wordlist-id',
      title: 'Test Wordlist',
      words: [{ en: 'test', zh: '测试' }],
    }
    wrapper.vm.totalQuestions = 10
    wrapper.vm.answeredCount = 7
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.progressPercentage).toBe(70)
  })

  it('displays personal mistakes section when mistakes exist', async () => {
    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: 'Test User' },
      isLoading: { value: false },
      error: { value: null },
      registerSession: vi.fn(),
      hasActiveSession: vi.fn(() => true),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    // Set wordlist and mistakes data
    await wrapper.vm.$nextTick()
    wrapper.vm.wordlist = {
      id: 'test-wordlist-id',
      title: 'Test Wordlist',
      words: [{ en: 'test', zh: '测试' }],
    }
    wrapper.vm.personalMistakes = [
      { word: 'difficult', translation: '困难', count: 3 },
      { word: 'challenge', translation: '挑战', count: 2 },
    ]
    await wrapper.vm.$nextTick()

    const accordion = wrapper.findComponent(Accordion)
    expect(accordion.exists()).toBe(true)
    expect(wrapper.find('.stats-badge').text()).toBe('2 words')
  })

  it('handles nickname submission successfully', async () => {
    const mockRegisterSession = vi.fn().mockResolvedValue({
      success: true,
      wordlist: {
        id: 'test-wordlist-id',
        title: 'Test Wordlist',
        words: [
          { en: 'hello', zh: '你好' },
          { en: 'world', zh: '世界' },
        ],
      },
    })

    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: null },
      isLoading: { value: false },
      error: { value: null },
      registerSession: mockRegisterSession,
      hasActiveSession: vi.fn(() => false),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    await flushPromises()

    // Simulate nickname submission
    await wrapper.vm.handleNicknameSubmit('TestUser')
    await flushPromises()

    expect(mockRegisterSession).toHaveBeenCalledWith('test-share-token-123', 'TestUser')
  })

  it('handles retry session button click', async () => {
    const { useStudentSession } = await import('@/composables/useStudentSession')
    vi.mocked(useStudentSession).mockReturnValue({
      nickname: { value: null },
      isLoading: { value: false },
      error: { value: 'Session error' },
      registerSession: vi.fn(),
      hasActiveSession: vi.fn(() => false),
    } as any)

    const wrapper = mount(StudentPracticeView, {
      global: {
        components: {
          StudentNicknameEntry,
          Button,
          Card,
          Accordion,
        },
        stubs: {
          Teleport: true,
        },
      },
    })

    await flushPromises()

    const retryButton = wrapper.find('.error-container').findComponent(Button)
    expect(retryButton.exists()).toBe(true)

    await retryButton.trigger('click')
    await nextTick()

    expect(wrapper.vm.showNicknameModal).toBe(true)
  })
})
