'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { PieChart } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function TriviaScoreDisplay() {
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchTotalTriviaScore() {
      try {
        const token = await getToken();
        const response = await fetch('/api/trivia/total-score-dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTotalScore(data.totalScore);
      } catch (err: unknown) {
        console.error('Failed to fetch total trivia score:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTotalTriviaScore();
  }, [getToken]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={`Error loading trivia score: ${error}`} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Puntuación Total Trivia</p>
          <p className="text-3xl font-bold text-betis-green">{totalScore !== null ? totalScore : 'N/A'}</p>
        </div>
        <PieChart className="h-12 w-12 text-betis-green opacity-20" />
      </div>
    </div>
  );
}
