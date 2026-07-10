import { z } from "zod";

export const quizFiltersSchema = z.object({
  search: z.string().optional(),
  subject: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const quizSubmissionSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)).min(1),
  timeTaken: z.number().int().min(0),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(20).optional(),
  city: z.string().min(1).max(100).optional(),
  targetYear: z.string().min(1).max(20).optional(),
  bio: z.string().max(500).optional(),
});

export type QuizFiltersInput = z.infer<typeof quizFiltersSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
