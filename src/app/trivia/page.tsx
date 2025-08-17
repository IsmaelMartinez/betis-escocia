'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TriviaQuestion } from '@/lib/supabase';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import GameTimer from '@/components/GameTimer';
import { useUser, useAuth } from '@clerk/nextjs';
import TriviaScoreDisplay from '@/components/TriviaScoreDisplay';
import { log } from '@/lib/logger';

export default function TriviaPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerResetTrigger, setTimerResetTrigger] = useState(0); // To reset the timer
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // New state for game start

  const QUESTION_DURATION = 15; // seconds per question
  const MAX_QUESTIONS = 5; // Limit to 5 questions

  const saveScore = async (finalScore: number) => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      log.error('Failed to save trivia score', error, {
        finalScore
      });
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleStartGame = async () => {
    setLoading(true); // Show spinner while fetching questions
    try {
      const response = await fetch('/api/trivia');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      // Handle the case where user already played today
      if (apiResponse.success && apiResponse.data && typeof apiResponse.data === 'object' && 'message' in apiResponse.data) {
        setError(apiResponse.data.message);
        setGameCompleted(true);
        setScore(apiResponse.data.score);
        setLoading(false);
        return;
      }
      
      // Handle the case where we get questions array
      const questions = apiResponse.success ? apiResponse.data : apiResponse;
      setQuestions(questions.slice(0, MAX_QUESTIONS));
      setGameStarted(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred while starting game');
    } finally {
      setLoading(false); // Hide spinner after fetching questions
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      async function initializeTriviaPage() {
        setLoading(true); // Start loading for initial checks

        

        // Fetch accumulated scores on initial load
        // This is now handled by TriviaScoreDisplay component
        /*
        try {
          const totalScoreResponse = await fetch('/api/trivia/total-score');
          if (!totalScoreResponse.ok) {
            throw new Error(`HTTP error! status: ${totalScoreResponse.status}`);
          }
          const totalScoreData: { score: number } = await totalScoreResponse.json();
          setTotalAccumulatedScore(totalScoreData.score);
        } catch (error: unknown) {
          log.error('Failed to fetch accumulated scores on trivia initial load', error);
          // Don't block the page if score fetch fails, but log it.
        }
        */

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
            setGameCompleted(true);
            setScore(apiResponse.data.score);
            setQuestions(Array(MAX_QUESTIONS).fill({} as TriviaQuestion)); // Populate questions for display
            setLoading(false); // User already played, stop loading
            return;
          }
          
          // If response is OK and we get questions, it means user hasn't played yet
          // We don't set questions here, as they will be fetched on game start
        } catch (error: unknown) {
          setError(error instanceof Error ? error.message : 'An error occurred during initial check');
        } finally {
          setLoading(false); // All initial checks done, stop loading
        }
      }
      initializeTriviaPage();
    }
  }, [isLoaded, isSignedIn]); // Only run once when user is loaded and signed in

  const goToNextQuestion = (answeredCorrectly: boolean | null = null) => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setTimerResetTrigger(prev => prev + 1); // Reset timer for next question

    let newScore = score;
    if (answeredCorrectly) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Game over - show results and save score
      setGameCompleted(true);
      saveScore(newScore);
    }
  };

  const handleAnswerClick = (answerId: string, isCorrect: boolean) => {
    if (selectedAnswer) return; // Prevent multiple answers

    setSelectedAnswer(answerId);
    setShowFeedback(true);

    setTimeout(() => goToNextQuestion(isCorrect), 2000); // Show feedback for 2 seconds
  };

  const handleTimeUp = () => {
    // If time runs out, treat as an incorrect answer and move to next question
    goToNextQuestion();
  };

  

  if (loading && !gameStarted) {
    return <LoadingSpinner />;
  }

  

  if (gameCompleted) {
    const totalQuestions = gameStarted ? questions.length : MAX_QUESTIONS;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    let resultMessage = '';
    let resultColor = '';

    if (percentage === 100) {
      resultMessage = '¡Perfecto! ¡Conoces tu Betis y Escocia! ¡Vuelve mañana para otro desafío!';
      resultColor = 'text-green-600';
    } else if (percentage >= 67) {
      resultMessage = '¡Muy bien! ¡Gran conocimiento de Betis y Escocia! ¡Inténtalo de nuevo mañana!';
      resultColor = 'text-green-500';
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
          <h1 className="text-3xl font-bold text-green-600 mb-6">¡Trivia Diaria Completada!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {score}/{totalQuestions}
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
            <div className="flex items-center justify-center">
              <TriviaScoreDisplay />
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg inline-block"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-6">Betis & Scotland Trivia Challenge</h1>
          {error && (
            <div className="mb-4 text-red-500 font-medium">
              <ErrorMessage message={error} />
              {score !== null && <p>Your score today: {score}</p>}
            </div>
          )}
          <p className="text-lg text-gray-700 mb-6">¡Pon a prueba tus conocimientos sobre el Real Betis y Escocia!</p>
          <button
            onClick={handleStartGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg inline-block"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : "Comenzar Trivia"}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (questions.length === 0) {
    return <div className="text-center text-xl text-gray-600">No trivia questions available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Betis & Scotland Trivia Challenge</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold mb-4">Pregunta {currentQuestionIndex + 1} of {questions.length}</p>
        <GameTimer
          duration={QUESTION_DURATION}
          onTimeUp={handleTimeUp}
          resetTrigger={timerResetTrigger}
        />
        <h2 className="text-2xl font-bold mb-6">{currentQuestion.question_text}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.trivia_answers.map(answer => {
            const isSelected = selectedAnswer === answer.id;
            const isCorrect = answer.is_correct;
            let buttonClass = "w-full py-3 px-4 rounded-lg text-left transition-colors duration-300";

            if (showFeedback && isSelected) {
              buttonClass += isCorrect ? " bg-green-500 text-white" : " bg-red-500 text-white";
            } else if (showFeedback && isCorrect) {
              buttonClass += " bg-green-300"; // Highlight correct answer even if not selected
            } else {
              buttonClass += " bg-gray-200 hover:bg-gray-300";
            }

            return (
              <button
                key={answer.id}
                className={buttonClass}
                onClick={() => handleAnswerClick(answer.id, isCorrect)}
                disabled={selectedAnswer !== null}
              >
                {answer.answer_text}
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-center text-2xl font-bold">Puntuación: {score}</div>
    </div>
  );
}
