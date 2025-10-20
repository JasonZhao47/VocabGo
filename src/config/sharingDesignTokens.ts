/**
 * Sharing Design Tokens
 * Design system tokens specific to the student tracking & sharing feature
 * Extends the base design tokens with sharing-specific colors, animations, and spacing
 */

export const sharingTokens = {
  /**
   * Gradient Colors for Share States
   * Used for visual feedback on sharing status and mistake difficulty levels
   */
  colors: {
    // Share status gradients
    shareActive: {
      from: '#A855F7', // purple-500
      to: '#EC4899',   // pink-500
      gradient: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
      tailwind: 'from-purple-500 to-pink-500',
    },
    shareInactive: {
      from: '#9CA3AF', // gray-400
      to: '#6B7280',   // gray-500
      gradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
      tailwind: 'from-gray-400 to-gray-500',
    },
    
    // Mistake difficulty level gradients
    mistakeHigh: {
      from: '#EF4444', // red-500
      to: '#F97316',   // orange-500
      gradient: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
      tailwind: 'from-red-500 to-orange-500',
    },
    mistakeMedium: {
      from: '#EAB308', // yellow-500
      to: '#F59E0B',   // amber-500
      gradient: 'linear-gradient(135deg, #EAB308 0%, #F59E0B 100%)',
      tailwind: 'from-yellow-500 to-amber-500',
    },
    mistakeLow: {
      from: '#10B981', // green-500
      to: '#059669',   // emerald-600
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      tailwind: 'from-green-500 to-emerald-600',
    },
    
    // Student session colors
    studentActive: {
      from: '#3B82F6', // blue-500
      to: '#8B5CF6',   // violet-500
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
      tailwind: 'from-blue-500 to-violet-500',
    },
    
    // Background overlays
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    cardOverlay: 'rgba(255, 255, 255, 0.95)',
  },

  /**
   * Animation Timings
   * Specific animation durations and easing for sharing interactions
   */
  animations: {
    // Copy success feedback
    copySuccess: {
      duration: 200,
      scale: 1.05,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // spring
      tailwind: 'scale-105 duration-200',
    },
    
    // Stat card updates
    statUpdate: {
      duration: 300,
      easing: 'ease-out',
      tailwind: 'pulse duration-300',
    },
    
    // Accordion expand/collapse
    accordionExpand: {
      duration: 300,
      easing: 'ease-out',
      tailwind: 'ease-out duration-300',
    },
    
    // Share button activation
    shareActivate: {
      duration: 250,
      scale: 1.02,
      easing: 'ease-out',
    },
    
    // Mistake bar fill animation
    mistakeBarFill: {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
      delay: 100, // stagger delay per bar
    },
    
    // Student list item hover
    studentHover: {
      duration: 150,
      easing: 'ease-out',
      translateY: -2,
    },
    
    // Modal entrance
    modalEnter: {
      duration: 250,
      scale: 0.95,
      opacity: 0,
      easing: 'ease-out',
    },
    
    // Toast notification
    toastSlide: {
      duration: 300,
      translateX: 100,
      easing: 'cubic-bezier(0, 0, 0.2, 1)', // ease-out
    },
  },

  /**
   * Spacing and Sizing Constants
   * Layout dimensions specific to sharing components
   */
  spacing: {
    // Dashboard layout
    dashboardGap: '24px',
    dashboardPadding: '32px',
    dashboardMaxWidth: '1280px',
    
    // Card spacing
    cardPadding: '20px',
    cardGap: '16px',
    cardBorderRadius: '12px',
    
    // Stat cards
    statCardHeight: '120px',
    statCardMinWidth: '200px',
    statCardGap: '16px',
    
    // Student list
    studentItemHeight: '64px',
    studentItemPadding: '16px',
    studentAvatarSize: '40px',
    
    // Mistake table
    mistakeRowHeight: '56px',
    mistakeBarHeight: '8px',
    mistakeBarMaxWidth: '200px',
    
    // Share URL input
    shareUrlHeight: '48px',
    shareUrlPadding: '12px',
    shareButtonSize: '36px',
    
    // Modal
    modalMaxWidth: '480px',
    modalPadding: '32px',
    modalBorderRadius: '16px',
    
    // Nickname entry
    nicknameInputHeight: '56px',
    nicknameInputPadding: '16px',
    nicknameButtonHeight: '48px',
  },

  /**
   * Typography Overrides
   * Font sizes and weights specific to sharing components
   */
  typography: {
    // Dashboard headings
    dashboardTitle: {
      fontSize: '32px',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    
    // Stat values
    statValue: {
      fontSize: '40px',
      fontWeight: 700,
      lineHeight: 1,
    },
    statLabel: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#6B7280', // gray-500
    },
    
    // Student names
    studentName: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    
    // Mistake counts
    mistakeCount: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    
    // Share URL
    shareUrl: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
      fontFamily: 'ui-monospace, monospace',
    },
    
    // Nickname input
    nicknameInput: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
  },

  /**
   * Border Styles
   * Border widths and styles for sharing components
   */
  borders: {
    // Gradient borders
    gradientBorder: {
      width: '2px',
      style: 'solid',
    },
    
    // Card borders
    cardBorder: {
      width: '1px',
      style: 'solid',
      color: '#E5E7EB', // gray-200
    },
    
    // Input borders
    inputBorder: {
      width: '1px',
      style: 'solid',
      color: '#D1D5DB', // gray-300
      focusColor: '#3B82F6', // blue-500
    },
    
    // Dividers
    divider: {
      width: '1px',
      style: 'solid',
      color: '#F3F4F6', // gray-100
    },
  },

  /**
   * Shadow Styles
   * Elevation and depth for sharing components
   */
  shadows: {
    // Card shadows
    card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    cardHover: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    
    // Modal shadow
    modal: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)',
    
    // Stat card shadow
    statCard: '0 2px 4px rgba(0, 0, 0, 0.05)',
    
    // Button shadow
    button: '0 1px 2px rgba(0, 0, 0, 0.05)',
    buttonHover: '0 2px 4px rgba(0, 0, 0, 0.1)',
    
    // Gradient border glow
    gradientGlow: '0 0 20px rgba(168, 85, 247, 0.3)', // purple glow
  },

  /**
   * Z-Index Layers
   * Stacking order for sharing components
   */
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    modal: 50,
    modalOverlay: 40,
    toast: 100,
    tooltip: 60,
  },

  /**
   * Breakpoints for Responsive Design
   * Mobile-first breakpoints for sharing components
   */
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },

  /**
   * Difficulty Thresholds
   * Mistake count thresholds for color coding
   */
  thresholds: {
    mistakeLow: 2,      // 0-2 mistakes = low (green)
    mistakeMedium: 5,   // 3-5 mistakes = medium (yellow)
    mistakeHigh: 999,   // 6+ mistakes = high (red)
  },
} as const

