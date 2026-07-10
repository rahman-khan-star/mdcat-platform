export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Subject {
  id: string;
  name: string;
  icon: string;
  totalTopics: number;
  completedTopics: number;
  color: string;
  description: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  questionCount: number;
  duration: number;
  difficulty: Difficulty;
  attempted: boolean;
  score?: number;
  bestScore?: number;
  attempts: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  quizzesCompleted: number;
  streak: number;
}

export interface WeeklyData {
  day: string;
  score: number;
  quizzes: number;
}

export interface SubjectPerformance {
  subject: string;
  score: number;
  fill: string;
}

export interface MonthlyProgress {
  month: string;
  score: number;
}

export interface StatsData {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  studyStreak: number;
  totalStudyTime: string;
  weeklyData: WeeklyData[];
  subjectPerformance: SubjectPerformance[];
  monthlyProgress: MonthlyProgress[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  targetYear: string;
  bio: string;
  joinDate: string;
  rank: number;
  stats: {
    quizzesTaken: number;
    averageScore: number;
    bestStreak: number;
    studyTime: string;
  };
  achievements: Achievement[];
}

export interface Achievement {
  title: string;
  description: string;
  icon: string;
}

export interface QuizSubmission {
  answers: number[];
  timeTaken: number;
}

export interface QuizResult {
  quizId: string;
  quizTitle: string;
  subject: string;
  score: number;
  correct: number;
  wrong: number;
  unattempted: number;
  total: number;
  timeTaken: number;
  passed: boolean;
  questions: QuizResultQuestion[];
}

export interface QuizResultQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  selectedAnswer: number;
  isCorrect: boolean;
  isUnattempted: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QuizFilters {
  search?: string;
  subject?: string;
  difficulty?: Difficulty;
  page?: number;
  limit?: number;
}
