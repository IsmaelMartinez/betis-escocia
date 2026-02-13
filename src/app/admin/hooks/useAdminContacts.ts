import { useState, useCallback } from 'react';
import { supabase, type ContactSubmission, updateContactSubmissionStatus } from '@/lib/api/supabase';
import { log } from '@/lib/utils/logger';

interface UseAdminContactsOptions {
  userId?: string;
  getToken?: () => Promise<string | null>;
}

export function useAdminContacts({ userId, getToken }: UseAdminContactsOptions = {}) {
  const [allContactSubmissions, setAllContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [contactFilterStatus, setContactFilterStatus] = useState<
    ContactSubmission['status'][]
  >(['new', 'in progress']);

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
        setError('User not authenticated.');
        return;
      }

      setRefreshing(true);
      try {
        const clerkToken = await getToken();

        if (!clerkToken) {
          setError('Authentication token not available.');
          setRefreshing(false);
          return;
        }

        const result = await updateContactSubmissionStatus(
          id,
          status,
          userId,
          clerkToken
        );

        if (result.success) {
          // Update local state optimistically
          setAllContactSubmissions((prev) =>
            prev.map((contact) =>
              contact.id === id ? { ...contact, status } : contact
            )
          );
        } else {
          setError(result.error || 'Error al actualizar el estado del contacto');
        }
      } catch (err) {
        log.error('Failed to update contact status in admin panel', err, {
          contactId: id,
          newStatus: status,
          userId,
        });
        setError('Error al actualizar el estado del contacto');
      } finally {
        setRefreshing(false);
      }
    },
    [userId, getToken]
  );

  const handleContactFilterChange = useCallback((status: ContactSubmission['status']) => {
    setContactFilterStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const filteredContacts = allContactSubmissions.filter((contact) =>
    contactFilterStatus.includes(contact.status)
  );

  return {
    allContactSubmissions,
    filteredContacts,
    contactFilterStatus,
    loading,
    error,
    refreshing,
    fetchContacts,
    handleUpdateContactStatus,
    handleContactFilterChange,
  };
}
