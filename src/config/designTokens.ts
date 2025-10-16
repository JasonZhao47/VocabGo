/**
 * Design Tokens
 * Centralized design system tokens for consistent styling across components
 * Inspired by ElevenLabs aesthetic and S-tier SaaS design patterns
 */

export const designTokens = {
  /**
   * Color Palette
   * Neutrals for text, backgrounds, and borders
   * Semantic colors for status and actions
   */
  colors: {
    // Base colors
    black: '#000000',
    white: '#FFFFFF',
    
    // Neutral scale (light mode)
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Semantic colors
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    dangerBorder: '#FCA5A5',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    
    // Accent/Primary (can be customized per brand)
    accent: '#3B82F6',
    accentHover: '#2563EB',
  },

  /**
   * Spacing Units
   * Based on 8px base unit for consistent spacing
   */
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  /**
   * Typography Scale
   * Font families, sizes, weights, and line heights
   */
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '15px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '40px',
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  /**
   * Border Radii
   * Consistent corner rounding for elements
   */
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },

  /**
   * Transitions
   * Timing and easing for smooth animations
   */
  transitions: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'ease-out',
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out',
    },
  },

  /**
   * Shadows
   * Elevation and depth for layered UI
   */
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.15)',
  },

  /**
   * Component-specific tokens
   */
  components: {
    sidebar: {
      widthExpanded: '260px',
      widthCollapsed: '72px',
      background: '#FAFAFA',
      border: '#F0F0F0',
    },
    
    table: {
      rowHeight: '56px',
      headerBackground: '#FAFAFA',
      borderColor: '#F5F5F5',
      hoverBackground: '#FAFAFA',
    },
    
    actionButton: {
      size: '36px',
      borderColor: '#E5E7EB',
      hoverBorderColor: '#D1D5DB',
    },
    
    card: {
      aspectRatio: '16 / 9',
      borderRadius: '12px',
    },
  },

  /**
   * Breakpoints for responsive design
   */
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
  },
} as const

/**
 * Type-safe access to design tokens
 */
export type DesignTokens = typeof designTokens

/**
 * Helper function to get transition string
 */
export const getTransition = (
  property: string | string[],
  duration: keyof typeof designTokens.transitions.duration = 'normal',
  easing: keyof typeof designTokens.transitions.easing = 'default'
): string => {
  const props = Array.isArray(property) ? property : [property]
  const durationValue = designTokens.transitions.duration[duration]
  const easingValue = designTokens.transitions.easing[easing]
  
  return props.map(prop => `${prop} ${durationValue} ${easingValue}`).join(', ')
}

/**
 * Helper function to get responsive breakpoint media query
 */
export const getBreakpoint = (breakpoint: keyof typeof designTokens.breakpoints): string => {
  return `@media (min-width: ${designTokens.breakpoints[breakpoint]})`
}
