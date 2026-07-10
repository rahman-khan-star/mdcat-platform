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
      .from("quizzes")
      .select("*, subjects!inner(id, name)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Quiz not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch quiz");
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
    if (body.title !== undefined) updates.title = body.title;
    if (body.subject_id !== undefined) updates.subject_id = body.subject_id;
    if (body.question_count !== undefined) updates.question_count = body.question_count;
    if (body.duration_minutes !== undefined) updates.duration_minutes = body.duration_minutes;
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const { data, error } = await supabase
      .from("quizzes")
      .update(updates)
      .eq("id", id)
      .select("*, subjects!inner(id, name)")
      .single();

    if (error) throw new Error(error.message);
    if (!data) return errorResponse("Quiz not found", 404);

    return successResponse(data, "Quiz updated");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to update quiz");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    const { error } = await supabase.from("quizzes").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return successResponse(null, "Quiz deleted");
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to delete quiz");
  }
}
