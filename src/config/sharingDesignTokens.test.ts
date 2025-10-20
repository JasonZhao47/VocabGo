import { describe, it, expect } from 'vitest'
import { 
  sharingTokens, 
  getGradient, 
  getMistakeDifficultyColor, 
  getAnimation, 
  getSpacing 
} from './sharingDesignTokens'

describe('sharingDesignTokens', () => {
  describe('colors', () => {
    it('should have share state gradients', () => {
      expect(sharingTokens.colors.shareActive).toBeDefined()
      expect(sharingTokens.colors.shareActive.from).toBe('#A855F7')
      expect(sharingTokens.colors.shareActive.to).toBe('#EC4899')
      expect(sharingTokens.colors.shareActive.gradient).toContain('linear-gradient')
      expect(sharingTokens.colors.shareActive.tailwind).toBe('from-purple-500 to-pink-500')
    })

    it('should have mistake difficulty gradients', () => {
      expect(sharingTokens.colors.mistakeHigh).toBeDefined()
      expect(sharingTokens.colors.mistakeMedium).toBeDefined()
      expect(sharingTokens.colors.mistakeLow).toBeDefined()
      
      expect(sharingTokens.colors.mistakeHigh.gradient).toContain('linear-gradient')
      expect(sharingTokens.colors.mistakeMedium.gradient).toContain('linear-gradient')
      expect(sharingTokens.colors.mistakeLow.gradient).toContain('linear-gradient')
    })
  })

  describe('animations', () => {
    it('should have copy success animation', () => {
      expect(sharingTokens.animations.copySuccess).toBeDefined()
      expect(sharingTokens.animations.copySuccess.duration).toBe(200)
      expect(sharingTokens.animations.copySuccess.scale).toBe(1.05)
      expect(sharingTokens.animations.copySuccess.tailwind).toBe('scale-105 duration-200')
    })

    it('should have stat update animation', () => {
      expect(sharingTokens.animations.statUpdate).toBeDefined()
      expect(sharingTokens.animations.statUpdate.duration).toBe(300)
      expect(sharingTokens.animations.statUpdate.tailwind).toBe('pulse duration-300')
    })

    it('should have accordion expand animation', () => {
      expect(sharingTokens.animations.accordionExpand).toBeDefined()
      expect(sharingTokens.animations.accordionExpand.duration).toBe(300)
      expect(sharingTokens.animations.accordionExpand.easing).toBe('ease-out')
    })
  })

  describe('spacing', () => {
    it('should have dashboard spacing constants', () => {
      expect(sharingTokens.spacing.dashboardGap).toBe('24px')
      expect(sharingTokens.spacing.dashboardPadding).toBe('32px')
      expect(sharingTokens.spacing.dashboardMaxWidth).toBe('1280px')
    })

    it('should have card spacing constants', () => {
      expect(sharingTokens.spacing.cardPadding).toBe('20px')
      expect(sharingTokens.spacing.cardGap).toBe('16px')
      expect(sharingTokens.spacing.cardBorderRadius).toBe('12px')
    })

    it('should have stat card sizing constants', () => {
      expect(sharingTokens.spacing.statCardHeight).toBe('120px')
      expect(sharingTokens.spacing.statCardMinWidth).toBe('200px')
    })
  })

  describe('helper functions', () => {
    it('getGradient should return gradient CSS string', () => {
      const gradient = getGradient('shareActive')
      expect(gradient).toContain('linear-gradient')
      expect(gradient).toContain('#A855F7')
      expect(gradient).toContain('#EC4899')
    })

    it('getMistakeDifficultyColor should return correct color for low mistakes', () => {
      const color = getMistakeDifficultyColor(1)
      expect(color).toBe(sharingTokens.colors.mistakeLow)
    })

    it('getMistakeDifficultyColor should return correct color for medium mistakes', () => {
      const color = getMistakeDifficultyColor(4)
      expect(color).toBe(sharingTokens.colors.mistakeMedium)
    })

    it('getMistakeDifficultyColor should return correct color for high mistakes', () => {
      const color = getMistakeDifficultyColor(10)
      expect(color).toBe(sharingTokens.colors.mistakeHigh)
    })

    it('getAnimation should return animation Tailwind class', () => {
      const animation = getAnimation('copySuccess')
      expect(animation).toBe('scale-105 duration-200')
    })

    it('getSpacing should return spacing value', () => {
      const spacing = getSpacing('dashboardGap')
      expect(spacing).toBe('24px')
    })
  })

  describe('thresholds', () => {
    it('should have mistake difficulty thresholds', () => {
      expect(sharingTokens.thresholds.mistakeLow).toBe(2)
      expect(sharingTokens.thresholds.mistakeMedium).toBe(5)
      expect(sharingTokens.thresholds.mistakeHigh).toBe(999)
    })
  })

  describe('typography', () => {
    it('should have dashboard title typography', () => {
      expect(sharingTokens.typography.dashboardTitle.fontSize).toBe('32px')
      expect(sharingTokens.typography.dashboardTitle.fontWeight).toBe(600)
    })

    it('should have stat value typography', () => {
      expect(sharingTokens.typography.statValue.fontSize).toBe('40px')
      expect(sharingTokens.typography.statValue.fontWeight).toBe(700)
    })
  })

  describe('borders', () => {
    it('should have gradient border styles', () => {
      expect(sharingTokens.borders.gradientBorder.width).toBe('2px')
      expect(sharingTokens.borders.gradientBorder.style).toBe('solid')
    })

    it('should have card border styles', () => {
      expect(sharingTokens.borders.cardBorder.width).toBe('1px')
      expect(sharingTokens.borders.cardBorder.color).toBe('#E5E7EB')
    })
  })

  describe('shadows', () => {
    it('should have card shadows', () => {
      expect(sharingTokens.shadows.card).toBeDefined()
      expect(sharingTokens.shadows.cardHover).toBeDefined()
    })

    it('should have modal shadow', () => {
      expect(sharingTokens.shadows.modal).toBeDefined()
    })
  })

  describe('zIndex', () => {
    it('should have z-index layers', () => {
      expect(sharingTokens.zIndex.base).toBe(0)
      expect(sharingTokens.zIndex.modal).toBe(50)
      expect(sharingTokens.zIndex.toast).toBe(100)
    })
  })
})
