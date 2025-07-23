'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TriviaQuestion } from '@/lib/supabase';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import GameTimer from '@/components/GameTimer';
import { isFeatureEnabledAsync } from '@/lib/featureFlags';

export default function TriviaPage() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerResetTrigger, setTimerResetTrigger] = useState(0); // To reset the timer
  const [isTriviaEnabled, setIsTriviaEnabled] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const QUESTION_DURATION = 15; // seconds per question
  const MAX_QUESTIONS = 3; // Limit to 3 questions

  useEffect(() => {
    async function checkFeatureFlag() {
      const enabled = await isFeatureEnabledAsync('showTriviaGame');
      setIsTriviaEnabled(enabled);
      if (!enabled) {
        setLoading(false);
        return;
      }

      async function fetchQuestions() {
        try {
          setLoading(true);
          const response = await fetch('/api/trivia');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: TriviaQuestion[] = await response.json();
          // Limit to 3 questions
          setQuestions(data.slice(0, MAX_QUESTIONS));
        } catch (error: unknown) {
          setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      }
      fetchQuestions();
    }
    checkFeatureFlag();
  }, []);

  const goToNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setTimerResetTrigger(prev => prev + 1); // Reset timer for next question

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Game over - show results
      setGameCompleted(true);
    }
  };

  const handleAnswerClick = (answerId: string, isCorrect: boolean) => {
    if (selectedAnswer) return; // Prevent multiple answers

    setSelectedAnswer(answerId);
    setShowFeedback(true);

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    setTimeout(goToNextQuestion, 2000); // Show feedback for 2 seconds
  };

  const handleTimeUp = () => {
    // If time runs out, treat as an incorrect answer and move to next question
    goToNextQuestion();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isTriviaEnabled) {
    return (
      <div className="container mx-auto p-4 text-center">
        <ErrorMessage message="Trivia game is currently not enabled." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (questions.length === 0) {
    return <div className="text-center text-xl text-gray-600">No trivia questions available.</div>;
  }

  // Show results section when game is completed
  if (gameCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    let resultMessage = '';
    let resultColor = '';

    if (percentage === 100) {
      resultMessage = '¡Perfecto! You know your Betis and Scotland! Come back tomorrow for another challenge!';
      resultColor = 'text-green-600';
    } else if (percentage >= 67) {
      resultMessage = '¡Muy bien! Great knowledge of Betis and Scotland! Try again tomorrow!';
      resultColor = 'text-green-500';
    } else if (percentage >= 33) {
      resultMessage = 'Not bad! Study up and come back tomorrow for another try!';
      resultColor = 'text-yellow-600';
    } else {
      resultMessage = 'Keep learning about Betis and Scotland! New questions tomorrow!';
      resultColor = 'text-red-500';
    }

    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-6">Daily Trivia Complete!</h1>
          
          <div className="mb-6">
            <div className="text-6xl font-bold text-green-600 mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-2xl text-gray-600 mb-4">
              {percentage}% Correct
            </div>
            <div className={`text-xl font-semibold ${resultColor} mb-4`}>
              {resultMessage}
            </div>
            <div className="text-sm text-gray-500 italic">
              Your score has been recorded. New trivia available tomorrow!
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Betis & Scotland Trivia Challenge</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>
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
      <div className="text-center text-2xl font-bold">Score: {score}</div>
    </div>
  );
}
