'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { EventDetails } from '@/components/rsvp/RSVPWidget';

export interface RSVPData {
  status: 'confirmed';
  attendees: number;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RSVPSubmissionData {
  name: string;
  email: string;
  attendees: number;
  message?: string;
  whatsappInterest: boolean;
  matchId?: number;
}

export interface UseRSVPDataProps {
  event: EventDetails;
  enabled?: boolean;
}

export interface UseRSVPDataReturn {
  // Current RSVP data
  currentRSVP: RSVPData | null;
  attendeeCount: number;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  isFetchingCount: boolean;
  
  // Error states
  error: string | null;
  submitError: string | null;
  
  // Actions
  submitRSVP: (data: RSVPSubmissionData) => Promise<{ success: boolean; message?: string }>;
  refreshData: () => Promise<void>;
  clearErrors: () => void;
  
  // Status flags
  hasExistingRSVP: boolean;
  canSubmit: boolean;
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useRSVPData({ event, enabled = true }: UseRSVPDataProps): UseRSVPDataReturn {
  const { user } = useUser();
  
  // State management
  const [currentRSVP, setCurrentRSVP] = useState<RSVPData | null>(null);
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCount, setIsFetchingCount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch current RSVP status for authenticated users
  const fetchCurrentRSVP = useCallback(async (): Promise<RSVPData | null> => {
    if (!user || !event.id) return null;

    try {
      const response = await fetch(`/api/rsvp/status?match=${event.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No existing RSVP
        }
        throw new Error('Error al obtener el estado de confirmación');
      }

      const data = await response.json();
      return {
        status: 'confirmed',
        attendees: data.attendees || 1,
        message: data.message || '',
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      };
    } catch (err) {
      console.error('Error fetching current RSVP:', err);
      return null;
    }
  }, [user, event.id]);

  // Fetch attendee count for the event
  const fetchAttendeeCount = useCallback(async (): Promise<number> => {
    const url = event.id 
      ? `/api/rsvp/attendees?match=${event.id}`
      : '/api/rsvp/attendees';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener el número de asistentes');
    }

    const data = await response.json();
    return data.count || 0;
  }, [event.id]);

  // Retry wrapper for API calls
  const withRetry = async <T>(
    operation: () => Promise<T>, 
    attempts = RETRY_ATTEMPTS
  ): Promise<T> => {
    let lastError: Error = new Error('Operation failed after maximum retry attempts');

    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (i < attempts - 1) {
          await delay(RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
        }
      }
    }

    throw lastError;
  };

  // Load initial data
  const loadData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const [rsvpData, count] = await Promise.allSettled([
        fetchCurrentRSVP(),
        fetchAttendeeCount(),
      ]);

      if (rsvpData.status === 'fulfilled') {
        setCurrentRSVP(rsvpData.value);
      }

      if (count.status === 'fulfilled') {
        setAttendeeCount(count.value);
      }

      // Set error if critical requests failed
      if (count.status === 'rejected') {
        setError('Error al cargar los datos de confirmación');
      } else if (rsvpData.status === 'rejected' && user) {
        // Only show RSVP error if user is authenticated and we tried to fetch it
        setError('Error al cargar el estado de confirmación');
      }
    } catch (err) {
      setError('Error al cargar los datos de confirmación');
      console.error('Error loading RSVP data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetchCurrentRSVP, fetchAttendeeCount, user]);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Submit RSVP
  const submitRSVP = useCallback(async (data: RSVPSubmissionData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await withRetry(async () => {
        const apiUrl = event.id ? `/api/rsvp?match=${event.id}` : '/api/rsvp';
        const submissionData = {
          ...data,
          matchId: event.id,
          ...(user ? { userId: user.id } : {}),
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al enviar la confirmación');
        }

        return await response.json();
      });

      // Update local state with new RSVP data
      setCurrentRSVP({
        status: 'confirmed',
        attendees: data.attendees,
        message: data.message,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Refresh attendee count
      setIsFetchingCount(true);
      try {
        const newCount = await fetchAttendeeCount();
        setAttendeeCount(newCount);
      } catch (err) {
        console.error('Error refreshing attendee count:', err);
      } finally {
        setIsFetchingCount(false);
      }

      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setSubmitError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [event.id, user, fetchAttendeeCount]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setError(null);
    setSubmitError(null);
  }, []);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed values
  const hasExistingRSVP = Boolean(currentRSVP);
  const canSubmit = !isSubmitting && enabled;

  return {
    // Data
    currentRSVP,
    attendeeCount,
    
    // Loading states
    isLoading,
    isSubmitting,
    isFetchingCount,
    
    // Error states
    error,
    submitError,
    
    // Actions
    submitRSVP,
    refreshData,
    clearErrors,
    
    // Status flags
    hasExistingRSVP,
    canSubmit,
  };
}