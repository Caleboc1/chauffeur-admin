-- ============================================================
-- Migration: 20260505230001_create_admins.sql
-- Description: Stores all internal admin users.
-- Depends on:  none
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists admins (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid unique references auth.users(id) on delete cascade,
  name            text not null,
  email           text unique not null,
  role            text not null check (role in (
                    'super_admin',
                    'ops_admin',
                    'finance_admin',
                    'support_agent',
                    'inspection_officer'
                  )),
  status          text not null default 'active' check (status in ('active', 'suspended')),
  created_at      timestamptz not null default now()
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_admins_auth_user_id on admins(auth_user_id);
create index if not exists idx_admins_email        on admins(email);
create index if not exists idx_admins_role         on admins(role);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table admins enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Admins can read their own row
create policy "admins can read own profile"
  on admins for select
  to authenticated
  using (auth.uid() = auth_user_id);

-- Super admin can manage all admins
create policy "super_admin can manage all admins"
  on admins for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'super_admin'
    )
  );
