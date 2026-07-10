import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/quiz"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Allow auth callback
  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  // Check if the path matches protected routes
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected || isAuthRoute) {
    // Read cookies to check auth status
    const cookies = request.cookies;
    const hasSession = cookies.has("sb-access-token") || cookies.has("sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").replace(".supabase.co", "") + "-auth-token");

    // Simple check - the actual auth check happens in the API/routes
    // This middleware just refreshes the session
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
