'use client';

import { Calendar, MapPin, Clock, Trophy, Users } from 'lucide-react';
import Image from 'next/image';
import type { MatchCardProps } from '@/types/match';

export default function MatchCard(props: Readonly<MatchCardProps>) {
  const { 
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
    watchParty 
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

  // Get competition badge color
  const getCompetitionColor = (comp: string): string => {
    if (comp.toLowerCase().includes('liga') || comp.includes('Primera')) {
      return 'bg-red-600'; // La Liga red
    }
    if (comp.toLowerCase().includes('champions')) {
      return 'bg-blue-600'; // Champions League blue
    }
    if (comp.toLowerCase().includes('copa')) {
      return 'bg-yellow-600'; // Copa del Rey gold
    }
    return 'bg-betis-green'; // Default Betis green
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

  // Get formatted score or result
  const getMatchResult = (): string => {
    if (score && score.home !== null && score.away !== null) {
      if (isHome) {
        return `${score.home} - ${score.away}`;
      } else {
        return `${score.away} - ${score.home}`;
      }
    }
    return result ?? 'VS';
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
          <p className="text-sm font-medium">{competition}</p>
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
            {/* Home Team (Betis) */}
            <div className="text-right flex-1">
              <div className="flex items-center justify-end space-x-2 mb-1">
                <p className="font-bold text-lg">Real Betis</p>
                <div className="w-8 h-8 bg-betis-green rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">RB</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{isHome ? 'Local' : 'Visitante'}</p>
            </div>
            
            {/* Score/VS */}
            <div className="text-2xl font-bold text-gray-400 px-4">
              {getMatchResult()}
            </div>
            
            {/* Away Team (Opponent) */}
            <div className="text-left flex-1">
              <div className="flex items-center justify-start space-x-2 mb-1">
                {opponentCrest ? (
                  <Image
                    src={opponentCrest}
                    alt={`${opponent} logo`}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <p className="font-bold text-lg">{opponent}</p>
              </div>
              <p className="text-sm text-gray-600">{!isHome ? 'Local' : 'Visitante'}</p>
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
          <div className="bg-scotland-blue/10 rounded-lg p-3">
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
      </div>
    </div>
  );
}
