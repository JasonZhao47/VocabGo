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
      // TRANSITIONS & ANIMATIONS
      // ============================================
      transitionDuration: {
        'instant': '0ms',
        'fast': '150ms',
        'DEFAULT': '200ms',
        'normal': '250ms',
        'slow': '400ms',
        'slower': '600ms',
      },
      
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // Keyframe Animations
      keyframes: {
        // Shimmer effect for skeleton loading
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Fade in with slide up
        'fade-in-up': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        // Fade in with slide down
        'fade-in-down': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(-20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        // Scale in animation
        'scale-in': {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.95)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1)' 
          },
        },
        // Slide in from right
        'slide-in-right': {
          '0%': { 
            transform: 'translateX(100%)' 
          },
          '100%': { 
            transform: 'translateX(0)' 
          },
        },
        // Slide in from left
        'slide-in-left': {
          '0%': { 
            transform: 'translateX(-100%)' 
          },
          '100%': { 
            transform: 'translateX(0)' 
          },
        },
        // Shake animation for errors
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        // Spin animation for loaders
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Pulse animation
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // Bounce animation
        'bounce': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      
      // Animation utilities
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'shake': 'shake 0.3s ease-in-out',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
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
      
      // ============================================
      // GRADIENT PATTERNS
      // ============================================
      backgroundImage: {
        // Subtle gradients for backgrounds
        'gradient-subtle': 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
        'gradient-subtle-dark': 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        
        // Primary brand gradients
        'gradient-primary': 'linear-gradient(135deg, #000000 0%, #1A1A1A 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
        
        // Accent gradients (for CTAs and highlights)
        'gradient-accent': 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
        'gradient-accent-hover': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        
        // Success gradient
        'gradient-success': 'linear-gradient(135deg, #059669 0%, #065F46 100%)',
        'gradient-success-hover': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        
        // Warm gradient (for hero sections)
        'gradient-warm': 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)',
        
        // Cool gradient (for hero sections)
        'gradient-cool': 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 50%, #93C5FD 100%)',
        
        // Radial gradients for spotlight effects
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'gradient-radial-top': 'radial-gradient(circle at top, var(--tw-gradient-stops))',
        'gradient-radial-bottom': 'radial-gradient(circle at bottom, var(--tw-gradient-stops))',
        
        // Shimmer gradient for loading states
        'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        'gradient-shimmer-dark': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
      },
      
      // Gradient color stops for custom gradients
      gradientColorStops: {
        'primary-start': '#000000',
        'primary-end': '#1A1A1A',
        'accent-start': '#2563EB',
        'accent-end': '#1E40AF',
      },
    },
  },
  plugins: [],
}
