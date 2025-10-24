# ElevenLabs Audio Native - Exact Design Specifications

## Analysis from Reference Screenshot

### Layout Structure

#### Main Content Area (Right Side)
- **Max Width**: ~752px (measured from content container)
- **Padding**: 48px horizontal, 64px top
- **Background**: Light gray (#F9FAFB / gray-50)
- **Centered**: Content is centered within the main area

#### Content Container
- **Width**: Constrained to ~752px max
- **Margin**: 0 auto (centered)
- **Spacing**: Generous vertical spacing between sections

### Typography Specifications

#### Page Title (H1 - "Audio Native")
- **Font Size**: 30px (text-3xl in Tailwind, but closer to 32px)
- **Font Weight**: 600 (semibold)
- **Color**: Black (#000000 / gray-900)
- **Line Height**: 1.2
- **Margin Bottom**: 8px

#### Subtitle/Description
- **Font Size**: 14px (text-sm)
- **Font Weight**: 400 (normal)
- **Color**: Gray (#6B7280 / gray-500)
- **Line Height**: 1.5
- **Margin Bottom**: 48px

#### Card Title (H3 - "Get started with Audio Native")
- **Font Size**: 20px (text-xl)
- **Font Weight**: 600 (semibold)
- **Color**: Black (#000000 / gray-900)
- **Line Height**: 1.3
- **Margin Bottom**: 12px

#### Card Description
- **Font Size**: 14px (text-sm)
- **Font Weight**: 400 (normal)
- **Color**: Gray (#6B7280 / gray-500)
- **Line Height**: 1.6

#### Feature Titles
- **Font Size**: 16px (text-base)
- **Font Weight**: 600 (semibold)
- **Color**: Black (#000000 / gray-900)

#### Feature Descriptions
- **Font Size**: 14px (text-sm)
- **Font Weight**: 400 (normal)
- **Color**: Gray (#6B7280 / gray-500)
- **Line Height**: 1.6

### Card/Section Specifications

#### Main Hero Card (White Card with Demo)
- **Background**: White (#FFFFFF)
- **Border Radius**: 12px (rounded-xl)
- **Padding**: 32px
- **Box Shadow**: sm (subtle shadow)
- **Border**: 1px solid #E5E7EB (gray-200)
- **Margin Bottom**: 24px

#### Upgrade Banner
- **Background**: Light blue/gray (#F3F4F6)
- **Border Radius**: 12px
- **Padding**: 24px
- **Border**: 1px solid #E5E7EB
- **Margin Bottom**: 32px

#### Feature Cards (3 columns)
- **Background**: White
- **Border Radius**: 12px
- **Padding**: 24px
- **Border**: 1px solid #E5E7EB
- **Gap**: 16px between cards
- **Layout**: Grid 3 columns on desktop

### Button Specifications

#### Primary Button ("Upgrade")
- **Background**: Black (#000000)
- **Color**: White
- **Padding**: 10px 20px
- **Border Radius**: 8px
- **Font Size**: 14px
- **Font Weight**: 500 (medium)
- **Height**: 40px

#### Secondary Button ("Contact Sales")
- **Background**: White
- **Color**: Black
- **Border**: 1px solid #E5E7EB
- **Padding**: 10px 20px
- **Border Radius**: 8px
- **Font Size**: 14px
- **Font Weight**: 500
- **Height**: 40px

### Spacing System

#### Vertical Spacing
- Page title to description: 8px
- Description to first card: 48px
- Between major sections: 32px
- Between cards in grid: 16px
- Within cards (title to content): 12px

#### Horizontal Spacing
- Main content padding: 48px
- Card internal padding: 24-32px
- Button gap: 12px

### Color Palette (Exact)

- **Primary Text**: #000000 (pure black)
- **Secondary Text**: #6B7280 (gray-500)
- **Tertiary Text**: #9CA3AF (gray-400)
- **Background**: #F9FAFB (gray-50)
- **Card Background**: #FFFFFF (white)
- **Border**: #E5E7EB (gray-200)
- **Primary Action**: #000000 (black)
- **Hover State**: #1F2937 (gray-800)

### Key Differences from Current Implementation

1. **Content Width**: Must be exactly ~752px max-width, not full width
2. **Font Sizes**: Smaller and more refined (14px body, 20px card titles)
3. **Spacing**: More generous padding (48px horizontal, 64px top)
4. **Cards**: More subtle borders and shadows
5. **Typography**: Tighter line-heights, more weight contrast
6. **Colors**: Pure black for text, not gray-900
7. **Buttons**: Smaller, more compact (40px height)

## Implementation Checklist

- [ ] Update Container component to use max-w-[752px]
- [ ] Adjust all font sizes to match exact specifications
- [ ] Update spacing to use 48px horizontal, 64px top padding
- [ ] Refine card styles (borders, shadows, padding)
- [ ] Update button sizes and styles
- [ ] Ensure color palette matches exactly
- [ ] Test responsive behavior at various breakpoints
