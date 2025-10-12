import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sharePracticeSet,
  getSharedPracticeSet,
  unsharePracticeSet,
  deleteSharedPracticeSet,
  isValidShareUrl,
} from './practiceShareService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('practiceShareService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('session_id', 'test-session-123');
  });

  describe('sharePracticeSet', () => {
    it('should generate a share URL for a practice set', async () => {
      const mockResponse = {
        shareUrl: 'abc123def456',
        fullUrl: 'https://example.com/practice/abc123def456',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const result = await sharePracticeSet('practice-set-123');

      expect(result).toEqual(mockResponse);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('share-practice-set', {
        body: { practiceSetId: 'practice-set-123' },
        headers: {
          'x-session-id': 'test-session-123',
        },
      });
    });

    it('should throw error when session ID is missing', async () => {
      localStorage.removeItem('session_id');

      await expect(sharePracticeSet('practice-set-123')).rejects.toThrow(
        'Session ID not found'
      );
    });

    it('should throw error when API call fails', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'API error' },
      });

      await expect(sharePracticeSet('practice-set-123')).rejects.toThrow(
        'API error'
      );
    });
  });

  describe('getSharedPracticeSet', () => {
    it('should retrieve a shared practice set', async () => {
      const mockPracticeSet = {
        id: 'practice-set-123',
        questions: {
          matching: [],
          fillBlank: [],
          multipleChoice: [],
        },
        wordlistName: 'Test Wordlist',
        createdAt: '2025-01-10T00:00:00Z',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockPracticeSet,
        error: null,
      });

      const result = await getSharedPracticeSet('abc123def456');

      expect(result).toEqual(mockPracticeSet);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'get-shared-practice/abc123def456',
        { method: 'GET' }
      );
    });

    it('should throw error when practice set not found', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(getSharedPracticeSet('invalid-url')).rejects.toThrow('Not found');
    });
  });

  describe('unsharePracticeSet', () => {
    it('should unshare a practice set', async () => {
      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      await unsharePracticeSet('practice-set-123');

      expect(supabase.from).toHaveBeenCalledWith('practice_sets');
      expect(mockFrom.update).toHaveBeenCalledWith({
        is_shared: false,
        share_url: null,
      });
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'practice-set-123');
    });

    it('should throw error when session ID is missing', async () => {
      localStorage.removeItem('session_id');

      await expect(unsharePracticeSet('practice-set-123')).rejects.toThrow(
        'Session ID not found'
      );
    });

    it('should throw error when update fails', async () => {
      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      await expect(unsharePracticeSet('practice-set-123')).rejects.toThrow(
        'Failed to unshare practice set'
      );
    });
  });

  describe('deleteSharedPracticeSet', () => {
    it('should delete a practice set', async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      await deleteSharedPracticeSet('practice-set-123');

      expect(supabase.from).toHaveBeenCalledWith('practice_sets');
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'practice-set-123');
    });

    it('should throw error when session ID is missing', async () => {
      localStorage.removeItem('session_id');

      await expect(deleteSharedPracticeSet('practice-set-123')).rejects.toThrow(
        'Session ID not found'
      );
    });

    it('should throw error when delete fails', async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      await expect(deleteSharedPracticeSet('practice-set-123')).rejects.toThrow(
        'Failed to delete practice set'
      );
    });
  });

  describe('isValidShareUrl', () => {
    it('should validate correct share URL format', () => {
      expect(isValidShareUrl('abc123def456789012345678901234ab')).toBe(true);
      expect(isValidShareUrl('0123456789abcdef0123456789abcdef')).toBe(true);
    });

    it('should reject invalid share URL formats', () => {
      expect(isValidShareUrl('too-short')).toBe(false);
      expect(isValidShareUrl('not-hex-characters-here-xyz')).toBe(false);
      expect(isValidShareUrl('abc123def456789012345678901234567890')).toBe(false); // too long
      expect(isValidShareUrl('')).toBe(false);
    });
  });
});
