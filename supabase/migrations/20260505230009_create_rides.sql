-- ============================================================
-- Migration: 20260505230009_create_rides.sql
-- Description: Individual trip records.
-- Depends on:  20260505230007_create_riders.sql, 20260505230002_create_drivers.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists rides (
  id              uuid primary key default gen_random_uuid(),
  rider_id        uuid not null references riders(id) on delete set null,
  driver_id       uuid references drivers(id) on delete set null,
  trip_status     text not null default 'requested' check (trip_status in (
                    'requested',
                    'accepted',
                    'in_progress',
                    'completed',
                    'cancelled'
                  )),
  service_tier    text not null check (service_tier in ('standard', 'executive', 'premium')),
  pickup_address  text,
  dropoff_address text,
  fare            numeric(12,2),
  distance_km     numeric(8,2),
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_rides_rider_id   on rides(rider_id);
create index if not exists idx_rides_driver_id  on rides(driver_id);
create index if not exists idx_rides_status     on rides(trip_status);
create index if not exists idx_rides_created_at on rides(created_at);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table rides enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Ops Admin and Super Admin can read/write
create policy "ops_super_manage_rides"
  on rides for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin')
    )
  );

-- Support Agent read-only
create policy "support_read_rides"
  on rides for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'support_agent'
    )
  );
