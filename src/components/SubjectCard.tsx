"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Dna,
  FlaskConical,
  Atom,
  BookOpen,
  Brain,
  ArrowRight,
} from "lucide-react";
import type { Subject } from "@/data/mockData";

const iconMap: Record<string, React.ElementType> = {
  Dna,
  FlaskConical,
  Atom,
  BookOpen,
  Brain,
};

export default function SubjectCard({
  subject,
  index = 0,
}: {
  subject: Subject;
  index?: number;
}) {
  const Icon = iconMap[subject.icon] || BookOpen;
  const progress = Math.round(
    (subject.completedTopics / subject.totalTopics) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        href={`/quiz?subject=${subject.id}`}
        className="group block rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
        >
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-text-primary">
          {subject.name}
        </h3>
        <p className="mt-1.5 text-sm text-text-secondary line-clamp-2">
          {subject.description}
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {subject.completedTopics}/{subject.totalTopics} topics
            </span>
            <span className="font-medium" style={{ color: subject.color }}>
              {progress}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              className="h-full rounded-full"
              style={{ backgroundColor: subject.color }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Start Practice
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}
