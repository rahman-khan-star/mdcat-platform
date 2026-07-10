import { createClient } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";
import type { UserProfile } from "@/types";
import type { ProfileUpdateInput } from "@/lib/validation";

type ProfileRow = import("@/types/supabase").Database["public"]["Tables"]["profiles"]["Row"];

function mapProfile(row: ProfileRow): UserProfile {
  const hours = Math.floor(row.total_study_time_seconds / 3600);
  const minutes = Math.floor((row.total_study_time_seconds % 3600) / 60);

  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    targetYear: row.target_year,
    bio: row.bio,
    joinDate: row.created_at.split("T")[0],
    rank: row.rank,
    stats: {
      quizzesTaken: 0,
      averageScore: 0,
      bestStreak: row.study_streak,
      studyTime: `${hours}h ${minutes}m`,
    },
    achievements: [
      { title: "First Quiz", description: "Completed your first quiz", icon: "First Step" },
      { title: "Perfect Score", description: "Scored 100% on a quiz", icon: "Gold" },
      { title: "Week Warrior", description: "7-day study streak", icon: "Fire" },
      { title: "Biology Master", description: "Scored 90%+ in Biology", icon: "Science" },
    ],
  };
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new NotFoundError("Profile");

  const profile = mapProfile(data);

  const { data: statsData } = await supabase.rpc("get_user_stats", {
    p_user_id: userId,
  });

  if (statsData) {
    const stats = statsData as {
      totalQuizzes: number;
      averageScore: number;
      studyStreak: number;
      totalStudyTime: string;
    };
    profile.stats.quizzesTaken = stats.totalQuizzes;
    profile.stats.averageScore = stats.averageScore;
    profile.stats.bestStreak = stats.studyStreak;
  }

  return profile;
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput
): Promise<UserProfile> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.full_name = input.name;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.targetYear !== undefined) updateData.target_year = input.targetYear;
  if (input.bio !== undefined) updateData.bio = input.bio;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (error) throw new Error(error.message);

  return getProfile(userId);
}
