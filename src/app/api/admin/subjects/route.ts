import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { parseSearchParams, sanitizeSearch } from "@/lib/request";
import { adminSubjectSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const searchParams = parseSearchParams(request);
    const search = sanitizeSearch(String(searchParams.search || ""));
    const page = Number(searchParams.page) || 1;
    const limit = Math.min(Number(searchParams.limit) || 20, 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("subjects")
      .select("*", { count: "exact" })
      .order("sort_order");

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw new Error("Failed to fetch subjects");

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch subjects");
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const { name, icon, description, color, total_topics, sort_order } = body;

    if (!name || !icon) {
      return errorResponse("name and icon are required", 400);
    }

    const id = slugify(name);

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        id,
        name: String(name).slice(0, 100),
        icon: String(icon).slice(0, 50),
        description: String(description || "").slice(0, 500),
        color: String(color || "#2563eb"),
        total_topics: Number(total_topics) || 0,
        sort_order: Number(sort_order) || 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return errorResponse("A subject with this name already exists", 409);
      }
      throw new Error("Failed to create subject");
    }

    return successResponse(data, "Subject created", 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to create subject");
  }
}
