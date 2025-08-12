import { describe, it, expect } from 'vitest';
import { ROLES } from '@/lib/roleUtils';

// Simple focused tests for role validation logic
describe('serverRoleUtils', () => {
  describe('role validation', () => {
    it('should accept valid admin role', () => {
      expect(Object.values(ROLES).includes(ROLES.ADMIN)).toBe(true);
    });

    it('should accept valid moderator role', () => {
      expect(Object.values(ROLES).includes(ROLES.MODERATOR)).toBe(true);
    });

    it('should accept valid user role', () => {
      expect(Object.values(ROLES).includes(ROLES.USER)).toBe(true);
    });

    it('should reject invalid role', () => {
      expect(Object.values(ROLES).includes('invalid_role' as any)).toBe(false);
    });

    it('should have exactly 3 valid roles', () => {
      expect(Object.values(ROLES)).toEqual(['admin', 'user', 'moderator']);
    });

    it('should have correct role constants', () => {
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.MODERATOR).toBe('moderator');
      expect(ROLES.USER).toBe('user');
    });

    it('should have all required role types', () => {
      const roleValues = Object.values(ROLES);
      expect(roleValues).toContain('admin');
      expect(roleValues).toContain('user');
      expect(roleValues).toContain('moderator');
      expect(roleValues).toHaveLength(3);
    });
  });
});