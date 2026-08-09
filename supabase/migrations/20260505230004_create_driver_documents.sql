-- ============================================================
-- Migration: 20260505230004_create_driver_documents.sql
-- Description: Stores metadata and storage URLs for driver docs.
-- Depends on:  20260505230002_create_drivers.sql, 20260505230001_create_admins.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists driver_documents (
  id            uuid primary key default gen_random_uuid(),
  driver_id     uuid not null references drivers(id) on delete cascade,
  document_type text not null check (document_type in (
                  'government_id',
                  'drivers_licence',
                  'vehicle_insurance',
                  'vehicle_registration',
                  'selfie'
                )),
  storage_url   text not null,
  status        text not null default 'pending' check (status in (
                  'pending', 'approved', 'rejected', 'flagged_for_correction'
                )),
  rejection_reason text,
  reviewed_by   uuid references admins(id) on delete set null,
  uploaded_at   timestamptz not null default now(),
  reviewed_at   timestamptz
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_driver_docs_driver_id on driver_documents(driver_id);
create index if not exists idx_driver_docs_status    on driver_documents(status);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table driver_documents enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Ops Admin and Super Admin can manage
create policy "ops_and_super_manage_docs"
  on driver_documents for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin')
    )
  );

-- Drivers can insert their own documents (via authenticated user mapping)
create policy "drivers_upload_own_docs"
  on driver_documents for insert
  to authenticated
  with check (
    exists (
      select 1 from drivers
      where drivers.id = driver_id
      and drivers.auth_user_id = auth.uid()
    )
  );

-- Drivers can read their own documents
create policy "drivers_read_own_docs"
  on driver_documents for select
  to authenticated
  using (
    exists (
      select 1 from drivers
      where drivers.id = driver_id
      and drivers.auth_user_id = auth.uid()
    )
  );
