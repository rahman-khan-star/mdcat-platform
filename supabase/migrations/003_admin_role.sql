-- ============================================
-- Migration 003: Admin Role & RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add role column to profiles
alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

create index if not exists idx_profiles_role on public.profiles(role);

-- 2. Helper function: check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- 3. Drop existing overly-permissive policies
drop policy if exists "Subjects are publicly readable" on public.subjects;
drop policy if exists "Quizzes are publicly readable" on public.quizzes;
drop policy if exists "Questions are publicly readable" on public.questions;

-- 4. Subjects: public read, admin write
create policy "Subjects are publicly readable"
  on public.subjects for select
  using (true);

create policy "Admins can insert subjects"
  on public.subjects for insert
  with check (public.is_admin());

create policy "Admins can update subjects"
  on public.subjects for update
  using (public.is_admin());

create policy "Admins can delete subjects"
  on public.subjects for delete
  using (public.is_admin());

-- 5. Quizzes: public read active only, admin read all + write
drop policy if exists "Quizzes are publicly readable" on public.quizzes;

create policy "Active quizzes are publicly readable"
  on public.quizzes for select
  using (is_active = true or public.is_admin());

create policy "Admins can insert quizzes"
  on public.quizzes for insert
  with check (public.is_admin());

create policy "Admins can update quizzes"
  on public.quizzes for update
  using (public.is_admin());

create policy "Admins can delete quizzes"
  on public.quizzes for delete
  using (public.is_admin());

-- 6. Questions: public read, admin write
drop policy if exists "Questions are publicly readable" on public.questions;

create policy "Questions are publicly readable"
  on public.questions for select
  using (true);

create policy "Admins can insert questions"
  on public.questions for insert
  with check (public.is_admin());

create policy "Admins can update questions"
  on public.questions for update
  using (public.is_admin());

create policy "Admins can delete questions"
  on public.questions for delete
  using (public.is_admin());

-- 7. Quiz Submissions: users see own, admins see all
drop policy if exists "Users can view own submissions" on public.quiz_submissions;

create policy "Users can view own submissions"
  on public.quiz_submissions for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can view all submissions"
  on public.quiz_submissions for select
  using (public.is_admin());

-- 8. User Progress: users see own, admins see all
drop policy if exists "Users can view own progress" on public.user_progress;

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can view all progress"
  on public.user_progress for select
  using (public.is_admin());

-- 9. Profiles: users see own, admins see all
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- 10. Grant admin role to first user (run after creating your admin account)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
