import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    const { data, error } = await supabase
      .from("past_papers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return errorResponse("Past paper not found", 404);

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch past paper");
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = String(body.title).slice(0, 300);
    if (body.board !== undefined) updates.board = String(body.board).slice(0, 100);
    if (body.exam_type !== undefined) updates.exam_type = String(body.exam_type).slice(0, 100);
    if (body.year !== undefined) updates.year = Number(body.year);
    if (body.subject !== undefined) updates.subject = String(body.subject).slice(0, 100);
    if (body.description !== undefined) updates.description = String(body.description).slice(0, 1000);
    if (body.file_url !== undefined) updates.file_url = String(body.file_url).slice(0, 500);
    if (body.file_size !== undefined) updates.file_size = Number(body.file_size);
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const { data, error } = await supabase
      .from("past_papers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error("Failed to update past paper");

    return successResponse(data, "Past paper updated");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to update past paper");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    const { error } = await supabase
      .from("past_papers")
      .delete()
      .eq("id", id);

    if (error) throw new Error("Failed to delete past paper");

    return successResponse(null, "Past paper deleted");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to delete past paper");
  }
}
