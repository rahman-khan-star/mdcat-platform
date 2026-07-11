import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const { title, subject_id, duration_minutes, difficulty, is_active, questions } = body;

    if (!title || !subject_id) {
      return errorResponse("title and subject_id are required", 400);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return errorResponse("At least one question is required", 400);
    }

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        title: String(title).slice(0, 200),
        subject_id: String(subject_id).slice(0, 50),
        duration_minutes: Math.min(Number(duration_minutes) || 30, 180),
        difficulty: ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium",
        is_active: is_active !== false,
        question_count: questions.length,
      })
      .select("*, subjects!inner(id, name)")
      .single();

    if (quizError) throw new Error("Failed to create quiz");

    const questionsToInsert = questions.map((q: Record<string, unknown>, i: number) => ({
      quiz_id: quiz.id,
      question_text: String(q.question_text || "").slice(0, 2000),
      options: Array.isArray(q.options) && q.options.length === 4
        ? (q.options as string[]).map((o) => String(o).slice(0, 500))
        : ["", "", "", ""],
      correct_answer_index: Number(q.correct_answer_index) || 0,
      explanation: String(q.explanation || "").slice(0, 2000),
      sort_order: i + 1,
    }));

    for (const q of questionsToInsert) {
      if (!q.question_text) continue;
      const { error } = await supabase.from("questions").insert(q);
      if (error) throw new Error("Failed to insert question");
    }

    return successResponse(quiz, "Quiz created with questions", 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to create quiz");
  }
}
