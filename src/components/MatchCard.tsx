'use client';

import { Calendar, MapPin, Clock, Trophy, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { MatchCardProps } from '@/types/match';
import type { Match as DatabaseMatch } from '@/lib/supabase';
import BetisLogo from '@/components/BetisLogo';

// Adapter function to convert database match to MatchCardProps
export function convertDatabaseMatchToCardProps(
  dbMatch: DatabaseMatch, 
  rsvpCount?: number,
  totalAttendees?: number,
  showRSVP: boolean = true
): MatchCardProps {
  const isUpcoming = new Date(dbMatch.date_time) > new Date();
  
  return {
    id: dbMatch.id,
    opponent: dbMatch.opponent,
    date: dbMatch.date_time,
    venue: dbMatch.venue,
    competition: dbMatch.competition,
    isHome: dbMatch.home_away === 'home',
    status: isUpcoming ? 'SCHEDULED' : 'FINISHED',
    result: isUpcoming ? undefined : 'FINALIZADO',
    // Add watch party info for upcoming matches (Polwarth Tavern)
    watchParty: isUpcoming ? {
      location: 'Polwarth Tavern',
      address: '15 Polwarth Pl, Edinburgh EH11 1NH',
      time: new Date(dbMatch.date_time).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } : undefined,
    // Add RSVP info if available
    rsvpInfo: (rsvpCount !== undefined && totalAttendees !== undefined) ? {
      rsvpCount,
      totalAttendees
    } : undefined,
    // Control RSVP button visibility
    showRSVP
  };
}

export default function MatchCard(props: Readonly<MatchCardProps>) {
  const { 
    id,
    opponent, 
    date, 
    venue, 
    competition, 
    isHome, 
    result, 
    status,
    matchday,
    opponentCrest,
    competitionEmblem,
    score,
    watchParty,
    rsvpInfo,
    showRSVP
  } = props;

  const isUpcoming = status === 'SCHEDULED' || status === 'TIMED' || new Date(date) > new Date();
  
  // Format date with Spanish locale
  const formatDate = (dateString: string): string => {
    const matchDate = new Date(dateString);
    return matchDate.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get competition badge color and style
  const getCompetitionColor = (comp: string): string => {
    const compLower = comp.toLowerCase();
    
    // La Liga
    if (compLower.includes('liga') || compLower.includes('primera')) {
      return 'bg-gradient-to-r from-red-600 to-red-700'; // La Liga red
    }
    
    // Champions League
    if (compLower.includes('champions')) {
      return 'bg-gradient-to-r from-blue-600 to-blue-800'; // Champions League blue
    }
    
    // Europa League
    if (compLower.includes('europa') && !compLower.includes('conference')) {
      return 'bg-gradient-to-r from-orange-500 to-orange-600'; // Europa League orange
    }
    
    // Conference League
    if (compLower.includes('conference')) {
      return 'bg-gradient-to-r from-green-600 to-green-700'; // Conference League green
    }
    
    // Copa del Rey
    if (compLower.includes('copa')) {
      return 'bg-gradient-to-r from-yellow-600 to-yellow-700'; // Copa del Rey gold
    }
    
    // Supercopa de España
    if (compLower.includes('supercopa')) {
      return 'bg-gradient-to-r from-purple-600 to-purple-700'; // Supercopa purple
    }
    
    // Default - Betis green gradient
    return 'bg-gradient-to-r from-green-600 to-betis-green';
  };

  // Get friendly competition name for display
  const getCompetitionDisplayName = (comp: string): string => {
    const compLower = comp.toLowerCase();
    
    if (compLower.includes('primera') || compLower === 'laliga santander' || compLower === 'la liga') {
      return 'LaLiga';
    }
    if (compLower.includes('champions')) {
      return 'Champions League';
    }
    if (compLower.includes('europa') && !compLower.includes('conference')) {
      return 'Europa League';
    }
    if (compLower.includes('conference')) {
      return 'Conference League';
    }
    if (compLower.includes('copa del rey')) {
      return 'Copa del Rey';
    }
    if (compLower.includes('supercopa')) {
      return 'Supercopa de España';
    }
    
    return comp; // Return original if no mapping found
  };

  // Get match status display
  const getStatusInfo = () => {
    switch (status) {
      case 'IN_PLAY':
        return { text: 'EN VIVO', color: 'bg-red-500 text-white animate-pulse' };
      case 'PAUSED':
        return { text: 'DESCANSO', color: 'bg-orange-500 text-white' };
      case 'FINISHED':
        return { text: 'FINALIZADO', color: 'bg-gray-500 text-white' };
      case 'POSTPONED':
        return { text: 'APLAZADO', color: 'bg-yellow-500 text-white' };
      case 'SUSPENDED':
        return { text: 'SUSPENDIDO', color: 'bg-red-600 text-white' };
      case 'CANCELLED':
        return { text: 'CANCELADO', color: 'bg-gray-600 text-white' };
      case 'AWARDED':
        return { text: 'OTORGADO', color: 'bg-purple-500 text-white' };
      case 'SCHEDULED':
      case 'TIMED':
      default:
        return { text: 'PRÓXIMO', color: 'bg-green-500 text-white' };
    }
  };

  const statusInfo = getStatusInfo();

  // Get formatted score or result - always show local team score first
  const getMatchResult = (): string => {
    if (score && score.home !== null && score.away !== null) {
      // Always show local team score first, visitor team score second
      return `${score.home} - ${score.away}`;
    }
    return result ?? 'VS';
  };

  // Determine team display information - always show local (home) team on left, visitor (away) on right
  const localTeam = isHome ? {
    name: 'Real Betis',
    crest: '/images/logo_no_texto.jpg',
    isBetis: true
  } : {
    name: opponent,
    crest: opponentCrest,
    isBetis: false
  };

  const visitorTeam = isHome ? {
    name: opponent,
    crest: opponentCrest,
    isBetis: false
  } : {
    name: 'Real Betis',
    crest: '/images/logo_no_texto.jpg',
    isBetis: true
  };

  // Helper function to render team crest
  const renderTeamCrest = (team: { name: string; crest?: string; isBetis: boolean }) => {
    if (team.isBetis) {
      return (
        <BetisLogo width={32} height={32} className="object-contain rounded" />
      );
    }
    
    if (team.crest) {
      return (
        <Image
          src={team.crest}
          alt={`${team.name} logo`}
          width={32}
          height={32}
          className="object-contain rounded"
          unoptimized
        />
      );
    }
    
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
        <Trophy className="h-4 w-4 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Competition header with emblem */}
        <div className={`${getCompetitionColor(competition)} text-white px-4 py-2 flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            {competitionEmblem && (
              <Image
                src={competitionEmblem}
                alt={`${competition} logo`}
                width={20}
                height={20}
                className="object-contain"
              />
            )}
            <p className="text-sm font-medium">{getCompetitionDisplayName(competition)}</p>
          </div>
          {matchday && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              J{matchday}
            </span>
          )}
        </div>

        <div className="p-4">
          {/* Match details */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-4 mb-2">
              {/* Local Team (always on left) */}
              <div className="text-right flex-1">
                <div className="flex items-center justify-end space-x-2 mb-1">
                  <p className={`font-bold text-lg ${localTeam.isBetis ? 'text-betis-green' : ''}`}>
                    {localTeam.name}
                  </p>
                  {renderTeamCrest(localTeam)}
                </div>
                <p className="text-sm text-gray-600">Local</p>
              </div>
              
              {/* Score/VS */}
              <div className="text-2xl font-bold text-gray-400 px-4">
                {getMatchResult()}
              </div>
              
              {/* Visitor Team (always on right) */}
              <div className="text-left flex-1">
                <div className="flex items-center justify-start space-x-2 mb-1">
                  {renderTeamCrest(visitorTeam)}
                  <p className={`font-bold text-lg ${visitorTeam.isBetis ? 'text-betis-green' : ''}`}>
                    {visitorTeam.name}
                  </p>
                </div>
                <p className="text-sm text-gray-600">Visitante</p>
              </div>
            </div>
          </div>

        {/* Date and venue */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(date)}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{venue}</span>
          </div>
        </div>

        {/* Match status */}
        <div className="mb-4 text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>

        {/* Watch party info for upcoming matches */}
        {isUpcoming && watchParty && (
          <div className="bg-scotland-blue/10 rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-scotland-blue mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              ¡Nos vemos aquí!
            </h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <p className="font-medium">{watchParty.location}</p>
              </div>
              <p className="text-gray-600 ml-4">{watchParty.address}</p>
              <p className="text-betis-green font-medium ml-4">
                📍 Llega a las {watchParty.time}
              </p>
            </div>
          </div>
        )}

        {/* RSVP section for upcoming matches */}
        {isUpcoming && showRSVP && (
          <div className="border-t border-gray-200 pt-4">
            {rsvpInfo && (
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-betis-green">{rsvpInfo.rsvpCount}</span> confirmaciones
                  {rsvpInfo.totalAttendees > 0 && (
                    <span className="ml-2">
                      • <span className="font-medium text-betis-green">{rsvpInfo.totalAttendees}</span> asistentes
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <Link 
              href={`/rsvp?match=${id}`}
              className="block w-full bg-betis-green hover:bg-green-700 text-white text-center py-2 px-4 rounded-md font-medium transition-colors text-sm"
            >
              📝 Confirmar Asistencia
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
