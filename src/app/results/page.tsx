"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, CheckCircle2, XCircle, RotateCcw, Home, ArrowRight, Clock } from "lucide-react";

function ResultsContent() {
  const searchParams = useSearchParams();
  const score = Number(searchParams.get("score")) || 0;
  const correct = Number(searchParams.get("correct")) || 0;
  const total = Number(searchParams.get("total")) || 30;
  const quizId = searchParams.get("quizId") || "1";
  const timeTaken = Number(searchParams.get("time")) || 0;
  const incorrect = total - correct;
  const timeMinutes = Math.floor(timeTaken / 60);
  const timeSeconds = timeTaken % 60;

  const getMessage = () => {
    if (score >= 90) return { title: "Excellent!", desc: "Outstanding performance! You're ready for the real exam.", color: "text-secondary" };
    if (score >= 70) return { title: "Great Job!", desc: "Solid performance. Keep practicing to reach 90%+!", color: "text-primary" };
    if (score >= 50) return { title: "Good Effort!", desc: "You're making progress. Focus on your weak areas.", color: "text-warning" };
    return { title: "Keep Trying!", desc: "Don't give up! Review the material and try again.", color: "text-danger" };
  };

  const msg = getMessage();

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
          >
            <Trophy className="h-12 w-12 text-primary" />
          </motion.div>

          <h1 className={`mt-6 text-3xl font-bold ${msg.color}`}>{msg.title}</h1>
          <p className="mt-2 text-text-secondary">{msg.desc}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm"
        >
          <div className="text-center">
            <p className="text-sm text-text-secondary">Your Score</p>
            <p className="mt-1 text-5xl font-bold text-text-primary">{score}%</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-surface p-4 text-center">
              <CheckCircle2 className="mx-auto h-5 w-5 text-secondary" />
              <p className="mt-2 text-xl font-bold text-secondary">{correct}</p>
              <p className="text-xs text-text-muted">Correct</p>
            </div>
            <div className="rounded-xl bg-surface p-4 text-center">
              <XCircle className="mx-auto h-5 w-5 text-danger" />
              <p className="mt-2 text-xl font-bold text-danger">{incorrect}</p>
              <p className="text-xs text-text-muted">Incorrect</p>
            </div>
            <div className="rounded-xl bg-surface p-4 text-center">
              <Trophy className="mx-auto h-5 w-5 text-warning" />
              <p className="mt-2 text-xl font-bold text-warning">{total}</p>
              <p className="text-xs text-text-muted">Total</p>
            </div>
            <div className="rounded-xl bg-surface p-4 text-center">
              <Clock className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-2 text-xl font-bold text-primary">
                {timeMinutes}:{String(timeSeconds).padStart(2, "0")}
              </p>
              <p className="text-xs text-text-muted">Time Taken</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-col gap-3"
        >
          <Link
            href={`/quiz/${quizId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-hover"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl"
          >
            Try Another Quiz
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="pt-24 pb-16 text-center text-text-secondary">Loading results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
