-- ============================================================
-- Migration: 20260505230006_create_inspections.sql
-- Description: Records of physical inspections.
-- Depends on:  20260505230002_create_drivers.sql, 20260505230005_create_vehicles.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists inspections (
  id                      uuid primary key default gen_random_uuid(),
  driver_id               uuid not null references drivers(id) on delete cascade,
  vehicle_id              uuid references vehicles(id) on delete set null,
  scheduled_at            timestamptz not null,
  location                text not null,
  assigned_inspector_id   uuid references admins(id) on delete set null,
  notes_for_driver        text,
  vehicle_condition       text check (vehicle_condition in ('pass', 'fail')),
  document_verification   text check (document_verification in ('pass', 'fail')),
  identity_match          text check (identity_match in ('pass', 'fail')),
  inspector_notes         text,
  result                  text default 'pending' check (result in ('pending', 'pass', 'fail')),
  completed_at            timestamptz,
  created_at              timestamptz not null default now()
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_inspections_driver_id    on inspections(driver_id);
create index if not exists idx_inspections_inspector_id on inspections(assigned_inspector_id);
create index if not exists idx_inspections_result       on inspections(result);
create index if not exists idx_inspections_scheduled    on inspections(scheduled_at);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table inspections enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Ops Admin and Super Admin can manage
create policy "ops_and_super_manage_inspections"
  on inspections for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin')
    )
  );

-- Inspection Officers can update result fields (column restriction in API)
create policy "inspectors_manage_inspections"
  on inspections for update
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'inspection_officer'
    )
  )
  with check (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'inspection_officer'
    )
  );

-- Inspection Officers can read
create policy "inspectors_read_inspections"
  on inspections for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'inspection_officer'
    )
  );
