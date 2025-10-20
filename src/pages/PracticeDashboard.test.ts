/**
 * PracticeDashboard Component Tests
 * 
 * Tests for the practice statistics dashboard page.
 * Requirements: FR4, FR5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import PracticeDashboard from './PracticeDashboard.vue'
import type { PracticeStats } from '@/composables/usePracticeStats'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: { wordlistId: 'test-wordlist-123' },
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/composables/usePracticeStats', () => ({
  usePracticeStats: vi.fn(() => ({
    stats: ref(null),
    isLoading: ref(false),
    error: ref(null),
    fetchStats: vi.fn(),
    generateFromMistakes: vi.fn(),
    clearCache: vi.fn(),
  })),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    showToast: vi.fn(),
  })),
}))

// Mock components
vi.mock('@/components/ui/Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button><slot /></button>',
    props: ['variant', 'loading', 'disabled'],
  },
}))

vi.mock('@/components/ui/Card.vue', () => ({
  default: {
    name: 'Card',
    template: '<div class="card"><slot name="header" /><slot /></div>',
    props: ['variant'],
  },
}))

vi.mock('@/components/ui/DataTable.vue', () => ({
  default: {
    name: 'DataTable',
    template: '<div class="data-table"><slot name="empty" /></div>',
    props: ['columns', 'data', 'loading'],
  },
}))

vi.mock('@/components/ui/Accordion.vue', () => ({
  default: {
    name: 'Accordion',
    template: '<div class="accordion"><slot name="header" /><slot /></div>',
    props: ['title', 'variant'],
  },
}))

describe('PracticeDashboard', () => {
  const mockStats: PracticeStats = {
    wordlistId: 'test-wordlist-123',
    totalStudents: 5,
    totalPractices: 15,
    students: [
      {
        sessionId: 'session-1',
        nickname: 'Alice',
        lastActive: new Date().toISOString(),
        totalMistakes: 8,
        topMistakes: [
          { word: 'apple', translation: '苹果', count: 3 },
          { word: 'banana', translation: '香蕉', count: 2 },
        ],
      },
      {
        sessionId: 'session-2',
        nickname: 'Bob',
        lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        totalMistakes: 5,
        topMistakes: [
          { word: 'cat', translation: '猫', count: 2 },
        ],
      },
    ],
    aggregateMistakes: [
      {
        word: 'apple',
        translation: '苹果',
        studentCount: 3,
        totalCount: 10,
        avgPerStudent: 3.3,
      },
      {
        word: 'banana',
        translation: '香蕉',
        studentCount: 2,
        totalCount: 5,
        avgPerStudent: 2.5,
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should display loading spinner when loading', async () => {
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(null),
        isLoading: ref(true),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      expect(wrapper.find('.loading-container').exists()).toBe(true)
      expect(wrapper.find('.loading-text').text()).toContain('Loading practice statistics')
    })
  })

  describe('Error State', () => {
    it('should display error message when fetch fails', async () => {
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(null),
        isLoading: ref(false),
        error: ref('Failed to load stats'),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.error-text').text()).toContain('Failed to load stats')
    })

    it('should allow retry on error', async () => {
      const mockFetchStats = vi.fn()
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(null),
        isLoading: ref(false),
        error: ref('Network error'),
        fetchStats: mockFetchStats,
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      const retryButton = wrapper.find('button')
      await retryButton.trigger('click')

      expect(mockFetchStats).toHaveBeenCalled()
    })
  })

  describe('Stats Display', () => {
    it('should display stats overview cards', async () => {
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(mockStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      const statCards = wrapper.findAll('.stat-card')
      expect(statCards).toHaveLength(3)

      // Check stat values
      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[0].text()).toBe('5') // Total students
      expect(statValues[1].text()).toBe('15') // Total practices
      expect(statValues[2].text()).toContain('3.0') // Avg mistakes (15 total / 5 students = 3.0)
    })

    it('should calculate average mistakes correctly', async () => {
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(mockStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      // Total mistakes: 10 + 5 = 15
      // Total students: 5
      // Average: 15 / 5 = 3.0
      const avgValue = wrapper.findAll('.stat-value')[2]
      expect(avgValue.text()).toBe('3.0')
    })
  })

  describe('Aggregate Mistakes Table', () => {
    it('should display most challenging words', async () => {
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(mockStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      expect(wrapper.find('.mistakes-section').exists()).toBe(true)
      expect(wrapper.find('.section-title').text()).toBe('Most Challenging Words')
    })

    it('should show empty state when no mistakes', async () => {
      const emptyStats = { ...mockStats, aggregateMistakes: [] }
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(emptyStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      expect(wrapper.text()).toContain('No mistakes recorded yet')
    })
  })

  describe('Student List', () => {
    it('should display individual students', async () => {
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(mockStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      const accordions = wrapper.findAll('.student-accordion')
      expect(accordions).toHaveLength(2)

      // Check student names
      const studentNames = wrapper.findAll('.student-name')
      expect(studentNames[0].text()).toBe('Alice')
      expect(studentNames[1].text()).toBe('Bob')
    })

    it('should show empty state when no students', async () => {
      const emptyStats = { ...mockStats, students: [] }
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(emptyStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      expect(wrapper.text()).toContain('No students yet')
      expect(wrapper.text()).toContain('Share your wordlist link')
    })

    it('should format relative time correctly', async () => {
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(mockStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      const studentMeta = wrapper.findAll('.student-meta')
      expect(studentMeta[0].text()).toContain('just now')
      expect(studentMeta[1].text()).toContain('1h ago')
    })
  })

  describe('Generate Questions', () => {
    it('should call generateFromMistakes when button clicked', async () => {
      const mockGenerate = vi.fn().mockResolvedValue({
        questions: { matching: [], fillBlank: [], multipleChoice: [] },
        targetWords: ['apple', 'banana'],
        metadata: {
          generationTimeMs: 1000,
          wordCount: 2,
          questionCounts: { matching: 1, fillBlank: 1, multipleChoice: 1 },
          filteredByStudents: false,
          mistakeStats: { totalMistakes: 15, studentCount: 5 },
        },
      })

      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(mockStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: mockGenerate,
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      const generateButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('Generate Questions')
      )
      
      await generateButton?.trigger('click')
      await flushPromises()

      expect(mockGenerate).toHaveBeenCalledWith(10)
    })

    it('should disable generate button when no mistakes', async () => {
      const emptyStats = { ...mockStats, aggregateMistakes: [] }
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(emptyStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      const generateButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('Generate Questions')
      )
      
      expect(generateButton?.attributes('disabled')).toBeDefined()
    })
  })

  describe('Export CSV', () => {
    it('should export CSV with correct data', async () => {
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(mockStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      // Mock URL.createObjectURL and document.createElement
      const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
      const mockRevokeObjectURL = vi.fn()
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL

      const mockClick = vi.fn()
      const mockLink = { click: mockClick, href: '', download: '' }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      const exportButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('Export CSV')
      )
      
      await exportButton?.trigger('click')
      await flushPromises()

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('should disable export button when no mistakes', async () => {
      const emptyStats = { ...mockStats, aggregateMistakes: [] }
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(emptyStats),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: vi.fn(),
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      const wrapper = mount(PracticeDashboard)
      await nextTick()

      const exportButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('Export CSV')
      )
      
      expect(exportButton?.attributes('disabled')).toBeDefined()
    })
  })

  describe('Initialization', () => {
    it('should fetch stats on mount', async () => {
      const mockFetchStats = vi.fn()
      const { usePracticeStats } = await import('@/composables/usePracticeStats')
      vi.mocked(usePracticeStats).mockReturnValue({
        stats: ref(null),
        isLoading: ref(false),
        error: ref(null),
        fetchStats: mockFetchStats,
        generateFromMistakes: vi.fn(),
        clearCache: vi.fn(),
      } as any)

      mount(PracticeDashboard)
      await nextTick()

      expect(mockFetchStats).toHaveBeenCalledWith('all')
    })
  })
})
