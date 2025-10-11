/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}'
  ],
  theme: {
    extend: {
      // ============================================
      // COLOR PALETTE (ElevenLabs-inspired)
      // ============================================
      colors: {
        // Primary Brand (Black for ElevenLabs aesthetic)
        primary: {
          DEFAULT: '#000000',
          hover: '#1A1A1A',
          active: '#0A0A0A',
        },
        
        // Neutrals (7-step gray scale)
        neutral: {
          50: '#FAFAFA',   // Lightest - backgrounds
          100: '#F5F5F5',  // Very light - hover states
          200: '#E5E7EB',  // Light - borders
          300: '#D1D5DB',  // Medium light - disabled states
          400: '#9CA3AF',  // Medium - placeholders
          500: '#6B7280',  // Medium dark - secondary text
          600: '#4B5563',  // Dark - body text
          700: '#374151',  // Darker - headings
          800: '#1F2937',  // Very dark
          900: '#111827',  // Darkest
        },
        
        // Semantic Colors (WCAG AA compliant)
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
        
        // Background Colors
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#FAFAFA',
          tertiary: '#F5F5F5',
        },
        
        // Text Colors
        text: {
          primary: '#000000',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
          inverse: '#FFFFFF',
        },
        
        // Border Colors
        border: {
          light: '#F5F5F5',
          DEFAULT: '#E5E7EB',
          medium: '#D1D5DB',
          dark: '#9CA3AF',
        },
      },
      
      // ============================================
      // TYPOGRAPHY SCALE
      // ============================================
      fontSize: {
        // Display (Hero headings)
        'display-lg': ['64px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display': ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-sm': ['48px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        
        // Headings
        'h1': ['36px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h2': ['30px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'h5': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        'h6': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        
        // Body Text
        'body-xl': ['20px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-xs': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        
        // Captions & Labels
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      
      // Font Weights
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      
      // ============================================
      // SPACING SCALE (8px base unit)
      // ============================================
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
      },
      
      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        'none': '0',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'full': '9999px',
      },
      
      // ============================================
      // BOX SHADOWS
      // ============================================
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'none': 'none',
      },
      
      // ============================================
      // TRANSITIONS
      // ============================================
      transitionDuration: {
        'fast': '150ms',
        'DEFAULT': '200ms',
        'normal': '250ms',
        'slow': '300ms',
      },
      
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // ============================================
      // RESPONSIVE BREAKPOINTS
      // ============================================
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // ============================================
      // Z-INDEX SCALE
      // ============================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
    },
  },
  plugins: [],
}
