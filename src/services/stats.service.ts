import { createClient } from "@/lib/supabase/server";
import type { StatsData } from "@/types";

export async function getStats(userId: string): Promise<StatsData> {
  const supabase = await createClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_user_stats",
    { p_user_id: userId }
  );

  if (rpcError) throw new Error(rpcError.message);

  const stats = rpcData as {
    totalQuizzes: number;
    averageScore: number;
    totalQuestions: number;
    correctAnswers: number;
    studyStreak: number;
    totalStudyTime: string;
  };

  const { data: submissions } = await supabase
    .from("quiz_submissions")
    .select("score, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = days.map((day) => ({ day, score: 0, quizzes: 0 }));
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const sub of submissions ?? []) {
    const d = new Date(sub.created_at);
    if (d >= weekAgo) {
      const dayIdx = d.getDay();
      weeklyData[dayIdx].score += sub.score;
      weeklyData[dayIdx].quizzes += 1;
    }
  }

  weeklyData.forEach((d) => {
    if (d.quizzes > 0) d.score = Math.round(d.score / d.quizzes);
  });

  const { data: progressData } = await supabase
    .from("user_progress")
    .select("subject_id, best_score")
    .eq("user_id", userId);

  const subjectPerformance = [
    { subject: "Biology", score: 0, fill: "#10b981" },
    { subject: "Chemistry", score: 0, fill: "#2563eb" },
    { subject: "Physics", score: 0, fill: "#8b5cf6" },
    { subject: "English", score: 0, fill: "#f59e0b" },
    { subject: "Reasoning", score: 0, fill: "#ec4899" },
  ];

  const subjectMap: Record<string, string> = {
    biology: "Biology",
    chemistry: "Chemistry",
    physics: "Physics",
    english: "English",
    "logical-reasoning": "Reasoning",
  };

  for (const p of progressData ?? []) {
    const name = subjectMap[p.subject_id];
    if (name) {
      const sp = subjectPerformance.find((s) => s.subject === name);
      if (sp) sp.score = p.best_score;
    }
  }

  const monthlyProgress = [
    { month: "Jan", score: 0 },
    { month: "Feb", score: 0 },
    { month: "Mar", score: 0 },
    { month: "Apr", score: 0 },
    { month: "May", score: 0 },
    { month: "Jun", score: 0 },
  ];

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthScores = new Map<number, { total: number; count: number }>();
  for (const sub of submissions ?? []) {
    const d = new Date(sub.created_at);
    const m = d.getMonth();
    const existing = monthScores.get(m) ?? { total: 0, count: 0 };
    monthScores.set(m, {
      total: existing.total + sub.score,
      count: existing.count + 1,
    });
  }

  const currentMonth = now.getMonth();
  for (let i = 0; i < 6; i++) {
    const m = (currentMonth - 5 + i + 12) % 12;
    const stats_m = monthScores.get(m);
    if (stats_m && stats_m.count > 0) {
      monthlyProgress[i] = {
        month: monthNames[m],
        score: Math.round(stats_m.total / stats_m.count),
      };
    } else {
      monthlyProgress[i] = { month: monthNames[m], score: 0 };
    }
  }

  return {
    totalQuizzes: stats.totalQuizzes,
    averageScore: stats.averageScore,
    totalQuestions: stats.totalQuestions,
    correctAnswers: stats.correctAnswers,
    studyStreak: stats.studyStreak,
    totalStudyTime: stats.totalStudyTime,
    weeklyData,
    subjectPerformance,
    monthlyProgress,
  };
}
