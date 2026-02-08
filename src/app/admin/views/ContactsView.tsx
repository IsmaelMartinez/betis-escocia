import dynamicImport from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { ContactSubmission } from '@/lib/api/supabase';

const ContactSubmissionsList = dynamicImport(
  () => import('@/components/admin/ContactSubmissionsList'),
  { loading: () => <LoadingSpinner /> }
);

interface ContactsViewProps {
  contacts: ContactSubmission[];
  filterStatus: ContactSubmission['status'][];
  onFilterStatusChange: (status: ContactSubmission['status'][]) => void;
  onUpdateStatus: (id: number, status: ContactSubmission['status']) => Promise<void>;
}

export function ContactsView({
  contacts,
  filterStatus,
  onFilterStatusChange,
  onUpdateStatus,
}: ContactsViewProps) {
  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex gap-4 items-center">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex gap-2">
          {(['new', 'in progress', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                if (filterStatus.includes(status)) {
                  onFilterStatusChange(filterStatus.filter((s) => s !== status));
                } else {
                  onFilterStatusChange([...filterStatus, status]);
                }
              }}
              className={`px-3 py-1 text-sm rounded ${
                filterStatus.includes(status)
                  ? 'bg-betis-verde text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts List */}
      <ContactSubmissionsList
        submissions={contacts}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
