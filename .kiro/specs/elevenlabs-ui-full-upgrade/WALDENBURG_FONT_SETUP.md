# Waldenburg Font Setup Guide

## Current Status
The font loading optimization (Task 27) is complete, but the Waldenburg font files are not yet in the project. The app currently uses system fonts as a fallback.

## How to Add Waldenburg Font

### Method 1: Extract from ElevenLabs Website

1. **Visit** https://elevenlabs.io
2. **Open DevTools** (F12 or Right-click → Inspect)
3. **Go to Network tab** and filter by "Font"
4. **Reload the page** (Cmd+R or Ctrl+R)
5. **Look for Waldenburg font files** (`.woff2` format)
6. **Download the fonts:**
   - Right-click on each font file
   - Select "Open in new tab"
   - Save the file (Cmd+S or Ctrl+S)

7. **Create fonts directory:**
   ```bash
   mkdir -p src/assets/fonts
   ```

8. **Rename and place files:**
   - Save regular weight as: `src/assets/fonts/waldenburg-regular.woff2`
   - Save bold weight as: `src/assets/fonts/waldenburg-bold.woff2`

9. **Uncomment font declarations in `src/assets/elevenlabs.css`:**
   ```css
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
   ```

10. **Update body font-family in `src/assets/elevenlabs.css`:**
    ```css
    body {
      font-family: 'Waldenburg', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      /* ... */
    }
    ```

11. **Uncomment preload links in `index.html`:**
    ```html
    <link rel="preload" href="/src/assets/fonts/waldenburg-regular.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href="/src/assets/fonts/waldenburg-bold.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
    ```

### Method 2: Use Google Fonts Alternative

If you can't access Waldenburg, use a similar font from Google Fonts:

**Option A: Inter (Most Similar)**
```html
<!-- Add to index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
```

```css
/* Update in src/assets/elevenlabs.css */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**Option B: Manrope (Clean Alternative)**
```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap" rel="stylesheet">
```

```css
body {
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Method 3: Keep System Fonts (Current Setup)

The app currently uses a high-quality system font stack:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
```

This provides:
- Zero loading time (fonts already on device)
- Native OS appearance
- Excellent readability
- No licensing concerns

## Verification

After adding fonts, verify they're working:

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Open browser DevTools** → Console
3. **Look for font loading metrics:**
   ```
   🔤 Font Loading Performance
   ✅ Waldenburg 400: 45.23ms (loaded)
   ✅ Waldenburg 700: 52.18ms (loaded)
   ```

4. **Check Network tab:**
   - Filter by "Font"
   - Verify `.woff2` files load successfully
   - Check they're cached on subsequent loads

5. **Inspect element:**
   - Right-click any text → Inspect
   - Check Computed styles
   - Verify `font-family` shows "Waldenburg"

## Troubleshooting

### Fonts not loading
- Check file paths are correct
- Verify files are in `src/assets/fonts/`
- Check browser console for 404 errors
- Clear browser cache and reload

### Wrong font displaying
- Check `@font-face` declarations are uncommented
- Verify `body` font-family includes 'Waldenburg'
- Inspect element to see computed font-family

### Performance issues
- Ensure `font-display: swap` is set
- Verify preload links are in `<head>`
- Check fonts are WOFF2 format (best compression)

## Font Licensing

**Important:** Waldenburg is ElevenLabs' proprietary font. Ensure you have proper licensing rights before using it in production. Alternatives:

- System fonts (free, no licensing needed)
- Google Fonts (free, open source)
- Purchase commercial font license

## Current Fallback Strategy

The app is configured to gracefully fall back to system fonts if Waldenburg isn't available:

```css
font-family: 'Waldenburg', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

This ensures the app always displays with high-quality typography, even without custom fonts.
