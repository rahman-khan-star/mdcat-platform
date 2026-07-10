import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id, is_active")
      .eq("id", id)
      .single();

    if (quizError || !quiz) {
      return errorResponse("Quiz not found", 404);
    }

    if (!quiz.is_active) {
      return errorResponse("Quiz not available", 404);
    }

    const { data, error } = await supabase
      .from("questions")
      .select("id, question_text, options, sort_order")
      .eq("quiz_id", id)
      .order("sort_order");

    if (error) {
      return errorResponse("Failed to fetch questions");
    }

    const safeQuestions = (data ?? []).map((q) => ({
      id: q.id,
      question: q.question_text,
      options: q.options,
    }));

    return successResponse(safeQuestions);
  } catch {
    return errorResponse("Failed to fetch questions");
  }
}
