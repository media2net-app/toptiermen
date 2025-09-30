-- Enable required extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Create table for user activities
create table if not exists public.user_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null, -- e.g. academy.lesson_completed, training.day_completed
  title text not null,
  icon text,          -- optional icon key
  details jsonb,      -- arbitrary extra data
  meta jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_user_activities_user_created on public.user_activities (user_id, created_at desc);
create index if not exists idx_user_activities_activity_type on public.user_activities (activity_type);

-- Row Level Security (if RLS enabled)
alter table public.user_activities enable row level security;

-- Policies (read own, insert own) - CREATE POLICY does not support IF NOT EXISTS
-- Drop existing (if any) and recreate to avoid errors on re-run
drop policy if exists "user_activities_select_own" on public.user_activities;
create policy "user_activities_select_own"
  on public.user_activities
  for select
  using (auth.uid() = user_id);

drop policy if exists "user_activities_insert_own" on public.user_activities;
create policy "user_activities_insert_own"
  on public.user_activities
  for insert
  with check (auth.uid() = user_id);
