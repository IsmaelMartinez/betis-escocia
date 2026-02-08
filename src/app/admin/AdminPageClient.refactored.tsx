"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { withAdminRole } from "@/lib/auth/withAdminRole";
import { exportRSVPs, exportContacts } from "@/lib/utils/csvExport";
import LoadingSpinner from "@/components/LoadingSpinner";
import MessageComponent from "@/components/MessageComponent";
import type { Match, ContactSubmission } from "@/lib/api/supabase";

// Hooks
import { useAdminStats } from "./hooks/useAdminStats";
import { useAdminMatches } from "./hooks/useAdminMatches";
import { useAdminContacts } from "./hooks/useAdminContacts";

// Views
import { DashboardView } from "./views/DashboardView";
import { MatchesView } from "./views/MatchesView";
import { ContactsView } from "./views/ContactsView";

type AdminView = "dashboard" | "matches" | "match-form" | "contacts";
type MatchFormMode = "list" | "create" | "edit";

interface AdminPageClientProps {
  readonly showPartidos: boolean;
}

function AdminPageClient({ showPartidos }: AdminPageClientProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // View state
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [matchFormMode, setMatchFormMode] = useState<MatchFormMode>("list");
  const [editingMatch, setEditingMatch] = useState<Match | undefined>();
  const [contactFilterStatus, setContactFilterStatus] = useState<
    ContactSubmission['status'][]
  >(["new", "in progress"]);

  // Custom hooks
  const statsHook = useAdminStats();
  const matchesHook = useAdminMatches();
  const contactsHook = useAdminContacts({
    filterStatus: contactFilterStatus,
    userId: user?.id,
    getToken,
  });

  // Auth check
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Initial data fetch (stats fetches automatically on mount)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      matchesHook.fetchMatches();
      contactsHook.fetchContacts();
    }
  }, [isLoaded, isSignedIn, matchesHook, contactsHook]);

  // Export handlers
  const handleExportRSVPs = async () => {
    try {
      await exportRSVPs();
    } catch (error) {
      console.error('Failed to export RSVPs:', error);
    }
  };

  const handleExportContacts = async () => {
    try {
      await exportContacts();
    } catch (error) {
      console.error('Failed to export contacts:', error);
    }
  };

  // Match handlers
  const handleCreateMatch = () => {
    setEditingMatch(undefined);
    setMatchFormMode("create");
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setMatchFormMode("edit");
  };

  const handleSaveMatch = async (matchData: Partial<Match>) => {
    if (matchFormMode === "create") {
      await matchesHook.handleCreateMatch(matchData as Omit<Match, 'id'>);
    } else if (matchFormMode === "edit" && editingMatch) {
      await matchesHook.handleUpdateMatch(editingMatch.id, matchData);
    }
    setMatchFormMode("list");
    setEditingMatch(undefined);
  };

  const handleCancelMatchForm = () => {
    setMatchFormMode("list");
    setEditingMatch(undefined);
  };

  const handleDeleteMatch = async (id: number) => {
    await matchesHook.handleDeleteMatch(id);
  };

  // Contact handlers
  const handleUpdateContactStatus = async (
    id: number,
    status: ContactSubmission['status']
  ) => {
    await contactsHook.handleUpdateContactStatus(id, status);
  };

  // Loading state
  if (!isLoaded || (isLoaded && !isSignedIn)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  const error = statsHook.error || matchesHook.error || contactsHook.error;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <MessageComponent type="error" message={error} />
      </div>
    );
  }

  // Initial loading state
  if (statsHook.loading && matchesHook.loading && contactsHook.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Welcome back, {user?.firstName || 'Admin'}!</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setCurrentView("dashboard");
              setMatchFormMode("list");
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              currentView === "dashboard"
                ? "border-betis-verde text-betis-verde"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Dashboard
          </button>

          {showPartidos && (
            <button
              onClick={() => {
                setCurrentView("matches");
                setMatchFormMode("list");
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === "matches"
                  ? "border-betis-verde text-betis-verde"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Partidos
            </button>
          )}

          <button
            onClick={() => {
              setCurrentView("contacts");
              setMatchFormMode("list");
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              currentView === "contacts"
                ? "border-betis-verde text-betis-verde"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Contactos
          </button>
        </nav>
      </div>

      {/* View Content */}
      {currentView === "dashboard" && (
        <DashboardView
          stats={statsHook.stats}
          loading={statsHook.loading}
          refreshing={statsHook.refreshing}
          onRefresh={statsHook.refresh}
          onExportRSVPs={handleExportRSVPs}
          onExportContacts={handleExportContacts}
          showPartidos={showPartidos}
        />
      )}

      {currentView === "matches" && showPartidos && (
        <MatchesView
          matches={matchesHook.matches}
          syncing={matchesHook.syncing}
          syncMessage={matchesHook.syncMessage}
          matchFormMode={matchFormMode}
          editingMatch={editingMatch}
          onSyncMatches={matchesHook.syncMatches}
          onCreateNew={handleCreateMatch}
          onEdit={handleEditMatch}
          onDelete={handleDeleteMatch}
          onSaveMatch={handleSaveMatch}
          onCancelForm={handleCancelMatchForm}
        />
      )}

      {currentView === "contacts" && (
        <ContactsView
          contacts={contactsHook.filteredContacts}
          filterStatus={contactFilterStatus}
          onFilterStatusChange={setContactFilterStatus}
          onUpdateStatus={handleUpdateContactStatus}
        />
      )}
    </div>
  );
}

export default withAdminRole(AdminPageClient);
