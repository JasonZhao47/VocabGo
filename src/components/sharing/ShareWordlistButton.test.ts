import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ShareWordlistButton from './ShareWordlistButton.vue'
import { useRouter } from 'vue-router'
import * as sharingService from '@/services/sharingService'
import { useToast } from '@/composables/useToast'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/services/sharingService', () => ({
  enableSharing: vi.fn(),
  disableSharing: vi.fn(),
  copyShareUrl: vi.fn(),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(),
}))

vi.mock('@/composables/useMotionPreference', () => ({
  useMotionPreference: () => ({
    shouldAnimate: { value: false },
    getDuration: (duration: number) => duration,
  }),
}))

describe('ShareWordlistButton', () => {
  const mockRouter = {
    push: vi.fn(),
  }

  const mockShowToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast } as any)
  })

  it('renders enable sharing button when not shared', () => {
    const wrapper = mount(ShareWordlistButton, {
      props: {
        wordlistId: 'test-id',
        initialIsShared: false,
      },
    })

    expect(wrapper.text()).toContain('Enable Sharing')
  })

  it('renders share URL and actions when shared', () => {
    const wrapper = mount(ShareWordlistButton, {
      props: {
        wordlistId: 'test-id',
        initialShareToken: 'test-token',
        initialIsShared: true,
      },
    })

    expect(wrapper.find('.share-url-input').exists()).toBe(true)
    expect(wrapper.text()).toContain('View Stats')
    expect(wrapper.text()).toContain('Disable')
  })

  it('enables sharing when button is clicked', async () => {
    const mockResult = {
      shareToken: 'new-token',
      shareUrl: 'http://localhost/practice/new-token',
    }
    vi.mocked(sharingService.enableSharing).mockResolvedValue(mockResult)

    const wrapper = mount(ShareWordlistButton, {
      props: {
        wordlistId: 'test-id',
        initialIsShared: false,
      },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(sharingService.enableSharing).toHaveBeenCalledWith('test-id')
    expect(wrapper.emitted('share-enabled')).toBeTruthy()
    expect(wrapper.emitted('share-enabled')?.[0]).toEqual([
      'new-token',
      'http://localhost/practice/new-token',
    ])
  })

  it('navigates to dashboard when view stats is clicked', async () => {
    const wrapper = mount(ShareWordlistButton, {
      props: {
        wordlistId: 'test-id',
        initialShareToken: 'test-token',
        initialIsShared: true,
      },
    })

    const viewStatsButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('View Stats')
    )
    await viewStatsButton?.trigger('click')

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/test-id')
  })

  it('disables sharing when disable button is clicked', async () => {
    vi.mocked(sharingService.disableSharing).mockResolvedValue()

    const wrapper = mount(ShareWordlistButton, {
      props: {
        wordlistId: 'test-id',
        initialShareToken: 'test-token',
        initialIsShared: true,
      },
    })

    const disableButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('Disable')
    )
    await disableButton?.trigger('click')
    await wrapper.vm.$nextTick()

    expect(sharingService.disableSharing).toHaveBeenCalledWith('test-id')
    expect(wrapper.emitted('share-disabled')).toBeTruthy()
  })

  it('copies share URL when copy button is clicked', async () => {
    vi.mocked(sharingService.copyShareUrl).mockResolvedValue()

    const wrapper = mount(ShareWordlistButton, {
      props: {
        wordlistId: 'test-id',
        initialShareToken: 'test-token',
        initialIsShared: true,
      },
    })

    const copyButton = wrapper.find('.copy-button')
    await copyButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(sharingService.copyShareUrl).toHaveBeenCalledWith('test-token')
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        message: 'Share link copied to clipboard!',
      })
    )
  })
})
