import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { success: false, error: "Password is too long" },
        { status: 400 }
      );
    }

    const sanitizedName = typeof fullName === "string"
      ? fullName.replace(/[<>"'&]/g, "").trim().slice(0, 100)
      : "";

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { full_name: sanitizedName },
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Could not create account" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: data.user ? { id: data.user.id, email: data.user.email } : null },
      message: "Account created. Please check your email to confirm.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
