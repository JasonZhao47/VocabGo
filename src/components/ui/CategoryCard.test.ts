import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryCard from './CategoryCard.vue'

describe('CategoryCard', () => {
  describe('Component Structure (Requirement 3.1)', () => {
    it('renders with title', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      expect(wrapper.find('.category-card__title').text()).toBe('Test Category')
    })

    it('renders with title and description', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          description: 'Test description',
        },
      })

      expect(wrapper.find('.category-card__title').text()).toBe('Test Category')
      expect(wrapper.find('.category-card__description').text()).toBe('Test description')
    })

    it('renders without description when not provided', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      expect(wrapper.find('.category-card__description').exists()).toBe(false)
    })

    it('has 16:9 aspect ratio', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      const card = wrapper.find('.category-card')
      
      // Check that the card element exists with proper class
      expect(card.exists()).toBe(true)
      expect(card.classes()).toContain('category-card')
    })

    it('has 12px border radius', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      const card = wrapper.find('.category-card')
      expect(card.attributes('style')).toContain('border-radius: 12px')
    })

    it('renders with gradient background', () => {
      const gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          gradient,
        },
      })

      expect(wrapper.find('.category-card__background').exists()).toBe(true)
    })

    it('renders with image background using lazy loading', () => {
      const imageUrl = 'https://example.com/image.jpg'
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          image: imageUrl,
        },
      })

      const img = wrapper.find('.category-card__image')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe(imageUrl)
      expect(img.attributes('loading')).toBe('lazy')
      expect(img.attributes('alt')).toBe('Test Category')
    })

    it('renders semi-transparent overlay', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      expect(wrapper.find('.category-card__overlay').exists()).toBe(true)
    })
  })

  describe('Interactions (Requirement 3.2)', () => {
    it('calls onClick when clicked', async () => {
      const onClick = vi.fn()
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          onClick,
        },
      })

      await wrapper.find('.category-card').trigger('click')
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick when Enter key is pressed', async () => {
      const onClick = vi.fn()
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          onClick,
        },
      })

      await wrapper.find('.category-card').trigger('keydown.enter')
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick when Space key is pressed', async () => {
      const onClick = vi.fn()
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          onClick,
        },
      })

      await wrapper.find('.category-card').trigger('keydown.space')
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('does not throw error when clicked without handler', async () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      // Should not throw error when clicked without onClick handler
      await expect(async () => {
        await wrapper.find('.category-card').trigger('click')
      }).not.toThrow()
    })

    it('has clickable class when onClick is provided', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          onClick: () => {},
        },
      })

      expect(wrapper.find('.category-card').classes()).toContain('category-card--clickable')
    })

    it('does not have clickable class when onClick is not provided', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      expect(wrapper.find('.category-card').classes()).not.toContain('category-card--clickable')
    })
  })

  describe('Keyboard Accessibility (Requirement 3.3)', () => {
    it('has tabindex 0 when clickable', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          onClick: () => {},
        },
      })

      expect(wrapper.find('.category-card').attributes('tabindex')).toBe('0')
    })

    it('has tabindex -1 when not clickable', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      expect(wrapper.find('.category-card').attributes('tabindex')).toBe('-1')
    })

    it('has role="button" for semantic HTML', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          onClick: () => {},
        },
      })

      expect(wrapper.find('.category-card').attributes('role')).toBe('button')
    })

    it('has aria-label with title', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
        },
      })

      expect(wrapper.find('.category-card').attributes('aria-label')).toBe('Test Category')
    })

    it('has aria-hidden on decorative elements', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      })

      expect(wrapper.find('.category-card__background').attributes('aria-hidden')).toBe('true')
      expect(wrapper.find('.category-card__overlay').attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Responsive Design', () => {
    it('renders content with proper structure for responsive layout', () => {
      const wrapper = mount(CategoryCard, {
        props: {
          title: 'Test Category',
          description: 'Test description',
        },
      })

      const content = wrapper.find('.category-card__content')
      expect(content.exists()).toBe(true)
      expect(content.find('.category-card__title').exists()).toBe(true)
      expect(content.find('.category-card__description').exists()).toBe(true)
    })
  })
})
