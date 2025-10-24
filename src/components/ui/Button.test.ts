import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button - ElevenLabs 1:1 Replication', () => {
  describe('Border Radius', () => {
    it('applies 8px border radius (rounded-lg) for all variants', () => {
      const variants = ['primary', 'secondary', 'ghost', 'destructive'] as const
      
      variants.forEach(variant => {
        const wrapper = mount(Button, {
          props: { variant },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('rounded-lg')
        expect(button.classes()).not.toContain('rounded-full')
      })
    })
  })

  describe('Typography', () => {
    it('applies 13px font size for all buttons', () => {
      const wrapper = mount(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('text-[13px]')
    })

    it('applies font-medium (500) weight', () => {
      const wrapper = mount(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('font-medium')
    })

    it('applies 20px line height', () => {
      const wrapper = mount(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('leading-[20px]')
    })
  })

  describe('Button Sizing', () => {
    it('applies correct height and padding for small size (32px height, 10px padding)', () => {
      const wrapper = mount(Button, {
        props: { size: 'sm' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('h-8') // 32px
      expect(button.classes()).toContain('px-[10px]')
    })

    it('applies correct height and padding for medium size (36px height, 12px padding)', () => {
      const wrapper = mount(Button, {
        props: { size: 'md' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('h-9') // 36px
      expect(button.classes()).toContain('px-3') // 12px
    })

    it('applies correct height and padding for large size (40px height, 16px padding)', () => {
      const wrapper = mount(Button, {
        props: { size: 'lg' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('h-10') // 40px
      expect(button.classes()).toContain('px-4') // 16px
    })
  })

  describe('Color Variants', () => {
    it('applies correct styles for primary variant', () => {
      const wrapper = mount(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-black')
      expect(button.classes()).toContain('text-white')
    })

    it('applies correct styles for secondary variant with subtle border', () => {
      const wrapper = mount(Button, {
        props: { variant: 'secondary' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-white')
      expect(button.classes()).toContain('text-[rgb(15,15,16)]')
      expect(button.classes()).toContain('border')
      expect(button.classes()).toContain('border-[rgba(0,0,29,0.1)]')
    })

    it('applies correct styles for ghost variant', () => {
      const wrapper = mount(Button, {
        props: { variant: 'ghost' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-transparent')
      expect(button.classes()).toContain('text-[rgb(15,15,16)]')
      expect(button.classes()).not.toContain('border')
    })
  })

  describe('Transitions', () => {
    it('uses 75ms transition duration', () => {
      const wrapper = mount(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('duration-75')
      expect(button.classes()).not.toContain('duration-200')
    })

    it('does not apply scale transforms on hover or active states', () => {
      const wrapper = mount(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).not.toContain('hover:scale-[1.02]')
      expect(button.classes()).not.toContain('active:scale-[0.98]')
    })

    it('uses ease-in-out timing function', () => {
      const wrapper = mount(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Test' },
      })
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('ease-in-out')
    })
  })

  describe('Functionality', () => {
    it('shows ripple effect when ripple prop is true and button is clicked', async () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'primary',
          ripple: true,
        },
        slots: {
          default: 'Click me',
        },
      })

      const button = wrapper.find('button')
      
      // Initially no ripple
      expect(wrapper.find('.animate-ripple').exists()).toBe(false)

      // Click the button
      await button.trigger('click')

      // Ripple should appear
      expect(wrapper.find('.animate-ripple').exists()).toBe(true)
      expect(wrapper.find('.animate-ripple').classes()).toContain('animate-ripple')
    })

    it('disables button when disabled prop is true', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'primary',
          disabled: true,
        },
        slots: {
          default: 'Test',
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.classes()).toContain('disabled:opacity-50')
    })

    it('shows loading spinner when loading prop is true', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'primary',
          loading: true,
        },
        slots: {
          default: 'Test',
        },
      })

      expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
    })
  })

  describe('Button States - Task 5.2', () => {
    describe('Hover States', () => {
      it('applies correct hover state for primary variant', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('hover:bg-gray-800')
        expect(button.classes()).toContain('transition-all')
        expect(button.classes()).toContain('duration-75')
      })

      it('applies correct hover state for secondary variant', () => {
        const wrapper = mount(Button, {
          props: { variant: 'secondary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('hover:bg-gray-50')
        expect(button.classes()).toContain('transition-all')
        expect(button.classes()).toContain('duration-75')
      })

      it('applies correct hover state for ghost variant', () => {
        const wrapper = mount(Button, {
          props: { variant: 'ghost' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('hover:bg-gray-100')
        expect(button.classes()).toContain('transition-all')
        expect(button.classes()).toContain('duration-75')
      })

      it('applies correct hover state for destructive variant', () => {
        const wrapper = mount(Button, {
          props: { variant: 'destructive' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('hover:bg-red-700')
        expect(button.classes()).toContain('transition-all')
        expect(button.classes()).toContain('duration-75')
      })

      it('does not apply hover styles when disabled', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary', disabled: true },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).not.toContain('hover:bg-gray-800')
      })

      it('does not apply hover styles when loading', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary', loading: true },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).not.toContain('hover:bg-gray-800')
      })
    })

    describe('Active States', () => {
      it('maintains transition properties for active state', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('transition-all')
        expect(button.classes()).toContain('duration-75')
        expect(button.classes()).toContain('ease-in-out')
      })

      it('does not use scale transforms for active state', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).not.toContain('active:scale-[0.98]')
        expect(button.classes()).not.toContain('active:scale-95')
      })
    })

    describe('Focus States', () => {
      it('applies focus-visible outline for primary variant', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('focus-visible:outline-2')
        expect(button.classes()).toContain('focus-visible:outline-offset-2')
        expect(button.classes()).toContain('focus-visible:outline-black')
      })

      it('applies focus-visible outline for secondary variant', () => {
        const wrapper = mount(Button, {
          props: { variant: 'secondary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('focus-visible:outline-2')
        expect(button.classes()).toContain('focus-visible:outline-offset-2')
        expect(button.classes()).toContain('focus-visible:outline-black')
      })

      it('applies focus-visible outline for ghost variant', () => {
        const wrapper = mount(Button, {
          props: { variant: 'ghost' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('focus-visible:outline-2')
        expect(button.classes()).toContain('focus-visible:outline-offset-2')
        expect(button.classes()).toContain('focus-visible:outline-black')
      })

      it('applies focus-visible outline for destructive variant', () => {
        const wrapper = mount(Button, {
          props: { variant: 'destructive' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('focus-visible:outline-2')
        expect(button.classes()).toContain('focus-visible:outline-offset-2')
        expect(button.classes()).toContain('focus-visible:outline-red-600')
      })
    })

    describe('Loading States', () => {
      it('displays loading spinner when loading is true', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary', loading: true },
          slots: { default: 'Test' },
        })
        
        const spinner = wrapper.find('svg.animate-spin')
        expect(spinner.exists()).toBe(true)
        expect(spinner.classes()).toContain('animate-spin')
      })

      it('disables button when loading is true', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary', loading: true },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.attributes('disabled')).toBeDefined()
        expect(button.attributes('aria-busy')).toBe('true')
      })

      it('maintains button styling when loading', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary', size: 'md', loading: true },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('bg-black')
        expect(button.classes()).toContain('text-white')
        expect(button.classes()).toContain('h-9')
        expect(button.classes()).toContain('rounded-lg')
      })

      it('shows loading spinner for all variants', () => {
        const variants = ['primary', 'secondary', 'ghost', 'destructive'] as const
        
        variants.forEach(variant => {
          const wrapper = mount(Button, {
            props: { variant, loading: true },
            slots: { default: 'Test' },
          })
          
          expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
        })
      })

      it('shows loading spinner for all sizes', () => {
        const sizes = ['sm', 'md', 'lg'] as const
        
        sizes.forEach(size => {
          const wrapper = mount(Button, {
            props: { size, loading: true },
            slots: { default: 'Test' },
          })
          
          expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
        })
      })
    })

    describe('Disabled States', () => {
      it('applies disabled attribute when disabled is true', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary', disabled: true },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.attributes('disabled')).toBeDefined()
        expect(button.attributes('aria-disabled')).toBe('true')
      })

      it('applies disabled opacity styling', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary', disabled: true },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('disabled:opacity-50')
        expect(button.classes()).toContain('disabled:cursor-not-allowed')
      })

      it('maintains base styling when disabled', () => {
        const wrapper = mount(Button, {
          props: { variant: 'secondary', size: 'lg', disabled: true },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('bg-white')
        expect(button.classes()).toContain('border')
        expect(button.classes()).toContain('h-10')
        expect(button.classes()).toContain('rounded-lg')
      })

      it('disables button for all variants', () => {
        const variants = ['primary', 'secondary', 'ghost', 'destructive'] as const
        
        variants.forEach(variant => {
          const wrapper = mount(Button, {
            props: { variant, disabled: true },
            slots: { default: 'Test' },
          })
          
          const button = wrapper.find('button')
          expect(button.attributes('disabled')).toBeDefined()
          expect(button.classes()).toContain('disabled:opacity-50')
        })
      })

      it('disables button for all sizes', () => {
        const sizes = ['sm', 'md', 'lg'] as const
        
        sizes.forEach(size => {
          const wrapper = mount(Button, {
            props: { size, disabled: true },
            slots: { default: 'Test' },
          })
          
          const button = wrapper.find('button')
          expect(button.attributes('disabled')).toBeDefined()
          expect(button.classes()).toContain('disabled:opacity-50')
        })
      })

      it('does not trigger ripple effect when disabled', async () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary', disabled: true, ripple: true },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        await button.trigger('click')
        
        expect(wrapper.find('.animate-ripple').exists()).toBe(false)
      })
    })

    describe('Transition Verification', () => {
      it('uses 75ms transition for all states', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('duration-75')
        expect(button.classes()).toContain('transition-all')
      })

      it('uses ease-in-out easing for all transitions', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        expect(button.classes()).toContain('ease-in-out')
      })

      it('does not use scale transforms on any state', () => {
        const wrapper = mount(Button, {
          props: { variant: 'primary' },
          slots: { default: 'Test' },
        })
        
        const button = wrapper.find('button')
        const classString = button.classes().join(' ')
        expect(classString).not.toContain('scale')
      })
    })
  })
})
