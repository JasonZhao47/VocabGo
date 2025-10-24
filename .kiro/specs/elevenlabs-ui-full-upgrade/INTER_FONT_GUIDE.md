# Inter Font - Quick Reference Guide

## What is Inter?

**Inter** is a free, open-source typeface designed specifically for computer screens. It's used by major companies like GitHub, Mozilla, and many modern SaaS products.

## Why Inter for VocabGo?

✅ **Free & Open Source** - No licensing fees or restrictions  
✅ **Modern & Professional** - Clean aesthetic similar to Waldenburg  
✅ **Excellent Readability** - Optimized for UI and screen reading  
✅ **Great Performance** - Loaded from Google Fonts CDN  
✅ **Multiple Weights** - 400, 500, 600, 700 available  
✅ **Wide Browser Support** - Works everywhere  

## Current Implementation

### In `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### In `src/assets/elevenlabs.css`:
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}
```

## Font Weights Available

- **400** (Regular) - Body text, paragraphs
- **500** (Medium) - Slightly emphasized text
- **600** (Semibold) - Subheadings, important UI elements
- **700** (Bold) - Headings, strong emphasis

## Using Inter in Your Components

### CSS:
```css
.heading {
  font-family: 'Inter', sans-serif;
  font-weight: 700; /* Bold */
}

.body-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400; /* Regular */
}
```

### Tailwind (if using):
```html
<h1 class="font-bold">Heading</h1>
<p class="font-normal">Body text</p>
<span class="font-semibold">Emphasized</span>
```

## Performance Monitoring

In development mode, open the browser console to see font loading metrics:

```
🔤 Font Loading Performance
✅ Inter 400: 35.12ms (loaded)
✅ Inter 500: 38.45ms (loaded)
✅ Inter 600: 41.23ms (loaded)
✅ Inter 700: 43.67ms (loaded)
💾 Font Cache Status: { cached: true }
```

## Switching to a Different Font

If you want to use a different font later:

### Option 1: Another Google Font

1. Visit https://fonts.google.com
2. Choose a font (e.g., "Manrope", "DM Sans", "Plus Jakarta Sans")
3. Update `index.html` with new Google Fonts link
4. Update `src/assets/elevenlabs.css` with new font-family name

### Option 2: Self-Hosted Font

1. Download font files (.woff2 format)
2. Place in `src/assets/fonts/`
3. Add `@font-face` declarations in CSS
4. Update `body` font-family

### Option 3: System Fonts Only

Remove Google Fonts link and use:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
```

## Comparison: Inter vs Other Fonts

| Font | License | CDN | Weights | Best For |
|------|---------|-----|---------|----------|
| **Inter** | Free | Google Fonts | 9 weights | UI, dashboards, SaaS |
| Manrope | Free | Google Fonts | 8 weights | Modern, geometric look |
| DM Sans | Free | Google Fonts | 5 weights | Clean, minimal design |
| Plus Jakarta Sans | Free | Google Fonts | 8 weights | Friendly, approachable |
| System Fonts | Free | N/A | Varies | Native OS feel |

## Troubleshooting

### Fonts not loading?
1. Check browser console for errors
2. Verify Google Fonts link in `index.html`
3. Check network tab - fonts should load from `fonts.gstatic.com`
4. Clear browser cache and reload

### Wrong font displaying?
1. Inspect element in DevTools
2. Check "Computed" tab → "font-family"
3. Verify Inter is listed first in font stack
4. Check if Google Fonts CSS loaded successfully

### Performance issues?
1. Check font loading metrics in console
2. Verify `display=swap` is in Google Fonts URL
3. Check if fonts are cached (Network tab)
4. Consider reducing number of font weights

## Resources

- **Inter Website**: https://rsms.me/inter/
- **Google Fonts**: https://fonts.google.com/specimen/Inter
- **GitHub**: https://github.com/rsms/inter
- **Font Pairing**: https://fontpair.co (for complementary fonts)

## License

Inter is licensed under the SIL Open Font License 1.1, which allows:
- ✅ Free commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

No attribution required!
