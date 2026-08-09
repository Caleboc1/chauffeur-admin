-- 20260510000012_create_vip_tables.sql

create table vip_vehicles (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  year integer not null,
  plate_number text unique not null,
  colour text not null,
  status text not null default 'available' check (status in ('available', 'in_use', 'maintenance', 'retired')),
  exterior_image_urls text[] not null default '{}',
  interior_image_urls text[] not null default '{}',
  amenities text[] not null default '{}',
  capacity integer not null default 4,
  description text,
  added_by uuid references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vip_bookings (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references riders(id) on delete cascade,
  driver_id uuid references drivers(id) on delete set null,
  vehicle_id uuid references vip_vehicles(id) on delete set null,
  booking_type text not null check (booking_type in ('instant', 'scheduled')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  pickup_address text not null,
  pickup_lat numeric(10,7) not null,
  pickup_lng numeric(10,7) not null,
  destination_address text not null,
  destination_lat numeric(10,7) not null,
  destination_lng numeric(10,7) not null,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  fare numeric(12,2),
  special_requests text,
  admin_notes text,
  assigned_by uuid references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vip_driver_assignments (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(id) on delete cascade,
  booking_id uuid references vip_bookings(id) on delete set null,
  assignment_status text not null default 'unassigned' check (assignment_status in ('unassigned', 'assigned', 'accepted', 'declined')),
  vip_certified boolean not null default false,
  vip_certified_by uuid references admins(id) on delete set null,
  vip_certified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table vip_vehicles enable row level security;
alter table vip_bookings enable row level security;
alter table vip_driver_assignments enable row level security;

-- vip_vehicles RLS
create policy "ops_super_read_vip_vehicles" on vip_vehicles for select to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);
create policy "ops_super_insert_vip_vehicles" on vip_vehicles for insert to authenticated with check (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);
create policy "ops_super_update_vip_vehicles" on vip_vehicles for update to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);

-- vip_bookings RLS
create policy "ops_super_read_vip_bookings" on vip_bookings for select to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin', 'support_agent'))
);
create policy "ops_super_insert_vip_bookings" on vip_bookings for insert to authenticated with check (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);
create policy "ops_super_update_vip_bookings" on vip_bookings for update to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);

-- vip_driver_assignments RLS
create policy "ops_super_read_vip_driver_assignments" on vip_driver_assignments for select to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);
create policy "ops_super_insert_vip_driver_assignments" on vip_driver_assignments for insert to authenticated with check (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);
create policy "ops_super_update_vip_driver_assignments" on vip_driver_assignments for update to authenticated using (
  exists (select 1 from admins where auth_user_id = auth.uid() and role in ('super_admin', 'ops_admin'))
);
