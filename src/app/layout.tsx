import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MDCAT Pro - Ace Your MDCAT 2026",
    template: "%s | MDCAT Pro",
  },
  description:
    "Your comprehensive platform for MDCAT preparation with practice quizzes, progress tracking, leaderboards, and more.",
  keywords: ["MDCAT", "medical college", "Pakistan", "MCQs", "quiz", "practice", "2026"],
  openGraph: {
    title: "MDCAT Pro - Ace Your MDCAT 2026",
    description:
      "Practice with thousands of MCQs, track your progress, and join thousands of students preparing for MDCAT 2026.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
