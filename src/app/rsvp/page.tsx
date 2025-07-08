'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import RSVPForm from '@/components/RSVPForm';
import { withFeatureFlag } from '@/lib/featureProtection';
import { getUpcomingMatchesWithRSVPCounts, Match } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RSVPData {
  currentMatch: {
    id?: number;
    opponent: string;
    date: string;
    competition: string;
  };
  totalAttendees: number;
  confirmedCount: number;
}

interface MatchWithRSVP extends Match {
  rsvp_count: number;
  total_attendees: number;
}

function RSVPPage() {
  const [showForm, setShowForm] = useState(true); // Show form by default
  const [rsvpData, setRSVPData] = useState<RSVPData | null>(null);
  const [availableMatches, setAvailableMatches] = useState<MatchWithRSVP[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const matchId = searchParams.get('match');
    if (matchId) {
      setSelectedMatchId(parseInt(matchId));
    }
    fetchAvailableMatches();
  }, [searchParams]);

  useEffect(() => {
    if (selectedMatchId) {
      fetchRSVPDataForMatch(selectedMatchId);
    } else {
      fetchRSVPData();
    }
  }, [selectedMatchId]);

  const fetchAvailableMatches = async () => {
    try {
      const matches = await getUpcomingMatchesWithRSVPCounts(2); // Only next 2 matches
      if (matches) {
        setAvailableMatches(matches as MatchWithRSVP[]);
      }
    } catch (error) {
      console.error('Error fetching available matches:', error);
    }
  };

  const fetchRSVPData = async () => {
    try {
      const response = await fetch('/api/rsvp');
      if (response.ok) {
        const data = await response.json();
        setRSVPData({
          currentMatch: data.currentMatch,
          totalAttendees: data.totalAttendees,
          confirmedCount: data.confirmedCount
        });
      }
    } catch (error) {
      console.error('Error fetching RSVP data:', error);
    }
  };

  const fetchRSVPDataForMatch = async (matchId: number) => {
    try {
      const response = await fetch(`/api/rsvp?match=${matchId}`);
      if (response.ok) {
        const data = await response.json();
        setRSVPData({
          currentMatch: data.currentMatch,
          totalAttendees: data.totalAttendees,
          confirmedCount: data.confirmedCount
        });
      }
    } catch (error) {
      console.error('Error fetching RSVP data for match:', error);
    }
  };

  const handleRSVPSuccess = () => {
    setShowForm(false);
    if (selectedMatchId) {
      fetchRSVPDataForMatch(selectedMatchId);
    } else {
      fetchRSVPData();
    }
    fetchAvailableMatches(); // Refresh match data
  };

  const handleMatchSelect = (matchId: number) => {
    setSelectedMatchId(matchId);
    setShowMatchSelector(false);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('match', matchId.toString());
    window.history.pushState({}, '', newUrl.toString());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Default data while loading
  const nextMatch = rsvpData?.currentMatch ?? {
    opponent: "Real Madrid",
    date: "2025-06-28T20:00:00",
    competition: "LaLiga"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-betis-green text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Vienes al Polwarth?
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-6">
            Confirma tu asistencia para el próximo partido
          </p>
        </div>
      </div>

      {/* Next Match Info */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-600 rounded-3xl p-8 text-white text-center mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Próximo Partido</h2>
              {availableMatches.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowMatchSelector(!showMatchSelector)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <span className="text-sm font-medium">Cambiar partido</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showMatchSelector ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showMatchSelector && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-64 z-10">
                      {availableMatches.map((match) => (
                        <button
                          key={match.id}
                          onClick={() => handleMatchSelect(match.id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                        >
                          <div className="text-gray-900 font-medium">{match.opponent}</div>
                          <div className="text-gray-500 text-sm">
                            {new Date(match.date_time).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} • {match.competition}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Teams */}
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="font-bold">Real Betis</p>
                </div>
                <div className="text-2xl font-bold">VS</div>
                <div className="text-center">
                  <p className="font-bold">{nextMatch.opponent}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold text-lg">{formatDate(nextMatch.date)}</p>
                <p className="text-sm opacity-90">{nextMatch.competition}</p>
              </div>

              {/* Location */}
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold">Polwarth Tavern</p>
                <p className="text-sm opacity-90">15 Polwarth Pl, Edinburgh</p>
                <p className="text-sm opacity-90">Llegada: 19:30</p>
              </div>
            </div>
          </div>

          {/* RSVP Status */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-green-100 text-betis-green px-6 py-3 rounded-full font-bold text-lg mb-4">
              <Users className="h-5 w-5 mr-2" />
              {rsvpData?.totalAttendees ?? 0} béticos confirmados
            </div>
            
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-betis-green hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ✋ ¡Confirmar Asistencia! ({rsvpData?.totalAttendees ?? 0})
              </button>
            ) : (
              <div className="max-w-2xl mx-auto">
                <RSVPForm onSuccess={handleRSVPSuccess} selectedMatchId={selectedMatchId || undefined} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why RSVP */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              ¿Por qué confirmar tu asistencia?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-betis-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Reservamos Mesa</h3>
              <p className="text-gray-600">
                Con tu confirmación, podemos reservar una mesa grande para que todos 
                estemos juntos viendo el partido.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-betis-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Llegada Puntual</h3>
              <p className="text-gray-600">
                Sabemos cuántos venís y podemos avisar si hay que llegar antes 
                para conseguir sitio en partidos importantes.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-betis-green rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Ambiente Bético</h3>
              <p className="text-gray-600">
                Cuantos más seamos, mejor ambiente. Tu presencia hace que la 
                experiencia sea más especial para todos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-betis-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">¿Dudas sobre el partido?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Polwarth Tavern</h3>
              <div className="space-y-2 text-lg">
                <p>📍 15 Polwarth Pl, Edinburgh EH11 1NH</p>
                <p>🕕 Llegada recomendada: 30 min antes</p>
                <p>🍺 Bar completo con ambiente bético</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Organización</h3>
              <div className="space-y-2 text-lg">
                <p>👑 Fran - Organizador principal</p>
                <p>📱 WhatsApp: Pregunta por el grupo</p>
                <p>📧 Contacto a través del formulario</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Wrapper component to handle Suspense boundary
function RSVPPageWithSuspense() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RSVPPage />
    </Suspense>
  );
}

export default withFeatureFlag(RSVPPageWithSuspense, 'showRSVP');
