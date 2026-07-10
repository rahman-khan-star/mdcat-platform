import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();

    const [
      { count: totalUsers },
      { count: totalSubjects },
      { count: totalQuizzes },
      { count: totalQuestions },
      { count: totalSubmissions },
      { data: recentSubmissions },
      { data: subjectStats },
      { data: difficultyStats },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("subjects").select("*", { count: "exact", head: true }),
      supabase.from("quizzes").select("*", { count: "exact", head: true }),
      supabase.from("questions").select("*", { count: "exact", head: true }),
      supabase.from("quiz_submissions").select("*", { count: "exact", head: true }),
      supabase
        .from("quiz_submissions")
        .select("id, score, created_at, user_id, quiz_id")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("quiz_submissions")
        .select("score, quizzes!inner(subject_id, subjects!inner(name))")
        .order("created_at", { ascending: false }),
      supabase
        .from("quizzes")
        .select("difficulty, id"),
    ]);

    const avgScore =
      recentSubmissions && recentSubmissions.length > 0
        ? Math.round(
            recentSubmissions.reduce((sum, s) => sum + s.score, 0) /
              recentSubmissions.length
          )
        : 0;

    const passRate =
      recentSubmissions && recentSubmissions.length > 0
        ? Math.round(
            (recentSubmissions.filter((s) => s.score >= 60).length /
              recentSubmissions.length) *
              100
          )
        : 0;

    const subjectPerformance =
      subjectStats?.reduce(
        (acc: Record<string, { total: number; count: number }>, item: any) => {
          const name = item.quizzes?.subjects?.name ?? "Unknown";
          if (!acc[name]) acc[name] = { total: 0, count: 0 };
          acc[name].total += item.score;
          acc[name].count += 1;
          return acc;
        },
        {}
      ) ?? {};

    const formattedSubjectPerformance = Object.entries(subjectPerformance).map(
      ([name, data]: [string, any]) => ({
        name,
        avgScore: Math.round(data.total / data.count),
      })
    );

    const difficultyDistribution =
      difficultyStats?.reduce(
        (acc: Record<string, number>, q: any) => {
          acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
          return acc;
        },
        {}
      ) ?? {};

    return successResponse({
      overview: {
        totalUsers: totalUsers ?? 0,
        totalSubjects: totalSubjects ?? 0,
        totalQuizzes: totalQuizzes ?? 0,
        totalQuestions: totalQuestions ?? 0,
        totalSubmissions: totalSubmissions ?? 0,
        avgScore,
        passRate,
      },
      recentSubmissions: recentSubmissions ?? [],
      subjectPerformance: formattedSubjectPerformance,
      difficultyDistribution,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch admin stats");
  }
}
