'use client';

import { useState } from 'react';
import MatchCard from '@/components/MatchCard';
import { ApiErrorMessage, NoRecentMatchesMessage } from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MatchCardErrorBoundary } from '@/components/ErrorBoundary';
import type { Match } from '@/types/match';

interface PaginatedMatchesProps {
  readonly initialMatches: Match[];
  readonly matchType: 'recent' | 'upcoming';
}

// Helper function to transform Football-Data.org match to component props
function transformMatch(match: Match, isUpcoming: boolean = false) {
  const isBetisHome = match.homeTeam.id === 90; // Real Betis team ID
  const opponent = isBetisHome ? match.awayTeam.name : match.homeTeam.name;
  const opponentCrest = isBetisHome ? match.awayTeam.crest : match.homeTeam.crest;
  
  // Get venue information - use known stadiums for common opponents
  const getVenue = () => {
    if (isBetisHome) {
      return "Estadio Benito Villamarín";
    } else {
      // Known opponent stadiums (add more as needed)
      const stadiums: Record<string, string> = {
        'FC Barcelona': 'Camp Nou',
        'Real Madrid CF': 'Santiago Bernabéu',
        'Atlético Madrid': 'Riyadh Air Metropolitano',
        'Sevilla FC': 'Ramón Sánchez-Pizjuán',
        'Valencia CF': 'Mestalla',
        'Athletic Bilbao': 'San Mamés',
        'Real Sociedad': 'Reale Arena',
        'Villarreal CF': 'Estadio de la Cerámica',
        'CA Osasuna': 'El Sadar',
        'Celta Vigo': 'Abanca-Balaídos',
        'RCD Espanyol': 'RCDE Stadium',
        'Getafe CF': 'Coliseum',
        'Deportivo Alavés': 'Mendizorroza',
        'Girona FC': 'Montilivi',
        'UD Las Palmas': 'Estadio Gran Canaria',
        'Rayo Vallecano': 'Campo de Fútbol de Vallecas',
        'RCD Mallorca': 'Son Moix',
        'CD Leganés': 'Butarque',
        'Real Valladolid CF': 'José Zorrilla'
      };
      
      const opponentName = isBetisHome ? match.awayTeam.name : match.homeTeam.name;
      return stadiums[opponentName] || `Estadio de ${opponentName}`;
    }
  };
  
  // Format score for display (always show Betis score first)
  const getFormattedScore = () => {
    if (match.score?.fullTime?.home !== null && match.score?.fullTime?.away !== null) {
      if (isBetisHome) {
        return {
          home: match.score.fullTime.home,
          away: match.score.fullTime.away
        };
      } else {
        // When Betis is away, flip the scores so Betis appears first
        return {
          home: match.score.fullTime.away,
          away: match.score.fullTime.home
        };
      }
    }
    return undefined;
  };

  // Get formatted result string (always show Betis score first)
  const getResultString = () => {
    if (!isUpcoming && match.score?.fullTime?.home !== null && match.score?.fullTime?.away !== null) {
      if (isBetisHome) {
        return `${match.score.fullTime.home}-${match.score.fullTime.away}`;
      } else {
        // When Betis is away, flip the result so Betis score appears first
        return `${match.score.fullTime.away}-${match.score.fullTime.home}`;
      }
    }
    return undefined;
  };

  return {
    id: match.id,
    opponent,
    date: match.utcDate,
    venue: getVenue(),
    competition: match.competition.name,
    isHome: isBetisHome, // Keep this for internal logic
    status: match.status,
    matchday: match.matchday,
    opponentCrest,
    competitionEmblem: match.competition.emblem,
    score: getFormattedScore(),
    result: getResultString(),
    watchParty: isUpcoming ? {
      location: "Polwarth Tavern",
      address: "15 Polwarth Pl, Edinburgh EH11 1NH",
      time: "30 minutos antes del partido"
    } : undefined
  };
}

export default function PaginatedMatches({ 
  initialMatches, 
  matchType
}: PaginatedMatchesProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialMatches.length >= 10);

  const MATCHES_PER_PAGE = 10;

  const loadMoreMatches = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/matches?type=${matchType}&limit=${MATCHES_PER_PAGE}&offset=${currentPage * MATCHES_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar más partidos');
      }

      const data = await response.json();
      const newMatches = data.matches || [];

      if (newMatches.length === 0) {
        setHasMore(false);
      } else {
        setMatches(prev => [...prev, ...newMatches]);
        setCurrentPage(prev => prev + 1);
        
        // If we got fewer matches than requested, we've reached the end
        if (newMatches.length < MATCHES_PER_PAGE) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const retryLoadMore = () => {
    setError(null);
    loadMoreMatches();
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <NoRecentMatchesMessage />
      </div>
    );
  }

  const isUpcoming = matchType === 'upcoming';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match: Match) => {
          const transformedMatch = transformMatch(match, isUpcoming);
          return (
            <MatchCardErrorBoundary key={`${matchType}-boundary-${match.id}`}>
              <MatchCard
                key={`${matchType}-${match.id}`}
                {...transformedMatch}
              />
            </MatchCardErrorBoundary>
          );
        })}
      </div>

      {/* Load More Section */}
      {(hasMore || loading || error) && (
        <div className="text-center pt-8">
          {error && <ApiErrorMessage onRetry={retryLoadMore} />}
          
          {!error && loading && (
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner />
              <p className="text-gray-600">Cargando más partidos...</p>
            </div>
          )}
          
          {!error && !loading && hasMore && (
            <button
              onClick={loadMoreMatches}
              className="bg-betis-green hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Ver más partidos
            </button>
          )}
          
          {!error && !loading && !hasMore && (
            <p className="text-gray-500 text-sm">
              No hay más {matchType === 'recent' ? 'resultados' : 'partidos'} para mostrar
            </p>
          )}
        </div>
      )}
    </div>
  );
}
