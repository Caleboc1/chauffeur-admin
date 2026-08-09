-- 20260510000014_create_sos_tables.sql

create table sos_alerts (
  id uuid primary key default gen_random_uuid(),
  triggered_by text not null check (triggered_by in ('rider', 'driver')),
  user_id uuid not null,
  ride_id uuid references rides(id) on delete set null,
  sos_type text not null check (sos_type in ('message', 'voice_recording')),
  message_text text,
  voice_recording_url text,
  voice_duration_seconds integer,
  status text not null default 'active' check (status in ('active', 'responding', 'resolved', 'false_alarm')),
  location_address text,
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  triggered_at timestamptz not null,
  first_responded_by uuid references admins(id) on delete set null,
  first_responded_at timestamptz,
  resolved_by uuid references admins(id) on delete set null,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now()
);

create table sos_actions (
  id uuid primary key default gen_random_uuid(),
  sos_id uuid not null references sos_alerts(id) on delete cascade,
  admin_id uuid references admins(id) on delete set null,
  action_type text not null check (action_type in ('opened', 'called_user', 'called_emergency', 'sent_message', 'escalated', 'resolved', 'false_alarm', 'voice_played')),
  action_notes text,
  created_at timestamptz not null default now()
);

alter table sos_alerts enable row level security;
alter table sos_actions enable row level security;

-- sos_alerts RLS
create policy "all_admins_read_sos" on sos_alerts for select to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid())
);

create policy "all_admins_insert_sos" on sos_alerts for insert to authenticated with check (
  exists (select 1 from admins where auth_user_id = auth.uid())
);

create policy "ops_super_update_sos" on sos_alerts for update to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);

-- sos_actions RLS
create policy "all_admins_read_sos_actions" on sos_actions for select to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid())
);

create policy "all_admins_insert_sos_actions" on sos_actions for insert to authenticated with check (
  exists (select 1 from admins where auth_user_id = auth.uid())
);
