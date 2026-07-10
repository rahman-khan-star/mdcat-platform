import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { parseSearchParams } from "@/lib/request";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const searchParams = parseSearchParams(request);
    const search = (searchParams.search as string) || "";
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("profiles")
      .select(
        "id, full_name, email, role, study_streak, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: profiles, count, error } = await query.range(from, to);
    if (error) throw new Error(error.message);

    // Get submission stats for each user
    const userIds = profiles?.map((p) => p.id) ?? [];

    const { data: submissionStats } = await supabase
      .from("quiz_submissions")
      .select("user_id, score")
      .in("user_id", userIds);

    const statsMap =
      submissionStats?.reduce(
        (acc: Record<string, { total: number; count: number; best: number }>, s) => {
          if (!acc[s.user_id]) acc[s.user_id] = { total: 0, count: 0, best: 0 };
          acc[s.user_id].total += s.score;
          acc[s.user_id].count += 1;
          acc[s.user_id].best = Math.max(acc[s.user_id].best, s.score);
          return acc;
        },
        {}
      ) ?? {};

    const users =
      profiles?.map((p) => {
        const stats = statsMap[p.id] ?? { total: 0, count: 0, best: 0 };
        return {
          ...p,
          quizzesCompleted: stats.count,
          avgScore: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
          bestScore: stats.best,
        };
      }) ?? [];

    return paginatedResponse(users, count ?? 0, page, limit);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch users");
  }
}
