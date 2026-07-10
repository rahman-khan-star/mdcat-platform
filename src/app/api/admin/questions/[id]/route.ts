import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    const { data, error } = await supabase
      .from("questions")
      .select("*, quizzes!inner(id, title)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Question not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch question");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.question_text !== undefined) updates.question_text = body.question_text;
    if (body.options !== undefined) updates.options = body.options;
    if (body.correct_answer_index !== undefined) updates.correct_answer_index = body.correct_answer_index;
    if (body.explanation !== undefined) updates.explanation = body.explanation;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

    if (body.options && !Array.isArray(body.options)) {
      return errorResponse("options must be an array", 400);
    }

    if (body.correct_answer_index !== undefined && (body.correct_answer_index < 0 || body.correct_answer_index > 3)) {
      return errorResponse("correct_answer_index must be between 0 and 3", 400);
    }

    const { data, error } = await supabase
      .from("questions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return errorResponse("Question not found", 404);

    return successResponse(data, "Question updated");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to update question");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    // Get quiz_id before deleting
    const { data: question } = await supabase
      .from("questions")
      .select("quiz_id")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw new Error(error.message);

    // Update quiz question count
    if (question) {
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", question.quiz_id);

      await supabase
        .from("quizzes")
        .update({ question_count: count ?? 0 })
        .eq("id", question.quiz_id);
    }

    return successResponse(null, "Question deleted");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to delete question");
  }
}
