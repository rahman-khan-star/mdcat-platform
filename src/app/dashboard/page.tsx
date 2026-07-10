"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  Flame,
  Clock,
  Trophy,
  TrendingUp,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { WeeklyChart, SubjectChart, ProgressChart } from "@/components/Charts";
import { statsData } from "@/data/mockData";

export default function DashboardPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-text-secondary">
            Welcome back, Ahmed! Here&apos;s your study overview.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={BookOpen}
            label="Quizzes Completed"
            value={statsData.totalQuizzes}
            change="+5 this week"
            color="#2563eb"
            index={0}
          />
          <StatsCard
            icon={Target}
            label="Average Score"
            value={`${statsData.averageScore}%`}
            change="+2.3%"
            color="#10b981"
            index={1}
          />
          <StatsCard
            icon={Flame}
            label="Study Streak"
            value={`${statsData.studyStreak} days`}
            color="#f59e0b"
            index={2}
          />
          <StatsCard
            icon={Clock}
            label="Total Study Time"
            value={statsData.totalStudyTime}
            color="#8b5cf6"
            index={3}
          />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <WeeklyChart data={statsData.weeklyData} />
          <SubjectChart data={statsData.subjectPerformance} />
        </div>

        <div className="mt-8">
          <ProgressChart data={statsData.monthlyProgress} />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-text-primary">
              Subject Breakdown
            </h3>
            <div className="mt-4 space-y-4">
              {statsData.subjectPerformance.map((subj) => (
                <div key={subj.subject}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{subj.subject}</span>
                    <span className="font-semibold" style={{ color: subj.fill }}>
                      {subj.score}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${subj.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: subj.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-text-primary">
              Recent Activity
            </h3>
            <div className="mt-4 space-y-4">
              {[
                { title: "Cell Biology Basics", score: 85, date: "Today" },
                { title: "Organic Chemistry", score: 90, date: "Yesterday" },
                { title: "Mechanics", score: 68, date: "2 days ago" },
                { title: "English Grammar", score: 95, date: "3 days ago" },
                { title: "Critical Thinking", score: 80, date: "4 days ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-surface p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {activity.title}
                    </p>
                    <p className="text-xs text-text-muted">{activity.date}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      activity.score >= 80
                        ? "text-secondary"
                        : activity.score >= 60
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {activity.score}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
