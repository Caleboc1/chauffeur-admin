-- ============================================================
-- Migration: 20260505230002_create_drivers.sql
-- Description: Core driver account record.
-- Depends on:  20260505230001_create_admins.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists drivers (
  id                    uuid primary key default gen_random_uuid(),
  auth_user_id          uuid unique references auth.users(id) on delete set null,
  full_name             text not null,
  email                 text unique not null,
  phone                 text not null,
  date_of_birth         date,
  residential_address   text,
  government_id_number  text,
  selfie_url            text,
  face_match_score      numeric(5,2),
  face_match_status     text check (face_match_status in ('pass', 'needs_review', 'fail')),
  status                text not null default 'offline' check (status in (
                          'active', 'offline', 'suspended', 'under_review'
                        )),
  verification_status   text not null default 'pending' check (verification_status in (
                          'pending', 'approved', 'rejected'
                        )),
  rating                numeric(3,2) default 0.00,
  commission_rate       numeric(5,2),  -- null = use global default
  created_at            timestamptz not null default now()
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_drivers_auth_user_id on drivers(auth_user_id);
create index if not exists idx_drivers_email        on drivers(email);
create index if not exists idx_drivers_status       on drivers(status);
create index if not exists idx_drivers_verification on drivers(verification_status);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table drivers enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Ops Admin and Super Admin can read/write
create policy "ops_and_super_manage_drivers"
  on drivers for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin')
    )
  );

-- Finance Admin read-only
create policy "finance_read_drivers"
  on drivers for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'finance_admin'
    )
  );

-- Support Agent read-only
create policy "support_read_drivers"
  on drivers for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'support_agent'
    )
  );
