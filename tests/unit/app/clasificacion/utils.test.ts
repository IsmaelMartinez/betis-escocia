import { describe, it, expect } from 'vitest';
import { 
  getPositionStyle, 
  getPositionBadge, 
  formatForm, 
  getFormResultStyle 
} from '@/app/clasificacion/utils';

describe('Clasificacion Utils', () => {
  describe('getPositionStyle', () => {
    it('should return Champions League style for positions 1-4', () => {
      expect(getPositionStyle(1)).toBe('text-betis-verde font-bold');
      expect(getPositionStyle(2)).toBe('text-betis-verde font-bold');
      expect(getPositionStyle(3)).toBe('text-betis-verde font-bold');
      expect(getPositionStyle(4)).toBe('text-betis-verde font-bold');
    });

    it('should return Europa League style for positions 5-6', () => {
      expect(getPositionStyle(5)).toBe('text-scotland-blue font-bold');
      expect(getPositionStyle(6)).toBe('text-scotland-blue font-bold');
    });

    it('should return Conference League style for position 7', () => {
      expect(getPositionStyle(7)).toBe('text-orange-600 font-bold');
    });

    it('should return relegation style for positions 18-20', () => {
      expect(getPositionStyle(18)).toBe('text-red-600 font-bold');
      expect(getPositionStyle(19)).toBe('text-red-600 font-bold');
      expect(getPositionStyle(20)).toBe('text-red-600 font-bold');
    });

    it('should return default style for mid-table positions', () => {
      expect(getPositionStyle(8)).toBe('text-gray-900');
      expect(getPositionStyle(10)).toBe('text-gray-900');
      expect(getPositionStyle(15)).toBe('text-gray-900');
      expect(getPositionStyle(17)).toBe('text-gray-900');
    });

    it('should handle edge cases', () => {
      expect(getPositionStyle(0)).toBe('text-betis-verde font-bold'); // Position 0 is <= 4, so Champions League
      expect(getPositionStyle(21)).toBe('text-red-600 font-bold'); // Position 21 is >= 18, so relegation
    });
  });

  describe('getPositionBadge', () => {
    it('should return Champions League badge for positions 1-4', () => {
      const badge1 = getPositionBadge(1);
      expect(badge1).toEqual({
        text: 'UCL',
        color: 'bg-betis-verde-light text-betis-verde-dark',
      });

      const badge4 = getPositionBadge(4);
      expect(badge4).toEqual({
        text: 'UCL',
        color: 'bg-betis-verde-light text-betis-verde-dark',
      });
    });

    it('should return Europa League badge for positions 5-6', () => {
      const badge5 = getPositionBadge(5);
      expect(badge5).toEqual({
        text: 'UEL',
        color: 'bg-blue-100 text-scotland-blue',
      });

      const badge6 = getPositionBadge(6);
      expect(badge6).toEqual({
        text: 'UEL',
        color: 'bg-blue-100 text-scotland-blue',
      });
    });

    it('should return Conference League badge for position 7', () => {
      const badge = getPositionBadge(7);
      expect(badge).toEqual({
        text: 'UECL',
        color: 'bg-orange-100 text-orange-800',
      });
    });

    it('should return relegation badge for positions 18-20', () => {
      const badge18 = getPositionBadge(18);
      expect(badge18).toEqual({
        text: 'DESC',
        color: 'bg-red-100 text-red-800',
      });

      const badge20 = getPositionBadge(20);
      expect(badge20).toEqual({
        text: 'DESC',
        color: 'bg-red-100 text-red-800',
      });
    });

    it('should return null for mid-table positions', () => {
      expect(getPositionBadge(8)).toBeNull();
      expect(getPositionBadge(10)).toBeNull();
      expect(getPositionBadge(15)).toBeNull();
      expect(getPositionBadge(17)).toBeNull();
    });

    it('should handle edge cases', () => {
      expect(getPositionBadge(0)).toEqual({
        text: 'UCL',
        color: 'bg-betis-verde-light text-betis-verde-dark',
      }); // Position 0 is <= 4, so Champions League
      expect(getPositionBadge(21)).toEqual({
        text: 'DESC',
        color: 'bg-red-100 text-red-800',
      }); // Position 21 is >= 18, so relegation
    });
  });

  describe('formatForm', () => {
    it('should split form string and return last 5 results', () => {
      expect(formatForm('WWLWDL')).toEqual(['W', 'L', 'W', 'D', 'L']);
      expect(formatForm('WWWWW')).toEqual(['W', 'W', 'W', 'W', 'W']);
      expect(formatForm('LLLLL')).toEqual(['L', 'L', 'L', 'L', 'L']);
    });

    it('should handle short form strings', () => {
      expect(formatForm('WWW')).toEqual(['W', 'W', 'W']);
      expect(formatForm('L')).toEqual(['L']);
      expect(formatForm('WD')).toEqual(['W', 'D']);
    });

    it('should handle long form strings by taking last 5', () => {
      expect(formatForm('WWWWWLLLLL')).toEqual(['L', 'L', 'L', 'L', 'L']); // Last 5 of 'WWWWWLLLLL'
      expect(formatForm('WWWWWWWWWW')).toEqual(['W', 'W', 'W', 'W', 'W']); // Last 5 of 'WWWWWWWWWW'
    });

    it('should handle empty or null form strings', () => {
      expect(formatForm('')).toEqual([]);
      expect(formatForm(null as any)).toEqual([]);
      expect(formatForm(undefined as any)).toEqual([]);
    });

    it('should handle form with mixed case', () => {
      expect(formatForm('WwLdL')).toEqual(['W', 'L', 'L']);
    });

    it('should handle exactly 5 results', () => {
      expect(formatForm('WDLWW')).toEqual(['W', 'D', 'L', 'W', 'W']);
    });

    it('should filter out commas from form data', () => {
      expect(formatForm('W,D,L,W,W')).toEqual(['W', 'D', 'L', 'W', 'W']);
      expect(formatForm('W,D,L')).toEqual(['W', 'D', 'L']);
      expect(formatForm('W,,D,L,W,W,L,D')).toEqual(['L', 'W', 'W', 'L', 'D']); // Last 5 after filtering commas
    });
  });

  describe('getFormResultStyle', () => {
    it('should return win style for W', () => {
      expect(getFormResultStyle('W')).toBe('bg-betis-verde text-white');
    });

    it('should return draw style for D', () => {
      expect(getFormResultStyle('D')).toBe('bg-betis-oro text-white');
    });

    it('should return loss style for L', () => {
      expect(getFormResultStyle('L')).toBe('bg-red-500 text-white');
    });

    it('should return default style for unknown results', () => {
      expect(getFormResultStyle('X')).toBe('bg-gray-300 text-gray-700');
      expect(getFormResultStyle('?')).toBe('bg-gray-300 text-gray-700');
      expect(getFormResultStyle('')).toBe('bg-gray-300 text-gray-700');
      expect(getFormResultStyle('123')).toBe('bg-gray-300 text-gray-700');
    });

    it('should handle lowercase results', () => {
      expect(getFormResultStyle('w')).toBe('bg-gray-300 text-gray-700');
      expect(getFormResultStyle('d')).toBe('bg-gray-300 text-gray-700');
      expect(getFormResultStyle('l')).toBe('bg-gray-300 text-gray-700');
    });

    it('should handle null/undefined inputs', () => {
      expect(getFormResultStyle(null as any)).toBe('bg-gray-300 text-gray-700');
      expect(getFormResultStyle(undefined as any)).toBe('bg-gray-300 text-gray-700');
    });
  });

  describe('Integration Tests', () => {
    it('should work together for a typical team position', () => {
      const position = 5; // Europa League position

      const style = getPositionStyle(position);
      const badge = getPositionBadge(position);
      const form = formatForm('WDLWW');

      expect(style).toBe('text-scotland-blue font-bold');
      expect(badge).toEqual({
        text: 'UEL',
        color: 'bg-blue-100 text-scotland-blue',
      });
      expect(form).toEqual(['W', 'D', 'L', 'W', 'W']);

      // Check form result styles
      expect(getFormResultStyle(form[0])).toBe('bg-betis-verde text-white'); // W
      expect(getFormResultStyle(form[1])).toBe('bg-betis-oro text-white'); // D
      expect(getFormResultStyle(form[2])).toBe('bg-red-500 text-white'); // L
    });

    it('should work for Champions League position', () => {
      const position = 1;

      expect(getPositionStyle(position)).toBe('text-betis-verde font-bold');
      expect(getPositionBadge(position)).toEqual({
        text: 'UCL',
        color: 'bg-betis-verde-light text-betis-verde-dark',
      });
    });

    it('should work for relegation position', () => {
      const position = 19;
      
      expect(getPositionStyle(position)).toBe('text-red-600 font-bold');
      expect(getPositionBadge(position)).toEqual({
        text: 'DESC',
        color: 'bg-red-100 text-red-800',
      });
    });

    it('should work for mid-table position', () => {
      const position = 12;
      
      expect(getPositionStyle(position)).toBe('text-gray-900');
      expect(getPositionBadge(position)).toBeNull();
    });
  });
});