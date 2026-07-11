import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { parseSearchParams } from "@/lib/request";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = parseSearchParams(request);
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
      .eq("is_active", true)
      .order("year", { ascending: false });

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
  } catch {
    return errorResponse("Failed to fetch past papers");
  }
}
