-- ============================================================
-- Migration: 20260505230007_create_riders.sql
-- Description: Passenger account records.
-- Depends on:  none
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists riders (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid unique references auth.users(id) on delete set null,
  full_name             text not null,
  email           text unique not null,
  phone                 text not null,
  status          text not null default 'active' check (status in (
                    'active', 'suspended', 'banned', 'under_review'
                  )),
  wallet_balance  numeric(12,2) not null default 0.00,
  rating          numeric(3,2) default 5.00,
  created_at      timestamptz not null default now(),
  last_active_at  timestamptz
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_riders_auth_user_id on riders(auth_user_id);
create index if not exists idx_riders_email        on riders(email);
create index if not exists idx_riders_status       on riders(status);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table riders enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Support Agent and above can read
create policy "staff_read_riders"
  on riders for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin', 'support_agent', 'finance_admin')
    )
  );

-- Ops Admin and Super Admin can update status
create policy "ops_super_manage_riders"
  on riders for update
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin')
    )
  );

-- Finance Admin can update wallet_balance (column restriction in API)
create policy "finance_manage_wallet"
  on riders for update
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'finance_admin'
    )
  );
