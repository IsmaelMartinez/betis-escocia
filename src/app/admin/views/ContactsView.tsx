"use client";

import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import dynamicImport from "next/dynamic";
import type { ContactSubmission } from "@/lib/api/supabase";

const ContactSubmissionsList = dynamicImport(
  () => import("@/components/admin/ContactSubmissionsList"),
  { loading: () => <LoadingSpinner /> },
);

interface ContactsViewProps {
  readonly filteredContacts: ContactSubmission[];
  readonly contactFilterStatus: ContactSubmission["status"][];
  readonly onFilterChange: (status: ContactSubmission["status"]) => void;
  readonly onUpdateStatus: (id: number, status: ContactSubmission["status"]) => Promise<void>;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export default function ContactsView({
  filteredContacts,
  contactFilterStatus,
  onFilterChange,
  onUpdateStatus,
  isLoading,
  error,
}: ContactsViewProps) {
  return (
    <>
      <div className="mb-6">
        <label
          htmlFor="contactFilter"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Filtrar por estado:
        </label>
        <div className="flex space-x-2">
          {(["new", "in progress", "resolved"] as const).map((status) => (
            <Button
              key={status}
              variant={
                contactFilterStatus.includes(status) ? "primary" : "outline"
              }
              onClick={() => onFilterChange(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      <ContactSubmissionsList
        submissions={filteredContacts}
        onUpdateStatus={onUpdateStatus}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
