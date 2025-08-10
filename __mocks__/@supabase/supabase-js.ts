// __mocks__/@supabase/supabase-js.ts
import { vi } from 'vitest';

const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
}));

const mockSupabaseClient = {
  from: mockFrom,
};

export const createClient = vi.fn(() => mockSupabaseClient);

// Export the mock client directly for named imports like 'supabase'
export const supabase = mockSupabaseClient;

// Mock the getAuthenticatedSupabaseClient as well if it's used
export const getAuthenticatedSupabaseClient = vi.fn(() => mockSupabaseClient);
