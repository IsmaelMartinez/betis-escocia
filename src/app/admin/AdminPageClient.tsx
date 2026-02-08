"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Users,
  Mail,
  RefreshCw,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { exportRSVPs, exportContacts } from "@/lib/utils/csvExport";
import type { Match, MatchInsert, MatchUpdate } from "@/lib/api/supabase";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import MessageComponent from "@/components/MessageComponent";
import { useRouter } from "next/navigation";
import { withAdminRole } from "@/lib/auth/withAdminRole";
import clsx from "clsx";

import { useAdminStats } from "./hooks/useAdminStats";
import { useAdminMatches } from "./hooks/useAdminMatches";
import { useAdminContacts } from "./hooks/useAdminContacts";

import DashboardView from "./views/DashboardView";
import MatchesView from "./views/MatchesView";
import MatchFormView from "./views/MatchFormView";
import ContactsView from "./views/ContactsView";

type AdminView = "dashboard" | "matches" | "match-form" | "contacts";

interface MatchFormData {
  mode: "create" | "edit";
  match?: Match;
}

interface AdminPageClientProps {
  readonly showPartidos: boolean;
}

function AdminPageClient({ showPartidos }: AdminPageClientProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [matchFormData, setMatchFormData] = useState<MatchFormData>({
    mode: "create",
  });

  // Hooks
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refreshing,
    refresh: refreshStats,
    fetchStats,
  } = useAdminStats(isSignedIn);

  const {
    matches,
    syncing,
    syncMessage,
    handleCreateMatch,
    handleUpdateMatch,
    handleDeleteMatch,
    syncMatches: handleSyncMatches,
    handleSyncMatchFromTable,
    fetchMatches,
  } = useAdminMatches();

  const {
    filteredContacts,
    contactFilterStatus,
    error: contactsError,
    handleUpdateContactStatus,
    handleContactFilterChange,
    fetchContacts,
  } = useAdminContacts({ userId: user?.id, getToken });

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch matches and contacts when signed in
  useEffect(() => {
    if (isSignedIn) {
      fetchMatches();
      fetchContacts();
    }
  }, [isSignedIn, fetchMatches, fetchContacts]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshStats(), fetchMatches(), fetchContacts()]);
  }, [refreshStats, fetchMatches, fetchContacts]);

  const handleMatchFormSubmit = useCallback(
    async (data: MatchInsert | MatchUpdate) => {
      if (matchFormData.mode === "create") {
        const result = await handleCreateMatch(data as MatchInsert);
        if (result.success) {
          setCurrentView("matches");
          await fetchStats();
        }
        return result;
      } else {
        if (!matchFormData.match) {
          return { success: false, error: "No match selected" };
        }
        const result = await handleUpdateMatch(
          matchFormData.match.id,
          data as MatchUpdate,
        );
        if (result.success) {
          setCurrentView("matches");
          await fetchStats();
        }
        return result;
      }
    },
    [matchFormData, handleCreateMatch, handleUpdateMatch, fetchStats],
  );

  const handleDeleteMatchWrapper = useCallback(
    async (matchId: number) => {
      const result = await handleDeleteMatch(matchId);
      if (result.success) {
        await fetchStats();
      }
      return result;
    },
    [handleDeleteMatch, fetchStats],
  );

  const handleDeleteMatchFromForm = useCallback(async () => {
    if (!matchFormData.match) {
      return { success: false, error: "No match selected" };
    }
    const result = await handleDeleteMatch(matchFormData.match.id);
    if (result.success) {
      setCurrentView("matches");
      await fetchStats();
    }
    return result;
  }, [matchFormData, handleDeleteMatch, fetchStats]);

  const handleEditMatch = useCallback((match: Match) => {
    setMatchFormData({ mode: "edit", match });
    setCurrentView("match-form");
  }, []);

  const handleSyncMatchFromTableWrapper = useCallback(
    async (matchId: number) => {
      const result = await handleSyncMatchFromTable(matchId);
      if (result.success) {
        await fetchStats();
      }
      return result;
    },
    [handleSyncMatchFromTable, fetchStats],
  );

  const handleExportRSVPs = () => exportRSVPs(user?.id);
  const handleExportContacts = () => exportContacts(user?.id);

  const error = statsError || contactsError;

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando autenticación..." />
      </div>
    );
  }

  // Show loading while fetching data
  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando panel de administración..." />
      </div>
    );
  }

  // Don't render anything if not signed in (redirect will handle this)
  if (!isSignedIn) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <MessageComponent type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-betis-black">
                Panel de Administración
              </h1>
              <p className="text-gray-600 mt-2">
                {currentView === "dashboard" &&
                  "Gestión de RSVPs, contactos y partidos de la Peña Bética"}
                {currentView === "matches" && "Gestión de partidos"}
                {currentView === "match-form" &&
                  (matchFormData.mode === "create"
                    ? "Crear nuevo partido"
                    : "Editar partido")}
                {currentView === "contacts" && "Gestión de contactos"}
              </p>
              {user && (
                <p className="text-sm text-betis-green mt-1">
                  Conectado como:{" "}
                  {user.emailAddresses[0]?.emailAddress ||
                    user.firstName ||
                    "Admin"}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {showPartidos && (
                <Button
                  onClick={handleSyncMatches}
                  variant="secondary"
                  leftIcon={
                    <RotateCcw
                      className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                    />
                  }
                  isLoading={syncing}
                >
                  Sincronizar Partidos
                </Button>
              )}
              <Button
                onClick={handleRefresh}
                variant="outline"
                leftIcon={
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                }
                isLoading={refreshing}
              >
                Actualizar
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={clsx(
                  "py-2 px-1 border-b-2 font-medium text-sm",
                  currentView === "dashboard"
                    ? "border-betis-green text-betis-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Dashboard
              </button>

              {showPartidos && (
                <button
                  onClick={() => setCurrentView("matches")}
                  className={clsx(
                    "py-2 px-1 border-b-2 font-medium text-sm",
                    currentView === "matches"
                      ? "border-betis-green text-betis-green"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  )}
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Partidos
                </button>
              )}

              <button
                onClick={() => setCurrentView("contacts")}
                className={clsx(
                  "py-2 px-1 border-b-2 font-medium text-sm",
                  currentView === "contacts"
                    ? "border-betis-green text-betis-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Contactos
              </button>
            </nav>
          </div>
        </div>

        {/* Sync Message */}
        {syncMessage && (
          <div className="mb-6">
            <MessageComponent
              type={syncMessage.includes("Error") ? "error" : "success"}
              message={syncMessage}
            />
          </div>
        )}

        {/* Content based on current view */}
        {currentView === "dashboard" && (
          <DashboardView
            stats={stats}
            showPartidos={showPartidos}
            onExportRSVPs={handleExportRSVPs}
            onExportContacts={handleExportContacts}
            onUpdateContactStatus={handleUpdateContactStatus}
            onViewContacts={() => setCurrentView("contacts")}
          />
        )}

        {currentView === "matches" && showPartidos && (
          <MatchesView
            matches={matches}
            onEdit={handleEditMatch}
            onDelete={handleDeleteMatchWrapper}
            onSync={handleSyncMatchFromTableWrapper}
            isLoading={statsLoading}
            onCreateNew={() => {
              setMatchFormData({ mode: "create" });
              setCurrentView("match-form");
            }}
          />
        )}

        {currentView === "match-form" && showPartidos && (
          <MatchFormView
            match={matchFormData.match}
            onSubmit={handleMatchFormSubmit}
            onCancel={() => setCurrentView("matches")}
            onDelete={
              matchFormData.mode === "edit"
                ? handleDeleteMatchFromForm
                : undefined
            }
            isLoading={statsLoading}
          />
        )}

        {currentView === "contacts" && (
          <ContactsView
            filteredContacts={filteredContacts}
            contactFilterStatus={contactFilterStatus}
            onFilterChange={handleContactFilterChange}
            onUpdateStatus={handleUpdateContactStatus}
            isLoading={statsLoading}
            error={contactsError}
          />
        )}
      </div>
    </div>
  );
}

export default withAdminRole(AdminPageClient);
