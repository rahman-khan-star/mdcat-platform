"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  HelpCircle,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import type { Quiz } from "@/data/mockData";

const difficultyColors = {
  Easy: "bg-secondary/10 text-secondary",
  Medium: "bg-primary/10 text-primary",
  Hard: "bg-danger/10 text-danger",
};

export default function QuizCard({
  quiz,
  index = 0,
}: {
  quiz: Quiz;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/quiz/${quiz.id}`}
        className="group block rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${difficultyColors[quiz.difficulty]}`}
              >
                {quiz.difficulty}
              </span>
              {quiz.attempted && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                  <CheckCircle2 className="h-3 w-3" />
                  Attempted
                </span>
              )}
            </div>
            <h3 className="mt-3 text-base font-semibold text-text-primary group-hover:text-primary transition-colors">
              {quiz.title}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">{quiz.subject}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-text-muted transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {quiz.attempts > 0 && (
          <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              {quiz.attempts} attempt{quiz.attempts > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {quiz.attempted && quiz.score !== undefined && (
          <div className="mt-4 rounded-xl bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Best Score</span>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-warning" />
                <span className="text-sm font-bold text-text-primary">
                  {quiz.score}%
                </span>
              </div>
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
