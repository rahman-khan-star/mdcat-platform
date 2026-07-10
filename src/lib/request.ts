import { NextRequest } from "next/server";
import { AppError } from "./errors";

export function parseSearchParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function getIdFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const id = segments[segments.length - 1];
  if (!id || id === "api") {
    throw new AppError(400, "Invalid resource ID");
  }
  return id;
}

export async function parseJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    throw new AppError(400, "Invalid JSON body");
  }
}
