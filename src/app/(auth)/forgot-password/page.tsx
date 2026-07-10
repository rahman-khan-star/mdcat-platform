"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, GraduationCap, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    setIsSent(true);
    setIsLoading(false);
  };

  if (isSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
          <CheckCircle2 className="h-7 w-7 text-secondary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-text-primary">Check your email</h1>
        <p className="mt-2 text-sm text-text-secondary">
          We sent a password reset link to <span className="font-medium text-text-primary">{email}</span>
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <GraduationCap className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-text-primary">Reset password</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-xl bg-danger/5 p-3 text-center text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="font-medium text-primary hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </p>
    </motion.div>
  );
}
