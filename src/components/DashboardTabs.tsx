"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@clerk/nextjs";
import DashboardDisplay from "@/components/DashboardDisplay";
import GDPRTabContent from "@/components/user/GDPRTabContent";
import { User, PieChart } from "lucide-react";
import { useAuthSafe as useAuth } from "@/hooks/useClerkSafe";
import { RSVP, ContactSubmission } from "@/lib/supabase";

interface Counts {
  rsvpCount: number;
  contactCount: number;
  totalSubmissions: number;
}

interface DashboardTabsProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
    createdAt: number | null; // Clerk's createdAt is a number (timestamp)
    lastSignInAt: number | null; // Clerk's lastSignInAt is a number (timestamp)
  };
  rsvps: RSVP[] | null;
  contactSubmissions: ContactSubmission[] | null;
  counts: Counts;
  userName: string;
}

export default function DashboardTabs({
  user,
  rsvps,
  contactSubmissions,
  counts,
  userName,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "profile" | "gdpr">(
    "dashboard",
  );
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [totalScoreLoading, setTotalScoreLoading] = useState(true);
  const [totalScoreError, setTotalScoreError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchTotalScore = useCallback(async () => {
    setTotalScoreLoading(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/trivia?action=total", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json();
      const totalScore = apiResponse.success ? apiResponse.data.totalScore : 0;
      setTotalScore(totalScore);
      setTotalScoreError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch total trivia score:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setTotalScoreError(`Error loading trivia score: ${errorMessage}`);
    } finally {
      setTotalScoreLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTotalScore();
  }, [fetchTotalScore]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-betis-green text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                {/* User icon is part of the header, not directly tied to UserProfile component */}
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard Personal</h1>
                <p className="text-xl opacity-90">Bienvenido, {userName}</p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Puntuación Total Trivia
                    </p>
                    {totalScoreLoading ? (
                      <div className="text-2xl font-bold text-betis-green">
                        Cargando...
                      </div>
                    ) : totalScoreError ? (
                      <div className="text-sm text-red-500">Error</div>
                    ) : (
                      <p className="text-3xl font-bold text-betis-green">
                        {totalScore !== null ? totalScore : "N/A"}
                      </p>
                    )}
                  </div>
                  <PieChart className="h-12 w-12 text-betis-green opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 pt-4">
            <button
              className={`py-2 px-4 text-sm font-medium rounded-t-lg ${activeTab === "dashboard" ? "border-b-2 border-betis-green text-betis-green" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Mi Dashboard
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium rounded-t-lg ${activeTab === "profile" ? "border-b-2 border-betis-green text-betis-green" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("profile")}
            >
              Mi Perfil
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium rounded-t-lg ${activeTab === "gdpr" ? "border-b-2 border-betis-green text-betis-green" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("gdpr")}
            >
              Tus Datos GDPR
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <DashboardDisplay
            user={user}
            rsvps={rsvps}
            contactSubmissions={contactSubmissions}
            counts={counts}
          />
        )}
        {activeTab === "profile" && (
          <div className="flex justify-center py-8">
            <UserProfile />
          </div>
        )}
        {activeTab === "gdpr" && (
          <div className="flex justify-center py-8">
            <GDPRTabContent userEmail={user.emailAddresses[0].emailAddress} />
          </div>
        )}
      </div>
    </div>
  );
}
