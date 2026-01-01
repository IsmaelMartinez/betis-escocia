'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TriviaQuestion } from '@/lib/supabase';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUserSafe as useUser, useAuthSafe as useAuth } from '@/hooks/useClerkSafe';
import { log } from '@/lib/logger';

// Simplified state machine type
type GameState = 'idle' | 'loading' | 'playing' | 'feedback' | 'completed' | 'error';

// Consolidated data structure
interface CurrentData {
  questions: TriviaQuestion[];
  questionIndex: number;
  score: number;
  selectedAnswer: string | null;
  timeLeft: number;
  scoreSubmitted: boolean;
}

export default function TriviaPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  // Simplified 3-variable state system
  const [gameState, setGameState] = useState<GameState>('loading');
  const [currentData, setCurrentData] = useState<CurrentData>({
    questions: [],
    questionIndex: 0,
    score: 0,
    selectedAnswer: null,
    timeLeft: 15,
    scoreSubmitted: false,
  });
  const [error, setError] = useState<string | null>(null);

  const QUESTION_DURATION = 15; // seconds per question
  const MAX_QUESTIONS = 5; // Limit to 5 questions

  const saveScore = useCallback(async (finalScore: number) => {
    // Prevent multiple submissions
    if (currentData.scoreSubmitted) {
      log.warn('Attempted to submit score multiple times', { finalScore });
      return;
    }

    setCurrentData(prev => ({ ...prev, scoreSubmitted: true }));

    try {
      const token = await getToken();
      const response = await fetch('/api/trivia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ score: finalScore }),
      });

      if (!response.ok) {
        // Try to get the error message from the response
        try {
          const errorData = await response.json();
          const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
          
          // If user already played today, show a more specific message
          if (response.status === 400 && errorMessage.includes('jugado hoy')) {
            setError('Ya has jugado hoy. Tu puntuación anterior se mantiene. ¡Vuelve mañana para un nuevo desafío!');
            return;
          }
          
          throw new Error(errorMessage);
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // If we get here, the score was saved successfully
      log.business('trivia_score_saved_frontend', { finalScore });

    } catch (error) {
      log.error('Failed to save trivia score', error, {
        finalScore
      });
      
      // Show generic error if we don't have a specific one set
      if (!error) {
        setError('Error al guardar la puntuación. Tu juego fue completado pero la puntuación podría no haberse guardado.');
      }
    }
  }, [currentData.scoreSubmitted, getToken]);


  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleStartGame = async () => {
    setGameState('loading');
    try {
      const response = await fetch('/api/trivia');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      // Handle the case where user already played today
      if (apiResponse.success && apiResponse.data && typeof apiResponse.data === 'object' && 'message' in apiResponse.data) {
        setError(apiResponse.data.message);
        setCurrentData(prev => ({ 
          ...prev, 
          score: apiResponse.data.score,
          questions: Array(MAX_QUESTIONS).fill({} as TriviaQuestion)
        }));
        setGameState('completed');
        return;
      }
      
      // Handle the case where we get questions array (now exactly 5 from database)
      const questions = apiResponse.success ? apiResponse.data : apiResponse;
      setCurrentData(prev => ({ 
        ...prev, 
        questions: questions, // No slicing needed - database returns exactly 5 random questions
        questionIndex: 0,
        score: 0,
        timeLeft: QUESTION_DURATION,
        selectedAnswer: null
      }));
      setGameState('playing');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred while starting game');
      setGameState('error');
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      async function initializeTriviaPage() {
        setGameState('loading');

        // Check if user has already played today
        try {
          const response = await fetch('/api/trivia'); // This endpoint checks if played today
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const apiResponse = await response.json();
          
          // Handle the case where user already played today
          if (apiResponse.success && apiResponse.data && typeof apiResponse.data === 'object' && 'message' in apiResponse.data) {
            setError(apiResponse.data.message);
            setCurrentData(prev => ({
              ...prev,
              score: apiResponse.data.score,
              questions: Array(MAX_QUESTIONS).fill({} as TriviaQuestion)
            }));
            setGameState('completed');
            return;
          }
          
          // If response is OK and we get questions, it means user hasn't played yet
          // We don't set questions here, as they will be fetched on game start
          setGameState('idle');
        } catch (error: unknown) {
          setError(error instanceof Error ? error.message : 'An error occurred during initial check');
          setGameState('error');
        }
      }
      initializeTriviaPage();
    }
  }, [isLoaded, isSignedIn]); // Only run once when user is loaded and signed in


  const goToNextQuestion = useCallback((answeredCorrectly: boolean | null = null) => {
    const newScore = answeredCorrectly ? currentData.score + 1 : currentData.score;
    
    if (currentData.questionIndex < currentData.questions.length - 1) {
      // Move to next question
      setCurrentData(prev => ({
        ...prev,
        questionIndex: prev.questionIndex + 1,
        score: newScore,
        selectedAnswer: null,
        timeLeft: QUESTION_DURATION
      }));
      setGameState('playing');
    } else {
      // Game over - show results and save score
      setCurrentData(prev => ({ ...prev, score: newScore }));
      setGameState('completed');
      saveScore(newScore);
    }
  }, [currentData.score, currentData.questionIndex, currentData.questions.length, QUESTION_DURATION, saveScore]);

  const handleAnswerClick = (answerId: string, isCorrect: boolean) => {
    if (currentData.selectedAnswer) return; // Prevent multiple answers

    setCurrentData(prev => ({ ...prev, selectedAnswer: answerId }));
    setGameState('feedback');

    setTimeout(() => goToNextQuestion(isCorrect), 2000); // Show feedback for 2 seconds
  };


  // Simple timer implementation using setTimeout
  useEffect(() => {
    if (gameState === 'playing' && currentData.timeLeft > 0) {
      const timerId = setTimeout(() => {
        setCurrentData(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);

      return () => clearTimeout(timerId);
    } else if (gameState === 'playing' && currentData.timeLeft === 0) {
      // Time's up - treat as incorrect answer and move to next question
      goToNextQuestion();
    }
  }, [gameState, currentData.timeLeft, goToNextQuestion]);

  // Simplified render logic based on gameState
  if (gameState === 'loading') {
    return <LoadingSpinner />;
  }

  if (gameState === 'completed') {
    const totalQuestions = currentData.questions.length || MAX_QUESTIONS;
    const percentage = totalQuestions > 0 ? Math.round((currentData.score / totalQuestions) * 100) : 0;
    let resultMessage = '';
    let resultColor = '';

    if (percentage === 100) {
      resultMessage = '¡Perfecto! ¡Conoces tu Betis y Escocia! ¡Vuelve mañana para otro desafío!';
      resultColor = 'text-betis-verde';
    } else if (percentage >= 67) {
      resultMessage = '¡Muy bien! ¡Gran conocimiento de Betis y Escocia! ¡Inténtalo de nuevo mañana!';
      resultColor = 'text-betis-verde';
    } else if (percentage >= 33) {
      resultMessage = '¡No está mal! ¡Estudia y vuelve mañana para otro intento!';
      resultColor = 'text-yellow-600';
    } else {
      resultMessage = '¡Sigue aprendiendo sobre el Betis y Escocia! ¡Nuevas preguntas mañana!';
      resultColor = 'text-red-500';
    }

    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-betis-verde mb-6">¡Trivia Diaria Completada!</h1>
          
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-betis-verde mb-2">
              {currentData.score}/{totalQuestions}
            </div>
            <div className="text-2xl text-gray-600 mb-4">
              {percentage}% Correct
            </div>
            <div className={`text-xl font-semibold ${resultColor} mb-4`}>
              {resultMessage}
            </div>
            <div className="text-sm text-gray-500 italic">
              Tu puntuación ha sido registrada. ¡Nueva trivia disponible mañana!
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="bg-betis-verde hover:bg-betis-verde-dark text-white font-bold py-3 px-6 rounded-lg inline-block"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'idle' || gameState === 'error') {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-betis-verde mb-6">Betis & Scotland Trivia Challenge</h1>
          {error && (
            <div className="mb-4 text-red-500 font-medium">
              <ErrorMessage message={error} />
              {currentData.score !== null && <p>Your score today: {currentData.score}</p>}
            </div>
          )}
          <p className="text-lg text-gray-700 mb-6">¡Pon a prueba tus conocimientos sobre el Real Betis y Escocia!</p>
          <button
            onClick={handleStartGame}
            className="bg-betis-verde hover:bg-betis-verde-dark text-white font-bold py-3 px-6 rounded-lg inline-block"
            disabled={false}
          >
            Comenzar Trivia
          </button>
        </div>
      </div>
    );
  }

  // Playing or feedback state
  const currentQuestion = currentData.questions[currentData.questionIndex];

  if (currentData.questions.length === 0) {
    return <div className="text-center text-xl text-gray-600">No trivia questions available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Betis & Scotland Trivia Challenge</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold mb-4">Pregunta {currentData.questionIndex + 1} of {currentData.questions.length}</p>
        <div className="text-center mb-4" data-testid="game-timer">
          <div className={`text-2xl font-bold ${currentData.timeLeft <= 5 ? 'text-red-500' : currentData.timeLeft <= 10 ? 'text-yellow-500' : 'text-betis-verde'}`}>
            {currentData.timeLeft}s
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6">{currentQuestion.question_text}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.trivia_answers.map(answer => {
            const isSelected = currentData.selectedAnswer === answer.id;
            const isCorrect = answer.is_correct;
            let buttonClass = "w-full py-3 px-4 rounded-lg text-left transition-colors duration-300";

            if (gameState === 'feedback' && isSelected) {
              buttonClass += isCorrect ? " bg-betis-verde text-white" : " bg-red-500 text-white";
            } else if (gameState === 'feedback' && isCorrect) {
              buttonClass += " bg-betis-verde-light"; // Highlight correct answer even if not selected
            } else {
              buttonClass += " bg-gray-200 hover:bg-gray-300";
            }

            return (
              <button
                key={answer.id}
                className={buttonClass}
                onClick={() => handleAnswerClick(answer.id, isCorrect)}
                disabled={currentData.selectedAnswer !== null}
              >
                {answer.answer_text}
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-center text-2xl font-bold">Puntuación: {currentData.score}</div>
    </div>
  );
}
