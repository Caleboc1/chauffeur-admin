-- ============================================================
-- Migration: 20260505230005_create_vehicles.sql
-- Description: Vehicle directory and compliance tracking.
-- Depends on:  20260505230002_create_drivers.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists vehicles (
  id                  uuid primary key default gen_random_uuid(),
  driver_id           uuid not null references drivers(id) on delete cascade,
  make                text not null,
  model               text not null,
  year                integer not null,
  colour              text,
  plate_number        text unique not null,
  -- ⚠️ DEVIATION: Added 'pending' to check constraint to match default
  compliance_status   text not null default 'pending' check (compliance_status in (
                        'pending',
                        'approved',
                        'inspection_due',
                        'suspended',
                        'expired'
                      )),
  created_at          timestamptz not null default now()
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_vehicles_driver_id     on vehicles(driver_id);
create index if not exists idx_vehicles_plate         on vehicles(plate_number);
create index if not exists idx_vehicles_compliance    on vehicles(compliance_status);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table vehicles enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Ops Admin and Super Admin can manage
create policy "ops_and_super_manage_vehicles"
  on vehicles for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin')
    )
  );

-- Support Agent read-only
create policy "support_read_vehicles"
  on vehicles for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'support_agent'
    )
  );
