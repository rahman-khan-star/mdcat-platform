"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  MinusCircle,
  RotateCcw,
  Home,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  BookOpen,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Hash,
} from "lucide-react";

interface ReviewQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  selectedAnswer: number;
  isCorrect: boolean;
  isUnattempted: boolean;
}

interface ReviewData {
  quizId: string;
  quizTitle: string;
  subject: string;
  score: number;
  correct: number;
  wrong: number;
  unattempted: number;
  total: number;
  timeTaken: number;
  passed: boolean;
  questions: ReviewQuestion[];
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get("quizId") || "";

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz-review-${quizId}`);
    if (stored) {
      setReviewData(JSON.parse(stored));
    }
  }, [quizId]);

  useEffect(() => {
    const saved = localStorage.getItem(`bookmarks-${quizId}`);
    if (saved) {
      setBookmarks(new Set(JSON.parse(saved)));
    }
  }, [quizId]);

  const toggleBookmark = useCallback(
    (index: number) => {
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        localStorage.setItem(`bookmarks-${quizId}`, JSON.stringify([...next]));
        return next;
      });
    },
    [quizId]
  );

  if (!reviewData) {
    return (
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-warning" />
          <h2 className="mt-4 text-xl font-bold text-text-primary">
            No results found
          </h2>
          <p className="mt-2 text-text-secondary">
            Please complete a quiz first to see results.
          </p>
          <Link
            href="/quiz"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Browse Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const {
    quizTitle,
    subject,
    score,
    correct,
    wrong,
    unattempted,
    total,
    timeTaken,
    passed,
    questions,
  } = reviewData;

  const attempted = total - unattempted;
  const timeMinutes = Math.floor(timeTaken / 60);
  const timeSeconds = timeTaken % 60;
  const percentage = score;

  const filteredQuestions = showOnlyBookmarks
    ? questions.map((q, i) => ({ ...q, originalIndex: i })).filter((q) => bookmarks.has(q.originalIndex))
    : questions.map((q, i) => ({ ...q, originalIndex: i }));

  const currentQ = filteredQuestions[currentReviewIndex];

  const getPerformanceMessage = () => {
    if (score >= 90)
      return {
        title: "Outstanding!",
        desc: "Excellent performance! You are well-prepared for the MDCAT.",
        color: "text-secondary",
        bg: "bg-secondary/10",
      };
    if (score >= 70)
      return {
        title: "Great Job!",
        desc: "Strong performance. Keep refining your weak areas.",
        color: "text-primary",
        bg: "bg-primary/10",
      };
    if (score >= 50)
      return {
        title: "Good Effort!",
        desc: "Decent attempt. Focus more on practice to improve.",
        color: "text-warning",
        bg: "bg-warning/10",
      };
    return {
      title: "Needs Improvement",
      desc: "Review the concepts and try again with more preparation.",
      color: "text-danger",
      bg: "bg-danger/10",
    };
  };

  const perf = getPerformanceMessage();

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${perf.bg}`}
          >
            <Trophy className={`h-10 w-10 ${perf.color}`} />
          </div>
          <h1 className={`mt-4 text-3xl font-bold ${perf.color}`}>
            {perf.title}
          </h1>
          <p className="mt-2 text-text-secondary">{perf.desc}</p>
          <p className="mt-1 text-sm font-medium text-text-muted">
            {quizTitle} &middot; {subject}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm"
        >
          <div className="text-center">
            <p className="text-sm text-text-secondary">Your Score</p>
            <p className="mt-1 text-5xl font-bold text-text-primary">
              {score}%
            </p>
            <div
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                passed
                  ? "bg-secondary/10 text-secondary"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {passed ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Passed
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Failed
                </>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl bg-surface p-3 text-center">
              <Target className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-lg font-bold text-text-primary">
                {total}
              </p>
              <p className="text-xs text-text-muted">Total</p>
            </div>
            <div className="rounded-xl bg-surface p-3 text-center">
              <CheckCircle2 className="mx-auto h-4 w-4 text-secondary" />
              <p className="mt-1 text-lg font-bold text-secondary">
                {correct}
              </p>
              <p className="text-xs text-text-muted">Correct</p>
            </div>
            <div className="rounded-xl bg-surface p-3 text-center">
              <XCircle className="mx-auto h-4 w-4 text-danger" />
              <p className="mt-1 text-lg font-bold text-danger">{wrong}</p>
              <p className="text-xs text-text-muted">Wrong</p>
            </div>
            <div className="rounded-xl bg-surface p-3 text-center">
              <MinusCircle className="mx-auto h-4 w-4 text-text-muted" />
              <p className="mt-1 text-lg font-bold text-text-muted">
                {unattempted}
              </p>
              <p className="text-xs text-text-muted">Skipped</p>
            </div>
            <div className="rounded-xl bg-surface p-3 text-center">
              <Clock className="mx-auto h-4 w-4 text-violet-500" />
              <p className="mt-1 text-lg font-bold text-text-primary">
                {timeMinutes}:{String(timeSeconds).padStart(2, "0")}
              </p>
              <p className="text-xs text-text-muted">Time</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-text-primary">
            Performance Summary
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-text-muted">Accuracy</p>
              <p className="text-sm font-bold text-text-primary">
                {attempted > 0 ? Math.round((correct / attempted) * 100) : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Attempted</p>
              <p className="text-sm font-bold text-text-primary">
                {attempted}/{total}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Passing Score</p>
              <p className="text-sm font-bold text-text-primary">60%</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Your Score</p>
              <p
                className={`text-sm font-bold ${
                  passed ? "text-secondary" : "text-danger"
                }`}
              >
                {score}%
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Status</p>
              <p
                className={`text-sm font-bold ${
                  passed ? "text-secondary" : "text-danger"
                }`}
              >
                {passed ? "PASS" : "FAIL"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Avg Time/Question</p>
              <p className="text-sm font-bold text-text-primary">
                {attempted > 0
                  ? `${Math.round(timeTaken / attempted)}s`
                  : "-"}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">
              Question Review
            </h3>
            <button
              onClick={() => {
                setShowOnlyBookmarks(!showOnlyBookmarks);
                setCurrentReviewIndex(0);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                showOnlyBookmarks
                  ? "bg-warning/10 text-warning"
                  : "bg-surface text-text-muted hover:bg-surface-hover"
              }`}
            >
              {showOnlyBookmarks ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              {showOnlyBookmarks
                ? `Bookmarked (${filteredQuestions.length})`
                : "Bookmark"}
            </button>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
              <Bookmark className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-secondary">
                No bookmarked questions yet.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {filteredQuestions.map((q, i) => (
                  <button
                    key={q.originalIndex}
                    onClick={() => setCurrentReviewIndex(i)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                      i === currentReviewIndex
                        ? "bg-primary text-white shadow-md"
                        : q.isCorrect
                        ? "bg-secondary/10 text-secondary"
                        : q.isUnattempted
                        ? "bg-surface text-text-muted"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {q.originalIndex + 1}
                  </button>
                ))}
              </div>

              {currentQ && (
                <motion.div
                  key={currentQ.originalIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <Hash className="h-3 w-3" />
                        {currentQ.originalIndex + 1}/{total}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          currentQ.isCorrect
                            ? "bg-secondary/10 text-secondary"
                            : currentQ.isUnattempted
                            ? "bg-surface text-text-muted"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {currentQ.isCorrect
                          ? "Correct"
                          : currentQ.isUnattempted
                          ? "Unattempted"
                          : "Wrong"}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleBookmark(currentQ.originalIndex)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-surface"
                    >
                      {bookmarks.has(currentQ.originalIndex) ? (
                        <BookmarkCheck className="h-5 w-5 text-warning" />
                      ) : (
                        <Bookmark className="h-5 w-5 text-text-muted" />
                      )}
                    </button>
                  </div>

                  <h4 className="mt-4 text-base font-medium leading-relaxed text-text-primary">
                    {currentQ.question}
                  </h4>

                  <div className="mt-4 space-y-2">
                    {currentQ.options.map((option, i) => {
                      const isCorrectAnswer = i === currentQ.correctAnswer;
                      const isStudentAnswer = i === currentQ.selectedAnswer;

                      let style =
                        "border-border bg-white";
                      if (isCorrectAnswer) {
                        style = "border-secondary bg-secondary/5";
                      } else if (isStudentAnswer && !isCorrectAnswer) {
                        style = "border-danger bg-danger/5";
                      }

                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 rounded-xl border-2 p-3 ${style}`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                              isCorrectAnswer
                                ? "bg-secondary text-white"
                                : isStudentAnswer
                                ? "bg-danger text-white"
                                : "bg-surface text-text-muted"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 text-sm text-text-primary">
                            {option}
                          </span>
                          {isCorrectAnswer && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                          )}
                          {isStudentAnswer && !isCorrectAnswer && (
                            <XCircle className="h-4 w-4 shrink-0 text-danger" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!currentQ.isUnattempted && (
                    <p className="mt-3 text-xs text-text-muted">
                      Your answer:{" "}
                      <span
                        className={
                          currentQ.isCorrect ? "text-secondary" : "text-danger"
                        }
                      >
                        {String.fromCharCode(65 + currentQ.selectedAnswer)} -{" "}
                        {currentQ.options[currentQ.selectedAnswer]}
                      </span>
                    </p>
                  )}

                  {currentQ.explanation && (
                    <div className="mt-4 rounded-xl bg-primary/5 p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">
                          Explanation
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setCurrentReviewIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentReviewIndex === 0}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:bg-surface-hover disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </button>
                    <span className="text-xs text-text-muted">
                      {currentReviewIndex + 1} of {filteredQuestions.length}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentReviewIndex((prev) =>
                          Math.min(filteredQuestions.length - 1, prev + 1)
                        )
                      }
                      disabled={
                        currentReviewIndex === filteredQuestions.length - 1
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:bg-surface-hover disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href={`/quiz/${quizId}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-hover"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Quiz
          </Link>
          <Link
            href="/quiz"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
          >
            <BookOpen className="h-4 w-4" />
            More Quizzes
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 pb-16 text-center text-text-secondary">
          Loading results...
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
