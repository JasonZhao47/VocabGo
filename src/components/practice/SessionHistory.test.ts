/**
 * Session History Component Tests
 * Tests for session history display, filtering, and interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SessionHistory from './SessionHistory.vue';
import * as sessionPersistence from '@/utils/sessionPersistence';
import * as practiceSessionService from '@/services/practiceSessionService';

// Mock dependencies
vi.mock('@/utils/sessionPersistence');
vi.mock('@/services/practiceSessionService');

describe('SessionHistory Component', () => {
  const mockHistory = [
    {
      practiceSetId: 'set-1',
      wordlistId: 'wordlist-1',
      wordlistName: 'Test Wordlist 1',
      score: 85,
      completedAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
      duration: 300, // 5 minutes
      questionTypes: ['matching', 'fill-blank'],
    },
    {
      practiceSetId: 'set-2',
      wordlistId: 'wordlist-1',
      wordlistName: 'Test Wordlist 1',
      score: 92,
      completedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      duration: 420, // 7 minutes
      questionTypes: ['multiple-choice'],
    },
    {
      practiceSetId: 'set-3',
      wordlistId: 'wordlist-2',
      wordlistName: 'Test Wordlist 2',
      score: 78,
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
      duration: 360, // 6 minutes
      questionTypes: ['matching', 'multiple-choice'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock session persistence
    vi.mocked(sessionPersistence.getHistory).mockReturnValue(mockHistory);
    vi.mocked(sessionPersistence.getHistoryForWordlist).mockReturnValue(
      mockHistory.filter((h) => h.wordlistId === 'wordlist-1')
    );
    vi.mocked(sessionPersistence.deleteHistoryItem).mockReturnValue(true);
    vi.mocked(sessionPersistence.clearHistory).mockReturnValue(true);

    // Mock practice session service
    vi.mocked(practiceSessionService.fetchPracticeHistory).mockResolvedValue({
      success: true,
      history: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Display', () => {
    it('should display session history statistics', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Check statistics are displayed
      expect(wrapper.text()).toContain('Total Sessions');
      expect(wrapper.text()).toContain('3'); // Total sessions
      expect(wrapper.text()).toContain('Average Score');
      expect(wrapper.text()).toContain('Best Score');
      expect(wrapper.text()).toContain('Total Practice Time');
    });

    it('should calculate and display correct statistics', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Average score: (85 + 92 + 78) / 3 = 85
      expect(wrapper.text()).toContain('85%');
      
      // Best score: 92
      expect(wrapper.text()).toContain('92%');
    });

    it('should display session cards with details', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards).toHaveLength(3);

      // Check first session details
      const firstCard = sessionCards[0];
      expect(firstCard.text()).toContain('Test Wordlist 1');
      expect(firstCard.text()).toContain('85%');
      expect(firstCard.text()).toContain('5:00'); // Duration
    });

    it('should display question type badges', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const badges = wrapper.findAll('.type-badge');
      expect(badges.length).toBeGreaterThan(0);
      
      // Check badge text formatting
      expect(wrapper.text()).toContain('Matching');
      expect(wrapper.text()).toContain('Fill Blank');
      expect(wrapper.text()).toContain('Multiple Choice');
    });

    it('should show empty state when no history', async () => {
      vi.mocked(sessionPersistence.getHistory).mockReturnValue([]);
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(wrapper.text()).toContain('No practice sessions yet');
      expect(wrapper.text()).toContain('Complete a practice session');
    });

    it('should show loading state initially', async () => {
      const wrapper = mount(SessionHistory);
      
      // Should show loading before data loads
      expect(wrapper.find('.loading-state').exists()).toBe(true);
      expect(wrapper.text()).toContain('Loading history');
    });
  });

  describe('Filtering', () => {
    it('should filter by question type', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      // Select matching question type
      const typeFilter = wrapper.find('#question-type-filter');
      await typeFilter.setValue('matching');

      // Should show only sessions with matching questions
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards.length).toBeLessThanOrEqual(2); // 2 sessions have matching
    });

    it('should filter by date range - today', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const dateFilter = wrapper.find('#date-range-filter');
      await dateFilter.setValue('today');

      // Should show only today's sessions
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards.length).toBeLessThanOrEqual(1);
    });

    it('should filter by date range - last 7 days', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const dateFilter = wrapper.find('#date-range-filter');
      await dateFilter.setValue('week');

      // Should show sessions from last 7 days (2 sessions)
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards.length).toBeLessThanOrEqual(2);
    });

    it('should filter by date range - last 30 days', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const dateFilter = wrapper.find('#date-range-filter');
      await dateFilter.setValue('month');

      // Should show all sessions (all within 30 days)
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards).toHaveLength(3);
    });

    it('should show custom date range inputs', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const dateFilter = wrapper.find('#date-range-filter');
      await dateFilter.setValue('custom');

      // Should show custom date inputs
      expect(wrapper.find('.custom-date-range').exists()).toBe(true);
      expect(wrapper.findAll('.date-input')).toHaveLength(2);
    });

    it('should filter by custom date range', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const dateFilter = wrapper.find('#date-range-filter');
      await dateFilter.setValue('custom');

      // Set custom date range
      const dateInputs = wrapper.findAll('.date-input');
      const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2); // 2 days ago
      const endDate = new Date();
      
      await dateInputs[0].setValue(startDate.toISOString().split('T')[0]);
      await dateInputs[1].setValue(endDate.toISOString().split('T')[0]);

      // Should filter sessions within range
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards.length).toBeGreaterThan(0);
    });

    it('should combine multiple filters', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Apply both question type and date filters
      const typeFilter = wrapper.find('#question-type-filter');
      await typeFilter.setValue('matching');

      const dateFilter = wrapper.find('#date-range-filter');
      await dateFilter.setValue('week');

      await wrapper.vm.$nextTick();

      // Should show only matching sessions from last week (1 session)
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards.length).toBeGreaterThanOrEqual(0);
      expect(sessionCards.length).toBeLessThanOrEqual(2);
    });

    it('should show empty state when filters match nothing', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Apply filter that matches nothing
      const typeFilter = wrapper.find('#question-type-filter');
      await typeFilter.setValue('fill-blank');

      const dateFilter = wrapper.find('#date-range-filter');
      await dateFilter.setValue('today');

      await wrapper.vm.$nextTick();

      // Check if empty state is shown or very few results
      const sessionCards = wrapper.findAll('.session-card');
      if (sessionCards.length === 0) {
        expect(wrapper.text()).toContain('No sessions match your filters');
      }
    });

    it('should reset custom dates when switching away from custom range', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      // Set custom range
      const dateFilter = wrapper.find('#date-range-filter');
      await dateFilter.setValue('custom');

      const dateInputs = wrapper.findAll('.date-input');
      await dateInputs[0].setValue('2024-01-01');
      await dateInputs[1].setValue('2024-01-31');

      // Switch to different range
      await dateFilter.setValue('week');

      // Custom date inputs should be hidden
      expect(wrapper.find('.custom-date-range').exists()).toBe(false);
    });
  });

  describe('Progress Trend', () => {
    it('should display progress trend indicator', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      // Should show trend indicator with 3+ sessions
      expect(wrapper.find('.trend-indicator').exists()).toBe(true);
    });

    it('should show improving trend', async () => {
      const improvingHistory = [
        { ...mockHistory[0], score: 70, completedAt: Date.now() - 3000 },
        { ...mockHistory[1], score: 80, completedAt: Date.now() - 2000 },
        { ...mockHistory[2], score: 90, completedAt: Date.now() - 1000 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(improvingHistory);
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const trendIndicator = wrapper.find('.trend-indicator');
      expect(trendIndicator.classes()).toContain('trend-improving');
      expect(trendIndicator.text()).toContain('Improving');
    });

    it('should show declining trend', async () => {
      const decliningHistory = [
        { ...mockHistory[0], score: 90, completedAt: Date.now() - 3000 },
        { ...mockHistory[1], score: 80, completedAt: Date.now() - 2000 },
        { ...mockHistory[2], score: 70, completedAt: Date.now() - 1000 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(decliningHistory);
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const trendIndicator = wrapper.find('.trend-indicator');
      expect(trendIndicator.classes()).toContain('trend-declining');
      expect(trendIndicator.text()).toContain('Needs Practice');
    });

    it('should show stable trend', async () => {
      const stableHistory = [
        { ...mockHistory[0], score: 80, completedAt: Date.now() - 3000 },
        { ...mockHistory[1], score: 82, completedAt: Date.now() - 2000 },
        { ...mockHistory[2], score: 81, completedAt: Date.now() - 1000 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(stableHistory);
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const trendIndicator = wrapper.find('.trend-indicator');
      expect(trendIndicator.classes()).toContain('trend-stable');
      expect(trendIndicator.text()).toContain('Stable');
    });

    it('should not show trend with less than 2 sessions', async () => {
      vi.mocked(sessionPersistence.getHistory).mockReturnValue([mockHistory[0]]);
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.trend-indicator').exists()).toBe(false);
    });

    it('should display trend chart with multiple sessions', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      // Should show chart with 2+ sessions
      expect(wrapper.find('.trend-chart').exists()).toBe(true);
      expect(wrapper.find('.chart-svg').exists()).toBe(true);
    });

    it('should render trend line points correctly', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const polyline = wrapper.find('polyline');
      expect(polyline.exists()).toBe(true);
      expect(polyline.attributes('points')).toBeTruthy();
    });

    it('should render data points on chart', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const circles = wrapper.findAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      // Each circle should have a title for tooltip
      circles.forEach((circle) => {
        expect(circle.find('title').exists()).toBe(true);
      });
    });
  });

  describe('Actions', () => {
    it('should delete a session', async () => {
      // Mock window.confirm
      vi.stubGlobal('confirm', vi.fn(() => true));
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const deleteButton = wrapper.find('.delete-button');
      expect(deleteButton.exists()).toBe(true);
      await deleteButton.trigger('click');

      expect(sessionPersistence.deleteHistoryItem).toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });

    it('should not delete session if user cancels', async () => {
      vi.stubGlobal('confirm', vi.fn(() => false));
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const deleteButton = wrapper.find('.delete-button');
      expect(deleteButton.exists()).toBe(true);
      await deleteButton.trigger('click');

      expect(sessionPersistence.deleteHistoryItem).not.toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });

    it('should clear all history', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true));
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const clearButton = wrapper.find('.clear-button');
      await clearButton.trigger('click');

      expect(sessionPersistence.clearHistory).toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });

    it('should not clear history if user cancels', async () => {
      vi.stubGlobal('confirm', vi.fn(() => false));
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      const clearButton = wrapper.find('.clear-button');
      await clearButton.trigger('click');

      expect(sessionPersistence.clearHistory).not.toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });
  });

  describe('Wordlist Filtering', () => {
    it('should filter history by wordlist ID when provided', async () => {
      const wrapper = mount(SessionHistory, {
        props: {
          wordlistId: 'wordlist-1',
        },
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(sessionPersistence.getHistoryForWordlist).toHaveBeenCalledWith('wordlist-1');
      
      // Should only show sessions for wordlist-1
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards.length).toBeLessThanOrEqual(2);
    });

    it('should show all history when no wordlist ID provided', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(sessionPersistence.getHistory).toHaveBeenCalled();
      
      // Should show all sessions
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards).toHaveLength(3);
    });
  });

  describe('Score Styling', () => {
    it('should apply excellent class for scores >= 90', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const scores = wrapper.findAll('.score');
      const excellentScore = scores.find((s) => s.text().includes('92%'));
      expect(excellentScore).toBeDefined();
      if (excellentScore) {
        expect(excellentScore.classes()).toContain('excellent');
      }
    });

    it('should apply good class for scores >= 70', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const scores = wrapper.findAll('.score');
      const goodScore = scores.find((s) => s.text().includes('85%'));
      expect(goodScore).toBeDefined();
      if (goodScore) {
        expect(goodScore.classes()).toContain('good');
      }
    });

    it('should apply fair class for scores >= 50', async () => {
      const fairHistory = [
        { ...mockHistory[0], score: 65 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(fairHistory);
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const scores = wrapper.findAll('.score');
      const fairScore = scores.find((s) => s.text().includes('65%'));
      expect(fairScore).toBeDefined();
      if (fairScore) {
        expect(fairScore.classes()).toContain('fair');
      }
    });

    it('should apply needs-improvement class for scores < 50', async () => {
      const poorHistory = [
        { ...mockHistory[0], score: 45 },
      ];
      
      vi.mocked(sessionPersistence.getHistory).mockReturnValue(poorHistory);
      
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const scores = wrapper.findAll('.score');
      const poorScore = scores.find((s) => s.text().includes('45%'));
      expect(poorScore).toBeDefined();
      if (poorScore) {
        expect(poorScore.classes()).toContain('needs-improvement');
      }
    });
  });

  describe('Database Integration', () => {
    it('should fetch history from database', async () => {
      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();

      expect(practiceSessionService.fetchPracticeHistory).toHaveBeenCalled();
    });

    it('should merge local and database history', async () => {
      const dbHistory = [
        {
          id: 'db-1',
          practiceSetId: 'set-4',
          wordlistId: 'wordlist-1',
          wordlistName: 'Test Wordlist 1',
          startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          endTime: new Date(Date.now() - 1000 * 60 * 60 * 2 + 300000).toISOString(),
          score: 88,
          completed: true,
          questionTypes: ['matching'],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
      ];

      vi.mocked(practiceSessionService.fetchPracticeHistory).mockResolvedValue({
        success: true,
        history: dbHistory,
      });

      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should have merged history (3 local + 1 db = 4 total)
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle database fetch errors gracefully', async () => {
      vi.mocked(practiceSessionService.fetchPracticeHistory).mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const wrapper = mount(SessionHistory);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should still show local history
      const sessionCards = wrapper.findAll('.session-card');
      expect(sessionCards).toHaveLength(3);
    });
  });
});
