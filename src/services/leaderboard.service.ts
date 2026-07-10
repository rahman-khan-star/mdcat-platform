import { createClient } from "@/lib/supabase/server";
import type { LeaderboardEntry } from "@/types";

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("*")
    .order("rank", { ascending: true })
    .limit(50);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    rank: row.rank,
    name: row.name,
    avatar: row.avatar,
    score: row.total_score,
    quizzesCompleted: row.quizzes_completed,
    streak: row.streak,
  }));
}

export async function getTopThree(): Promise<LeaderboardEntry[]> {
  const entries = await getLeaderboard();
  return entries.slice(0, 3);
}

export async function getRankById(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("rank")
    .eq("user_id", userId)
    .single();

  if (error) return 0;
  return data?.rank ?? 0;
}
