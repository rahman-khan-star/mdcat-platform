import { NextRequest } from "next/server";
import { getAllSubjects, searchSubjects } from "@/services/subject.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const data = search ? await searchSubjects(search) : await getAllSubjects();
    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to fetch subjects");
  }
}
