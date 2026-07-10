import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitQuiz } from "@/services/quiz.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { quizSubmissionSchema } from "@/lib/validation";
import { parseJsonBody } from "@/lib/request";
import { AppError } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    const { id } = await params;
    const body = await parseJsonBody(request);

    const parsed = quizSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const result = await submitQuiz(id, parsed.data, user.id);
    return successResponse(result, "Quiz submitted successfully");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to submit quiz");
  }
}
