import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { securityLog } from "@/lib/logger";

const protectedRoutes = ["/dashboard", "/profile", "/quiz"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
const adminRoutes = ["/admin"];

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_AUTH = 10;
const RATE_LIMIT_MAX_ADMIN = 30;

function checkRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

function hasValidCsrfOrigin(request: NextRequest): boolean {
  const method = request.method;
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const requestId = generateRequestId();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  // CSRF protection
  if (!hasValidCsrfOrigin(request)) {
    securityLog.csrfViolation(ip, request.nextUrl.pathname, requestId);
    return NextResponse.json(
      { success: false, error: "Invalid request origin" },
      { status: 403 }
    );
  }

  const { pathname } = request.nextUrl;

  // Rate limit auth endpoints
  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/signup")) {
    const rateKey = `auth:${ip}:${pathname}`;
    if (!checkRateLimit(rateKey, RATE_LIMIT_MAX_AUTH)) {
      securityLog.rateLimitHit(ip, pathname, requestId);
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Rate limit admin API endpoints
  if (pathname.startsWith("/api/admin")) {
    const rateKey = `admin:${ip}`;
    if (!checkRateLimit(rateKey, RATE_LIMIT_MAX_ADMIN)) {
      securityLog.rateLimitHit(ip, pathname, requestId);
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  const supabaseResponse = await updateSession(request);

  // Add request ID header to response
  supabaseResponse.headers.set("X-Request-ID", requestId);

  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const hasSession = request.cookies.has(
    "sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").replace(".supabase.co", "") + "-auth-token"
  );

  if ((isProtected || isAdminRoute) && !hasSession) {
    if (isAdminRoute) {
      securityLog.unauthorizedAccess(pathname, ip, "no session", requestId);
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
