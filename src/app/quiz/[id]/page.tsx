"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flag, SkipForward } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import QuestionCard from "@/components/QuestionCard";
import { sampleQuestions } from "@/data/mockData";

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(sampleQuestions.length).fill(null)
  );
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = sampleQuestions[currentIndex];
  const totalQuestions = sampleQuestions.length;
  const answeredCount = answers.filter((a) => a !== null).length;

  const handleAnswer = useCallback(
    (index: number) => {
      if (showResult) return;
      const newAnswers = [...answers];
      newAnswers[currentIndex] = index;
      setAnswers(newAnswers);
      setShowResult(true);
    },
    [answers, currentIndex, showResult]
  );

  const handleNext = () => {
    setShowResult(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setShowResult(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    const correct = answers.reduce<number>((count, answer, i) => {
      return count + (answer === sampleQuestions[i].correctAnswer ? 1 : 0);
    }, 0);
    const score = Math.round((correct / totalQuestions) * 100);
    router.push(
      `/results?score=${score}&correct=${correct}&total=${totalQuestions}`
    );
  };

  const handleTimeUp = () => {
    handleFinish();
  };

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
              Cell Biology Basics
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {answeredCount}/{totalQuestions} questions answered
            </p>
          </div>
          <CountdownTimer duration={30} onTimeUp={handleTimeUp} />
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
            showResult={showResult}
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentIndex === totalQuestions - 1 ? (
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5"
              >
                <Flag className="h-4 w-4" />
                Finish Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {sampleQuestions.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setShowResult(false);
                setCurrentIndex(i);
              }}
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
