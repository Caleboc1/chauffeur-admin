-- ============================================================
-- Migration: 20260505230012_create_global_settings.sql
-- Description: Platform-wide configuration values.
-- Depends on:  20260505230001_create_admins.sql, 20260505230003_create_driver_applications.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists global_settings (
  key           text primary key,
  value         text,
  description   text,
  updated_by    uuid references admins(id) on delete set null,
  updated_at    timestamptz not null default now()
);

-- ── Section 2: Triggers ───────────────────────────────────────

create trigger global_settings_updated_at
  before update on global_settings
  for each row execute function update_updated_at();

-- ── Section 3: Enable RLS ─────────────────────────────────────

alter table global_settings enable row level security;

-- ── Section 4: RLS Policies ───────────────────────────────────

-- Super Admin only can read/write
create policy "super_admin_manage_settings"
  on global_settings for all
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'super_admin'
    )
  );

-- All staff can read settings
create policy "staff_read_settings"
  on global_settings for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
    )
  );

-- ── Section 5: Seed Data ──────────────────────────────────────

insert into global_settings (key, value, description)
values
  ('global_commission_rate', '15', 'Default commission percentage for drivers'),
  ('support_email', 'support@chauffeur.com', 'Primary support contact email'),
  ('app_name', 'Chauffeur Admin', 'Dashboard application name'),
  ('default_language', 'en', 'Default system language')
on conflict (key) do nothing;
