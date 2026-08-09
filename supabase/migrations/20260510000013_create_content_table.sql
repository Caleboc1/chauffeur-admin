-- 20260510000013_create_content_table.sql

create table platform_content (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('faq', 'privacy_policy', 'terms_of_service', 'company_policy')),
  audience text not null check (audience in ('driver', 'rider', 'both')),
  title text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version integer not null default 1,
  published_at timestamptz,
  published_by uuid references admins(id) on delete set null,
  created_by uuid references admins(id) on delete set null,
  updated_by uuid references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table content_version_history (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references platform_content(id) on delete cascade,
  version integer not null,
  body_snapshot text not null,
  published_by uuid references admins(id) on delete set null,
  published_at timestamptz not null default now()
);

alter table platform_content enable row level security;
alter table content_version_history enable row level security;

-- platform_content RLS
create policy "super_admin_all_content" on platform_content for all to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role = 'super_admin')
) with check (
  exists (select 1 from admins where auth_user_id = auth.uid() and role = 'super_admin')
);

create policy "ops_admin_read_content" on platform_content for select to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role = 'ops_admin')
);

create policy "ops_admin_insert_content" on platform_content for insert to authenticated with check (
  exists (select 1 from admins where auth_user_id = auth.uid() and role = 'ops_admin')
  and status = 'draft'
);

create policy "ops_admin_update_content" on platform_content for update to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role = 'ops_admin')
  and status = 'draft'
) with check (
  exists (select 1 from admins where auth_user_id = auth.uid() and role = 'ops_admin')
  and status = 'draft'
);

-- content_version_history RLS
create policy "super_admin_insert_content_history" on content_version_history for insert to authenticated with check (
  exists (select 1 from admins where auth_user_id = auth.uid() and role = 'super_admin')
);

create policy "super_admin_read_content_history" on content_version_history for select to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role = 'super_admin')
);
