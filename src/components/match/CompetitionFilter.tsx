'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface Competition {
  id: string;
  code: string;
  name: string;
  emblem?: string;
}

interface CompetitionFilterProps {
  competitions: Competition[];
  selectedCompetition: string | null;
  onCompetitionChange: (competitionId: string | null) => void;
  matchCounts?: Record<string, number>;
}

export default function CompetitionFilter({
  competitions,
  selectedCompetition,
  onCompetitionChange,
  matchCounts = {}
}: CompetitionFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedComp = competitions.find(c => c.id === selectedCompetition);

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-betis-verde focus:border-betis-verde"
      >
        <div className="flex items-center space-x-2">
          {selectedComp?.emblem && (
            <Image
              src={selectedComp.emblem}
              alt={selectedComp.name}
              width={20}
              height={20}
              className="rounded"
            />
          )}
          <span>
            {selectedComp ? selectedComp.name : 'Todas las competiciones'}
          </span>
          {selectedCompetition && matchCounts[selectedCompetition] && (
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {matchCounts[selectedCompetition]}
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            {/* All competitions option */}
            <button
              onClick={() => {
                onCompetitionChange(null);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                !selectedCompetition ? 'bg-betis-verde-pale text-betis-verde-dark' : 'text-gray-700'
              }`}
            >
              <span>Todas las competiciones</span>
              {!selectedCompetition && matchCounts && (
                <span className="text-xs text-gray-500">
                  {Object.values(matchCounts).reduce((a, b) => a + b, 0)} partidos
                </span>
              )}
            </button>

            {/* Individual competitions */}
            {competitions.map((competition) => (
              <button
                key={competition.id}
                onClick={() => {
                  onCompetitionChange(competition.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                  selectedCompetition === competition.id ? 'bg-betis-verde-pale text-betis-verde-dark' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {competition.emblem && (
                    <Image
                      src={competition.emblem}
                      alt={competition.name}
                      width={20}
                      height={20}
                      className="rounded"
                    />
                  )}
                  <span>{competition.name}</span>
                </div>
                {matchCounts[competition.id] && (
                  <span className="text-xs text-gray-500">
                    {matchCounts[competition.id]} partidos
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
