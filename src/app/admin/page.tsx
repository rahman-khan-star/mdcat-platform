"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  FileQuestion,
  HelpCircle,
  ClipboardList,
  TrendingUp,
  Trophy,
  Activity,
} from "lucide-react";
import dynamic from "next/dynamic";
import { SkeletonChart } from "@/components/Skeleton";

const AdminBarChart = dynamic(
  () => import("recharts").then((mod) => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
    return {
      default: function AdminBarChart({ data }: { data: Array<{ name: string; avgScore: number }> }) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    };
  }),
  { loading: () => <SkeletonChart className="h-80" />, ssr: false }
);

const AdminPieChart = dynamic(
  () => import("recharts").then((mod) => {
    const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } = mod;
    const COLORS = ["#10b981", "#f59e0b", "#ef4444"];
    return {
      default: function AdminPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      },
    };
  }),
  { loading: () => <SkeletonChart className="h-80" />, ssr: false }
);

interface AdminStats {
  overview: {
    totalUsers: number;
    totalSubjects: number;
    totalQuizzes: number;
    totalQuestions: number;
    totalSubmissions: number;
    avgScore: number;
    passRate: number;
  };
  recentSubmissions: Array<{
    id: string;
    score: number;
    created_at: string;
    user_id: string;
    quiz_id: string;
  }>;
  subjectPerformance: Array<{ name: string; avgScore: number }>;
  difficultyDistribution: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || "Failed to load stats");
      }
    } catch {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-surface" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total Users", value: stats.overview.totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Subjects", value: stats.overview.totalSubjects, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Quizzes", value: stats.overview.totalQuizzes, icon: FileQuestion, color: "text-violet-500", bg: "bg-violet-50" },
    { label: "Questions", value: stats.overview.totalQuestions, icon: HelpCircle, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const secondaryStats = [
    { label: "Submissions", value: stats.overview.totalSubmissions, icon: ClipboardList, color: "text-cyan-500", bg: "bg-cyan-50" },
    { label: "Avg Score", value: `${stats.overview.avgScore}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Pass Rate", value: `${stats.overview.passRate}%`, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Active Rate", value: `${stats.overview.totalSubmissions > 0 ? Math.round((stats.overview.totalSubmissions / Math.max(stats.overview.totalUsers, 1)) * 100) : 0}%`, icon: Activity, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  const difficultyData = Object.entries(stats.difficultyDistribution).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-secondary">Overview of your MDCAT platform</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-white p-5 shadow-sm border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{card.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {secondaryStats.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="rounded-2xl bg-white p-5 shadow-sm border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{card.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-border"
        >
          <h3 className="mb-4 text-lg font-semibold text-text-primary">Subject Performance</h3>
          {stats.subjectPerformance.length > 0 ? (
            <AdminBarChart data={stats.subjectPerformance} />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-text-secondary">
              No data yet
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-border"
        >
          <h3 className="mb-4 text-lg font-semibold text-text-primary">Quiz Difficulty Distribution</h3>
          {difficultyData.length > 0 ? (
            <AdminPieChart data={difficultyData} />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-text-secondary">
              No data yet
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-white p-6 shadow-sm border border-border"
      >
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Recent Submissions</h3>
        {stats.recentSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-text-secondary">User</th>
                  <th className="pb-3 text-left font-medium text-text-secondary">Quiz</th>
                  <th className="pb-3 text-left font-medium text-text-secondary">Score</th>
                  <th className="pb-3 text-left font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/50">
                    <td className="py-3 text-text-primary">{sub.user_id.slice(0, 8)}...</td>
                    <td className="py-3 text-text-primary">{sub.quiz_id.slice(0, 8)}...</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          sub.score >= 60
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {sub.score}%
                      </span>
                    </td>
                    <td className="py-3 text-text-secondary">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-text-secondary py-8">No submissions yet</p>
        )}
      </motion.div>
    </div>
  );
}
