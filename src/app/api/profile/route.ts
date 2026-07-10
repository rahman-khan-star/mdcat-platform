import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile, updateProfile } from "@/services/profile.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { profileUpdateSchema } from "@/lib/validation";
import { parseJsonBody } from "@/lib/request";
import { AppError } from "@/lib/errors";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    const data = await getProfile(user.id);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch profile");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    const body = await parseJsonBody(request);

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const data = await updateProfile(user.id, parsed.data);
    return successResponse(data, "Profile updated successfully");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to update profile");
  }
}
