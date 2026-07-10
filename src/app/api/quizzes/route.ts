import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllQuizzes } from "@/services/quiz.service";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { quizFiltersSchema } from "@/lib/validation";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = quizFiltersSchema.safeParse(params);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { quizzes, total } = await getAllQuizzes(parsed.data, user?.id);
    return paginatedResponse(quizzes, total, parsed.data.page, parsed.data.limit);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch quizzes");
  }
}
