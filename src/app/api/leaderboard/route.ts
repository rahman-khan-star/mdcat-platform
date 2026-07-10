import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/services/leaderboard.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(_request: NextRequest) {
  try {
    const data = await getLeaderboard();
    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch leaderboard");
  }
}
