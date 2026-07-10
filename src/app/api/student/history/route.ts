import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from("quiz_submissions")
      .select(
        "id, quiz_id, score, correct_count, total_questions, time_taken_seconds, passed, created_at, quizzes!inner(id, title, subject_id, difficulty, subjects!inner(id, name, color))",
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    const history =
      data?.map((s) => {
        const quiz = Array.isArray(s.quizzes) ? s.quizzes[0] : s.quizzes;
        const subject = Array.isArray(quiz?.subjects) ? quiz?.subjects[0] : quiz?.subjects;
        return {
          id: s.id,
          quizId: s.quiz_id,
          quizTitle: quiz?.title ?? "Unknown",
          subjectName: subject?.name ?? "Unknown",
          subjectColor: subject?.color ?? "#2563eb",
          difficulty: quiz?.difficulty ?? "Medium",
          score: s.score,
          correctCount: s.correct_count,
          totalQuestions: s.total_questions,
          timeTaken: s.time_taken_seconds,
          passed: s.passed,
          date: s.created_at,
        };
      }) ?? [];

    return paginatedResponse(history, count ?? 0, page, limit);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to load history");
  }
}
