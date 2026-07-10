"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

export default function CountdownTimer({
  duration,
  onTimeUp,
}: {
  duration: number;
  onTimeUp: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= 60;
  const percentage = (timeLeft / (duration * 60)) * 100;

  const handleTimeUp = useCallback(onTimeUp, [onTimeUp]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleTimeUp]);

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
        isWarning
          ? "border-danger/30 bg-danger/5"
          : "border-border bg-white"
      }`}
    >
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={isWarning ? "#ef4444" : "#2563eb"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isWarning ? (
            <AlertTriangle className="h-4 w-4 text-danger animate-pulse" />
          ) : (
            <Clock className="h-4 w-4 text-primary" />
          )}
        </div>
      </div>
      <div>
        <p className="text-xs text-text-muted">Time Remaining</p>
        <p
          className={`text-lg font-bold tabular-nums ${
            isWarning ? "text-danger" : "text-text-primary"
          }`}
        >
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </p>
      </div>
    </motion.div>
  );
}
