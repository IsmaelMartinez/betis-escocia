"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Match,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatches,
} from "@/lib/api/supabase";
import { RefreshCw, Calendar, Plus, RotateCcw } from "lucide-react";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import MessageComponent from "@/components/MessageComponent";
import dynamicImport from "next/dynamic";
import { useRouter } from "next/navigation";
import { withAdminRole } from "@/lib/auth/withAdminRole";
import { log } from "@/lib/utils/logger";

// Lazy load heavy admin components to reduce initial bundle size
const MatchForm = dynamicImport(() => import("@/components/admin/MatchForm"), {
  loading: () => <LoadingSpinner />,
});
const MatchesList = dynamicImport(
  () => import("@/components/admin/MatchesList"),
  {
    loading: () => <LoadingSpinner />,
  },
);

type AdminView = "dashboard" | "matches" | "match-form";

interface MatchFormData {
  mode: "create" | "edit";
  match?: Match;
}

interface AdminPageClientProps {
  readonly showPartidos: boolean;
}

function AdminPageClient({ showPartidos }: AdminPageClientProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [matchFormData, setMatchFormData] = useState<MatchFormData>({
    mode: "create",
  });

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const matchesData = await getMatches();
      setMatches(matchesData || []);
    } catch (err) {
      log.error("Failed to fetch matches", err, {
        userId: user?.id,
      });
      setError("Error al cargar los partidos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
  };

  const handleSyncMatches = async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/admin/sync-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setSyncMessage(result.message);
        await fetchMatches();
      } else {
        setSyncMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      log.error("Failed to sync matches from admin panel", error, {
        userId: user?.id,
      });
      setSyncMessage("Error al sincronizar partidos");
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncMatchFromTable = async (
    matchId: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/sync-match/${matchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        await fetchMatches();
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      log.error("Failed to sync individual match from admin table", error, {
        matchId,
        userId: user?.id,
      });
      return { success: false, error: "Error al sincronizar el partido" };
    }
  };

  // Match management functions
  const handleCreateMatch = async (data: Parameters<typeof createMatch>[0]) => {
    const result = await createMatch(data);
    if (result.success) {
      setCurrentView("matches");
      await fetchMatches();
    }
    return result;
  };

  const handleUpdateMatch = async (data: Parameters<typeof updateMatch>[1]) => {
    if (!matchFormData.match)
      return { success: false, error: "No match selected" };

    const result = await updateMatch(matchFormData.match.id, data);
    if (result.success) {
      setCurrentView("matches");
      await fetchMatches();
    }
    return result;
  };

  // Combined handler for match form that handles both create and update
  const handleMatchFormSubmit = async (
    data: Parameters<typeof createMatch>[0] | Parameters<typeof updateMatch>[1],
  ) => {
    if (matchFormData.mode === "create") {
      return handleCreateMatch(data as Parameters<typeof createMatch>[0]);
    } else {
      return handleUpdateMatch(data as Parameters<typeof updateMatch>[1]);
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    const result = await deleteMatch(matchId);
    if (result.success) {
      await fetchMatches();
    }
    return result;
  };

  const handleEditMatch = (match: Match) => {
    setMatchFormData({ mode: "edit", match });
    setCurrentView("match-form");
  };

  const handleDeleteMatchFromForm = async () => {
    if (!matchFormData.match)
      return { success: false, error: "No match selected" };

    const result = await deleteMatch(matchFormData.match.id);
    if (result.success) {
      setCurrentView("matches");
      await fetchMatches();
    }
    return result;
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchMatches();
    }
  }, [isSignedIn, fetchMatches]);

  // Auto-clear sync message after 5 seconds with proper cleanup
  useEffect(() => {
    if (syncMessage) {
      const timerId = setTimeout(() => {
        setSyncMessage(null);
      }, 5000);

      return () => clearTimeout(timerId);
    }
  }, [syncMessage]);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando autenticación..." />
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
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
                {currentView === "dashboard" && "Gestión de partidos"}
                {currentView === "matches" && "Gestión de partidos"}
                {currentView === "match-form" &&
                  (matchFormData.mode === "create"
                    ? "Crear nuevo partido"
                    : "Editar partido")}
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

        {/* Dashboard: stats + jump to matches */}
        {currentView === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {showPartidos && (
              <Card className="hover-lift">
                <CardBody className="text-center">
                  <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-betis-green" />
                  </div>
                  <div className="text-3xl font-black text-betis-black mb-2">
                    {matches.length}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Partidos Guardados
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setCurrentView("matches")}
                  >
                    Gestionar partidos
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Matches Management View */}
        {currentView === "matches" && showPartidos && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <Button
                onClick={() => {
                  setMatchFormData({ mode: "create" });
                  setCurrentView("match-form");
                }}
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Crear Nuevo Partido
              </Button>
            </div>

            <MatchesList
              matches={matches}
              onEdit={handleEditMatch}
              onDelete={handleDeleteMatch}
              onSync={handleSyncMatchFromTable}
              isLoading={loading}
            />
          </>
        )}

        {/* Match Form View */}
        {currentView === "match-form" && showPartidos && (
          <MatchForm
            match={matchFormData.match}
            onSubmit={handleMatchFormSubmit}
            onCancel={() => setCurrentView("matches")}
            onDelete={
              matchFormData.mode === "edit"
                ? handleDeleteMatchFromForm
                : undefined
            }
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default withAdminRole(AdminPageClient);
