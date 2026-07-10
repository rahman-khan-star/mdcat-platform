-- ============================================
-- MDCAT Pro Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text default '',
  city text default '',
  target_year text default 'MDCAT 2026',
  bio text default '',
  avatar_url text default '',
  rank integer default 0,
  study_streak integer default 0,
  total_study_time_seconds integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 2. SUBJECTS
-- ============================================
create table public.subjects (
  id text primary key,
  name text not null,
  icon text not null,
  description text not null default '',
  color text not null default '#2563eb',
  total_topics integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.subjects enable row level security;

create policy "Subjects are publicly readable"
  on public.subjects for select
  using (true);

-- ============================================
-- 3. QUIZZES
-- ============================================
create table public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subject_id text not null references public.subjects(id) on delete cascade,
  question_count integer not null default 0,
  duration_minutes integer not null default 30,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quizzes enable row level security;

create policy "Quizzes are publicly readable"
  on public.quizzes for select
  using (is_active = true);

create index idx_quizzes_subject_id on public.quizzes(subject_id);
create index idx_quizzes_difficulty on public.quizzes(difficulty);

-- ============================================
-- 4. QUESTIONS
-- ============================================
create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer_index integer not null check (correct_answer_index between 0 and 3),
  explanation text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

create policy "Questions are publicly readable"
  on public.questions for select
  using (true);

create index idx_questions_quiz_id on public.questions(quiz_id);

-- ============================================
-- 5. QUIZ SUBMISSIONS (results)
-- ============================================
create table public.quiz_submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  answers jsonb not null default '[]'::jsonb,
  score integer not null default 0,
  correct_count integer not null default 0,
  total_questions integer not null default 0,
  time_taken_seconds integer not null default 0,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.quiz_submissions enable row level security;

create policy "Users can view own submissions"
  on public.quiz_submissions for select
  using (auth.uid() = user_id);

create policy "Users can insert own submissions"
  on public.quiz_submissions for insert
  with check (auth.uid() = user_id);

create index idx_submissions_user_id on public.quiz_submissions(user_id);
create index idx_submissions_quiz_id on public.quiz_submissions(quiz_id);
create index idx_submissions_user_quiz on public.quiz_submissions(user_id, quiz_id);
create index idx_submissions_created_at on public.quiz_submissions(created_at desc);

-- ============================================
-- 6. USER PROGRESS (per subject)
-- ============================================
create table public.user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null references public.subjects(id) on delete cascade,
  completed_topics integer not null default 0,
  total_attempts integer not null default 0,
  best_score integer not null default 0,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, subject_id)
);

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can upsert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

create index idx_progress_user_id on public.user_progress(user_id);
create index idx_progress_subject_id on public.user_progress(subject_id);

-- ============================================
-- 7. LEADERBOARD VIEW (computed)
-- ============================================
create or replace view public.leaderboard_view as
select
  p.id as user_id,
  p.full_name as name,
  coalesce(nullif(p.avatar_url, ''), substr(p.full_name, 1, 2)) as avatar,
  coalesce(sum(qs.score), 0) as total_score,
  count(qs.id) as quizzes_completed,
  p.study_streak as streak,
  rank() over (order by coalesce(sum(qs.score), 0) desc) as rank
from public.profiles p
left join public.quiz_submissions qs on qs.user_id = p.id
group by p.id, p.full_name, p.avatar_url, p.study_streak
order by total_score desc;

-- ============================================
-- 8. STATS FUNCTION
-- ============================================
create or replace function public.get_user_stats(p_user_id uuid)
returns json as $$
declare
  v_total_quizzes integer;
  v_avg_score numeric;
  v_total_questions integer;
  v_correct_answers integer;
  v_study_streak integer;
  v_study_time text;
begin
  select
    count(*),
    coalesce(avg(score), 0),
    coalesce(sum(total_questions), 0),
    coalesce(sum(correct_count), 0)
  into v_total_quizzes, v_avg_score, v_total_questions, v_correct_answers
  from public.quiz_submissions
  where user_id = p_user_id;

  select study_streak, total_study_time_seconds
  into v_study_streak, v_study_time
  from public.profiles
  where id = p_user_id;

  v_study_time := format(
    '%sh %sm',
    v_study_time / 3600,
    (v_study_time % 3600) / 60
  );

  return json_build_object(
    'totalQuizzes', v_total_quizzes,
    'averageScore', round(v_avg_score, 1),
    'totalQuestions', v_total_questions,
    'correctAnswers', v_correct_answers,
    'studyStreak', v_study_streak,
    'totalStudyTime', v_study_time
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- 9. UPDATED_AT TRIGGER
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.update_updated_at();

create trigger update_progress_updated_at
  before update on public.user_progress
  for each row execute function public.update_updated_at();
