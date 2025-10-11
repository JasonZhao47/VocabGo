import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyWillChange,
  removeWillChange,
  applyWillChangeToMultiple,
  removeWillChangeFromMultiple,
  hasWillChange,
  arePropertiesGPUAccelerated,
  forceGPUAcceleration,
} from './gpuAcceleration';

describe('gpuAcceleration', () => {
  let element: HTMLElement;
  let elements: HTMLElement[];

  beforeEach(() => {
    element = document.createElement('div');
    elements = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
    ];
  });

  describe('applyWillChange', () => {
    it('should apply will-change with default properties', () => {
      applyWillChange(element);
      expect(element.style.willChange).toBe('transform, opacity');
    });

    it('should apply will-change with custom properties', () => {
      applyWillChange(element, ['opacity']);
      expect(element.style.willChange).toBe('opacity');
    });

    it('should apply will-change with multiple properties', () => {
      applyWillChange(element, ['transform', 'opacity', 'filter']);
      expect(element.style.willChange).toBe('transform, opacity, filter');
    });

    it('should handle null element gracefully', () => {
      expect(() => applyWillChange(null)).not.toThrow();
    });

    it('should handle non-HTMLElement gracefully', () => {
      const textNode = document.createTextNode('text');
      expect(() => applyWillChange(textNode as any)).not.toThrow();
    });
  });

  describe('removeWillChange', () => {
    it('should remove will-change property', () => {
      element.style.willChange = 'transform, opacity';
      removeWillChange(element);
      expect(element.style.willChange).toBe('auto');
    });

    it('should handle null element gracefully', () => {
      expect(() => removeWillChange(null)).not.toThrow();
    });

    it('should handle element without will-change', () => {
      expect(() => removeWillChange(element)).not.toThrow();
      expect(element.style.willChange).toBe('auto');
    });
  });

  describe('applyWillChangeToMultiple', () => {
    it('should apply will-change to all elements', () => {
      applyWillChangeToMultiple(elements);
      elements.forEach(el => {
        expect(el.style.willChange).toBe('transform, opacity');
      });
    });

    it('should apply will-change with custom properties', () => {
      applyWillChangeToMultiple(elements, ['opacity']);
      elements.forEach(el => {
        expect(el.style.willChange).toBe('opacity');
      });
    });

    it('should handle NodeList', () => {
      const container = document.createElement('div');
      elements.forEach(el => container.appendChild(el));
      const nodeList = container.querySelectorAll('div');
      
      applyWillChangeToMultiple(nodeList);
      Array.from(nodeList).forEach(el => {
        expect((el as HTMLElement).style.willChange).toBe('transform, opacity');
      });
    });

    it('should handle empty array', () => {
      expect(() => applyWillChangeToMultiple([])).not.toThrow();
    });
  });

  describe('removeWillChangeFromMultiple', () => {
    it('should remove will-change from all elements', () => {
      elements.forEach(el => el.style.willChange = 'transform');
      removeWillChangeFromMultiple(elements);
      elements.forEach(el => {
        expect(el.style.willChange).toBe('auto');
      });
    });

    it('should handle NodeList', () => {
      const container = document.createElement('div');
      elements.forEach(el => {
        el.style.willChange = 'transform';
        container.appendChild(el);
      });
      const nodeList = container.querySelectorAll('div');
      
      removeWillChangeFromMultiple(nodeList);
      Array.from(nodeList).forEach(el => {
        expect((el as HTMLElement).style.willChange).toBe('auto');
      });
    });

    it('should handle empty array', () => {
      expect(() => removeWillChangeFromMultiple([])).not.toThrow();
    });
  });

  describe('hasWillChange', () => {
    it('should return true when will-change is set', () => {
      element.style.willChange = 'transform';
      expect(hasWillChange(element)).toBe(true);
    });

    it('should return false when will-change is auto', () => {
      element.style.willChange = 'auto';
      expect(hasWillChange(element)).toBe(false);
    });

    it('should return false when will-change is empty', () => {
      expect(hasWillChange(element)).toBe(false);
    });

    it('should return false for null element', () => {
      expect(hasWillChange(null)).toBe(false);
    });
  });

  describe('arePropertiesGPUAccelerated', () => {
    it('should return true for GPU-accelerated properties', () => {
      expect(arePropertiesGPUAccelerated(['transform'])).toBe(true);
      expect(arePropertiesGPUAccelerated(['opacity'])).toBe(true);
      expect(arePropertiesGPUAccelerated(['filter'])).toBe(true);
      expect(arePropertiesGPUAccelerated(['transform', 'opacity'])).toBe(true);
    });

    it('should return false for non-GPU-accelerated properties', () => {
      expect(arePropertiesGPUAccelerated(['width'])).toBe(false);
      expect(arePropertiesGPUAccelerated(['height'])).toBe(false);
      expect(arePropertiesGPUAccelerated(['margin'])).toBe(false);
      expect(arePropertiesGPUAccelerated(['transform', 'width'])).toBe(false);
    });

    it('should handle empty array', () => {
      expect(arePropertiesGPUAccelerated([])).toBe(true);
    });
  });

  describe('forceGPUAcceleration', () => {
    it('should add translateZ(0) to element', () => {
      forceGPUAcceleration(element);
      expect(element.style.transform).toContain('translateZ(0)');
    });

    it('should append translateZ(0) to existing transform', () => {
      element.style.transform = 'scale(1.5)';
      forceGPUAcceleration(element);
      expect(element.style.transform).toBe('scale(1.5) translateZ(0)');
    });

    it('should handle null element gracefully', () => {
      expect(() => forceGPUAcceleration(null)).not.toThrow();
    });
  });
});
