'use client';

import { useState, useEffect } from 'react';
import { getUpcomingMatchesWithRSVPCounts, Match } from '@/lib/supabase';
import MatchCard, { convertDatabaseMatchToCardProps } from './MatchCard';
import Link from 'next/link';

interface UpcomingMatchesProps {
  limit?: number;
  showTitle?: boolean;
  showViewAllLink?: boolean;
  className?: string;
}

interface MatchWithRSVP extends Match {
  rsvp_count: number;
  total_attendees: number;
}

export default function UpcomingMatches({ 
  limit = 3, 
  showTitle = true, 
  showViewAllLink = true,
  className = ''
}: UpcomingMatchesProps) {
  const [matches, setMatches] = useState<MatchWithRSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getUpcomingMatchesWithRSVPCounts(limit);
        
        if (data) {
          setMatches(data as MatchWithRSVP[]);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error('Error fetching upcoming matches:', err);
        setError('Error al cargar los próximos partidos');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, [limit]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Próximos Partidos</h2>
          </div>
        )}
        
        <div className="space-y-4">
          {Array.from({ length: limit }).map((_, index) => (
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
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
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
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Próximos Partidos</h2>
          </div>
        )}
        
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
  if (!matches || matches.length === 0) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Próximos Partidos</h2>
          </div>
        )}
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay partidos programados</h3>
          <p className="text-gray-600 mb-4">
            Actualmente no hay próximos partidos del Betis programados.
          </p>
          {showViewAllLink && (
            <Link
              href="/partidos"
              className="inline-flex items-center text-betis-green hover:text-green-700 font-medium"
            >
              Ver historial de partidos →
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Success state with matches
  return (
    <div className={`${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Próximos Partidos</h2>
          {showViewAllLink && matches.length > 0 && (
            <Link
              href="/partidos"
              className="text-betis-green hover:text-green-700 font-medium flex items-center"
            >
              Ver todos →
            </Link>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        {matches.map((match) => {
          const cardProps = convertDatabaseMatchToCardProps(
            match, 
            match.rsvp_count, 
            match.total_attendees
          );
          
          return (
            <MatchCard 
              key={match.id}
              {...cardProps}
            />
          );
        })}
      </div>
      
      {/* View all link at bottom for mobile */}
      {showViewAllLink && matches.length > 0 && (
        <div className="mt-6 text-center md:hidden">
          <Link
            href="/partidos"
            className="inline-flex items-center bg-betis-green hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ver todos los partidos
          </Link>
        </div>
      )}
    </div>
  );
}
