import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Subject not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch subject");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.description !== undefined) updates.description = body.description;
    if (body.color !== undefined) updates.color = body.color;
    if (body.total_topics !== undefined) updates.total_topics = body.total_topics;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

    const { data, error } = await supabase
      .from("subjects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return errorResponse("Subject not found", 404);

    return successResponse(data, "Subject updated");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to update subject");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    const { error } = await supabase.from("subjects").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return successResponse(null, "Subject deleted");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to delete subject");
  }
}
