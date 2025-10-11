# Quick Beautification Reference

## 🎨 Color Palette (Copy-Paste Ready)

```css
/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F8F9FA;
--bg-tertiary: #F9FAFB;
--bg-input: #F8F9FA;

/* Borders */
--border-subtle: #F3F4F6;
--border-light: #E5E7EB;
--border-medium: #D1D5DB;
--border-dark: #000000;

/* Text */
--text-primary: #000000;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--text-white: #FFFFFF;

/* Buttons */
--btn-primary-bg: #000000;
--btn-primary-hover: #1A1A1A;
--btn-secondary-bg: #FFFFFF;
--btn-secondary-border: #E5E7EB;

/* Accents */
--accent-blue: #3B82F6;
--accent-green: #10B981;
--accent-red: #EF4444;
```

## 📐 Spacing Scale (8px Grid)

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 96px;
--space-5xl: 120px;
```

## 🔤 Typography Scale

```css
/* Font Sizes */
--text-xs: 12px;
--text-sm: 13px;
--text-base: 14px;
--text-md: 15px;
--text-lg: 16px;
--text-xl: 18px;
--text-2xl: 20px;
--text-3xl: 24px;
--text-4xl: 32px;
--text-5xl: 48px;
--text-6xl: 56px;
--text-7xl: 64px;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.1;
--leading-snug: 1.4;
--leading-normal: 1.5;
--leading-relaxed: 1.6;
```

## 🎯 Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

## ✨ Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## 🎬 Transitions

```css
--transition-fast: 150ms ease-out;
--transition-normal: 250ms ease-out;
--transition-slow: 350ms ease-out;
```

## 🌈 Gradient Presets

```css
/* Purple */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Pink */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Blue */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Orange */
background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

/* Green */
background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
```

## 🔘 Button Styles (Copy-Paste)

```css
/* Primary Black Pill Button */
.btn-primary {
  height: 52px;
  padding: 0 32px;
  background: #000000;
  color: #FFFFFF;
  border: none;
  border-radius: 9999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-primary:hover {
  background: #1A1A1A;
}

/* Secondary Outlined Button */
.btn-secondary {
  height: 48px;
  padding: 0 24px;
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #E5E7EB;
  border-radius: 9999px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-secondary:hover {
  border-color: #D1D5DB;
  background: #F9FAFB;
}
```

## 📝 Input Styles (Copy-Paste)

```css
/* Text Input */
.input {
  height: 48px;
  padding: 0 16px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 15px;
  color: #000000;
  transition: all 150ms ease-out;
}

.input:focus {
  outline: none;
  border-color: #000000;
  background: #FFFFFF;
}

.input::placeholder {
  color: #9CA3AF;
}

/* Textarea */
.textarea {
  min-height: 160px;
  padding: 20px;
  background: #F8F9FA;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
  color: #000000;
  resize: vertical;
  transition: all 150ms ease-out;
}

.textarea:focus {
  outline: none;
  border-color: #000000;
  background: #FFFFFF;
}
```

## 🎴 Card Styles (Copy-Paste)

```css
/* Basic Card */
.card {
  padding: 24px;
  background: #FFFFFF;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  transition: all 150ms ease-out;
}

/* Interactive Card */
.card-interactive {
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.card-interactive:hover {
  border-color: #E5E7EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

## 🏷️ Badge Styles (Copy-Paste)

```css
/* Pill Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #F3F4F6;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* Black Badge */
.badge-black {
  background: #000000;
  color: #FFFFFF;
}

/* Colored Badges */
.badge-blue { background: #DBEAFE; color: #1E40AF; }
.badge-green { background: #D1FAE5; color: #065F46; }
.badge-red { background: #FEE2E2; color: #991B1B; }
```

## 🔍 Search Bar (Copy-Paste)

```css
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9CA3AF;
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 48px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 15px;
  color: #000000;
  transition: all 150ms ease-out;
}

.search-input:focus {
  outline: none;
  border-color: #000000;
  background: #FFFFFF;
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  /* Mobile styles */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop styles */
}

/* Wide Desktop */
@media (min-width: 1440px) {
  /* Wide desktop styles */
}
```

## 🎭 Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 250ms ease-out;
}

/* Hover Lift */
.hover-lift {
  transition: all 150ms ease-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 🎯 Quick Implementation Checklist

### Upload Page
- [ ] Light gray background (#F8F9FA) for drop zone
- [ ] Rounded corners (12px)
- [ ] Centered icon and text
- [ ] Subtle border (#E5E7EB)
- [ ] Hover state with darker border

### Buttons
- [ ] Black primary buttons (pill-shaped)
- [ ] Height: 52-56px
- [ ] Padding: 0 32px
- [ ] Font-weight: 600
- [ ] Hover: #1A1A1A

### Cards
- [ ] White background
- [ ] Subtle border (#F3F4F6)
- [ ] Border-radius: 12px
- [ ] Hover lift effect
- [ ] Shadow on hover

### Typography
- [ ] Headings: 56-64px, bold, black
- [ ] Body: 15-16px, regular, gray
- [ ] Line-height: 1.6
- [ ] Letter-spacing: -0.02em for headings

### Spacing
- [ ] Massive vertical padding (120px+ top)
- [ ] Generous margins (32px+, 48px+)
- [ ] Consistent 8px grid
- [ ] Centered content (max-width: 700px)

## 📚 Resources

- **Full Guide:** `BEAUTIFICATION_GUIDE.md`
- **Screenshots:** `screenshots/README.md`
- **Design Doc:** `design.md`
- **Tasks:** `tasks.md`

## 💡 Pro Tips

1. **Whitespace is your friend** - Don't be afraid of generous spacing
2. **Keep transitions fast** - 150ms feels snappy
3. **Use subtle shadows** - Less is more
4. **Center important content** - Max-width 700px for focus
5. **Black buttons** - Primary CTAs should be black, not blue
6. **Light gray inputs** - #F8F9FA background feels premium
7. **Pill shapes** - Border-radius: 9999px for buttons and badges
8. **Hover lifts** - translateY(-2px) adds polish
9. **Clean borders** - Use #F3F4F6 for subtle separation
10. **Typography hierarchy** - Bold headings, regular body, gray secondary text
