-- ============================================================
-- Migration: 20260505230010_create_complaints.sql
-- Description: Dispute and support tickets.
-- Depends on:  20260505230001_create_admins.sql, 20260505230009_create_rides.sql, 20260505230003_create_driver_applications.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists complaints (
  id                uuid primary key default gen_random_uuid(),
  trip_id           uuid references rides(id) on delete set null,
  complainant_type  text not null check (complainant_type in ('rider', 'driver')),
  complainant_id    uuid not null,  -- references riders.id or drivers.id depending on type
  reported_user_id  uuid,
  category          text not null check (category in (
                      'rider_complaint',
                      'driver_complaint',
                      'payment_issue',
                      'safety_report'
                    )),
  severity          text not null default 'low' check (severity in (
                      'low', 'medium', 'high', 'critical'
                    )),
  state             text not null default 'open' check (state in (
                      'open', 'in_progress', 'resolved', 'escalated', 'closed'
                    )),
  description       text not null,
  resolution_notes  text,
  assigned_to       uuid references admins(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_complaints_trip_id   on complaints(trip_id);
create index if not exists idx_complaints_category  on complaints(category);
create index if not exists idx_complaints_severity  on complaints(severity);
create index if not exists idx_complaints_state     on complaints(state);

-- ── Section 3: Triggers ───────────────────────────────────────

create trigger complaints_updated_at
  before update on complaints
  for each row execute function update_updated_at();

-- ── Section 4: Enable RLS ─────────────────────────────────────

alter table complaints enable row level security;

-- ── Section 5: RLS Policies ───────────────────────────────────

-- Support Agent and above can read and update state
create policy "support_manage_complaints"
  on complaints for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin', 'support_agent')
    )
  );

-- Only Super Admin can delete
create policy "super_delete_complaints"
  on complaints for delete
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'super_admin'
    )
  );
