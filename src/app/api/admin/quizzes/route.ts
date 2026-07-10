import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { parseSearchParams, sanitizeSearch } from "@/lib/request";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const searchParams = parseSearchParams(request);
    const search = sanitizeSearch(String(searchParams.search || ""));
    const subject = String(searchParams.subject || "").slice(0, 50);
    const difficulty = String(searchParams.difficulty || "");
    const page = Number(searchParams.page) || 1;
    const limit = Math.min(Number(searchParams.limit) || 20, 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("quizzes")
      .select("*, subjects!inner(id, name)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (subject) {
      query = query.eq("subject_id", subject);
    }
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw new Error("Failed to fetch quizzes");

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch quizzes");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const { title, subject_id, duration_minutes, difficulty, is_active } = body;

    if (!title || !subject_id) {
      return errorResponse("title and subject_id are required", 400);
    }

    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        title: String(title).slice(0, 200),
        subject_id: String(subject_id).slice(0, 50),
        duration_minutes: Math.min(Number(duration_minutes) || 30, 180),
        difficulty: ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium",
        is_active: is_active !== false,
      })
      .select("*, subjects!inner(id, name)")
      .single();

    if (error) throw new Error("Failed to create quiz");

    return successResponse(data, "Quiz created", 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to create quiz");
  }
}
