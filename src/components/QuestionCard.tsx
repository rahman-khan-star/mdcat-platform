"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import type { Question } from "@/data/mockData";

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  selectedAnswer,
  showResult,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (index: number) => void;
  selectedAnswer: number | null;
  showResult: boolean;
}) {
  const isCorrect = selectedAnswer === question.correctAnswer;

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
      </div>

      <h3 className="mt-4 text-base font-medium leading-relaxed text-text-primary sm:text-lg">
        {question.question}
      </h3>

      <div className="mt-6 space-y-3">
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === i;
          const isAnswer = i === question.correctAnswer;
          let optionStyle = "border-border bg-white hover:border-primary/50 hover:bg-primary/5";
          if (showResult) {
            if (isAnswer) {
              optionStyle = "border-secondary bg-secondary/5";
            } else if (isSelected && !isAnswer) {
              optionStyle = "border-danger bg-danger/5";
            } else {
              optionStyle = "border-border bg-white opacity-60";
            }
          } else if (isSelected) {
            optionStyle = "border-primary bg-primary/5";
          }

          return (
            <button
              key={i}
              onClick={() => !showResult && onAnswer(i)}
              disabled={showResult}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${optionStyle} ${
                !showResult ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  showResult && isAnswer
                    ? "bg-secondary text-white"
                    : showResult && isSelected && !isAnswer
                    ? "bg-danger text-white"
                    : isSelected
                    ? "bg-primary text-white"
                    : "bg-surface text-text-muted"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-sm font-medium text-text-primary pt-0.5">
                {option}
              </span>
              {showResult && isAnswer && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />
              )}
              {showResult && isSelected && !isAnswer && (
                <XCircle className="h-5 w-5 shrink-0 text-danger" />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 overflow-hidden"
          >
            <div
              className={`rounded-xl p-4 ${
                isCorrect ? "bg-secondary/5" : "bg-danger/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb
                  className={`h-4 w-4 ${
                    isCorrect ? "text-secondary" : "text-danger"
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    isCorrect ? "text-secondary" : "text-danger"
                  }`}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