/**
 * Type-safe access to sharing tokens
 */
export type SharingTokens = typeof sharingTokens

/**
 * Helper function to get gradient CSS string
 */
export const getGradient = (
  gradientKey: keyof typeof sharingTokens.colors
): string => {
  const gradient = sharingTokens.colors[gradientKey]
  if (gradient && typeof gradient === 'object' && 'gradient' in gradient) {
    return gradient.gradient
  }
  return ''
}

/**
 * Helper function to get mistake difficulty color based on count
 */
export const getMistakeDifficultyColor = (
  mistakeCount: number
): typeof sharingTokens.colors.mistakeLow | 
   typeof sharingTokens.colors.mistakeMedium | 
   typeof sharingTokens.colors.mistakeHigh => {
  if (mistakeCount <= sharingTokens.thresholds.mistakeLow) {
    return sharingTokens.colors.mistakeLow
  } else if (mistakeCount <= sharingTokens.thresholds.mistakeMedium) {
    return sharingTokens.colors.mistakeMedium
  } else {
    return sharingTokens.colors.mistakeHigh
  }
}

/**
 * Helper function to get animation CSS string
 */
export const getAnimation = (
  animationKey: keyof typeof sharingTokens.animations
): string => {
  const animation = sharingTokens.animations[animationKey]
  if (animation && 'tailwind' in animation) {
    return animation.tailwind
  }
  return ''
}

/**
 * Helper function to format spacing value
 */
export const getSpacing = (
  spacingKey: keyof typeof sharingTokens.spacing
): string => {
  return sharingTokens.spacing[spacingKey]
}
