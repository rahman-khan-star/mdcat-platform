"use client";

import { motion } from "framer-motion";

interface Question {
  id: string;
  question: string;
  options: string[];
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  selectedAnswer,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (index: number) => void;
  selectedAnswer: number | null;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Question {questionNumber}/{totalQuestions}
        </span>
        {selectedAnswer !== null && (
          <span className="text-xs font-medium text-secondary">
            Answered
          </span>
        )}
      </div>

      <h3 className="mt-4 text-base font-medium leading-relaxed text-text-primary sm:text-lg">
        {question.question}
      </h3>

      <div className="mt-6 space-y-3">
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === i;

          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-surface text-text-muted"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-sm font-medium text-text-primary pt-0.5">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
