'use client';

import { Calendar, MapPin, Clock } from 'lucide-react';

interface MatchCardProps {
  readonly opponent: string;
  readonly date: string;
  readonly venue: string;
  readonly competition: string;
  readonly isHome: boolean;
  readonly result?: string;
  readonly watchParty?: {
    location: string;
    address: string;
    time: string;
  };
}

export default function MatchCard({ 
  opponent, 
  date, 
  venue, 
  competition, 
  isHome, 
  result, 
  watchParty 
}: MatchCardProps) {
  const isUpcoming = new Date(date) > new Date();
  
  // Format date inline
  const formatDate = (dateString: string): string => {
    const matchDate = new Date(dateString);
    return matchDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Competition header */}
      <div className="bg-betis-green text-white px-4 py-2">
        <p className="text-sm font-medium">{competition}</p>
      </div>

      <div className="p-4">
        {/* Match details */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="text-right">
              <p className="font-bold text-lg">Real Betis</p>
              <p className="text-sm text-gray-600">{isHome ? 'Local' : 'Visitante'}</p>
            </div>
            
            <div className="text-2xl font-bold text-gray-400">
              {result ?? 'VS'}
            </div>
            
            <div className="text-left">
              <p className="font-bold text-lg">{opponent}</p>
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

        {/* Watch party info for upcoming matches */}
        {isUpcoming && watchParty && (
          <div className="bg-scotland-blue/10 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-scotland-blue mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              ¡Nos vemos aquí!
            </h4>
            <div className="text-sm space-y-1">
              <p className="font-medium">{watchParty.location}</p>
              <p className="text-gray-600">{watchParty.address}</p>
              <p className="text-betis-green font-medium">
                📍 Llega a las {watchParty.time}
              </p>
            </div>
          </div>
        )}

        {/* Match status */}
        <div className="mt-4 text-center">
          {isUpcoming ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Próximo
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Finalizado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
