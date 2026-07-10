"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, GraduationCap } from "lucide-react";

export default function ConfirmPage() {
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
        We&apos;ve sent a confirmation link to your email address.
        Please check your inbox and click the link to verify your account.
      </p>
      <div className="mt-6 space-y-3">
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
        >
          Go to Login
        </Link>
        <p className="text-xs text-text-muted">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    </motion.div>
  );
}
