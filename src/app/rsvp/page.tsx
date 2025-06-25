'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, CheckCircle } from 'lucide-react';
import RSVPForm from '@/components/RSVPForm';

interface RSVPData {
  currentMatch: {
    opponent: string;
    date: string;
    competition: string;
  };
  totalAttendees: number;
  confirmedCount: number;
}

export default function RSVPPage() {
  const [showForm, setShowForm] = useState(false);
  const [rsvpData, setRSVPData] = useState<RSVPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRSVPData();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPSuccess = () => {
    setShowForm(false);
    fetchRSVPData(); // Refresh data after successful submission
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
      <section className="bg-gradient-to-br from-betis-green to-green-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-black mb-4">
                ¿Vienes al Polwarth?
              </h1>
              <p className="text-xl opacity-90">
                Confirma tu asistencia para el próximo partido
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Match Info */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-betis-green to-green-600 rounded-3xl p-8 text-white text-center mb-8">
            <h2 className="text-2xl font-bold mb-6">Próximo Partido</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Teams */}
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-betis-green font-bold text-lg">RB</span>
                  </div>
                  <p className="font-bold">Real Betis</p>
                </div>
                <div className="text-2xl font-bold">VS</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-purple-600 font-bold text-lg">RM</span>
                  </div>
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
                ✋ ¡Confirmar Asistencia!
              </button>
            ) : (
              <div className="max-w-2xl mx-auto">
                <RSVPForm onSuccess={handleRSVPSuccess} />
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
                <p>🍺 Bar completo y comida disponible</p>
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
