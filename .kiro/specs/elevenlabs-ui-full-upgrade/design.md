# Design Document

## Overview

This design document outlines the technical approach for implementing an ElevenLabs-inspired UI upgrade for VocabGo. The upgrade focuses on replicating ElevenLabs' precise spacing, typography, smooth animations, and overall visual polish while maintaining VocabGo's unique functionality and branding.

The implementation will use TailwindCSS for utility-first styling, Vue 3 Composition API for component logic, and leverage existing animation composables while enhancing them to match ElevenLabs' interaction smoothness.

## Architecture

### Design System Structure

```
src/
├── config/
│   ├── elevenlabsDesignTokens.ts    # Core design tokens
│   └── elevenlabsAnimations.ts      # Animation configurations
├── assets/
│   ├── fonts/                        # Waldenburg font files
│   └── elevenlabs.css               # ElevenLabs-specific styles
├── components/
│   └── ui/                          # Updated UI components
└── composables/
    └── useElevenlabsTheme.ts        # Theme composable
```

### Technology Stack

- **Styling**: TailwindCSS with custom configuration
- **Typography**: Waldenburg font family
- **Animations**: CSS transitions + Vue transition components
- **State Management**: Vue 3 Composition API
- **Build Tool**: Vite

## Components and Interfaces

### 1. Design Tokens Configuration

**File**: `src/config/elevenlabsDesignTokens.ts`

```typescript
export const elevenlabsTokens = {
  // Typography
  typography: {
    fontFamily: {
      primary: 'Waldenburg, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
      light: 'rgb(242, 242, 242)',
      dark: 'rgb(28, 28, 28)',
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
};
```

### 2. Tailwind Configuration

**File**: `tailwind.config.js` (updated)

```javascript
import { elevenlabsTokens } from './src/config/elevenlabsDesignTokens';

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: elevenlabsTokens.typography.fontFamily.primary.split(','),
      },
      fontSize: elevenlabsTokens.typography.fontSize,
      fontWeight: elevenlabsTokens.typography.fontWeight,
      lineHeight: elevenlabsTokens.typography.lineHeight,
      colors: elevenlabsTokens.colors,
      spacing: elevenlabsTokens.spacing,
      borderRadius: elevenlabsTokens.borderRadius,
      boxShadow: elevenlabsTokens.shadows,
      transitionDuration: {
        fast: elevenlabsTokens.transitions.fast,
        normal: elevenlabsTokens.transitions.normal,
        slow: elevenlabsTokens.transitions.slow,
      },
      transitionTimingFunction: {
        'elevenlabs': elevenlabsTokens.transitions.easing,
      },
    },
  },
  plugins: [],
};
```

### 3. Global Styles

**File**: `src/assets/elevenlabs.css`

```css
/* Waldenburg Font Import */
@font-face {
  font-family: 'Waldenburg';
  src: url('./fonts/waldenburg-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Waldenburg';
  src: url('./fonts/waldenburg-bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Base Styles */
body {
  font-family: 'Waldenburg', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 18px;
  line-height: 1.6;
  color: rgb(0, 0, 0);
  background-color: rgb(255, 255, 255);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus Visible */
*:focus-visible {
  outline: 2px solid rgb(0, 0, 0);
  outline-offset: 2px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. Button Component

**File**: `src/components/ui/Button.vue` (updated)

```vue
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-normal transition-all duration-normal ease-elevenlabs';
  
  const variants = {
    primary: 'bg-black text-white hover:opacity-90 active:opacity-80',
    secondary: 'bg-gray-light text-black hover:bg-gray-200 active:bg-gray-300',
    ghost: 'bg-transparent text-black hover:bg-gray-light active:bg-gray-200',
  };
  
  const sizes = {
    sm: 'text-sm px-3 py-1.5 rounded-full',
    md: 'text-sm px-4 py-2 rounded-full',
    lg: 'text-base px-6 py-3 rounded-full',
  };
  
  const disabled = props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${disabled}`;
});
</script>
```

### 5. Card Component

**File**: `src/components/ui/Card.vue` (updated)

```vue
<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  elevated?: boolean;
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  elevated: false,
  interactive: false,
  padding: 'md',
});

const cardClasses = computed(() => {
  const base = 'bg-white rounded-md transition-all duration-normal ease-elevenlabs';
  
  const elevation = props.elevated 
    ? 'shadow-sm hover:shadow-md' 
    : 'border border-gray-200';
  
  const interactive = props.interactive 
    ? 'cursor-pointer hover:scale-[1.02]' 
    : '';
  
  const padding = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  return `${base} ${elevation} ${interactive} ${padding[props.padding]}`;
});
</script>
```

