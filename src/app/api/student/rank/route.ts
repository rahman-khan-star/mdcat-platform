import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    const { data, error } = await supabase
      .from("leaderboard_view")
      .select("rank, total_score, quizzes_completed, streak")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return successResponse({
        rank: 0,
        totalScore: 0,
        quizzesCompleted: 0,
        streak: 0,
        totalUsers: 0,
      });
    }

    const { count: totalUsers } = await supabase
      .from("leaderboard_view")
      .select("*", { count: "exact", head: true });

    return successResponse({
      rank: data.rank,
      totalScore: data.total_score,
      quizzesCompleted: data.quizzes_completed,
      streak: data.streak,
      totalUsers: totalUsers ?? 0,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to load rank");
  }
}
