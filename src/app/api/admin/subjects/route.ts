import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { parseSearchParams } from "@/lib/request";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { supabase } = await requireAdmin();
    const searchParams = parseSearchParams(request);
    const search = (searchParams.search as string) || "";
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("subjects")
      .select("*", { count: "exact" })
      .order("sort_order");

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw new Error(error.message);

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch subjects");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const { id, name, icon, description, color, total_topics, sort_order } = body;

    if (!id || !name || !icon) {
      return errorResponse("id, name, and icon are required", 400);
    }

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        id,
        name,
        icon,
        description: description || "",
        color: color || "#2563eb",
        total_topics: total_topics || 0,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return errorResponse("A subject with this ID already exists", 409);
      }
      throw new Error(error.message);
    }

    return successResponse(data, "Subject created", 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to create subject");
  }
}
