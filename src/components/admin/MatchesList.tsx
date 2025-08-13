'use client';

import { useState, useMemo } from 'react';
import { Match } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DATE_FORMAT, TIME_FORMAT } from '@/lib/constants/dateFormats';

// Note: This component should be wrapped with FeatureWrapper for 'showAdmin' flag
// when used in admin pages to ensure proper access control

interface MatchesListProps {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (matchId: number) => Promise<{ success: boolean; error?: string }>;
  onSync?: (externalId: number) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

type SortField = 'date_time' | 'opponent' | 'competition' | 'home_away';
type SortDirection = 'asc' | 'desc';

export default function MatchesList({ 
  matches, 
  onEdit, 
  onDelete, 
  onSync,
  isLoading = false 
}: MatchesListProps) {
  const [sortField, setSortField] = useState<SortField>('date_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterText, setFilterText] = useState('');
  const [competitionFilter, setCompetitionFilter] = useState('');
  const [homeAwayFilter, setHomeAwayFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());

  const itemsPerPage = 10;

  // Get unique competitions for filter dropdown
  const competitions = useMemo(() => {
    const unique = [...new Set(matches.map(match => match.competition))];
    return unique.sort();
  }, [matches]);

  // Filter and sort matches
  const filteredAndSortedMatches = useMemo(() => {
    const filtered = matches.filter(match => {
      const matchesText = filterText === '' || 
        match.opponent.toLowerCase().includes(filterText.toLowerCase()) ||
        match.notes?.toLowerCase().includes(filterText.toLowerCase());
      
      const matchesCompetition = competitionFilter === '' || match.competition === competitionFilter;
      const matchesHomeAway = homeAwayFilter === '' || match.home_away === homeAwayFilter;
      
      return matchesText && matchesCompetition && matchesHomeAway;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      if (sortField === 'date_time') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        aValue = (aValue as string).toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [matches, filterText, competitionFilter, homeAwayFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMatches.length / itemsPerPage);
  const paginatedMatches = filteredAndSortedMatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle delete
  const handleDelete = async (match: Match) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el partido contra ${match.opponent}?`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(match.id));
    
    try {
      const result = await onDelete(match.id);
      
      if (!result.success) {
        alert(`Error al eliminar: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Error al eliminar el partido');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(match.id);
        return newSet;
      });
    }
  };

  // Handle sync
  const handleSync = async (match: Match) => {
    if (!onSync || !match.external_id) return;
    
    if (!confirm(`¿Estás seguro de que quieres sincronizar el partido contra ${match.opponent}?`)) {
      return;
    }

    setSyncingIds(prev => new Set(prev).add(match.id));
    
    try {
      const result = await onSync(match.external_id);
      
      if (!result.success) {
        alert(`Error al sincronizar: ${result.error}`);
      }
    } catch (error) {
      console.error('Error syncing match:', error);
      alert('Error al sincronizar el partido');
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(match.id);
        return newSet;
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, DATE_FORMAT, { locale: es }),
      time: format(date, TIME_FORMAT, { locale: es })
    };
  };

  // Sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">↕️</span>;
    return <span>{sortDirection === 'asc' ? '↗️' : '↙️'}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Gestión de Partidos</h2>
        <p className="text-gray-600 mt-1">Total: {filteredAndSortedMatches.length} partidos</p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Oponente, notas..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-betis-green focus:border-betis-green"
            />
          </div>

          {/* Competition filter */}
          <div>
            <label htmlFor="competition" className="block text-sm font-medium text-gray-700 mb-1">
              Competición
            </label>
            <select
              id="competition"
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-betis-green focus:border-betis-green"
            >
              <option value="">Todas</option>
              {competitions.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Home/Away filter */}
          <div>
            <label htmlFor="homeaway" className="block text-sm font-medium text-gray-700 mb-1">
              Local/Visitante
            </label>
            <select
              id="homeaway"
              value={homeAwayFilter}
              onChange={(e) => setHomeAwayFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-betis-green focus:border-betis-green"
            >
              <option value="">Todos</option>
              <option value="home">Local</option>
              <option value="away">Visitante</option>
            </select>
          </div>

          {/* Clear filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterText('');
                setCompetitionFilter('');
                setHomeAwayFilter('');
                setCurrentPage(1);
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date_time')}
              >
                Fecha y Hora <SortIcon field="date_time" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('opponent')}
              >
                Oponente <SortIcon field="opponent" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('competition')}
              >
                Competición <SortIcon field="competition" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('home_away')}
              >
                L/V <SortIcon field="home_away" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedMatches.map((match) => {
              const { date, time } = formatDate(match.date_time);
              const isDeleting = deletingIds.has(match.id);
              const isSyncing = syncingIds.has(match.id);
              
              return (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{date}</div>
                    <div className="text-sm text-gray-500">{time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{match.opponent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {match.competition}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      match.home_away === 'home' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {match.home_away === 'home' ? 'Local' : 'Visitante'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(match)}
                        disabled={isDeleting || isSyncing || isLoading}
                        className="text-betis-green hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✏️ Editar
                      </button>
                      {onSync && match.external_id && (
                        <button
                          onClick={() => handleSync(match)}
                          disabled={isDeleting || isSyncing || isLoading}
                          className="text-yellow-600 hover:text-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSyncing ? '⏳ Sincronizando...' : '🔄 Sincronizar'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(match)}
                        disabled={isDeleting || isSyncing || isLoading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredAndSortedMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay partidos</h3>
          <p className="text-gray-500">
            {matches.length === 0 
              ? 'Aún no se han creado partidos.'
              : 'No hay partidos que coincidan con los filtros aplicados.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedMatches.length)} de {filteredAndSortedMatches.length} partidos
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
