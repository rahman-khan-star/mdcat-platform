"use client";

import { motion } from "framer-motion";

export default function ProgressBar({
  value,
  max = 100,
  color = "#2563eb",
  size = "md",
  showLabel = false,
  label,
}: {
  value: number;
  max?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
}) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            {label || "Progress"}
          </span>
          <span className="text-xs font-semibold" style={{ color }}>
            {percentage}%
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-surface ${heights[size]}`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${heights[size]}`}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
