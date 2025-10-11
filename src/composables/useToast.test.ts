/**
 * Tests for useToast composable with animations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast } from './useToast'

describe('useToast with animations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should create a toast with animation properties', () => {
    const { showToast, toasts } = useToast()
    
    showToast('Test message', 'info', 3000)
    
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe('Test message')
    expect(toasts[0].type).toBe('info')
    expect(toasts[0].progress).toBe(100)
    expect(toasts[0].isEntering).toBe(true)
    expect(toasts[0].isLeaving).toBe(false)
  })

  it('should clear entering state after animation', () => {
    const { showToast, toasts } = useToast()
    
    showToast('Test message', 'info', 3000)
    
    expect(toasts[0].isEntering).toBe(true)
    
    // Fast-forward past entering animation (300ms)
    vi.advanceTimersByTime(300)
    
    expect(toasts[0].isEntering).toBe(false)
  })

  it('should animate progress bar countdown', () => {
    const { showToast, toasts } = useToast()
    
    showToast('Test message', 'info', 1000)
    
    expect(toasts[0].progress).toBe(100)
    
    // Advance halfway through duration
    vi.advanceTimersByTime(500)
    
    // Progress should be approximately 50%
    expect(toasts[0].progress).toBeLessThan(60)
    expect(toasts[0].progress).toBeGreaterThan(40)
  })

  it('should set leaving state when removing toast', () => {
    const { showToast, removeToast, toasts } = useToast()
    
    const id = showToast('Test message', 'info', 5000)
    
    expect(toasts.length).toBe(1)
    
    removeToast(id)
    
    expect(toasts[0].isLeaving).toBe(true)
    
    // Toast should still exist during animation
    expect(toasts.length).toBe(1)
    
    // After animation completes (250ms)
    vi.advanceTimersByTime(250)
    
    expect(toasts.length).toBe(0)
  })

  it('should auto-remove toast after duration', () => {
    const { showToast, toasts } = useToast()
    
    showToast('Test message', 'info', 1000)
    
    expect(toasts.length).toBe(1)
    
    // Fast-forward past duration
    vi.advanceTimersByTime(1000)
    
    // Toast should be in leaving state
    expect(toasts[0].isLeaving).toBe(true)
    
    // Complete leaving animation
    vi.advanceTimersByTime(250)
    
    expect(toasts.length).toBe(0)
  })

  it('should handle multiple simultaneous toasts', () => {
    const { success, error, info, toasts } = useToast()
    
    success('Success message')
    error('Error message')
    info('Info message')
    
    expect(toasts.length).toBe(3)
    expect(toasts[0].type).toBe('success')
    expect(toasts[1].type).toBe('error')
    expect(toasts[2].type).toBe('info')
  })

  it('should clear all toasts with animations', () => {
    const { success, error, clearAll, toasts } = useToast()
    
    success('Success message')
    error('Error message')
    
    expect(toasts.length).toBe(2)
    
    clearAll()
    
    // All toasts should be in leaving state
    expect(toasts[0].isLeaving).toBe(true)
    expect(toasts[1].isLeaving).toBe(true)
    
    // Complete leaving animation
    vi.advanceTimersByTime(250)
    
    expect(toasts.length).toBe(0)
  })

  it('should clean up progress intervals on removal', () => {
    const { showToast, removeToast, toasts } = useToast()
    
    const id = showToast('Test message', 'info', 5000)
    
    // Progress should be updating
    expect(toasts[0].progress).toBe(100)
    
    removeToast(id)
    
    // Complete leaving animation
    vi.advanceTimersByTime(250)
    
    // Toast should be removed
    expect(toasts.length).toBe(0)
  })

  it('should support toasts without auto-dismiss', () => {
    const { showToast, toasts } = useToast()
    
    showToast('Persistent message', 'info', 0)
    
    expect(toasts.length).toBe(1)
    
    // Fast-forward time
    vi.advanceTimersByTime(10000)
    
    // Toast should still exist
    expect(toasts.length).toBe(1)
  })
})