### 6. Input Component

**File**: `src/components/ui/Input.vue` (updated)

```vue
<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-normal mb-1">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
    <p v-else-if="helper" class="text-sm text-gray-600 mt-1">{{ helper }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  id?: string;
  type?: string;
  modelValue?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  disabled: false,
});

defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputClasses = computed(() => {
  const base = 'w-full px-3 py-2 text-base border rounded-sm transition-all duration-normal ease-elevenlabs';
  const state = props.error 
    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
    : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200';
  const disabled = props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white';
  
  return `${base} ${state} ${disabled}`;
});
</script>
```

## Data Models

### Theme Configuration Interface

```typescript
interface ElevenlabsTheme {
  typography: {
    fontFamily: { primary: string };
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  colors: {
    white: string;
    black: string;
    gray: {
      light: string;
      dark: string;
    };
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: {
    fast: string;
    normal: string;
    slow: string;
    easing: string;
  };
}
```

## Error Handling

### Design Token Fallbacks

- If Waldenburg font fails to load, system fonts provide fallback
- All color values have explicit RGB values for consistency
- Spacing uses px units for precise control
- Transitions respect `prefers-reduced-motion` media query

### Component Error States

- Input components show clear error styling and messages
- Buttons have disabled states with reduced opacity
- Cards gracefully handle missing content with min-height

## Testing Strategy

### Visual Regression Testing

1. **Snapshot Tests**: Capture component renders at different states
2. **Cross-Browser Testing**: Verify consistency across Chrome, Firefox, Safari
3. **Responsive Testing**: Test at mobile (375px), tablet (768px), desktop (1440px)

### Accessibility Testing

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Reader**: ARIA labels and semantic HTML
3. **Color Contrast**: WCAG AA compliance for all text
4. **Focus Indicators**: Visible focus states on all interactive elements

### Performance Testing

1. **Font Loading**: Measure FOUT/FOIT with font-display: swap
2. **Animation Performance**: Monitor FPS during transitions
3. **Bundle Size**: Track CSS bundle size impact

## Implementation Phases

### Phase 1: Foundation (Design Tokens & Global Styles)
- Create design tokens configuration
- Update Tailwind config
- Add Waldenburg font files
- Implement global CSS

### Phase 2: Core Components
- Update Button component
- Update Input component
- Update Card component
- Update Modal component

### Phase 3: Layout Components
- Update Header component
- Update Container component
- Implement consistent spacing

### Phase 4: Page Updates
- Apply new styles to HomePage
- Apply new styles to UploadPage
- Apply new styles to ResultPage
- Apply new styles to SavedWordlistsPage

### Phase 5: Polish & Testing
- Add micro-interactions
- Implement loading states
- Conduct accessibility audit
- Perform visual regression testing

## Migration Strategy

### Gradual Rollout

1. **Parallel Implementation**: New components coexist with old
2. **Feature Flag**: Toggle between old and new UI
3. **Page-by-Page**: Migrate one page at a time
4. **Component-by-Component**: Update shared components incrementally

### Backward Compatibility

- Maintain existing component APIs
- Use CSS classes that don't conflict with existing styles
- Provide migration guide for custom components

## Performance Considerations

### Font Loading Strategy

```html
<link rel="preload" href="/fonts/waldenburg-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/waldenburg-bold.woff2" as="font" type="font/woff2" crossorigin>
```

### CSS Optimization

- Use TailwindCSS purge to remove unused styles
- Minimize custom CSS
- Leverage browser caching for font files

### Animation Performance

- Use `transform` and `opacity` for GPU acceleration
- Avoid animating `width`, `height`, or `top/left`
- Implement `will-change` for frequently animated elements

## Accessibility Compliance

### WCAG AA Requirements

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All functionality available via keyboard
- **Focus Indicators**: Visible focus states (2px outline)
- **Screen Reader**: Proper ARIA labels and semantic HTML

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Android 90+
- **Fallbacks**: System fonts if Waldenburg fails to load

## Documentation

### Component Documentation

Each component will include:
- Props interface with TypeScript types
- Usage examples
- Accessibility notes
- Visual examples in Storybook (optional)

### Design System Documentation

- Typography scale with examples
- Color palette with contrast ratios
- Spacing system with visual guide
- Component library with live examples
