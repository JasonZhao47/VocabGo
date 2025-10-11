/**
 * Accessibility Announcer
 * 
 * Provides alternative feedback mechanisms for users with reduced motion.
 * Uses ARIA live regions to announce state changes to screen readers.
 */

export type AnnouncementPriority = 'polite' | 'assertive';

export interface AnnouncementOptions {
  /** Priority level for the announcement */
  priority?: AnnouncementPriority;
  /** Clear previous announcements before announcing */
  clearPrevious?: boolean;
  /** Delay before announcing (in ms) */
  delay?: number;
}

class AccessibilityAnnouncer {
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;
  private initialized = false;

  /**
   * Initialize ARIA live regions
   */
  private initialize(): void {
    if (this.initialized || typeof document === 'undefined') return;

    // Create polite live region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('role', 'status');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    document.body.appendChild(this.politeRegion);

    // Create assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    document.body.appendChild(this.assertiveRegion);

    this.initialized = true;
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, options: AnnouncementOptions = {}): void {
    if (!this.initialized) {
      this.initialize();
    }

    const {
      priority = 'polite',
      clearPrevious = false,
      delay = 0,
    } = options;

    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    if (!region) return;

    const doAnnounce = () => {
      if (clearPrevious) {
        region.textContent = '';
        // Force reflow to ensure screen readers pick up the change
        void region.offsetHeight;
      }
      region.textContent = message;
    };

    if (delay > 0) {
      setTimeout(doAnnounce, delay);
    } else {
      doAnnounce();
    }
  }

  /**
   * Clear all announcements
   */
  clear(): void {
    if (this.politeRegion) {
      this.politeRegion.textContent = '';
    }
    if (this.assertiveRegion) {
      this.assertiveRegion.textContent = '';
    }
  }

  /**
   * Cleanup live regions
   */
  destroy(): void {
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
    this.initialized = false;
  }
}

// Singleton instance
let announcerInstance: AccessibilityAnnouncer | null = null;

/**
 * Get or create the accessibility announcer instance
 */
export function getAnnouncer(): AccessibilityAnnouncer {
  if (!announcerInstance) {
    announcerInstance = new AccessibilityAnnouncer();
  }
  return announcerInstance;
}

/**
 * Announce a message to screen readers
 */
export function announce(message: string, options?: AnnouncementOptions): void {
  const announcer = getAnnouncer();
  announcer.announce(message, options);
}

/**
 * Announce a polite message (won't interrupt current speech)
 */
export function announcePolite(message: string): void {
  announce(message, { priority: 'polite' });
}

/**
 * Announce an assertive message (interrupts current speech)
 */
export function announceAssertive(message: string): void {
  announce(message, { priority: 'assertive' });
}

/**
 * Clear all announcements
 */
export function clearAnnouncements(): void {
  const announcer = getAnnouncer();
  announcer.clear();
}

/**
 * Announce loading state
 */
export function announceLoading(message: string = 'Loading'): void {
  announcePolite(`${message}...`);
}

/**
 * Announce success
 */
export function announceSuccess(message: string): void {
  announcePolite(`Success: ${message}`);
}

/**
 * Announce error
 */
export function announceError(message: string): void {
  announceAssertive(`Error: ${message}`);
}

/**
 * Announce navigation
 */
export function announceNavigation(pageName: string): void {
  announcePolite(`Navigated to ${pageName}`);
}

/**
 * Announce modal open
 */
export function announceModalOpen(modalTitle: string): void {
  announcePolite(`${modalTitle} dialog opened`);
}

/**
 * Announce modal close
 */
export function announceModalClose(): void {
  announcePolite('Dialog closed');
}

/**
 * Announce item added
 */
export function announceItemAdded(itemName: string): void {
  announcePolite(`${itemName} added`);
}

/**
 * Announce item removed
 */
export function announceItemRemoved(itemName: string): void {
  announcePolite(`${itemName} removed`);
}

/**
 * Announce count update
 */
export function announceCount(count: number, itemType: string): void {
  const plural = count !== 1 ? 's' : '';
  announcePolite(`${count} ${itemType}${plural}`);
}
