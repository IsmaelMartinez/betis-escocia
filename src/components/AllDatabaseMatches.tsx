'use client';

import { useState, useEffect } from 'react';
import { getAllMatchesWithRSVPCounts, Match } from '@/lib/supabase';
import MatchCard, { convertDatabaseMatchToCardProps } from './MatchCard';

interface MatchWithRSVP extends Match {
  rsvp_count: number;
  total_attendees: number;
}

interface AllDatabaseMatchesProps {
  className?: string;
}

export default function AllDatabaseMatches({ className = '' }: AllDatabaseMatchesProps) {
  const [matches, setMatches] = useState<MatchWithRSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [competitionFilter, setCompetitionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [matchesPerPage] = useState(6);

  useEffect(() => {
    async function fetchAllMatches() {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getAllMatchesWithRSVPCounts(); // Get all matches with RSVP counts
        
        if (data) {
          setMatches(data as MatchWithRSVP[]);
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
    
    const passesTimeFilter = (() => {
      switch (filter) {
        case 'upcoming':
          return matchDate > now;
        case 'past':
          return matchDate <= now;
        default:
          return true;
      }
    })();

    const passesCompetitionFilter = competitionFilter === 'all' || match.competition === competitionFilter;

    return passesTimeFilter && passesCompetitionFilter;
  });

  // Calculate counts for filter buttons
  const allMatches = matches;
  const upcomingMatches = matches.filter(m => new Date(m.date_time) > new Date());
  const pastMatches = matches.filter(m => new Date(m.date_time) <= new Date());
  
  // Get available competitions from all matches
  const availableCompetitions = Array.from(new Set(matches.map(m => m.competition))).sort();
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, competitionFilter]);

  // Get the actual count based on what will be displayed (considering limits)
  const getDisplayCount = (filterType: 'all' | 'upcoming' | 'past'): number => {
    const targetMatches = filterType === 'all' ? allMatches : 
                         filterType === 'upcoming' ? upcomingMatches : pastMatches;
    
    // Apply competition filter
    const competitionFilteredMatches = competitionFilter === 'all' 
      ? targetMatches 
      : targetMatches.filter(m => m.competition === competitionFilter);
    
    // Group by competition and apply same logic as processedMatchesByCompetition
    const grouped = competitionFilteredMatches.reduce((acc, match) => {
      if (!acc[match.competition]) {
        acc[match.competition] = [];
      }
      acc[match.competition].push(match);
      return acc;
    }, {} as Record<string, MatchWithRSVP[]>);
    
    let totalCount = 0;
    Object.entries(grouped).forEach(([, competitionMatches]) => {
      const now = new Date();
      const compUpcoming = competitionMatches.filter(match => new Date(match.date_time) > now);
      const compPast = competitionMatches.filter(match => new Date(match.date_time) <= now);
      
      if (filterType === 'upcoming') {
        // For upcoming filter, only count if there are upcoming matches
        if (compUpcoming.length > 0) {
          totalCount += compUpcoming.length;
        }
      } else if (filterType === 'past') {
        totalCount += compPast.length;
      } else {
        // For 'all' filter
        totalCount += compUpcoming.length + compPast.length;
      }
    });
    
    return totalCount;
  };

  // Group matches by competition and apply proper sorting and limits
  const matchesByCompetition = filteredMatches.reduce((acc, match) => {
    if (!acc[match.competition]) {
      acc[match.competition] = [];
    }
    acc[match.competition].push(match);
    return acc;
  }, {} as Record<string, MatchWithRSVP[]>);

  // Sort and limit matches within each competition
  const processedMatchesByCompetition = Object.entries(matchesByCompetition).reduce((acc, [competition, competitionMatches]) => {
    const now = new Date();
    
    // Separate upcoming and past matches
    const upcomingMatches = competitionMatches.filter(match => new Date(match.date_time) > now);
    const pastMatches = competitionMatches.filter(match => new Date(match.date_time) <= now);
    
    // Sort upcoming matches (earliest first) and past matches (most recent first)
    const sortedUpcoming = upcomingMatches.sort((a, b) => 
      new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
    const sortedPast = pastMatches.sort((a, b) => 
      new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
    );
    
    let finalMatches: MatchWithRSVP[] = [];
    
    if (filter === 'upcoming') {
      // For upcoming matches, only show competitions that have upcoming matches
      if (sortedUpcoming.length > 0) {
        finalMatches = sortedUpcoming;
      }
    } else if (filter === 'past') {
      finalMatches = sortedPast;
    } else {
      // For 'all' filter, show all upcoming + all past matches
      finalMatches = [...sortedUpcoming, ...sortedPast];
    }
    
    // Only add to result if there are matches to show
    if (finalMatches.length > 0) {
      acc[competition] = finalMatches;
    }
    
    return acc;
  }, {} as Record<string, MatchWithRSVP[]>);

  // Apply pagination to processedMatchesByCompetition
  const allProcessedMatches = Object.values(processedMatchesByCompetition).flat();
  const totalMatches = allProcessedMatches.length;
  const totalPages = Math.ceil(totalMatches / matchesPerPage);
  const startIndex = (currentPage - 1) * matchesPerPage;
  const endIndex = startIndex + matchesPerPage;
  
  // Paginate matches while maintaining competition grouping
  const paginatedMatches = allProcessedMatches.slice(startIndex, endIndex);
  
  // Re-group paginated matches by competition
  const paginatedMatchesByCompetition = paginatedMatches.reduce((acc, match) => {
    if (!acc[match.competition]) {
      acc[match.competition] = [];
    }
    acc[match.competition].push(match);
    return acc;
  }, {} as Record<string, MatchWithRSVP[]>);

  // Pagination component
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-between mt-8 px-4">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, totalMatches)} de {totalMatches} partidos
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Previous page button */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Anterior
          </button>
          
          {/* Page numbers */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500">...</span>}
            </>
          )}
          
          {pageNumbers.map(pageNumber => (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                pageNumber === currentPage
                  ? 'bg-betis-green text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {totalPages}
              </button>
            </>
          )}
          
          {/* Next page button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Siguiente →
          </button>
        </div>
      </div>
    );
  };

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
            ({getDisplayCount(filter)} {filter === 'all' ? 'total' : filter === 'upcoming' ? 'próximos' : 'pasados'})
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
            Todos ({getDisplayCount('all')})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'upcoming' 
                ? 'bg-betis-green text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Próximos ({getDisplayCount('upcoming')})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'past' 
                ? 'bg-betis-green text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pasados ({getDisplayCount('past')})
          </button>
    </div>
  </div>

  {/* Competition Filter buttons */}
  <div className="flex space-x-2 my-4">
    <button
      onClick={() => setCompetitionFilter('all')}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        competitionFilter === 'all' 
          ? 'bg-betis-green text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      Todas
    </button>
    {availableCompetitions.map((competition) => (
      <button
        key={competition}
        onClick={() => setCompetitionFilter(competition)}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          competitionFilter === competition 
            ? 'bg-betis-green text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {competition}
      </button>
    ))}
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
    <>
      <div className="space-y-8">
        {Object.entries(paginatedMatchesByCompetition).map(([competition, competitionMatches]) => {
          return (
            <div key={competition} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🏆 {competition}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({competitionMatches.length} partidos en esta página)
                </span>
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {competitionMatches.map((match) => {
                  const cardProps = convertDatabaseMatchToCardProps(match, match.rsvp_count, match.total_attendees, true);
                  
                  return (
                    <MatchCard 
                      key={match.id}
                      {...cardProps}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pagination Component */}
      <PaginationComponent />
    </>
  )}
    </div>
  );
}
