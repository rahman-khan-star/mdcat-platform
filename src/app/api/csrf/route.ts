import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const token = await generateCsrfToken(user.id);

    return successResponse({ token });
  } catch {
    return errorResponse("Failed to generate CSRF token");
  }
}
