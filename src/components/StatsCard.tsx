"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export default function StatsCard({
  icon: Icon,
  label,
  value,
  change,
  color = "#2563eb",
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  color?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {change && (
          <span className="text-xs font-semibold text-secondary">{change}</span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-secondary">{label}</p>
    </motion.div>
  );
}
