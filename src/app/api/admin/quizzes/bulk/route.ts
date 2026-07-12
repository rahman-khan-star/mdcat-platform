import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

const MAX_QUESTIONS = 200;

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const { title, subject_id, duration_minutes, difficulty, is_active, questions } = body;

    if (!title || !subject_id) {
      return errorResponse("title and subject_id are required", 400);
    }

    if (typeof title !== "string" || title.length > 200) {
      return errorResponse("Invalid title", 400);
    }

    if (typeof subject_id !== "string" || subject_id.length > 50) {
      return errorResponse("Invalid subject_id", 400);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return errorResponse("At least one question is required", 400);
    }

    if (questions.length > MAX_QUESTIONS) {
      return errorResponse(`Too many questions. Maximum is ${MAX_QUESTIONS}`, 400);
    }

    // Validate difficulty
    const validDifficulties = ["Easy", "Medium", "Hard"];
    const safeDifficulty = validDifficulties.includes(difficulty) ? difficulty : "Medium";

    // Validate duration
    const safeDuration = Math.min(Math.max(Number(duration_minutes) || 30, 1), 180);

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        title: title.slice(0, 200),
        subject_id: subject_id.slice(0, 50),
        duration_minutes: safeDuration,
        difficulty: safeDifficulty,
        is_active: is_active !== false,
        question_count: questions.length,
      })
      .select("*, subjects!inner(id, name)")
      .single();

    if (quizError) throw new Error("Failed to create quiz");

    const questionsToInsert = questions
      .filter((q: Record<string, unknown>) => q.question_text && String(q.question_text).trim())
      .map((q: Record<string, unknown>, i: number) => ({
        quiz_id: quiz.id,
        question_text: String(q.question_text || "").trim().slice(0, 2000),
        options: Array.isArray(q.options) && q.options.length === 4
          ? (q.options as string[]).map((o) => String(o || "").trim().slice(0, 500))
          : ["", "", "", ""],
        correct_answer_index: Math.min(Math.max(Number(q.correct_answer_index) || 0, 0), 3),
        explanation: String(q.explanation || "").trim().slice(0, 2000),
        sort_order: i + 1,
      }));

    for (const q of questionsToInsert) {
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
