/**
 * ElevenLabs Design Tokens
 * Button-specific design tokens matching ElevenLabs Productions page
 * Reference: https://elevenlabs.io/app/productions
 */

export const elevenlabsDesignTokens = {
  /**
   * Button Design Tokens
   * Precise specifications for 1:1 visual match with ElevenLabs
   */
  button: {
    /**
     * Border Radius
     * 8px for all button variants (not fully rounded)
     */
    borderRadius: '8px',

    /**
     * Typography
     * Font size, weight, and line height for button text
     */
    typography: {
      fontSize: '13px',
      fontWeight: 500, // medium
      lineHeight: '20px',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },

    /**
     * Button Sizes
     * Height and horizontal padding for each size variant
     */
    sizes: {
      sm: {
        height: '32px',
        paddingX: '10px',
      },
      md: {
        height: '36px',
        paddingX: '12px',
      },
      lg: {
        height: '40px',
        paddingX: '16px',
      },
    },

    /**
     * Color Variants
     * Background, text, and border colors for each variant
     */
    colors: {
      primary: {
        background: 'rgb(0, 0, 0)',
        text: 'rgb(255, 255, 255)',
        border: 'transparent',
        hover: {
          background: 'rgb(26, 26, 26)',
        },
      },
      secondary: {
        background: 'rgb(255, 255, 255)',
        text: 'rgb(15, 15, 16)',
        border: 'rgba(0, 0, 29, 0.1)',
        hover: {
          background: 'rgb(250, 250, 250)',
        },
      },
      ghost: {
        background: 'transparent',
        text: 'rgb(15, 15, 16)',
        border: 'transparent',
        hover: {
          background: 'rgba(0, 0, 0, 0.05)',
        },
      },
      destructive: {
        background: 'rgb(220, 38, 38)',
        text: 'rgb(255, 255, 255)',
        border: 'transparent',
        hover: {
          background: 'rgb(185, 28, 28)',
        },
      },
    },

    /**
     * Transitions
     * Duration and easing for state changes
     */
    transition: {
      duration: '75ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      properties: ['color', 'background-color', 'border-color', 'opacity'],
    },

    /**
     * States
     * Opacity values for different interaction states
     */
    states: {
      hover: {
        opacity: 1,
      },
      active: {
        opacity: 0.9,
      },
      disabled: {
        opacity: 0.5,
      },
      loading: {
        opacity: 0.7,
      },
    },
  },
} as const

/**
 * Type-safe access to ElevenLabs design tokens
 */
export type ElevenLabsDesignTokens = typeof elevenlabsDesignTokens

/**
 * Helper function to get button transition string
 * Returns a CSS transition value for button state changes
 */
export const getButtonTransition = (): string => {
  const { duration, easing, properties } = elevenlabsDesignTokens.button.transition
  return properties.map(prop => `${prop} ${duration} ${easing}`).join(', ')
}

/**
 * Helper function to get button size styles
 * Returns height and padding values for a specific button size
 */
export const getButtonSize = (size: 'sm' | 'md' | 'lg') => {
  return elevenlabsDesignTokens.button.sizes[size]
}

/**
 * Helper function to get button variant colors
 * Returns color values for a specific button variant
 */
export const getButtonColors = (variant: 'primary' | 'secondary' | 'ghost' | 'destructive') => {
  return elevenlabsDesignTokens.button.colors[variant]
}

/**
 * Helper function to get button typography styles
 * Returns font size, weight, and line height for buttons
 */
export const getButtonTypography = () => {
  return elevenlabsDesignTokens.button.typography
}
