import { z } from "zod";

export function sanitizeSearch(input: string): string {
  return input.replace(/[(),|\\]/g, "").trim().slice(0, 200);
}

export const quizFiltersSchema = z.object({
  search: z.string().optional(),
  subject: z.string().max(50).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const quizSubmissionSchema = z.object({
  answers: z.array(z.number().int().min(-1).max(3)),
  timeTaken: z.number().int().min(0).max(7200),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  city: z.string().min(1).max(100).optional(),
  targetYear: z.string().min(1).max(20).optional(),
  bio: z.string().max(500).optional(),
});

export const adminSubjectSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  icon: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  total_topics: z.number().int().min(0).max(1000).optional(),
  sort_order: z.number().int().min(0).max(100).optional(),
});

export const adminQuizSchema = z.object({
  title: z.string().min(1).max(200),
  subject_id: z.string().min(1).max(50),
  duration_minutes: z.number().int().min(1).max(180).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  is_active: z.boolean().optional(),
});

export const adminQuestionSchema = z.object({
  quiz_id: z.string().uuid(),
  question_text: z.string().min(1).max(2000),
  options: z.array(z.string().min(1).max(500)).length(4),
  correct_answer_index: z.number().int().min(0).max(3),
  explanation: z.string().max(2000).optional(),
  sort_order: z.number().int().min(0).max(100).optional(),
});

export type QuizFiltersInput = z.infer<typeof quizFiltersSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
