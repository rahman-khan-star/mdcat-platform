import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    const [
      { data: profile },
      { data: submissions },
      { data: progress },
      { data: leaderboardEntry },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, phone, city, target_year, bio, avatar_url, rank, study_streak, total_study_time_seconds, created_at")
        .eq("id", user.id)
        .single(),
      supabase
        .from("quiz_submissions")
        .select("id, quiz_id, score, correct_count, total_questions, time_taken_seconds, passed, created_at, quizzes!inner(id, title, subject_id, subjects!inner(id, name, color))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_progress")
        .select("subject_id, completed_topics, total_attempts, best_score, last_attempt_at, subjects!inner(id, name, color, icon, total_topics)")
        .eq("user_id", user.id),
      supabase
        .from("leaderboard_view")
        .select("rank, total_score, quizzes_completed")
        .eq("user_id", user.id)
        .single(),
    ]);

    // Compute overview stats
    const totalQuizzes = submissions?.length ?? 0;
    const avgScore =
      totalQuizzes > 0
        ? Math.round(
            (submissions?.reduce((sum, s) => sum + s.score, 0) ?? 0) / totalQuizzes
          )
      : 0;
    const totalCorrect = submissions?.reduce((sum, s) => sum + s.correct_count, 0) ?? 0;
    const totalQuestions = submissions?.reduce((sum, s) => sum + s.total_questions, 0) ?? 0;
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const passedQuizzes = submissions?.filter((s) => s.passed).length ?? 0;
    const passRate = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;
    const totalTime = profile?.total_study_time_seconds ?? 0;
    const studyTime = `${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m`;

    // Subject-wise progress
    const subjectProgress =
      progress?.map((p) => {
        const sub = Array.isArray(p.subjects) ? p.subjects[0] : p.subjects;
        return {
          subjectId: p.subject_id,
          name: sub?.name ?? "Unknown",
          color: sub?.color ?? "#2563eb",
          icon: sub?.icon ?? "BookOpen",
          totalTopics: sub?.total_topics ?? 0,
          completedTopics: p.completed_topics,
          totalAttempts: p.total_attempts,
          bestScore: p.best_score,
          lastAttempt: p.last_attempt_at,
          progressPercent:
            (sub?.total_topics ?? 0) > 0
              ? Math.round((p.completed_topics / (sub?.total_topics ?? 1)) * 100)
              : 0,
        };
      }) ?? [];

    // Recent attempts (last 10)
    const recentAttempts =
      submissions?.slice(0, 10).map((s) => {
        const quiz = Array.isArray(s.quizzes) ? s.quizzes[0] : s.quizzes;
        const subject = Array.isArray(quiz?.subjects) ? quiz?.subjects[0] : quiz?.subjects;
        return {
          id: s.id,
          quizId: s.quiz_id,
          quizTitle: quiz?.title ?? "Unknown Quiz",
          subjectName: subject?.name ?? "Unknown",
          subjectColor: subject?.color ?? "#2563eb",
          score: s.score,
          correctCount: s.correct_count,
          totalQuestions: s.total_questions,
          timeTaken: s.time_taken_seconds,
          passed: s.passed,
          date: s.created_at,
        };
      }) ?? [];

    // Weekly data (last 7 days)
    const now = new Date();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dayStr = date.toISOString().split("T")[0];
      const daySubs =
        submissions?.filter((s) => s.created_at.split("T")[0] === dayStr) ?? [];
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        score:
          daySubs.length > 0
            ? Math.round(daySubs.reduce((sum, s) => sum + s.score, 0) / daySubs.length)
            : 0,
        quizzes: daySubs.length,
      };
    });

    // Subject performance for chart
    const subjectPerformanceMap: Record<string, { total: number; count: number; color: string }> = {};
    submissions?.forEach((s) => {
      const quiz = Array.isArray(s.quizzes) ? s.quizzes[0] : s.quizzes;
      const subject = Array.isArray(quiz?.subjects) ? quiz?.subjects[0] : quiz?.subjects;
      const name = subject?.name ?? "Unknown";
      if (!subjectPerformanceMap[name]) subjectPerformanceMap[name] = { total: 0, count: 0, color: subject?.color ?? "#2563eb" };
      subjectPerformanceMap[name].total += s.score;
      subjectPerformanceMap[name].count += 1;
    });
    const subjectPerformance = Object.entries(subjectPerformanceMap).map(([subject, data]) => ({
      subject,
      score: Math.round(data.total / data.count),
      fill: data.color,
    }));

    return successResponse({
      profile: {
        id: profile?.id,
        name: profile?.full_name,
        email: profile?.email,
        phone: profile?.phone,
        city: profile?.city,
        targetYear: profile?.target_year,
        bio: profile?.bio,
        avatarUrl: profile?.avatar_url,
        joinDate: profile?.created_at,
      },
      overview: {
        totalQuizzes,
        avgScore,
        accuracy,
        passRate,
        studyStreak: profile?.study_streak ?? 0,
        studyTime,
        rank: leaderboardEntry?.rank ?? 0,
        totalScore: leaderboardEntry?.total_score ?? 0,
        quizzesCompleted: leaderboardEntry?.quizzes_completed ?? 0,
      },
      subjectProgress,
      recentAttempts,
      weeklyData,
      subjectPerformance,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to load dashboard");
  }
}
