'use client';

import { useState, useEffect } from 'react';
import { getMatches, Match } from '@/lib/supabase';
import MatchCard, { convertDatabaseMatchToCardProps } from './MatchCard';

interface AllDatabaseMatchesProps {
  className?: string;
}

export default function AllDatabaseMatches({ className = '' }: AllDatabaseMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    async function fetchAllMatches() {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getMatches(); // Get all matches without limit
        
        if (data) {
          // Sort by date (most recent first)
          const sortedMatches = data.sort((a, b) => 
            new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
          );
          setMatches(sortedMatches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error('Error fetching all matches:', err);
        setError('Error al cargar todos los partidos');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllMatches();
  }, []);

  // Filter matches based on current filter
  const filteredMatches = matches.filter(match => {
    const now = new Date();
    const matchDate = new Date(match.date_time);
    
    switch (filter) {
      case 'upcoming':
        return matchDate > now;
      case 'past':
        return matchDate <= now;
      default:
        return true;
    }
  });

  // Group matches by competition
  const matchesByCompetition = filteredMatches.reduce((acc, match) => {
    if (!acc[match.competition]) {
      acc[match.competition] = [];
    }
    acc[match.competition].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Todos los Partidos</h2>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="bg-gray-300 h-10"></div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4 ml-auto"></div>
                    <div className="h-8 bg-gray-300 rounded w-full"></div>
                  </div>
                  <div className="h-8 w-16 bg-gray-300 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Todos los Partidos</h2>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar partidos</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (matches.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Todos los Partidos</h2>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay partidos en la base de datos</h3>
          <p className="text-gray-600 mb-4">
            Aún no se han añadido partidos a la base de datos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Todos los Partidos 
          <span className="text-lg font-normal text-gray-600 ml-2">
            ({filteredMatches.length} {filter === 'all' ? 'total' : filter === 'upcoming' ? 'próximos' : 'pasados'})
          </span>
        </h2>
        
        {/* Filter buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-betis-green text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({matches.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'upcoming' 
                ? 'bg-betis-green text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Próximos ({matches.filter(m => new Date(m.date_time) > new Date()).length})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'past' 
                ? 'bg-betis-green text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pasados ({matches.filter(m => new Date(m.date_time) <= new Date()).length})
          </button>
        </div>
      </div>
      
      {filteredMatches.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay partidos {filter === 'upcoming' ? 'próximos' : 'pasados'}
          </h3>
          <p className="text-gray-600">
            {filter === 'upcoming' 
              ? 'No hay próximos partidos programados.' 
              : 'No hay partidos pasados registrados.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(matchesByCompetition).map(([competition, competitionMatches]) => (
            <div key={competition} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🏆 {competition}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({competitionMatches.length} partidos)
                </span>
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {competitionMatches.map((match) => {
                  const cardProps = convertDatabaseMatchToCardProps(match);
                  
                  return (
                    <MatchCard 
                      key={match.id}
                      {...cardProps}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
