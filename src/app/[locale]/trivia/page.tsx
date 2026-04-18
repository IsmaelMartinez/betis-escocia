"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ErrorMessage from "@/components/ErrorMessage";
import type { ClientTriviaQuestion } from "@/types/trivia";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser, useAuth } from "@clerk/nextjs";
import { log } from "@/lib/utils/logger";

type GameState =
  | "idle"
  | "loading"
  | "playing"
  | "feedback"
  | "completed"
  | "error";

interface CurrentData {
  questions: ClientTriviaQuestion[];
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
  const t = useTranslations("Trivia");

  const [gameState, setGameState] = useState<GameState>("loading");
  const [currentData, setCurrentData] = useState<CurrentData>({
    questions: [],
    questionIndex: 0,
    score: 0,
    selectedAnswer: null,
    timeLeft: 15,
    scoreSubmitted: false,
  });
  const [error, setError] = useState<string | null>(null);

  const QUESTION_DURATION = 15;
  const MAX_QUESTIONS = 5;

  const saveScore = useCallback(
    async (finalScore: number) => {
      if (currentData.scoreSubmitted) {
        log.warn("Attempted to submit score multiple times", { finalScore });
        return;
      }

      setCurrentData((prev) => ({ ...prev, scoreSubmitted: true }));

      try {
        const token = await getToken();
        const response = await fetch("/api/trivia", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ score: finalScore }),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            const errorMessage =
              errorData.error || `HTTP error! status: ${response.status}`;

            if (
              response.status === 400 &&
              errorMessage.includes(t("alreadyPlayedKeyword"))
            ) {
              setError(t("alreadyPlayedNotice"));
              return;
            }

            throw new Error(errorMessage);
          } catch {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        log.business("trivia_score_saved_frontend", { finalScore });
      } catch (error) {
        log.error("Failed to save trivia score", error, {
          finalScore,
        });
        setError(t("saveError"));
      }
    },
    [currentData.scoreSubmitted, getToken, t],
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleStartGame = async () => {
    setGameState("loading");
    try {
      const response = await fetch("/api/trivia");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();

      if (
        apiResponse.success &&
        apiResponse.data &&
        typeof apiResponse.data === "object" &&
        "message" in apiResponse.data
      ) {
        setError(apiResponse.data.message);
        setCurrentData((prev) => ({
          ...prev,
          score: apiResponse.data.score,
          questions: Array(MAX_QUESTIONS).fill({} as ClientTriviaQuestion),
        }));
        setGameState("completed");
        return;
      }

      const questions = apiResponse.success ? apiResponse.data : apiResponse;
      setCurrentData((prev) => ({
        ...prev,
        questions: questions,
        questionIndex: 0,
        score: 0,
        timeLeft: QUESTION_DURATION,
        selectedAnswer: null,
      }));
      setGameState("playing");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("startGameError"));
      setGameState("error");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      async function initializeTriviaPage() {
        setGameState("loading");

        try {
          const response = await fetch("/api/trivia");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const apiResponse = await response.json();

          if (
            apiResponse.success &&
            apiResponse.data &&
            typeof apiResponse.data === "object" &&
            "message" in apiResponse.data
          ) {
            setError(apiResponse.data.message);
            setCurrentData((prev) => ({
              ...prev,
              score: apiResponse.data.score,
              questions: Array(MAX_QUESTIONS).fill({} as ClientTriviaQuestion),
            }));
            setGameState("completed");
            return;
          }

          setGameState("idle");
        } catch (error: unknown) {
          setError(
            error instanceof Error ? error.message : t("initialCheckError"),
          );
          setGameState("error");
        }
      }
      initializeTriviaPage();
    }
  }, [isLoaded, isSignedIn, t]);

  const goToNextQuestion = useCallback(
    (answeredCorrectly: boolean | null = null) => {
      const newScore = answeredCorrectly
        ? currentData.score + 1
        : currentData.score;

      if (currentData.questionIndex < currentData.questions.length - 1) {
        setCurrentData((prev) => ({
          ...prev,
          questionIndex: prev.questionIndex + 1,
          score: newScore,
          selectedAnswer: null,
          timeLeft: QUESTION_DURATION,
        }));
        setGameState("playing");
      } else {
        setCurrentData((prev) => ({ ...prev, score: newScore }));
        setGameState("completed");
        saveScore(newScore);
      }
    },
    [
      currentData.score,
      currentData.questionIndex,
      currentData.questions.length,
      QUESTION_DURATION,
      saveScore,
    ],
  );

  const handleAnswerClick = (answerId: string) => {
    if (currentData.selectedAnswer) return;

    const isCorrect = currentQuestion.correct_answer_id === answerId;
    setCurrentData((prev) => ({ ...prev, selectedAnswer: answerId }));
    setGameState("feedback");

    setTimeout(() => goToNextQuestion(isCorrect), 2000);
  };

  useEffect(() => {
    if (gameState === "playing" && currentData.timeLeft > 0) {
      const timerId = setTimeout(() => {
        setCurrentData((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);

      return () => clearTimeout(timerId);
    } else if (gameState === "playing" && currentData.timeLeft === 0) {
      goToNextQuestion();
    }
  }, [gameState, currentData.timeLeft, goToNextQuestion]);

  if (gameState === "loading") {
    return <LoadingSpinner />;
  }

  if (gameState === "completed") {
    const totalQuestions = currentData.questions.length || MAX_QUESTIONS;
    const percentage =
      totalQuestions > 0
        ? Math.round((currentData.score / totalQuestions) * 100)
        : 0;
    let resultMessage = "";
    let resultColor = "";

    if (percentage === 100) {
      resultMessage = t("result100");
      resultColor = "text-betis-verde";
    } else if (percentage >= 67) {
      resultMessage = t("result67");
      resultColor = "text-betis-verde";
    } else if (percentage >= 33) {
      resultMessage = t("result33");
      resultColor = "text-yellow-600";
    } else {
      resultMessage = t("result0");
      resultColor = "text-red-500";
    }

    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-betis-verde mb-6">
            {t("completedHeading")}
          </h1>

          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-betis-verde mb-2">
              {currentData.score}/{totalQuestions}
            </div>
            <div className="text-2xl text-gray-600 mb-4">
              {t("correctLabel", { pct: percentage })}
            </div>
            <div className={`text-xl font-semibold ${resultColor} mb-4`}>
              {resultMessage}
            </div>
            <div className="text-sm text-gray-500 italic">
              {t("registeredNote")}
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="bg-betis-verde hover:bg-betis-verde-dark text-white font-bold py-3 px-6 rounded-lg inline-block"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "idle" || gameState === "error") {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-betis-verde mb-6">
            {t("challengeTitle")}
          </h1>
          {error && (
            <div className="mb-4 text-red-500 font-medium">
              <ErrorMessage message={error} />
              {currentData.score !== null && (
                <p>{t("todaysScore", { score: currentData.score })}</p>
              )}
            </div>
          )}
          <p className="text-lg text-gray-700 mb-6">{t("challengeIntro")}</p>
          <button
            onClick={handleStartGame}
            className="bg-betis-verde hover:bg-betis-verde-dark text-white font-bold py-3 px-6 rounded-lg inline-block"
            disabled={false}
          >
            {t("startButton")}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentData.questions[currentData.questionIndex];

  if (currentData.questions.length === 0) {
    return (
      <div className="text-center text-xl text-gray-600">
        {t("noQuestions")}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        {t("challengeTitle")}
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold mb-4">
          {t("questionProgress", {
            current: currentData.questionIndex + 1,
            total: currentData.questions.length,
          })}
        </p>
        <div className="text-center mb-4" data-testid="game-timer">
          <div
            className={`text-2xl font-bold ${currentData.timeLeft <= 5 ? "text-red-500" : currentData.timeLeft <= 10 ? "text-yellow-500" : "text-betis-verde"}`}
          >
            {currentData.timeLeft}s
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6">
          {currentQuestion.question_text}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.trivia_answers.map((answer) => {
            const isSelected = currentData.selectedAnswer === answer.id;
            const isCorrect = currentQuestion.correct_answer_id === answer.id;
            let buttonClass =
              "w-full py-3 px-4 rounded-lg text-left transition-colors duration-300";

            if (gameState === "feedback" && isSelected) {
              buttonClass += isCorrect
                ? " bg-betis-verde text-white"
                : " bg-red-500 text-white";
            } else if (gameState === "feedback" && isCorrect) {
              buttonClass += " bg-betis-verde-light";
            } else {
              buttonClass += " bg-gray-200 hover:bg-gray-300";
            }

            return (
              <button
                key={answer.id}
                className={buttonClass}
                onClick={() => handleAnswerClick(answer.id)}
                disabled={currentData.selectedAnswer !== null}
              >
                {answer.answer_text}
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-center text-2xl font-bold">
        {t("scoreLabel", { score: currentData.score })}
      </div>
    </div>
  );
}
