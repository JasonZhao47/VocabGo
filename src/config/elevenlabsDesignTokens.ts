/**
 * ElevenLabs Design Tokens
 * 
 * Core design tokens for typography, colors, spacing, and transitions
 * matching ElevenLabs.io visual design system.
 */

export const elevenlabsTokens = {
  // Typography
  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '18px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
    },
    fontWeight: {
      normal: 400,
      bold: 700,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  
  // Colors
  colors: {
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
    gray: {
      50: 'rgb(250, 250, 250)',
      100: 'rgb(245, 245, 245)',
      200: 'rgb(242, 242, 242)',
      300: 'rgb(229, 229, 229)',
      400: 'rgb(163, 163, 163)',
      500: 'rgb(115, 115, 115)',
      600: 'rgb(82, 82, 82)',
      700: 'rgb(64, 64, 64)',
      800: 'rgb(38, 38, 38)',
      900: 'rgb(28, 28, 28)',
    },
    red: {
      500: 'rgb(239, 68, 68)',
      600: 'rgb(220, 38, 38)',
    },
  },
  
  // Spacing (8px base unit)
  spacing: {
    0: '0px',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    6: '48px',
    8: '64px',
    12: '96px',
  },
  
  // Border Radius
  borderRadius: {
    sm: '8px',
    md: '12px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
  },
} as const;

export type ElevenlabsTokens = typeof elevenlabsTokens;
