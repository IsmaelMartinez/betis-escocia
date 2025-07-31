
// __mocks__/@supabase/supabase-js.ts
import { jest } from '@jest/globals';

const mockFrom = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
}));

const mockSupabaseClient = {
  from: mockFrom,
};

export const createClient = jest.fn(() => mockSupabaseClient);

// Export the mock client directly for named imports like 'supabase'
export const supabase = mockSupabaseClient;

// Mock the getAuthenticatedSupabaseClient as well if it's used
export const getAuthenticatedSupabaseClient = jest.fn(() => mockSupabaseClient);
