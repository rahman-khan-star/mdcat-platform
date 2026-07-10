import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { parseSearchParams } from "@/lib/request";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const searchParams = parseSearchParams(request);
    const quizId = (searchParams.quiz_id as string) || "";
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("questions")
      .select("*, quizzes!inner(id, title, subject_id)", { count: "exact" })
      .order("sort_order");

    if (quizId) {
      query = query.eq("quiz_id", quizId);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw new Error(error.message);

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch questions");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const { quiz_id, question_text, options, correct_answer_index, explanation, sort_order } = body;

    if (!quiz_id || !question_text || !options || correct_answer_index === undefined) {
      return errorResponse("quiz_id, question_text, options, and correct_answer_index are required", 400);
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return errorResponse("options must be an array of 4 items", 400);
    }

    if (correct_answer_index < 0 || correct_answer_index > 3) {
      return errorResponse("correct_answer_index must be between 0 and 3", 400);
    }

    const { data, error } = await supabase
      .from("questions")
      .insert({
        quiz_id,
        question_text,
        options,
        correct_answer_index,
        explanation: explanation || "",
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update quiz question count
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", quiz_id);

    await supabase
      .from("quizzes")
      .update({ question_count: count ?? 0 })
      .eq("id", quiz_id);

    return successResponse(data, "Question created", 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to create question");
  }
}
