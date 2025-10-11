# Tailwind CSS Not Compiling - Fix Required

## Problem
The Tailwind CSS utility classes (like `bg-black`, `rounded-full`, etc.) are being added to the HTML elements but are not being compiled into actual CSS styles. The computed styles show default browser styles instead of Tailwind styles.

## Evidence
- Button has class `bg-black` but computed `backgroundColor` is `rgb(239, 239, 239)` (light gray)
- Button has class `rounded-full` but computed `borderRadius` is `0px`
- No `.bg-black` class found in any loaded stylesheet

## Root Cause
Tailwind's JIT (Just-In-Time) compiler is not processing the utility classes. This typically happens when:
1. The dev server was started before Tailwind configuration was set up
2. Vite's HMR (Hot Module Replacement) didn't pick up the Tailwind config changes
3. PostCSS isn't processing the CSS correctly

## Solution
**Restart the development server:**

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
pnpm dev
```

## Verification
After restarting, check that:
1. The "Generate Wordlist" button appears as a black pill-shaped button
2. The button has white text
3. The button has rounded corners
4. Hover effects work (button becomes slightly lighter gray on hover)

## Files Involved
- `tailwind.config.js` - Tailwind configuration (correct)
- `postcss.config.js` - PostCSS configuration (correct)
- `src/assets/main.css` - Main CSS file with Tailwind directives (correct)
- `src/main.ts` - Imports main.css (correct)

All configuration files are correct. The issue is purely that the dev server needs to be restarted.
