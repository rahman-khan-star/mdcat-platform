export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          city: string;
          target_year: string;
          bio: string;
          avatar_url: string;
          rank: number;
          study_streak: number;
          total_study_time_seconds: number;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email?: string;
          phone?: string;
          city?: string;
          target_year?: string;
          bio?: string;
          avatar_url?: string;
          rank?: number;
          study_streak?: number;
          total_study_time_seconds?: number;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          city?: string;
          target_year?: string;
          bio?: string;
          avatar_url?: string;
          rank?: number;
          study_streak?: number;
          total_study_time_seconds?: number;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          icon: string;
          description: string;
          color: string;
          total_topics: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          icon: string;
          description?: string;
          color?: string;
          total_topics?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          description?: string;
          color?: string;
          total_topics?: number;
          sort_order?: number;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          subject_id: string;
          question_count: number;
          duration_minutes: number;
          difficulty: "Easy" | "Medium" | "Hard";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subject_id: string;
          question_count?: number;
          duration_minutes?: number;
          difficulty: "Easy" | "Medium" | "Hard";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subject_id?: string;
          question_count?: number;
          duration_minutes?: number;
          difficulty?: "Easy" | "Medium" | "Hard";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          options: Json;
          correct_answer_index: number;
          explanation: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          options: Json;
          correct_answer_index: number;
          explanation?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question_text?: string;
          options?: Json;
          correct_answer_index?: number;
          explanation?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      quiz_submissions: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          answers: Json;
          score: number;
          correct_count: number;
          total_questions: number;
          time_taken_seconds: number;
          passed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          answers: Json;
          score?: number;
          correct_count?: number;
          total_questions?: number;
          time_taken_seconds?: number;
          passed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          answers?: Json;
          score?: number;
          correct_count?: number;
          total_questions?: number;
          time_taken_seconds?: number;
          passed?: boolean;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          completed_topics: number;
          total_attempts: number;
          best_score: number;
          last_attempt_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          completed_topics?: number;
          total_attempts?: number;
          best_score?: number;
          last_attempt_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          completed_topics?: number;
          total_attempts?: number;
          best_score?: number;
          last_attempt_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      leaderboard_view: {
        Row: {
          user_id: string;
          name: string;
          avatar: string;
          total_score: number;
          quizzes_completed: number;
          streak: number;
          rank: number;
        };
      };
    };
    Functions: {
      get_user_stats: {
        Args: { p_user_id: string };
        Returns: Json;
      };
    };
  };
}
