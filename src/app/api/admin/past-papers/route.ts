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
    const board = String(searchParams.board || "").slice(0, 50);
    const examType = String(searchParams.exam_type || "").slice(0, 50);
    const year = Number(searchParams.year) || 0;
    const page = Number(searchParams.page) || 1;
    const limit = Math.min(Number(searchParams.limit) || 20, 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("past_papers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (board) {
      query = query.eq("board", board);
    }
    if (examType) {
      query = query.eq("exam_type", examType);
    }
    if (year) {
      query = query.eq("year", year);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw new Error("Failed to fetch past papers");

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch past papers");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const { title, board, exam_type, year, subject, description, file_url, file_size, is_active } = body;

    if (!title || !board || !exam_type || !year) {
      return errorResponse("title, board, exam_type, and year are required", 400);
    }

    const { data, error } = await supabase
      .from("past_papers")
      .insert({
        title: String(title).slice(0, 300),
        board: String(board).slice(0, 100),
        exam_type: String(exam_type).slice(0, 100),
        year: Number(year),
        subject: String(subject || "").slice(0, 100),
        description: String(description || "").slice(0, 1000),
        file_url: String(file_url || "").slice(0, 500),
        file_size: Number(file_size) || 0,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) throw new Error("Failed to create past paper");

    return successResponse(data, "Past paper created", 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to create past paper");
  }
}
