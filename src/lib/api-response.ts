import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function successResponse<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data };
  if (message) body.message = message;
  return NextResponse.json(body, { status });
}

export function errorResponse(error: string, status = 500) {
  const body: ApiResponse = { success: false, error };
  return NextResponse.json(body, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
