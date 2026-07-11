import Hero from "@/components/Hero";
import SubjectCard from "@/components/SubjectCard";
import QuizCard from "@/components/QuizCard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, TrendingUp, Target, Flame, Award } from "lucide-react";
import type { Subject, Quiz } from "@/types";

async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    totalTopics: s.total_topics,
    completedTopics: 0,
    color: s.color,
    description: s.description,
  }));
}

async function getRecentQuizzes(): Promise<Quiz[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("*, subjects!inner(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (data ?? []).map((q) => ({
    id: q.id,
    title: q.title,
    subject: q.subjects?.name ?? "",
    subjectId: q.subject_id,
    questionCount: q.question_count,
    duration: q.duration_minutes,
    difficulty: q.difficulty,
    attempted: false,
    attempts: 0,
  }));
}

export default async function Home() {
  const [subjects, recentQuizzes] = await Promise.all([
    getSubjects(),
    getRecentQuizzes(),
  ]);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Your Subjects
            </h2>
            <p className="mt-2 text-text-secondary">
              Track your progress across all MDCAT subjects
            </p>
          </div>
          <Link
            href="/subjects"
            className="hidden items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {subjects.map((subject, i) => (
            <SubjectCard key={subject.id} subject={subject} index={i} />
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, label: "Average Score", value: "78.5%", color: "#2563eb" },
              { icon: Target, label: "Quizzes Done", value: "47", color: "#10b981" },
              { icon: Flame, label: "Study Streak", value: "12 days", color: "#f59e0b" },
              { icon: Award, label: "Top Rank", value: "#15", color: "#8b5cf6" },
            ].map((stat) => (
              <div key={stat.label} className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-default">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="h-6 w-6 transition-colors duration-300" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Recent Quizzes
            </h2>
            <p className="mt-2 text-text-secondary">
              Continue where you left off or try something new
            </p>
          </div>
          <Link
            href="/quiz"
            className="hidden items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recentQuizzes.map((quiz, i) => (
            <QuizCard key={quiz.id} quiz={quiz} index={i} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            View All Quizzes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to boost your MDCAT prep?
            </h2>
            <p className="mt-3 text-primary-light/80">
              Join thousands of students using MDCAT Pro to ace their exams. Start practicing today
              and track your improvement over time.
            </p>
            <Link
              href="/quiz"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
