import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getQuizById } from "@/services/quiz.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const data = await getQuizById(id, user?.id);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch quiz");
  }
}
