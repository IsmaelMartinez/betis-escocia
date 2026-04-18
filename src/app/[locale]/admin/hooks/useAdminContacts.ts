import { useState, useCallback } from 'react';
import { supabase, type ContactSubmission, updateContactSubmissionStatus } from '@/lib/api/supabase';
import { log } from '@/lib/utils/logger';

interface UseAdminContactsOptions {
  filterStatus?: ContactSubmission['status'][];
  userId?: string;
  getToken?: () => Promise<string | null>;
}

export function useAdminContacts({ filterStatus, userId, getToken }: UseAdminContactsOptions = {}) {
  const [allContactSubmissions, setAllContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setError(null);
      const { data, error: contactError } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;

      setAllContactSubmissions(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contacts';
      setError(errorMessage);
      log.error('Failed to fetch contacts:', { error: err });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateContactStatus = useCallback(
    async (id: number, status: ContactSubmission['status']) => {
      if (!userId || !getToken) {
        setError('User authentication required');
        return { success: false, error: 'User authentication required' };
      }

      try {
        setError(null);
        const clerkToken = await getToken();

        if (!clerkToken) {
          throw new Error('Authentication token not available');
        }

        const { data, error: updateError } = await updateContactSubmissionStatus(
          id,
          status,
          userId,
          clerkToken
        );

        if (updateError) {
          throw updateError;
        }

        // Update local state
        setAllContactSubmissions((prev) =>
          prev.map((contact) =>
            contact.id === id ? { ...contact, status } : contact
          )
        );

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update contact status';
        setError(errorMessage);
        log.error('Failed to update contact status:', { error: err });
        return { success: false, error: errorMessage };
      }
    },
    [userId, getToken]
  );

  // Filter contacts based on status
  const filteredContacts = filterStatus
    ? allContactSubmissions.filter((contact) =>
        filterStatus.includes(contact.status)
      )
    : allContactSubmissions;

  return {
    allContactSubmissions,
    filteredContacts,
    loading,
    error,
    fetchContacts,
    handleUpdateContactStatus,
  };
}
