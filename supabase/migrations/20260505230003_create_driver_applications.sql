-- ============================================================
-- Migration: 20260505230003_create_driver_applications.sql
-- Description: Tracks the onboarding state machine for each driver.
--              Includes shared update_updated_at function.
-- Depends on:  20260505230001_create_admins.sql, 20260505230002_create_drivers.sql
-- ============================================================

-- ── Section 1: Shared Functions ───────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Section 2: Table ──────────────────────────────────────────

create table if not exists driver_applications (
  id              uuid primary key default gen_random_uuid(),
  driver_id       uuid not null references drivers(id) on delete cascade,
  state           text not null default 'new' check (state in (
                    'new',
                    'under_review',
                    'correction_requested',
                    'inspection_scheduled',
                    'approved',
                    'rejected'
                  )),
  rejection_reason text,  -- required when state = 'rejected'
  reviewed_by     uuid references admins(id) on delete set null,
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Section 3: Indexes ────────────────────────────────────────

create index if not exists idx_driver_apps_driver_id on driver_applications(driver_id);
create index if not exists idx_driver_apps_state     on driver_applications(state);

-- ── Section 4: Triggers ───────────────────────────────────────

create trigger driver_applications_updated_at
  before update on driver_applications
  for each row execute function update_updated_at();

-- ── Section 5: Enable RLS ─────────────────────────────────────

alter table driver_applications enable row level security;

-- ── Section 6: RLS Policies ───────────────────────────────────

-- Ops Admin and Super Admin can read/write
create policy "ops_and_super_manage_apps"
  on driver_applications for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin')
    )
  );
