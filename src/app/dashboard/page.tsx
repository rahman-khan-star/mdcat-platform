"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  Flame,
  Clock,
  Trophy,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BarChart3,
  Award,
  ChevronRight,
  User,
  Percent,
} from "lucide-react";
import dynamic from "next/dynamic";
import { SkeletonChart } from "@/components/Skeleton";

const WeeklyChart = dynamic(
  () => import("@/components/Charts").then((mod) => mod.WeeklyChart),
  { loading: () => <SkeletonChart className="h-80" />, ssr: false }
);
const SubjectPerformanceChart = dynamic(
  () => import("@/components/Charts").then((mod) => mod.SubjectChart),
  { loading: () => <SkeletonChart className="h-80" />, ssr: false }
);

interface DashboardData {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    targetYear: string;
    bio: string;
    avatarUrl: string;
    joinDate: string;
  };
  overview: {
    totalQuizzes: number;
    avgScore: number;
    accuracy: number;
    passRate: number;
    studyStreak: number;
    studyTime: string;
    rank: number;
    totalScore: number;
    quizzesCompleted: number;
  };
  subjectProgress: Array<{
    subjectId: string;
    name: string;
    color: string;
    icon: string;
    totalTopics: number;
    completedTopics: number;
    totalAttempts: number;
    bestScore: number;
    lastAttempt: string | null;
    progressPercent: number;
  }>;
  recentAttempts: Array<{
    id: string;
    quizId: string;
    quizTitle: string;
    subjectName: string;
    subjectColor: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
    passed: boolean;
    date: string;
  }>;
  weeklyData: Array<{ day: string; score: number; quizzes: number }>;
  subjectPerformance: Array<{ subject: string; score: number; fill: string }>;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        else setError(d.error || "Failed to load dashboard");
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-xl bg-white" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface pt-24 flex items-center justify-center">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-border">
          <XCircle className="mx-auto h-12 w-12 text-danger" />
          <p className="mt-4 text-text-primary font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, overview, subjectProgress, recentAttempts, weeklyData, subjectPerformance } = data;

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statCards = [
    { label: "Quizzes Taken", value: overview.totalQuizzes, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Avg Score", value: `${overview.avgScore}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Accuracy", value: `${overview.accuracy}%`, icon: Percent, color: "text-violet-500", bg: "bg-violet-50" },
    { label: "Pass Rate", value: `${overview.passRate}%`, icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const secondaryStats = [
    { label: "Study Streak", value: `${overview.studyStreak}d`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Study Time", value: overview.studyTime, icon: Clock, color: "text-cyan-500", bg: "bg-cyan-50" },
    { label: "Leaderboard Rank", value: overview.rank > 0 ? `#${overview.rank}` : "—", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Total Score", value: overview.totalScore.toLocaleString(), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-surface pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div {...fadeUp} transition={{ delay: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {profile.name.split(" ")[0]}!</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden"
        >
          <div className="h-24 bg-gradient-to-r from-primary to-blue-400" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-primary text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
                <p className="text-sm text-text-secondary">{profile.email}</p>
                {profile.bio && <p className="mt-1 text-sm text-text-secondary">{profile.bio}</p>}
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xs text-text-secondary">Rank</p>
                  <p className="font-bold text-primary">#{overview.rank || "—"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary">Score</p>
                  <p className="font-bold text-emerald-500">{overview.totalScore.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary">Quizzes</p>
                  <p className="font-bold text-violet-500">{overview.quizzesCompleted}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              {...fadeUp}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl bg-white p-5 shadow-sm border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">{card.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {secondaryStats.map((card, i) => (
            <motion.div
              key={card.label}
              {...fadeUp}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="rounded-2xl bg-white p-5 shadow-sm border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">{card.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-border"
          >
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Weekly Performance</h3>
            <WeeklyChart data={weeklyData} />
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.35 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-border"
          >
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Subject Performance</h3>
            {subjectPerformance.length > 0 ? (
              <SubjectPerformanceChart data={subjectPerformance} />
            ) : (
              <div className="flex h-[280px] items-center justify-center text-text-secondary">
                No data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Subject-wise Progress */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Subject Progress</h3>
            <Link href="/subjects" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {subjectProgress.length > 0 ? (
            <div className="space-y-4">
              {subjectProgress.map((sub) => (
                <div key={sub.subjectId} className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: sub.color + "15" }}
                  >
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: sub.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">{sub.name}</span>
                      <span className="text-xs text-text-secondary">
                        {sub.completedTopics}/{sub.totalTopics} topics
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sub.progressPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0 w-16">
                    <span className="text-sm font-bold" style={{ color: sub.color }}>
                      {sub.progressPercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary py-8">No subject progress yet. Start a quiz!</p>
          )}
        </motion.div>

        {/* Recent Attempts */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.45 }}
          className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">Recent Attempts</h3>
            <Link href="/quiz" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1">
              Take Quiz <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {recentAttempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="px-6 py-3 text-left font-medium text-text-secondary">Quiz</th>
                    <th className="px-6 py-3 text-left font-medium text-text-secondary">Subject</th>
                    <th className="px-6 py-3 text-left font-medium text-text-secondary">Score</th>
                    <th className="px-6 py-3 text-left font-medium text-text-secondary">Correct</th>
                    <th className="px-6 py-3 text-left font-medium text-text-secondary hidden sm:table-cell">Time</th>
                    <th className="px-6 py-3 text-left font-medium text-text-secondary">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-text-secondary hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-surface/30">
                      <td className="px-6 py-3 font-medium text-text-primary max-w-[200px] truncate">{a.quizTitle}</td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: a.subjectColor + "15", color: a.subjectColor }}
                        >
                          {a.subjectName}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`font-bold ${a.score >= 60 ? "text-emerald-600" : "text-rose-600"}`}>
                          {a.score}%
                        </span>
                      </td>
                      <td className="px-6 py-3 text-text-primary">{a.correctCount}/{a.totalQuestions}</td>
                      <td className="px-6 py-3 text-text-secondary hidden sm:table-cell">
                        {Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.passed ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {a.passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {a.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-text-secondary text-xs hidden md:table-cell">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-text-secondary/30" />
              <p className="mt-4 text-text-secondary">No attempts yet. Take your first quiz!</p>
              <Link
                href="/quiz"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Start Quiz
              </Link>
            </div>
          )}
        </motion.div>

        {/* Rank on Leaderboard */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-gradient-to-r from-primary to-blue-400 p-6 text-white shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm text-white/80">Your Leaderboard Rank</p>
                <p className="text-3xl font-bold">
                  {overview.rank > 0 ? `#${overview.rank}` : "Unranked"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold">{overview.totalScore.toLocaleString()}</p>
                <p className="text-xs text-white/80">Total Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{overview.quizzesCompleted}</p>
                <p className="text-xs text-white/80">Quizzes Done</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{overview.studyStreak}d</p>
                <p className="text-xs text-white/80">Streak</p>
              </div>
            </div>
            <Link
              href="/leaderboard"
              className="rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
