import { describe, it, expect } from 'vitest';
import { 
  brandColors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  buttonStyles, 
  cardStyles, 
  inputStyles, 
  animations, 
  layout, 
  cn, 
  getButtonClass, 
  getCardClass, 
  getInputClass 
} from '@/lib/designSystem';

describe('designSystem', () => {
  describe('brandColors', () => {
    it('should have correct primary green colors', () => {
      expect(brandColors.primary.green).toBe('#048D47');
      expect(brandColors.primary.greenDark).toBe('#036B38');
      expect(brandColors.primary.greenLight).toBe('#E8F5ED');
      expect(brandColors.primary.greenPale).toBe('#F0F9F4');
    });

    it('should have correct secondary gold colors', () => {
      expect(brandColors.secondary.gold).toBe('#D4AF37');
      expect(brandColors.secondary.goldDark).toBe('#B8960F');
      expect(brandColors.secondary.goldLight).toBe('#F5E6B3');
    });

    it('should have correct accent colors', () => {
      expect(brandColors.accent.blue).toBe('#005EB8');
      expect(brandColors.accent.navy).toBe('#0B1426');
    });

    it('should have correct neutral colors', () => {
      expect(brandColors.neutral.white).toBe('#FFFFFF');
      expect(brandColors.neutral.black).toBe('#000000');
      expect(brandColors.neutral.dark).toBe('#0f1419');
    });

    it('should have complete gray color scale', () => {
      expect(brandColors.neutral.gray[50]).toBe('#F9FAFB');
      expect(brandColors.neutral.gray[100]).toBe('#F3F4F6');
      expect(brandColors.neutral.gray[900]).toBe('#111827');
    });

    it('should have correct status colors', () => {
      expect(brandColors.status.success).toBe('#059669');
      expect(brandColors.status.warning).toBe('#D97706');
      expect(brandColors.status.error).toBe('#DC2626');
      expect(brandColors.status.info).toBe('#2563EB');
    });
  });

  describe('typography', () => {
    it('should have correct font families', () => {
      expect(typography.fontFamily.primary).toBe('var(--font-geist-sans, ui-sans-serif, system-ui)');
      expect(typography.fontFamily.display).toBe('var(--font-geist-sans, ui-sans-serif, system-ui)');
    });

    it('should have correct font sizes', () => {
      expect(typography.fontSize.xs).toBe('0.75rem');
      expect(typography.fontSize.base).toBe('1rem');
      expect(typography.fontSize['6xl']).toBe('3.75rem');
    });

    it('should have correct font weights', () => {
      expect(typography.fontWeight.normal).toBe('400');
      expect(typography.fontWeight.bold).toBe('700');
      expect(typography.fontWeight.black).toBe('900');
    });

    it('should have correct line heights', () => {
      expect(typography.lineHeight.tight).toBe('1.25');
      expect(typography.lineHeight.normal).toBe('1.5');
      expect(typography.lineHeight.relaxed).toBe('1.75');
    });
  });

  describe('spacing', () => {
    it('should have correct base spacing values', () => {
      expect(spacing.px).toBe('1px');
      expect(spacing[0]).toBe('0');
      expect(spacing[4]).toBe('1rem');
    });

    it('should have correct larger spacing values', () => {
      expect(spacing[16]).toBe('4rem');
      expect(spacing[24]).toBe('6rem');
    });
  });

  describe('borderRadius', () => {
    it('should have correct border radius values', () => {
      expect(borderRadius.none).toBe('0');
      expect(borderRadius.base).toBe('0.25rem');
      expect(borderRadius.full).toBe('9999px');
    });
  });

  describe('shadows', () => {
    it('should have standard shadow definitions', () => {
      expect(shadows.sm).toBe('0 1px 2px 0 rgb(0 0 0 / 0.05)');
      expect(shadows.base).toBe('0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)');
      expect(shadows['2xl']).toBe('0 25px 50px -12px rgb(0 0 0 / 0.25)');
    });

    it('should have betis branded shadow', () => {
      expect(shadows.betis).toBe('0 4px 14px 0 rgba(4, 141, 71, 0.25)');
    });
  });

  describe('component styles', () => {
    it('should have button base styles', () => {
      expect(buttonStyles.base).toContain('inline-flex');
      expect(buttonStyles.base).toContain('font-semibold');
      expect(buttonStyles.base).toContain('transition-all');
    });

    it('should have button variant styles', () => {
      expect(buttonStyles.variants.primary).toContain('bg-betis-verde');
      expect(buttonStyles.variants.secondary).toContain('bg-betis-oro');
      expect(buttonStyles.variants.outline).toContain('border');
      expect(buttonStyles.variants.ghost).toContain('text-betis-verde');
      expect(buttonStyles.variants.danger).toContain('bg-red-600');
    });

    it('should have button size styles', () => {
      expect(buttonStyles.sizes.xs).toContain('px-2 py-1');
      expect(buttonStyles.sizes.md).toContain('px-4 py-2');
      expect(buttonStyles.sizes.xl).toContain('px-8 py-4');
    });

    it('should have card styles', () => {
      expect(cardStyles.base).toContain('bg-white');
      expect(cardStyles.interactive).toContain('hover:shadow-xl');
      expect(cardStyles.elevated).toContain('shadow-xl');
      expect(cardStyles.betis).toContain('border-betis-verde');
    });

    it('should have input styles', () => {
      expect(inputStyles.base).toContain('w-full');
      expect(inputStyles.base).toContain('focus:ring-2');
      expect(inputStyles.states.default).toContain('border-gray-300');
      expect(inputStyles.states.error).toContain('border-red-500');
      expect(inputStyles.states.success).toContain('border-betis-verde');
    });
  });

  describe('animations', () => {
    it('should have transition presets', () => {
      expect(animations.transition.fast).toBe('transition-all duration-150 ease-in-out');
      expect(animations.transition.normal).toBe('transition-all duration-200 ease-in-out');
      expect(animations.transition.slow).toBe('transition-all duration-300 ease-in-out');
    });

    it('should have animation classes', () => {
      expect(animations.bounce).toBe('animate-bounce');
      expect(animations.pulse).toBe('animate-pulse');
      expect(animations.spin).toBe('animate-spin');
    });
  });

  describe('layout', () => {
    it('should have container styles', () => {
      expect(layout.container).toContain('max-w-7xl');
      expect(layout.container).toContain('mx-auto');
    });

    it('should have section styles', () => {
      expect(layout.section).toContain('py-12');
    });

    it('should have grid presets', () => {
      expect(layout.grid.auto).toContain('grid');
      expect(layout.grid.responsive).toContain('md:grid-cols-2');
      expect(layout.grid.dense).toContain('xl:grid-cols-4');
    });
  });

  describe('utility functions', () => {
    describe('cn', () => {
      it('should combine valid class strings', () => {
        const result = cn('class1', 'class2', 'class3');
        expect(result).toBe('class1 class2 class3');
      });

      it('should filter out falsy values', () => {
        const result = cn('class1', null, undefined, false, 'class2', '');
        expect(result).toBe('class1 class2');
      });

      it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
      });

      it('should handle all falsy values', () => {
        const result = cn(null, undefined, false, '');
        expect(result).toBe('');
      });

      it('should handle mixed valid and invalid values', () => {
        const result = cn('valid', null, 'another-valid', false, undefined, 'final-valid');
        expect(result).toBe('valid another-valid final-valid');
      });
    });

    describe('getButtonClass', () => {
      it('should return combined button classes with default size', () => {
        const result = getButtonClass('primary');
        expect(result).toContain('inline-flex'); // base
        expect(result).toContain('bg-betis-verde'); // variant
        expect(result).toContain('px-4 py-2'); // default md size
      });

      it('should return combined button classes with custom size', () => {
        const result = getButtonClass('secondary', 'lg');
        expect(result).toContain('inline-flex'); // base
        expect(result).toContain('bg-betis-oro'); // variant
        expect(result).toContain('px-6 py-3'); // lg size
      });

      it('should work with all variants', () => {
        const primaryResult = getButtonClass('primary');
        const secondaryResult = getButtonClass('secondary');
        const outlineResult = getButtonClass('outline');
        const ghostResult = getButtonClass('ghost');
        const dangerResult = getButtonClass('danger');

        expect(primaryResult).toContain('bg-betis-verde');
        expect(secondaryResult).toContain('bg-betis-oro');
        expect(outlineResult).toContain('border');
        expect(ghostResult).toContain('text-betis-verde');
        expect(dangerResult).toContain('bg-red-600');
      });

      it('should work with all sizes', () => {
        const xsResult = getButtonClass('primary', 'xs');
        const smResult = getButtonClass('primary', 'sm');
        const mdResult = getButtonClass('primary', 'md');
        const lgResult = getButtonClass('primary', 'lg');
        const xlResult = getButtonClass('primary', 'xl');

        expect(xsResult).toContain('px-2 py-1');
        expect(smResult).toContain('px-3 py-1.5');
        expect(mdResult).toContain('px-4 py-2');
        expect(lgResult).toContain('px-6 py-3');
        expect(xlResult).toContain('px-8 py-4');
      });
    });

    describe('getCardClass', () => {
      it('should return base card class by default', () => {
        const result = getCardClass();
        expect(result).toBe(cardStyles.base);
        expect(result).toContain('bg-white');
      });

      it('should return specific card variant', () => {
        expect(getCardClass('base')).toBe(cardStyles.base);
        expect(getCardClass('interactive')).toBe(cardStyles.interactive);
        expect(getCardClass('elevated')).toBe(cardStyles.elevated);
        expect(getCardClass('betis')).toBe(cardStyles.betis);
      });
    });

    describe('getInputClass', () => {
      it('should return combined input classes with default state', () => {
        const result = getInputClass();
        expect(result).toContain('w-full'); // base
        expect(result).toContain('border-gray-300'); // default state
      });

      it('should return combined input classes with custom state', () => {
        const errorResult = getInputClass('error');
        const successResult = getInputClass('success');

        expect(errorResult).toContain('w-full'); // base
        expect(errorResult).toContain('border-red-500'); // error state

        expect(successResult).toContain('w-full'); // base
        expect(successResult).toContain('border-betis-verde'); // success state
      });

      it('should work with all input states', () => {
        const defaultResult = getInputClass('default');
        const errorResult = getInputClass('error');
        const successResult = getInputClass('success');

        expect(defaultResult).toContain('border-gray-300');
        expect(errorResult).toContain('border-red-500');
        expect(successResult).toContain('border-betis-verde');
      });
    });
  });

  describe('type safety', () => {
    it('should ensure const assertions work properly', () => {
      // These should not throw TypeScript errors if const assertions are working
      expect(typeof brandColors).toBe('object');
      expect(typeof typography).toBe('object');
      expect(typeof spacing).toBe('object');
      expect(typeof borderRadius).toBe('object');
      expect(typeof shadows).toBe('object');
      expect(typeof buttonStyles).toBe('object');
      expect(typeof cardStyles).toBe('object');
      expect(typeof inputStyles).toBe('object');
      expect(typeof animations).toBe('object');
      expect(typeof layout).toBe('object');
    });
  });
});