import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ShareModal from './ShareModal.vue'
import Modal from '@/components/ui/Modal.vue'
import * as practiceShareService from '@/services/practiceShareService'
import * as htmlGenerationService from '@/services/htmlGenerationService'
import type { Question } from '@/types/practice'

// Mock services
vi.mock('@/services/practiceShareService')
vi.mock('@/services/htmlGenerationService')

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    from: vi.fn(),
    to: vi.fn(),
    set: vi.fn(),
    fromTo: vi.fn(),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    })),
  },
}))

describe('ShareModal', () => {
  const mockQuestions: Question[] = [
    {
      id: '1',
      type: 'multiple-choice',
      sentence: 'The cat is on the mat.',
      targetWord: 'cat',
      options: [
        { text: '猫', isCorrect: true },
        { text: '狗', isCorrect: false },
        { text: '鸟', isCorrect: false },
        { text: '鱼', isCorrect: false },
      ],
    },
  ]

  const defaultProps = {
    modelValue: true,
    practiceSetId: 'test-practice-set-id',
    questions: mockQuestions,
    wordlistName: 'Test Wordlist',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders initial state with generate button', () => {
    const wrapper = mount(ShareModal, {
      props: defaultProps,
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    expect(wrapper.find('.initial-state').exists()).toBe(true)
    expect(wrapper.find('.btn-generate').exists()).toBe(true)
  })

  it('generates share URL when button is clicked', async () => {
    const mockShareResponse = {
      shareUrl: 'abc123',
      fullUrl: 'http://localhost:5173/practice/shared/abc123',
    }

    vi.mocked(practiceShareService.sharePracticeSet).mockResolvedValue(mockShareResponse)

    const wrapper = mount(ShareModal, {
      props: defaultProps,
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.find('.btn-generate').trigger('click')
    await wrapper.vm.$nextTick()

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(practiceShareService.sharePracticeSet).toHaveBeenCalledWith('test-practice-set-id')
  })

  it('displays share options after URL is generated', async () => {
    const wrapper = mount(ShareModal, {
      props: {
        ...defaultProps,
        existingShareUrl: 'abc123',
      },
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.share-options').exists()).toBe(true)
    expect(wrapper.find('.share-input').exists()).toBe(true)
    expect(wrapper.find('.btn-copy').exists()).toBe(true)
    expect(wrapper.find('.btn-download').exists()).toBe(true)
  })

  it('copies URL to clipboard when copy button is clicked', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }
    Object.assign(navigator, { clipboard: mockClipboard })

    const wrapper = mount(ShareModal, {
      props: {
        ...defaultProps,
        existingShareUrl: 'abc123',
      },
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.find('.btn-copy').trigger('click')
    await wrapper.vm.$nextTick()

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      'http://localhost:3000/practice/shared/abc123'
    )
  })

  it('downloads HTML when download button is clicked', async () => {
    const mockHtml = '<html>Test HTML</html>'
    vi.mocked(htmlGenerationService.generateStaticHtml).mockReturnValue(mockHtml)

    // Mock URL.createObjectURL and document methods
    global.URL.createObjectURL = vi.fn(() => 'blob:test')
    global.URL.revokeObjectURL = vi.fn()
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

    const wrapper = mount(ShareModal, {
      props: {
        ...defaultProps,
        existingShareUrl: 'abc123',
      },
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.find('.btn-download').trigger('click')
    await wrapper.vm.$nextTick()

    expect(htmlGenerationService.generateStaticHtml).toHaveBeenCalledWith({
      questions: mockQuestions,
      wordlistName: 'Test Wordlist',
      shareUrl: 'abc123',
    })
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('shows delete confirmation modal when delete button is clicked', async () => {
    const wrapper = mount(ShareModal, {
      props: {
        ...defaultProps,
        existingShareUrl: 'abc123',
      },
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.find('.btn-delete').trigger('click')
    await wrapper.vm.$nextTick()

    // Check that the nested modal is shown
    const modals = wrapper.findAllComponents(Modal)
    expect(modals.length).toBeGreaterThan(1)
  })

  it('emits share-created event when share URL is generated', async () => {
    const mockShareResponse = {
      shareUrl: 'abc123',
      fullUrl: 'http://localhost:5173/practice/shared/abc123',
    }

    vi.mocked(practiceShareService.sharePracticeSet).mockResolvedValue(mockShareResponse)

    const wrapper = mount(ShareModal, {
      props: defaultProps,
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.find('.btn-generate').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('share-created')).toBeTruthy()
  })

  it('displays error message when share generation fails', async () => {
    vi.mocked(practiceShareService.sharePracticeSet).mockRejectedValue(
      new Error('Failed to generate share URL')
    )

    const wrapper = mount(ShareModal, {
      props: defaultProps,
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.find('.btn-generate').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-state').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Failed to generate share URL')
  })

  it('shows loading state while generating share URL', async () => {
    vi.mocked(practiceShareService.sharePracticeSet).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    const wrapper = mount(ShareModal, {
      props: defaultProps,
      global: {
        components: { Modal },
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.find('.btn-generate').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })
})
