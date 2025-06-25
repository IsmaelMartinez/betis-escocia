'use client';

import { useState, useMemo } from 'react';
import MatchCard from '@/components/MatchCard';
import CompetitionFilter, { Competition } from '@/components/CompetitionFilter';
import { NoUpcomingMatchesMessage, NoRecentMatchesMessage } from '@/components/ErrorMessage';
import { MatchCardErrorBoundary } from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Match } from '@/types/match';

interface FilteredMatchesProps {
  readonly upcomingMatches: Match[];
  readonly recentMatches: Match[];
  readonly conferenceMatches: Match[];
  readonly friendlyMatches: Match[];
}

// Helper function to transform Football-Data.org match to component props
function transformMatch(match: Match, isUpcoming: boolean = false) {
  // Add safety checks for required properties
  if (!match?.homeTeam?.id || !match?.awayTeam?.id || !match?.competition?.id) {
    console.error('Invalid match data:', match);
    return null;
  }

  const isBetisHome = match.homeTeam.id === 90; // Real Betis team ID
  const opponent = isBetisHome ? match.awayTeam.name : match.homeTeam.name;
  const opponentCrest = isBetisHome ? match.awayTeam.crest : match.homeTeam.crest;
  
  // Get venue information
  const getVenue = () => {
    if (isBetisHome) {
      return "Estadio Benito Villamarín";
    } else {
      // Known opponent stadiums
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

  return {
    id: match.id,
    opponent,
    date: match.utcDate,
    venue: getVenue(),
    competition: match.competition?.name || 'Unknown',
    competitionLogo: match.competition?.emblem || '',
    isHome: isBetisHome,
    status: match.status,
    score: match.status === 'FINISHED' && match.score?.fullTime ? {
      home: match.score.fullTime.home,
      away: match.score.fullTime.away
    } : undefined,
    isUpcoming,
    opponentCrest,
    competitionEmblem: match.competition?.emblem || '',
    matchday: match.matchday,
    watchParty: isUpcoming ? {
      location: "Polwarth Tavern",
      address: "15 Polwarth Pl, Edinburgh EH11 1NH",
      time: "30 minutos antes del partido"
    } : undefined
  };
}

export default function FilteredMatches({ upcomingMatches, recentMatches, conferenceMatches, friendlyMatches }: FilteredMatchesProps) {
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique competitions from all matches
  const competitions = useMemo(() => {
    const allMatches = [...upcomingMatches, ...recentMatches, ...conferenceMatches, ...friendlyMatches];
    const competitionMap = new Map<string, Competition>();

    allMatches.forEach(match => {
      // Add defensive check for competition.id
      const competitionId = match.competition?.id;
      if (competitionId && !competitionMap.has(competitionId.toString())) {
        competitionMap.set(competitionId.toString(), {
          id: competitionId.toString(),
          code: match.competition.code || '',
          name: match.competition.name,
          emblem: match.competition.emblem
        });
      }
    });

    return Array.from(competitionMap.values());
  }, [upcomingMatches, recentMatches, conferenceMatches, friendlyMatches]);

  // Filter matches by selected competition
  const filteredUpcoming = useMemo(() => {
    if (!selectedCompetition) return upcomingMatches;
    return upcomingMatches.filter(match => match.competition?.id?.toString() === selectedCompetition);
  }, [upcomingMatches, selectedCompetition]);

  const filteredRecent = useMemo(() => {
    if (!selectedCompetition) return recentMatches;
    return recentMatches.filter(match => match.competition?.id?.toString() === selectedCompetition);
  }, [recentMatches, selectedCompetition]);

  const filteredConference = useMemo(() => {
    if (!selectedCompetition) return conferenceMatches;
    return conferenceMatches.filter(match => match.competition.name === 'UEFA Conference League');
  }, [conferenceMatches, selectedCompetition]);

  const filteredFriendlies = useMemo(() => {
    if (!selectedCompetition) return friendlyMatches;
    return friendlyMatches.filter(match => match.competition.name === 'Friendly');
  }, [friendlyMatches, selectedCompetition]);

  // Calculate match counts per competition
  const matchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const allMatches = [...upcomingMatches, ...recentMatches, ...conferenceMatches, ...friendlyMatches];
    
    allMatches.forEach(match => {
      const compId = match.competition?.id?.toString();
      if (compId) {
        counts[compId] = (counts[compId] || 0) + 1;
      }
    });

    return counts;
  }, [upcomingMatches, recentMatches, conferenceMatches, friendlyMatches]);

  const handleCompetitionChange = (competitionId: string | null) => {
    setIsLoading(true);
    setSelectedCompetition(competitionId);
    // Simulate a brief loading state for better UX
    setTimeout(() => setIsLoading(false), 200);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Competition Filter */}
      {competitions.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Filtrar por competición
          </h3>
          <CompetitionFilter
            competitions={competitions}
            selectedCompetition={selectedCompetition}
            onCompetitionChange={handleCompetitionChange}
            matchCounts={matchCounts}
          />
        </div>
      )}

      {/* Upcoming Matches */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Próximos Partidos
          {selectedCompetition && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              - {competitions.find(c => c.id === selectedCompetition)?.name}
            </span>
          )}
        </h2>
        
        {filteredUpcoming.length === 0 ? (
          <NoUpcomingMatchesMessage />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUpcoming.slice(0, 2).map((match) => {
              const transformedMatch = transformMatch(match, true);
              if (!transformedMatch) return null;
              return (
                <MatchCardErrorBoundary key={match.id}>
                  <MatchCard {...transformedMatch} />
                </MatchCardErrorBoundary>
              );
            })}
          </div>
        )}
      </section>

      {/* Conference League Matches */}
      {filteredConference.length > 0 && (
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            UEFA Conference League
            {selectedCompetition && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                - {competitions.find(c => c.id === selectedCompetition)?.name}
              </span>
            )}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredConference.slice(0, 2).map((match) => {
              const transformedMatch = transformMatch(match, true);
              if (!transformedMatch) return null;
              return (
                <MatchCardErrorBoundary key={match.id}>
                  <MatchCard {...transformedMatch} />
                </MatchCardErrorBoundary>
              );
            })}
          </div>
        </section>
      )}

      {/* Friendlies */}
      {filteredFriendlies.length > 0 && (
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Amistosos
            {selectedCompetition && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                - {competitions.find(c => c.id === selectedCompetition)?.name}
              </span>
            )}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFriendlies.slice(0, 2).map((match) => {
              const transformedMatch = transformMatch(match, true);
              if (!transformedMatch) return null;
              return (
                <MatchCardErrorBoundary key={match.id}>
                  <MatchCard {...transformedMatch} />
                </MatchCardErrorBoundary>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Results */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Últimos Resultados
          {selectedCompetition && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              - {competitions.find(c => c.id === selectedCompetition)?.name}
            </span>
          )}
        </h2>
        
        {filteredRecent.length === 0 ? (
          <NoRecentMatchesMessage />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecent.slice(0, 2).map((match) => {
              const transformedMatch = transformMatch(match);
              if (!transformedMatch) return null;
              return (
                <MatchCardErrorBoundary key={match.id}>
                  <MatchCard {...transformedMatch} />
                </MatchCardErrorBoundary>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
