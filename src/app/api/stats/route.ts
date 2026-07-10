import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStats } from "@/services/stats.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    const data = await getStats(user.id);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch stats");
  }
}
