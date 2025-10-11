/**
 * Accessible Animation Composable
 * 
 * Combines motion preferences with accessibility announcements.
 * Provides alternative feedback when animations are reduced or disabled.
 */

import { useMotionPreference, type AnimationType } from './useMotionPreference';
import { announce, type AnnouncementOptions } from '@/utils/accessibilityAnnouncer';

export interface AccessibleAnimationOptions {
  /** Message to announce when animation completes */
  announceOnComplete?: string;
  /** Message to announce when animation starts */
  announceOnStart?: string;
  /** Animation type for motion preference handling */
  animationType?: AnimationType;
  /** Announcement options */
  announcementOptions?: AnnouncementOptions;
}

/**
 * Composable for accessible animations with alternative feedback
 */
export function useAccessibleAnimation() {
  const motionPreference = useMotionPreference();

  /**
   * Run an animation with accessibility support
   * Announces state changes when animations are reduced
   */
  const runAnimation = async (
    animationFn: () => Promise<void> | void,
    options: AccessibleAnimationOptions = {}
  ): Promise<void> => {
    const {
      announceOnStart,
      announceOnComplete,
      animationType = 'decorative',
      announcementOptions = {},
    } = options;

    const shouldRun = motionPreference.shouldAnimateType(animationType);

    // Announce start if animations are reduced and message provided
    if (!shouldRun && announceOnStart) {
      announce(announceOnStart, announcementOptions);
    }

    // Run animation if allowed
    if (shouldRun || animationType === 'essential') {
      await animationFn();
    }

    // Announce completion if animations are reduced and message provided
    if (!shouldRun && announceOnComplete) {
      announce(announceOnComplete, {
        ...announcementOptions,
        delay: 100, // Small delay to ensure proper announcement
      });
    }
  };

  /**
   * Provide instant feedback when animations are disabled
   */
  const provideFeedback = (message: string, type: 'success' | 'error' | 'info' = 'info'): void => {
    if (motionPreference.prefersReducedMotion.value) {
      const priority = type === 'error' ? 'assertive' : 'polite';
      announce(message, { priority });
    }
  };

  /**
   * Announce state change with appropriate timing
   */
  const announceStateChange = (
    message: string,
    options?: AnnouncementOptions
  ): void => {
    // Always announce state changes for screen readers
    announce(message, options);
  };

  return {
    ...motionPreference,
    runAnimation,
    provideFeedback,
    announceStateChange,
  };
}

/**
 * Helper to create accessible loading states
 */
export function useAccessibleLoading() {
  const { prefersReducedMotion } = useMotionPreference();

  const announceLoading = (message: string = 'Loading') => {
    announce(`${message}...`, { priority: 'polite' });
  };

  const announceLoaded = (message: string = 'Content loaded') => {
    announce(message, { priority: 'polite', delay: 100 });
  };

  return {
    prefersReducedMotion,
    announceLoading,
    announceLoaded,
  };
}

/**
 * Helper for accessible form feedback
 */
export function useAccessibleFormFeedback() {
  const { prefersReducedMotion } = useMotionPreference();

  const announceValidation = (fieldName: string, isValid: boolean, message?: string) => {
    const status = isValid ? 'valid' : 'invalid';
    const fullMessage = message 
      ? `${fieldName} is ${status}: ${message}`
      : `${fieldName} is ${status}`;
    
    announce(fullMessage, {
      priority: isValid ? 'polite' : 'assertive',
    });
  };

  const announceSubmit = (success: boolean, message: string) => {
    announce(message, {
      priority: success ? 'polite' : 'assertive',
    });
  };

  return {
    prefersReducedMotion,
    announceValidation,
    announceSubmit,
  };
}
