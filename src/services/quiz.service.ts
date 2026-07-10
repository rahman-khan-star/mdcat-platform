import { createClient } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";
import type {
  Quiz,
  Question,
  QuizFilters,
  QuizSubmission,
  QuizResult,
} from "@/types";

type Database = import("@/types/supabase").Database;
type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];
type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];

function mapQuiz(
  row: QuizRow & { subjects?: { name: string } | null }
): Quiz {
  return {
    id: row.id,
    title: row.title,
    subject: row.subjects?.name ?? "",
    subjectId: row.subject_id,
    questionCount: row.question_count,
    duration: row.duration_minutes,
    difficulty: row.difficulty,
    attempted: false,
    attempts: 0,
  };
}

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    question: row.question_text,
    options: row.options as string[],
    correctAnswer: row.correct_answer_index,
    explanation: row.explanation,
  };
}

export async function getAllQuizzes(
  filters: QuizFilters,
  userId?: string
): Promise<{ quizzes: Quiz[]; total: number }> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("quizzes")
    .select("*, subjects!inner(name)", { count: "exact" })
    .eq("is_active", true);

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,subjects.name.ilike.%${filters.search}%`
    );
  }

  if (filters.subject) {
    query = query.eq("subject_id", filters.subject);
  }

  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  let quizzes = (data ?? []).map(mapQuiz);

  if (userId && quizzes.length > 0) {
    const quizIds = quizzes.map((q) => q.id);
    const { data: submissions } = await supabase
      .from("quiz_submissions")
      .select("quiz_id, score")
      .eq("user_id", userId)
      .in("quiz_id", quizIds);

    if (submissions) {
      const bestScores = new Map<string, { best: number; attempts: number }>();
      for (const sub of submissions) {
        const existing = bestScores.get(sub.quiz_id) ?? { best: 0, attempts: 0 };
        bestScores.set(sub.quiz_id, {
          best: Math.max(existing.best, sub.score),
          attempts: existing.attempts + 1,
        });
      }
      quizzes = quizzes.map((q) => {
        const stats = bestScores.get(q.id);
        return {
          ...q,
          attempted: !!stats,
          score: stats?.best,
          bestScore: stats?.best,
          attempts: stats?.attempts ?? 0,
        };
      });
    }
  }

  return { quizzes, total: count ?? 0 };
}

export async function getQuizById(id: string): Promise<Quiz> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*, subjects!inner(name)")
    .eq("id", id)
    .single();

  if (error) throw new NotFoundError(`Quiz "${id}"`);
  return mapQuiz(data);
}

export async function getQuestionsByQuizId(quizId: string): Promise<Question[]> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("quizzes")
    .select("id")
    .eq("id", quizId)
    .single();

  if (error) throw new NotFoundError(`Quiz "${quizId}"`);

  const { data, error: qError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (qError) throw new Error(qError.message);
  return (data ?? []).map(mapQuestion);
}

export async function submitQuiz(
  quizId: string,
  submission: QuizSubmission,
  userId: string
): Promise<QuizResult> {
  const supabase = await createClient();

  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("correct_answer_index")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (qError) throw new Error(qError.message);

  const correct = submission.answers.reduce((count, answer, i) => {
    return count + (answer === questions[i]?.correct_answer_index ? 1 : 0);
  }, 0);

  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  const { error: insertError } = await supabase
    .from("quiz_submissions")
    .insert({
      user_id: userId,
      quiz_id: quizId,
      answers: submission.answers,
      score,
      correct_count: correct,
      total_questions: total,
      time_taken_seconds: submission.timeTaken,
      passed: score >= 60,
    });

  if (insertError) throw new Error(insertError.message);

  return {
    quizId,
    score,
    correct,
    total,
    timeTaken: submission.timeTaken,
    passed: score >= 60,
  };
}
