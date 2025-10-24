import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('CSS Bundle Optimization', () => {
  describe('Tailwind Configuration', () => {
    it('should have content paths configured for purging', () => {
      const configPath = join(process.cwd(), 'tailwind.config.js')
      expect(existsSync(configPath)).toBe(true)
      
      const config = readFileSync(configPath, 'utf-8')
      
      // Check for content paths
      expect(config).toContain('content:')
      expect(config).toContain('./index.html')
      expect(config).toContain('./src/**/*.{vue,js,ts,jsx,tsx}')
    })

    it('should have safelist for dynamic classes', () => {
      const configPath = join(process.cwd(), 'tailwind.config.js')
      const config = readFileSync(configPath, 'utf-8')
      
      // Check for safelist
      expect(config).toContain('safelist:')
      
      // Check for critical animation classes
      expect(config).toContain('animate-fade-in')
      expect(config).toContain('animate-slide-up')
      expect(config).toContain('gpu-accelerated')
    })
  })

  describe('PostCSS Configuration', () => {
    it('should have cssnano configured for production', () => {
      const configPath = join(process.cwd(), 'postcss.config.js')
      expect(existsSync(configPath)).toBe(true)
      
      const config = readFileSync(configPath, 'utf-8')
      
      // Check for cssnano
      expect(config).toContain('cssnano')
      expect(config).toContain('process.env.NODE_ENV')
    })

    it('should have optimization presets configured', () => {
      const configPath = join(process.cwd(), 'postcss.config.js')
      const config = readFileSync(configPath, 'utf-8')
      
      // Check for optimization options
      expect(config).toContain('discardComments')
      expect(config).toContain('normalizeWhitespace')
      expect(config).toContain('minifySelectors')
    })
  })

  describe('Vite Configuration', () => {
    it('should have CSS code splitting enabled', () => {
      const configPath = join(process.cwd(), 'vite.config.ts')
      expect(existsSync(configPath)).toBe(true)
      
      const config = readFileSync(configPath, 'utf-8')
      
      // Check for CSS code splitting
      expect(config).toContain('cssCodeSplit')
    })

    it('should have CSS optimization configured', () => {
      const configPath = join(process.cwd(), 'vite.config.ts')
      const config = readFileSync(configPath, 'utf-8')
      
      // Check for CSS configuration
      expect(config).toContain('css:')
      expect(config).toContain('postcss')
    })
  })

  describe('Custom CSS Structure', () => {
    it('should have main CSS file', () => {
      const mainCssPath = join(process.cwd(), 'src/assets/main.css')
      expect(existsSync(mainCssPath)).toBe(true)
    })

    it('should import CSS files in correct order', () => {
      const mainCssPath = join(process.cwd(), 'src/assets/main.css')
      const mainCss = readFileSync(mainCssPath, 'utf-8')
      
      // Check for imports
      expect(mainCss).toContain('@import')
      expect(mainCss).toContain('@tailwind base')
      expect(mainCss).toContain('@tailwind components')
      expect(mainCss).toContain('@tailwind utilities')
    })

    it('should use CSS layers for organization', () => {
      const mainCssPath = join(process.cwd(), 'src/assets/main.css')
      const mainCss = readFileSync(mainCssPath, 'utf-8')
      
      // Check for layers
      expect(mainCss).toContain('@layer base')
      expect(mainCss).toContain('@layer components')
      expect(mainCss).toContain('@layer utilities')
    })

    it('should use CSS custom properties for theming', () => {
      const mainCssPath = join(process.cwd(), 'src/assets/main.css')
      const mainCss = readFileSync(mainCssPath, 'utf-8')
      
      // Check for CSS variables
      expect(mainCss).toContain(':root')
      expect(mainCss).toContain('--')
    })
  })

  describe('CSS Best Practices', () => {
    it('should not have duplicate selectors in main CSS', () => {
      const mainCssPath = join(process.cwd(), 'src/assets/main.css')
      const mainCss = readFileSync(mainCssPath, 'utf-8')
      
      // Extract selectors (simplified check)
      const selectorMatches = mainCss.match(/\.[a-z-]+\s*{/g) || []
      const selectors = selectorMatches.map(s => s.trim())
      
      // Check for obvious duplicates (same selector appearing multiple times)
      const selectorCounts = new Map<string, number>()
      selectors.forEach(selector => {
        selectorCounts.set(selector, (selectorCounts.get(selector) || 0) + 1)
      })
      
      // Allow some duplicates for different contexts (layers, media queries)
      // But flag if any selector appears more than 5 times
      const excessiveDuplicates = Array.from(selectorCounts.entries())
        .filter(([_, count]) => count > 5)
      
      expect(excessiveDuplicates.length).toBe(0)
    })

    it('should use shorthand properties where possible', () => {
      const mainCssPath = join(process.cwd(), 'src/assets/main.css')
      const mainCss = readFileSync(mainCssPath, 'utf-8')
      
      // Check that we're not using overly verbose properties
      // This is a basic check - cssnano will handle most of this
      const hasShorthand = mainCss.includes('margin:') || 
                          mainCss.includes('padding:') ||
                          mainCss.includes('border:')
      
      expect(hasShorthand).toBe(true)
    })

    it('should minimize use of !important', () => {
      const mainCssPath = join(process.cwd(), 'src/assets/main.css')
      const mainCss = readFileSync(mainCssPath, 'utf-8')
      
      // Count !important usage
      const importantCount = (mainCss.match(/!important/g) || []).length
      
      // Allow some !important for utility overrides and reduced motion
      // but flag if excessive (> 50 uses)
      expect(importantCount).toBeLessThan(50)
    })
  })

  describe('Performance Metrics', () => {
    it('should have reasonable CSS file structure', () => {
      const mainCssPath = join(process.cwd(), 'src/assets/main.css')
      const mainCss = readFileSync(mainCssPath, 'utf-8')
      
      // Check file size (uncompressed)
      const sizeKB = Buffer.byteLength(mainCss, 'utf-8') / 1024
      
      // Main CSS should be reasonable size (< 200KB uncompressed)
      // This will be much smaller after Tailwind purge and minification
      expect(sizeKB).toBeLessThan(200)
    })

    it('should have optimized animations CSS', () => {
      const animationsCssPath = join(process.cwd(), 'src/assets/animations-optimized.css')
      
      if (existsSync(animationsCssPath)) {
        const animationsCss = readFileSync(animationsCssPath, 'utf-8')
        
        // Check for GPU acceleration hints
        expect(animationsCss).toContain('transform')
        expect(animationsCss).toContain('will-change')
      }
    })
  })

  describe('Build Output Validation', () => {
    it('should have analysis script available', () => {
      const scriptPath = join(process.cwd(), 'scripts/analyze-css-bundle.sh')
      expect(existsSync(scriptPath)).toBe(true)
    })
  })
})
