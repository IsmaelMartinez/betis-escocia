// Community-related type definitions for the Peña Bética Escocesa platform

// API Response types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
