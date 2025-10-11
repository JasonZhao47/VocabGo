import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAnnouncer,
  announce,
  announcePolite,
  announceAssertive,
  clearAnnouncements,
  announceLoading,
  announceSuccess,
  announceError,
} from './accessibilityAnnouncer';

describe('accessibilityAnnouncer', () => {
  let announcer: ReturnType<typeof getAnnouncer>;

  beforeEach(() => {
    announcer = getAnnouncer();
    // Clear any existing announcements
    announcer.clear();
  });

  afterEach(() => {
    announcer.destroy();
  });

  describe('getAnnouncer', () => {
    it('should return an announcer instance', () => {
      expect(announcer).toBeDefined();
      expect(announcer.announce).toBeInstanceOf(Function);
      expect(announcer.clear).toBeInstanceOf(Function);
    });

    it('should return the same instance on subsequent calls', () => {
      const announcer1 = getAnnouncer();
      const announcer2 = getAnnouncer();
      expect(announcer1).toBe(announcer2);
    });
  });

  describe('announce', () => {
    it('should create ARIA live regions on first announcement', () => {
      announce('Test message');
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      
      expect(politeRegion).toBeTruthy();
      expect(assertiveRegion).toBeTruthy();
    });

    it('should announce polite messages', () => {
      announce('Test message', { priority: 'polite' });
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('Test message');
    });

    it('should announce assertive messages', () => {
      announce('Urgent message', { priority: 'assertive' });
      
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toBe('Urgent message');
    });

    it('should clear previous announcements when clearPrevious is true', () => {
      announce('First message');
      announce('Second message', { clearPrevious: true });
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('Second message');
    });

    it('should delay announcement when delay is specified', async () => {
      announce('Delayed message', { delay: 50 });
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('');
      
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(politeRegion?.textContent).toBe('Delayed message');
    });
  });

  describe('announcePolite', () => {
    it('should announce with polite priority', () => {
      announcePolite('Polite message');
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('Polite message');
    });
  });

  describe('announceAssertive', () => {
    it('should announce with assertive priority', () => {
      announceAssertive('Assertive message');
      
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toBe('Assertive message');
    });
  });

  describe('clearAnnouncements', () => {
    it('should clear all announcements', () => {
      announcePolite('Polite message');
      announceAssertive('Assertive message');
      
      clearAnnouncements();
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      
      expect(politeRegion?.textContent).toBe('');
      expect(assertiveRegion?.textContent).toBe('');
    });
  });

  describe('helper functions', () => {
    it('should announce loading', () => {
      announceLoading('Data');
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('Data...');
    });

    it('should announce success', () => {
      announceSuccess('Operation completed');
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('Success: Operation completed');
    });

    it('should announce error', () => {
      announceError('Something went wrong');
      
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toBe('Error: Something went wrong');
    });
  });

  describe('ARIA attributes', () => {
    it('should set correct ARIA attributes on live regions', () => {
      announce('Test');
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      
      expect(politeRegion?.getAttribute('aria-atomic')).toBe('true');
      expect(politeRegion?.getAttribute('role')).toBe('status');
      
      expect(assertiveRegion?.getAttribute('aria-atomic')).toBe('true');
      expect(assertiveRegion?.getAttribute('role')).toBe('alert');
    });

    it('should have sr-only class for visual hiding', () => {
      announce('Test');
      
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.className).toContain('sr-only');
    });
  });
});
