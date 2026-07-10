import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { errorResponse, paginatedResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { parseSearchParams, sanitizeSearch } from "@/lib/request";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const searchParams = parseSearchParams(request);
    const quizId = String(searchParams.quiz_id || "").slice(0, 50);
    const userId = String(searchParams.user_id || "").slice(0, 50);
    const page = Number(searchParams.page) || 1;
    const limit = Math.min(Number(searchParams.limit) || 20, 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("quiz_submissions")
      .select(
        "*, profiles!inner(id, full_name, email), quizzes!inner(id, title, subjects!inner(name))",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (quizId) {
      query = query.eq("quiz_id", quizId);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw new Error("Failed to fetch submissions");

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch submissions");
  }
}
