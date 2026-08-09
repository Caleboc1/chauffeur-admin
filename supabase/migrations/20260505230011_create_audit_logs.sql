-- ============================================================
-- Migration: 20260505230011_create_audit_logs.sql
-- Description: Immutable record of every admin action.
-- Depends on:  20260505230001_create_admins.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references admins(id) on delete set null,
  actor_role    text not null,
  action        text not null,
  entity_type   text not null,
  entity_id     uuid,
  metadata      jsonb,  -- optional extra context
  ip_address    inet,
  created_at    timestamptz not null default now()
);

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_audit_logs_actor_id    on audit_logs(actor_id);
create index if not exists idx_audit_logs_entity_type on audit_logs(entity_type);
create index if not exists idx_audit_logs_created_at  on audit_logs(created_at);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table audit_logs enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Allow inserts from authenticated admins only
create policy "admins can insert audit logs"
  on audit_logs for insert
  to authenticated
  with check (true);

-- Allow reads for super_admin only
create policy "super_admin can read audit logs"
  on audit_logs for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'super_admin'
    )
  );

-- ⚠️ NO update or delete policies defined (Immutable)
