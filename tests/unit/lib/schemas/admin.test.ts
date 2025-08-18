import { describe, it, expect } from 'vitest';
import { 
  userQuerySchema,
  userUpdateSchema,
  userDeleteSchema,
  userRoleSchema,
  matchSchema,
  notificationPreferencesSchema,
  type Role,
  type UserQueryParams,
  type UserUpdateData,
  type UserDeleteData,
  type UserRoleInput,
  type MatchInput,
  type NotificationPreferencesInput
} from '@/lib/schemas/admin';
import { ZodError } from 'zod';

describe('Admin Schema', () => {
  describe('userQuerySchema', () => {
    describe('Valid cases', () => {
      it('should parse with default values', () => {
        const result = userQuerySchema.parse({});
        expect(result).toEqual({
          limit: 50,
          offset: 0
        });
      });

      it('should parse custom limit and offset', () => {
        const result = userQuerySchema.parse({ limit: '25', offset: '100' });
        expect(result.limit).toBe(25);
        expect(result.offset).toBe(100);
      });

      it('should coerce string numbers to integers', () => {
        const result = userQuerySchema.parse({ limit: '75', offset: '50' });
        expect(typeof result.limit).toBe('number');
        expect(typeof result.offset).toBe('number');
        expect(result.limit).toBe(75);
        expect(result.offset).toBe(50);
      });

      it('should handle maximum limit', () => {
        const result = userQuerySchema.parse({ limit: '100' });
        expect(result.limit).toBe(100);
      });
    });

    describe('Invalid cases', () => {
      it('should reject limit above 100', () => {
        expect(() => userQuerySchema.parse({ limit: '101' })).toThrow(ZodError);
      });

      it('should reject negative limit', () => {
        expect(() => userQuerySchema.parse({ limit: '-1' })).toThrow(ZodError);
      });

      it('should reject zero limit', () => {
        expect(() => userQuerySchema.parse({ limit: '0' })).toThrow(ZodError);
      });

      it('should reject negative offset', () => {
        expect(() => userQuerySchema.parse({ offset: '-1' })).toThrow(ZodError);
      });

      it('should reject non-integer values', () => {
        expect(() => userQuerySchema.parse({ limit: '50.5' })).toThrow(ZodError);
        expect(() => userQuerySchema.parse({ offset: '25.7' })).toThrow(ZodError);
      });

      it('should reject non-numeric strings', () => {
        expect(() => userQuerySchema.parse({ limit: 'abc' })).toThrow(ZodError);
        expect(() => userQuerySchema.parse({ offset: 'xyz' })).toThrow(ZodError);
      });
    });
  });

  describe('userUpdateSchema', () => {
    const validUpdateData: UserUpdateData = {
      userId: 'user_123456',
      role: 'moderator',
      banned: false
    };

    describe('Valid cases', () => {
      it('should validate complete user update', () => {
        const result = userUpdateSchema.parse(validUpdateData);
        expect(result.userId).toBe('user_123456');
        expect(result.role).toBe('moderator');
        expect(result.banned).toBe(false);
      });

      it('should validate partial updates', () => {
        const roleOnlyUpdate = userUpdateSchema.parse({ userId: 'user_123', role: 'admin' });
        expect(roleOnlyUpdate.userId).toBe('user_123');
        expect(roleOnlyUpdate.role).toBe('admin');
        expect(roleOnlyUpdate.banned).toBeUndefined();

        const bannedOnlyUpdate = userUpdateSchema.parse({ userId: 'user_456', banned: true });
        expect(bannedOnlyUpdate.userId).toBe('user_456');
        expect(bannedOnlyUpdate.banned).toBe(true);
        expect(bannedOnlyUpdate.role).toBeUndefined();
      });

      it('should handle all valid roles', () => {
        const roles: Role[] = ['user', 'moderator', 'admin'];
        
        roles.forEach(role => {
          const data = { userId: 'user_123', role };
          const result = userUpdateSchema.parse(data);
          expect(result.role).toBe(role);
        });
      });

      it('should handle boolean banned values', () => {
        const bannedTrue = userUpdateSchema.parse({ userId: 'user_123', banned: true });
        expect(bannedTrue.banned).toBe(true);
        
        const bannedFalse = userUpdateSchema.parse({ userId: 'user_123', banned: false });
        expect(bannedFalse.banned).toBe(false);
      });
    });

    describe('Invalid cases', () => {
      it('should reject empty userId', () => {
        expect(() => userUpdateSchema.parse({ userId: '', role: 'user' })).toThrow(ZodError);
        
        try {
          userUpdateSchema.parse({ userId: '', role: 'user' });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('ID de usuario requerido');
        }
      });

      it('should reject missing userId', () => {
        expect(() => userUpdateSchema.parse({ role: 'user' })).toThrow(ZodError);
      });

      it('should reject invalid role', () => {
        expect(() => userUpdateSchema.parse({ userId: 'user_123', role: 'superadmin' as any })).toThrow(ZodError);
        
        try {
          userUpdateSchema.parse({ userId: 'user_123', role: 'superadmin' as any });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Rol debe ser user, moderator, o admin');
        }
      });

      it('should reject non-boolean banned values', () => {
        expect(() => userUpdateSchema.parse({ userId: 'user_123', banned: 'true' as any })).toThrow(ZodError);
        expect(() => userUpdateSchema.parse({ userId: 'user_123', banned: 1 as any })).toThrow(ZodError);
      });
    });
  });

  describe('userDeleteSchema', () => {
    describe('Valid cases', () => {
      it('should validate user deletion data', () => {
        const result = userDeleteSchema.parse({ userId: 'user_to_delete_123' });
        expect(result.userId).toBe('user_to_delete_123');
      });

      it('should accept various userId formats', () => {
        const userIds = ['user_123', 'usr-456', '789', 'uuid-f47ac10b-58cc'];
        
        userIds.forEach(userId => {
          const result = userDeleteSchema.parse({ userId });
          expect(result.userId).toBe(userId);
        });
      });
    });

    describe('Invalid cases', () => {
      it('should reject empty userId', () => {
        expect(() => userDeleteSchema.parse({ userId: '' })).toThrow(ZodError);
        
        try {
          userDeleteSchema.parse({ userId: '' });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('ID de usuario requerido');
        }
      });

      it('should reject missing userId', () => {
        expect(() => userDeleteSchema.parse({})).toThrow(ZodError);
      });
    });
  });

  describe('userRoleSchema (legacy)', () => {
    const validRoleData: UserRoleInput = {
      userId: 'user_456',
      role: 'admin'
    };

    describe('Valid cases', () => {
      it('should validate complete role assignment', () => {
        const result = userRoleSchema.parse(validRoleData);
        expect(result.userId).toBe('user_456');
        expect(result.role).toBe('admin');
      });

      it('should handle all valid roles', () => {
        const roles: Role[] = ['user', 'moderator', 'admin'];
        
        roles.forEach(role => {
          const data = { userId: 'user_123', role };
          const result = userRoleSchema.parse(data);
          expect(result.role).toBe(role);
        });
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid role', () => {
        expect(() => userRoleSchema.parse({ userId: 'user_123', role: 'guest' as any })).toThrow(ZodError);
        
        try {
          userRoleSchema.parse({ userId: 'user_123', role: 'guest' as any });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Rol debe ser user, moderator, o admin');
        }
      });

      it('should reject empty userId', () => {
        expect(() => userRoleSchema.parse({ userId: '', role: 'user' })).toThrow(ZodError);
        
        try {
          userRoleSchema.parse({ userId: '', role: 'user' });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('ID de usuario requerido');
        }
      });
    });
  });

  describe('matchSchema', () => {
    const validMatchData: MatchInput = {
      date_time: '2024-03-15T18:30:00Z',
      opponent: 'Valencia CF',
      competition: 'La Liga',
      home_away: 'home',
      notes: 'Partido importante para la clasificación europea',
      external_id: 12345,
      external_source: 'football-data.org',
      result: '2-1',
      home_score: 2,
      away_score: 1,
      status: 'FINISHED',
      matchday: 28
    };

    describe('Valid cases', () => {
      it('should validate complete match data', () => {
        const result = matchSchema.parse(validMatchData);
        expect(result.date_time).toBe('2024-03-15T18:30:00Z');
        expect(result.opponent).toBe('Valencia CF');
        expect(result.competition).toBe('La Liga');
        expect(result.home_away).toBe('home');
      });

      it('should validate minimal required match data', () => {
        const minimalData = {
          date_time: '2024-04-20T20:00:00Z',
          opponent: 'Sevilla FC',
          competition: 'La Liga',
          home_away: 'away' as const
        };
        
        const result = matchSchema.parse(minimalData);
        expect(result.opponent).toBe('Sevilla FC');
        expect(result.home_away).toBe('away');
        expect(result.notes).toBeUndefined();
      });

      it('should handle both home and away matches', () => {
        const homeMatch = { ...validMatchData, home_away: 'home' as const };
        const awayMatch = { ...validMatchData, home_away: 'away' as const };
        
        const homeResult = matchSchema.parse(homeMatch);
        const awayResult = matchSchema.parse(awayMatch);
        
        expect(homeResult.home_away).toBe('home');
        expect(awayResult.home_away).toBe('away');
      });

      it('should handle empty optional fields', () => {
        const dataWithEmptyOptionals = {
          ...validMatchData,
          notes: '',
          result: '',
          status: ''
        };
        
        const result = matchSchema.parse(dataWithEmptyOptionals);
        expect(result.notes).toBe('');
        expect(result.result).toBe('');
        expect(result.status).toBe('');
      });

      it('should trim string fields', () => {
        const dataWithSpaces = {
          ...validMatchData,
          opponent: '  Real Madrid  ',
          competition: '  Copa del Rey  ',
          notes: '  Partido especial  '
        };
        
        const result = matchSchema.parse(dataWithSpaces);
        expect(result.opponent).toBe('Real Madrid');
        expect(result.competition).toBe('Copa del Rey');
        expect(result.notes).toBe('Partido especial');
      });

      it('should handle various score scenarios', () => {
        const scenarios = [
          { home_score: 0, away_score: 0 }, // Draw 0-0
          { home_score: 3, away_score: 2 }, // High scoring
          { home_score: 1, away_score: 0 }  // Narrow win
        ];
        
        scenarios.forEach(scores => {
          const data = { ...validMatchData, ...scores };
          const result = matchSchema.parse(data);
          expect(result.home_score).toBe(scores.home_score);
          expect(result.away_score).toBe(scores.away_score);
        });
      });
    });

    describe('Invalid cases', () => {
      it('should reject invalid datetime format', () => {
        const invalidData = { ...validMatchData, date_time: '2024-03-15 18:30:00' };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          matchSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Fecha y hora deben tener formato ISO válido');
        }
      });

      it('should reject opponent name too short', () => {
        const invalidData = { ...validMatchData, opponent: 'A' };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          matchSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre del oponente debe tener al menos 2 caracteres');
        }
      });

      it('should reject opponent name too long', () => {
        const invalidData = { ...validMatchData, opponent: 'A'.repeat(101) };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          matchSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Nombre del oponente no puede exceder 100 caracteres');
        }
      });

      it('should reject invalid home_away value', () => {
        const invalidData = { ...validMatchData, home_away: 'neutral' as any };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          matchSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Debe ser home o away');
        }
      });

      it('should reject notes too long', () => {
        const invalidData = { ...validMatchData, notes: 'A'.repeat(501) };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
        
        try {
          matchSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('Notas no pueden exceder 500 caracteres');
        }
      });

      it('should reject negative scores', () => {
        const invalidData = { ...validMatchData, home_score: -1 };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject non-integer scores', () => {
        const invalidData = { ...validMatchData, away_score: 2.5 };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject negative external_id', () => {
        const invalidData = { ...validMatchData, external_id: -1 };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject non-integer external_id', () => {
        const invalidData = { ...validMatchData, external_id: 123.45 };
        expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('should reject zero or negative matchday', () => {
        const invalidMatchdays = [0, -1, -5];
        
        invalidMatchdays.forEach(matchday => {
          const invalidData = { ...validMatchData, matchday };
          expect(() => matchSchema.parse(invalidData)).toThrow(ZodError);
        });
      });
    });
  });

  describe('notificationPreferencesSchema', () => {
    describe('Valid cases', () => {
      it('should validate enabled notifications', () => {
        const result = notificationPreferencesSchema.parse({ enabled: true });
        expect(result.enabled).toBe(true);
      });

      it('should validate disabled notifications', () => {
        const result = notificationPreferencesSchema.parse({ enabled: false });
        expect(result.enabled).toBe(false);
      });
    });

    describe('Invalid cases', () => {
      it('should reject non-boolean values', () => {
        expect(() => notificationPreferencesSchema.parse({ enabled: 'true' })).toThrow(ZodError);
        expect(() => notificationPreferencesSchema.parse({ enabled: 1 })).toThrow(ZodError);
        expect(() => notificationPreferencesSchema.parse({ enabled: 'yes' })).toThrow(ZodError);
      });

      it('should reject missing enabled field', () => {
        expect(() => notificationPreferencesSchema.parse({})).toThrow(ZodError);
      });
    });
  });

  describe('Type inference', () => {
    it('should infer correct TypeScript types', () => {
      const queryParams: UserQueryParams = { limit: 25, offset: 50 };
      const updateData: UserUpdateData = { userId: 'user_123', role: 'admin' };
      const deleteData: UserDeleteData = { userId: 'user_456' };
      const roleData: UserRoleInput = { userId: 'user_789', role: 'moderator' };
      const matchData: MatchInput = {
        date_time: '2024-01-01T00:00:00Z',
        opponent: 'Test Team',
        competition: 'Test League',
        home_away: 'home'
      };
      const notificationData: NotificationPreferencesInput = { enabled: true };

      // These should not throw TypeScript errors
      expect(queryParams.limit).toBe(25);
      expect(updateData.role).toBe('admin');
      expect(deleteData.userId).toBe('user_456');
      expect(roleData.role).toBe('moderator');
      expect(matchData.home_away).toBe('home');
      expect(notificationData.enabled).toBe(true);
    });

    it('should properly type Role enum', () => {
      const roles: Role[] = ['user', 'moderator', 'admin'];
      expect(roles).toHaveLength(3);
      expect(roles.includes('user')).toBe(true);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical user management flow', () => {
      // Query users with pagination
      const query = userQuerySchema.parse({ limit: '20', offset: '40' });
      expect(query.limit).toBe(20);
      
      // Update user role
      const update = userUpdateSchema.parse({
        userId: 'user_abc123',
        role: 'moderator',
        banned: false
      });
      expect(update.role).toBe('moderator');
      
      // Delete user
      const deletion = userDeleteSchema.parse({ userId: 'user_xyz789' });
      expect(deletion.userId).toBe('user_xyz789');
    });

    it('should handle match creation from external API', () => {
      const externalMatchData = {
        date_time: '2024-05-15T20:00:00Z',
        opponent: 'Athletic Bilbao',
        competition: 'La Liga',
        home_away: 'home' as const,
        external_id: 54321,
        external_source: 'football-data.org',
        matchday: 35
      };

      const result = matchSchema.parse(externalMatchData);
      expect(result.external_id).toBe(54321);
      expect(result.matchday).toBe(35);
    });

    it('should handle notification preference updates', () => {
      // Enable notifications
      const enableNotifications = notificationPreferencesSchema.parse({ enabled: true });
      expect(enableNotifications.enabled).toBe(true);
      
      // Disable notifications
      const disableNotifications = notificationPreferencesSchema.parse({ enabled: false });
      expect(disableNotifications.enabled).toBe(false);
    });
  });
});