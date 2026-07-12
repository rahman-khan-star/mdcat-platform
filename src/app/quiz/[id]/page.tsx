"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Flag, Loader2 } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import QuestionCard from "@/components/QuestionCard";
import { LoadingState, ErrorState } from "@/components/DataStates";

interface QuizMeta {
  id: string;
  title: string;
  duration: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<QuizMeta | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const hasSubmittedRef = useRef(false);

  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [quizRes, questionsRes] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/questions`),
      ]);
      const quizJson = await quizRes.json();
      const questionsJson = await questionsRes.json();

      if (!quizJson.success) throw new Error(quizJson.error);
      if (!questionsJson.success) throw new Error(questionsJson.error);

      setQuiz({
        id: quizJson.data.id,
        title: quizJson.data.title,
        duration: quizJson.data.duration,
      });
      setQuestions(questionsJson.data);
      setAnswers(new Array(questionsJson.data.length).fill(null));
      startTimeRef.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const submitQuiz = useCallback(
    async (finalAnswers: (number | null)[]) => {
      if (hasSubmittedRef.current || isSubmitting || submitted) return;
      hasSubmittedRef.current = true;
      setIsSubmitting(true);

      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const answerArray = finalAnswers.map((a) => (a === null ? -1 : a));

      try {
        const res = await fetch(`/api/quizzes/${quizId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answerArray,
            timeTaken,
          }),
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to submit quiz");
        }

        setSubmitted(true);
        const result = data.data;
        sessionStorage.setItem(
          `quiz-review-${quizId}`,
          JSON.stringify({
            ...result,
            answers: answerArray,
          })
        );
        router.push(`/results?quizId=${quizId}`);
      } catch (err) {
        hasSubmittedRef.current = false;
        setIsSubmitting(false);
        setError(
          err instanceof Error ? err.message : "Failed to submit quiz. Please try again."
        );
      }
    },
    [quizId, isSubmitting, submitted, questions, router]
  );

  const handleTimeUp = useCallback(() => {
    submitQuiz(answers);
  }, [answers, submitQuiz]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;

  const handleAnswer = useCallback(
    (index: number) => {
      if (isSubmitting) return;
      const newAnswers = [...answers];
      newAnswers[currentIndex] = index;
      setAnswers(newAnswers);
    },
    [answers, currentIndex, isSubmitting]
  );

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    submitQuiz(answers);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <LoadingState message="Loading quiz..." />
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <ErrorState message={error ?? "Quiz not found"} onRetry={fetchQuiz} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="rounded-2xl bg-white p-8 shadow-2xl text-center"
              >
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                <p className="mt-4 text-lg font-semibold text-text-primary">
                  Submitting your answers...
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Please don&apos;t close this page
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
              {quiz!.title}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {answeredCount}/{totalQuestions} answered
            </p>
          </div>
          <CountdownTimer duration={quiz!.duration} onTimeUp={handleTimeUp} />
        </motion.div>

        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <motion.div
              animate={{
                width: `${(answeredCount / totalQuestions) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        <div className="mt-8">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
            onAnswer={handleAnswer}
            selectedAnswer={answers[currentIndex]}
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 || isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentIndex === totalQuestions - 1 ? (
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Flag className="h-4 w-4" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              disabled={isSubmitting}
              className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                i === currentIndex
                  ? "bg-primary text-white shadow-md"
                  : answers[i] !== null
                  ? "bg-secondary/10 text-secondary"
                  : "bg-surface text-text-muted hover:bg-surface-hover"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
