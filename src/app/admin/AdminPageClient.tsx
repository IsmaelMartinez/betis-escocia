"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  supabase,
  RSVP,
  ContactSubmission,
  Match,
  BetisNews,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatches,
  updateContactSubmissionStatus,
} from "@/lib/supabase";

// Extended type to include player data from joined query
interface NewsPlayer {
  player_id: number;
  role: string;
  players: {
    id: number;
    name: string;
    normalized_name: string;
  } | null;
}

interface BetisNewsWithPlayers extends BetisNews {
  news_players?: NewsPlayer[];
}
import {
  Users,
  Mail,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  Plus,
  RotateCcw,
  Newspaper,
} from "lucide-react";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import MessageComponent from "@/components/MessageComponent";
import dynamicImport from "next/dynamic";
import { useRouter } from "next/navigation";
import { withAdminRole } from "@/lib/withAdminRole";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DATE_FORMAT } from "@/lib/constants/dateFormats";
import { log } from "@/lib/logger";
import clsx from "clsx";

// Lazy load heavy admin components to reduce initial bundle size
const OneSignalNotificationPanel = dynamicImport(
  () => import("@/components/admin/OneSignalNotificationPanel"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
);
const MatchForm = dynamicImport(() => import("@/components/admin/MatchForm"), {
  loading: () => <LoadingSpinner />,
});
const MatchesList = dynamicImport(
  () => import("@/components/admin/MatchesList"),
  {
    loading: () => <LoadingSpinner />,
  },
);
const ContactSubmissionsList = dynamicImport(
  () => import("@/components/admin/ContactSubmissionsList"),
  {
    loading: () => <LoadingSpinner />,
  },
);
const SoylentiNewsList = dynamicImport(
  () => import("@/components/admin/SoylentiNewsList"),
  {
    loading: () => <LoadingSpinner />,
  },
);

interface AdminStats {
  totalRSVPs: number;
  totalAttendees: number;
  totalContacts: number;
  totalMatches: number;
  recentRSVPs: RSVP[];
  recentContacts: ContactSubmission[];
}

type AdminView =
  | "dashboard"
  | "matches"
  | "match-form"
  | "contacts"
  | "soylenti";

interface MatchFormData {
  mode: "create" | "edit";
  match?: Match;
}

interface AdminPageClientProps {
  readonly showPartidos: boolean;
  readonly showSoylenti: boolean;
}

function AdminPageClient({ showPartidos, showSoylenti }: AdminPageClientProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [matchFormData, setMatchFormData] = useState<MatchFormData>({
    mode: "create",
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [contactFilterStatus, setContactFilterStatus] = useState<
    ContactSubmission["status"][]
  >(["new", "in progress"]);
  const [allContactSubmissions, setAllContactSubmissions] = useState<
    ContactSubmission[]
  >([]);
  const [betisNews, setBetisNews] = useState<BetisNewsWithPlayers[]>([]);
  const [soylentiError, setSoylentiError] = useState<string | null>(null);
  const [showHiddenNews, setShowHiddenNews] = useState(true);

  const handleUpdateContactStatus = async (
    id: number,
    status: ContactSubmission["status"],
  ) => {
    if (!user?.id) {
      setError("User not authenticated.");
      return;
    }
    setRefreshing(true);
    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        setError("Authentication token not available.");
        setRefreshing(false);
        return;
      }
      const result = await updateContactSubmissionStatus(
        id,
        status,
        user.id,
        clerkToken,
      );
      if (result.success) {
        await fetchStats(); // Refresh data
      } else {
        setError(result.error || "Error al actualizar el estado del contacto");
      }
    } catch (err) {
      log.error("Failed to update contact status in admin panel", err, {
        contactId: id,
        newStatus: status,
        userId: user?.id,
      });
      setError("Error al actualizar el estado del contacto");
    } finally {
      setRefreshing(false);
    }
  };

  const handleContactFilterChange = (status: ContactSubmission["status"]) => {
    setContactFilterStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  // Fetch Soylenti news for admin panel (with player data)
  const fetchSoylentiNews = useCallback(async () => {
    try {
      setSoylentiError(null);
      const { data, error: fetchError } = await supabase
        .from("betis_news")
        .select(
          `
          *,
          news_players (
            player_id,
            role,
            players (
              id,
              name,
              normalized_name
            )
          )
        `,
        )
        .order("pub_date", { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setBetisNews((data as BetisNewsWithPlayers[]) || []);
    } catch (err) {
      log.error("Failed to fetch Soylenti news in admin panel", err, {
        userId: user?.id,
      });
      setSoylentiError("Error al cargar las noticias de Soylenti");
    }
  }, [user?.id]);

  // Handle news reassessment
  const handleReassessNews = async (
    newsId: number,
    adminContext: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/admin/soylenti/reassess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newsId, adminContext }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the news list after successful reassessment
        await fetchSoylentiNews();
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Error al re-analizar",
        };
      }
    } catch (err) {
      log.error("Failed to reassess news in admin panel", err, {
        newsId,
        userId: user?.id,
      });
      return { success: false, error: "Error al re-analizar la noticia" };
    }
  };

  // Handle news hide/unhide
  const handleHideNews = async (
    newsId: number,
    hide: boolean,
    reason?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/admin/soylenti/hide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newsId, hide, reason }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the news list after successful hide/unhide
        await fetchSoylentiNews();
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Error al cambiar visibilidad",
        };
      }
    } catch (err) {
      log.error("Failed to hide/unhide news in admin panel", err, {
        newsId,
        hide,
        userId: user?.id,
      });
      return { success: false, error: "Error al cambiar visibilidad" };
    }
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);

      // Fetch all data in parallel for better performance
      const [rsvpResult, allContactResult, matchesData] = await Promise.all([
        supabase
          .from("rsvps")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false }),
        getMatches(),
      ]);

      const { data: rsvpData, error: rsvpError } = rsvpResult;
      if (rsvpError) throw rsvpError;

      const { data: allContactData, error: allContactError } = allContactResult;
      if (allContactError) throw allContactError;
      setAllContactSubmissions(allContactData || []);

      // Fetch recent contact data for dashboard
      const recentContactData = (allContactData || [])
        .filter((c) => c.status === "new")
        .slice(0, 5);

      setMatches(matchesData || []);

      // Calculate stats
      const totalRSVPs = rsvpData?.length || 0;
      const totalAttendees =
        rsvpData?.reduce((sum, rsvp) => sum + rsvp.attendees, 0) || 0;
      const totalContacts = allContactData?.length || 0;
      const totalMatches = matchesData?.length || 0;
      const recentRSVPs = rsvpData?.slice(0, 5) || [];
      const recentContacts = recentContactData || [];

      setStats({
        totalRSVPs,
        totalAttendees,
        totalContacts,
        totalMatches,
        recentRSVPs,
        recentContacts,
      });
    } catch (err) {
      log.error("Failed to fetch admin stats", err, {
        userId: user?.id,
      });
      setError("Error al cargar las estadísticas del panel de administración");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
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
        await fetchStats(); // Refresh data after sync
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
        await fetchStats(); // Refresh data after sync
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
      await fetchStats(); // Refresh data
    }
    return result;
  };

  const handleUpdateMatch = async (data: Parameters<typeof updateMatch>[1]) => {
    if (!matchFormData.match)
      return { success: false, error: "No match selected" };

    const result = await updateMatch(matchFormData.match.id, data);
    if (result.success) {
      setCurrentView("matches");
      await fetchStats(); // Refresh data
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
      await fetchStats(); // Refresh data
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
      await fetchStats(); // Refresh data
    }
    return result;
  };

  // Helper function to download CSV files and prevent memory leaks
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Prevent memory leak
  };

  const exportRSVPs = async () => {
    try {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const csvContent = [
        "Name,Email,Attendees,Match Date,Message,WhatsApp Interest,Created At",
        ...(data || []).map(
          (rsvp) =>
            `"${rsvp.name}","${rsvp.email}",${rsvp.attendees},"${rsvp.match_date}","${rsvp.message || ""}",${rsvp.whatsapp_interest},"${rsvp.created_at}"`,
        ),
      ].join("\n");

      downloadCSV(csvContent, `rsvps-${format(new Date(), "yyyy-MM-dd")}.csv`);
    } catch (err) {
      log.error("Failed to export RSVPs from admin panel", err, {
        userId: user?.id,
      });
    }
  };

  const exportContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const csvContent = [
        "Name,Email,Phone,Type,Subject,Message,Status,Created At",
        ...(data || []).map(
          (contact) =>
            `"${contact.name}","${contact.email}","${contact.phone || ""}","${contact.type}","${contact.subject}","${contact.message}","${contact.status}","${contact.created_at}"`,
        ),
      ].join("\n");

      downloadCSV(
        csvContent,
        `contacts-${format(new Date(), "yyyy-MM-dd")}.csv`,
      );
    } catch (err) {
      log.error("Failed to export contacts from admin panel", err, {
        userId: user?.id,
      });
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchStats();
    }
  }, [isSignedIn, fetchStats]);

  // Auto-clear sync message after 5 seconds with proper cleanup
  useEffect(() => {
    if (syncMessage) {
      const timerId = setTimeout(() => {
        setSyncMessage(null);
      }, 5000);

      return () => clearTimeout(timerId);
    }
  }, [syncMessage]);

  // Fetch Soylenti news when switching to soylenti view
  useEffect(() => {
    if (currentView === "soylenti" && isSignedIn) {
      fetchSoylentiNews();
    }
  }, [currentView, isSignedIn, fetchSoylentiNews]);

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
                {currentView === "dashboard" &&
                  "Gestión de RSVPs, contactos y partidos de la Peña Bética"}
                {currentView === "matches" && "Gestión de partidos"}
                {currentView === "match-form" &&
                  (matchFormData.mode === "create"
                    ? "Crear nuevo partido"
                    : "Editar partido")}
                {currentView === "contacts" && "Gestión de contactos"}
                {currentView === "soylenti" &&
                  "Gestión de noticias y rumores de Soylenti"}
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

              {showSoylenti && (
                <button
                  onClick={() => setCurrentView("soylenti")}
                  className={clsx(
                    "py-2 px-1 border-b-2 font-medium text-sm",
                    currentView === "soylenti"
                      ? "border-betis-green text-betis-green"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  )}
                >
                  <Newspaper className="h-4 w-4 inline mr-2" />
                  Soylenti
                </button>
              )}
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
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="hover-lift">
                <CardBody className="text-center">
                  <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-betis-green" />
                  </div>
                  <div className="text-3xl font-black text-betis-black mb-2">
                    {stats?.totalRSVPs}
                  </div>
                  <div className="text-sm text-gray-600">RSVPs Totales</div>
                </CardBody>
              </Card>

              <Card className="hover-lift">
                <CardBody className="text-center">
                  <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-betis-green" />
                  </div>
                  <div className="text-3xl font-black text-betis-black mb-2">
                    {stats?.totalAttendees}
                  </div>
                  <div className="text-sm text-gray-600">
                    Asistentes Confirmados
                  </div>
                </CardBody>
              </Card>

              <Card className="hover-lift">
                <CardBody className="text-center">
                  <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-betis-green" />
                  </div>
                  <div className="text-3xl font-black text-betis-black mb-2">
                    {stats?.totalContacts}
                  </div>
                  <div className="text-sm text-gray-600">
                    Mensajes de Contacto
                  </div>
                </CardBody>
              </Card>

              {showPartidos && (
                <Card className="hover-lift">
                  <CardBody className="text-center">
                    <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                      <Calendar className="h-6 w-6 text-betis-green" />
                    </div>
                    <div className="text-3xl font-black text-betis-black mb-2">
                      {stats?.totalMatches}
                    </div>
                    <div className="text-sm text-gray-600">
                      Partidos Guardados
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Export Actions */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-betis-black">
                    Exportar Datos
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={exportRSVPs}
                      variant="primary"
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      Exportar RSVPs (CSV)
                    </Button>
                    <Button
                      onClick={exportContacts}
                      variant="secondary"
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      Exportar Contactos (CSV)
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* OneSignal Push Notifications Panel */}
            <div className="mb-8">
              <OneSignalNotificationPanel />
            </div>

            {/* Recent Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent RSVPs */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-betis-black">
                    RSVPs Recientes
                  </h2>
                </CardHeader>
                <CardBody>
                  {stats?.recentRSVPs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay RSVPs recientes
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {stats?.recentRSVPs.map((rsvp) => (
                        <div
                          key={rsvp.id}
                          className="border-l-4 border-betis-green bg-gray-50 p-4 rounded-r-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-betis-black">
                              {rsvp.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(rsvp.created_at), DATE_FORMAT, {
                                locale: es,
                              })}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {rsvp.email}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Asistentes:</span>{" "}
                            {rsvp.attendees} |
                            <span className="font-medium"> Partido:</span>{" "}
                            {format(new Date(rsvp.match_date), DATE_FORMAT, {
                              locale: es,
                            })}
                          </div>
                          {rsvp.message && (
                            <div className="text-sm text-gray-600 mt-2 italic">
                              &ldquo;{rsvp.message}&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Recent Contacts */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-betis-black">
                      Contactos Recientes
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentView("contacts")}
                    >
                      Ver Todos
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  {stats?.recentContacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay contactos recientes
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {stats?.recentContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="border-l-4 border-betis-green bg-gray-50 p-4 rounded-r-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-betis-black">
                              {contact.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(
                                new Date(contact.created_at),
                                DATE_FORMAT,
                                { locale: es },
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {contact.email}
                          </div>
                          <div className="text-sm mb-2">
                            <select
                              value={contact.status}
                              onChange={(e) =>
                                handleUpdateContactStatus(
                                  contact.id,
                                  e.target.value as ContactSubmission["status"],
                                )
                              }
                              className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium mr-2 focus:outline-none focus:ring-2 focus:ring-betis-green"
                            >
                              <option value="new">New</option>
                              <option value="in progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                              {contact.type}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            {contact.subject}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {contact.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </>
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

        {/* Contacts Management View */}
        {currentView === "contacts" && (
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
                      contactFilterStatus.includes(status)
                        ? "primary"
                        : "outline"
                    }
                    onClick={() => handleContactFilterChange(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <ContactSubmissionsList
              submissions={allContactSubmissions.filter((sub) =>
                contactFilterStatus.includes(sub.status),
              )}
              onUpdateStatus={handleUpdateContactStatus}
              isLoading={loading}
              error={error}
            />
          </>
        )}

        {/* Soylenti News Management View */}
        {currentView === "soylenti" && showSoylenti && (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-gray-600">
                Re-analiza noticias con IA proporcionando contexto adicional
                (jugador incorrecto, equipo incorrecto, etc.)
              </p>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHiddenNews}
                  onChange={(e) => setShowHiddenNews(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-betis-verde/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-betis-verde"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  Mostrar ocultos
                </span>
              </label>
            </div>
            <SoylentiNewsList
              news={betisNews}
              onReassess={handleReassessNews}
              onHide={handleHideNews}
              isLoading={loading}
              error={soylentiError}
              showHidden={showHiddenNews}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default withAdminRole(AdminPageClient);
