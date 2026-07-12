import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitQuiz } from "@/services/quiz.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { quizSubmissionSchema } from "@/lib/validation";
import { parseJsonBody } from "@/lib/request";
import { AppError } from "@/lib/errors";
import { securityLog } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get("x-request-id") || "unknown";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      securityLog.unauthorizedAccess(request.nextUrl.pathname, ip, "no auth", requestId);
      return errorResponse("Authentication required", 401);
    }

    // Check if email is verified
    if (!user.email_confirmed_at) {
      securityLog.unauthorizedAccess(request.nextUrl.pathname, ip, "email not verified", requestId);
      return errorResponse("Please verify your email before submitting quizzes", 403);
    }

    const { id } = await params;
    const body = await parseJsonBody(request);

    const parsed = quizSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const result = await submitQuiz(id, parsed.data, user.id);

    securityLog.quizSubmitted(user.id, id, result.score, requestId);

    return successResponse(result, "Quiz submitted successfully");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to submit quiz");
  }
}
