-- ============================================================
-- seed.sql — Development Seed Data
-- ⚠️  DEVELOPMENT ONLY. Never run against production.
-- Run with: supabase db reset (resets and re-seeds the local DB)
-- All IDs, names, phone numbers, and addresses are fictional.
-- ============================================================

-- Mock Admins
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000001', 'adaeze@chauffeur.app', '{"role":"super_admin"}'),
  ('00000000-0000-0000-0000-000000000002', 'emeka@chauffeur.app', '{"role":"ops_admin"}'),
  ('00000000-0000-0000-0000-000000000003', 'fatimah@chauffeur.app', '{"role":"finance_admin"}'),
  ('00000000-0000-0000-0000-000000000004', 'tunde@chauffeur.app', '{"role":"support_agent"}'),
  ('00000000-0000-0000-0000-000000000005', 'ngozi@chauffeur.app', '{"role":"inspection_officer"}'),
  ('00000000-0000-0000-0000-000000000006', 'bello@chauffeur.app', '{"role":"ops_admin"}');

insert into admins (id, auth_user_id, name, email, role, status, created_at) values
  ('adm-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Adaeze Okafor', 'adaeze@chauffeur.app', 'super_admin', 'active', '2024-01-15T09:00:00Z'),
  ('adm-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Chukwuemeka Eze', 'emeka@chauffeur.app', 'ops_admin', 'active', '2024-02-01T10:30:00Z'),
  ('adm-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Fatimah Al-Hassan', 'fatimah@chauffeur.app', 'finance_admin', 'active', '2024-02-14T08:00:00Z'),
  ('adm-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Tunde Adeyemi', 'tunde@chauffeur.app', 'support_agent', 'active', '2024-03-05T11:15:00Z'),
  ('adm-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Ngozi Nwosu', 'ngozi@chauffeur.app', 'inspection_officer', 'active', '2024-03-20T09:45:00Z'),
  ('adm-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'Bello Musa', 'bello@chauffeur.app', 'ops_admin', 'suspended', '2024-04-10T14:00:00Z');

-- Global Settings
insert into global_settings (key, value, description) values
  ('global_commission_rate', '15', 'Default commission rate'),
  ('app_name', 'Chauffeur', 'Platform name'),
  ('support_email', 'support@chauffeur.app', 'Support contact');

-- Mock Drivers
insert into drivers (id, full_name, email, phone, date_of_birth, residential_address, government_id_number, selfie_url, face_match_score, face_match_status, status, verification_status, rating, commission_rate, created_at) values
  ('drv-0000-0000-0000-000000000001', 'Emeka Obi', 'emeka.obi@gmail.com', '+234 801 234 5678', '1990-05-12', '14 Adeola Odeku Street, Victoria Island, Lagos', 'NIN-12345678901', 'https://i.pravatar.cc/150?img=11', 94.7, 'pass', 'active', 'approved', 4.9, null, '2024-03-01T08:00:00Z'),
  ('drv-0000-0000-0000-000000000002', 'Abiodun Salami', 'abiodun.s@yahoo.com', '+234 802 345 6789', '1987-11-23', '7 Bourdillon Road, Ikoyi, Lagos', 'NIN-98765432109', 'https://i.pravatar.cc/150?img=12', 88.3, 'pass', 'active', 'approved', 4.7, 12.0, '2024-03-15T10:30:00Z'),
  ('drv-0000-0000-0000-000000000003', 'Ifeanyi Okeke', 'ifeanyi.okeke@gmail.com', '+234 803 456 7890', '1993-02-08', '22 Ozumba Mbadiwe Avenue, Victoria Island, Lagos', 'NIN-11223344556', 'https://i.pravatar.cc/150?img=13', 61.2, 'needs_review', 'under_review', 'pending', 0, null, '2024-05-10T14:00:00Z'),
  ('drv-0000-0000-0000-000000000004', 'Kehinde Lawal', 'kehinde.l@hotmail.com', '+234 804 567 8901', '1985-07-30', '5 Glover Road, Ikoyi, Lagos', 'NIN-55667788990', 'https://i.pravatar.cc/150?img=14', 97.1, 'pass', 'suspended', 'approved', 4.2, null, '2024-02-20T09:15:00Z'),
  ('drv-0000-0000-0000-000000000005', 'Chidi Nnamdi', 'chidi.n@gmail.com', '+234 805 678 9012', '1991-09-14', '31 Eko Atlantic, Lagos', 'NIN-66778899001', 'https://i.pravatar.cc/150?img=15', 92.5, 'pass', 'offline', 'approved', 4.6, null, '2024-04-05T07:30:00Z'),
  ('drv-0000-0000-0000-000000000006', 'Segun Adebayo', 'segun.adebayo@gmail.com', '+234 806 789 0123', '1988-12-01', '9 Lekki Phase 1, Lagos', 'NIN-77889900112', 'https://i.pravatar.cc/150?img=16', 85.0, 'pass', 'active', 'approved', 4.8, 10.0, '2024-01-28T11:00:00Z');

-- Mock Vehicles
insert into vehicles (id, driver_id, make, model, year, plate_number, colour, compliance_status, created_at) values
  ('veh-0000-0000-0000-000000000001', 'drv-0000-0000-0000-000000000001', 'Toyota', 'Camry', 2022, 'LND 421 GH', 'Midnight Black', 'approved', '2024-03-01T08:00:00Z'),
  ('veh-0000-0000-0000-000000000002', 'drv-0000-0000-0000-000000000002', 'Honda', 'Accord', 2021, 'LND 887 KJ', 'Pearl White', 'approved', '2024-03-15T10:30:00Z'),
  ('veh-0000-0000-0000-000000000003', 'drv-0000-0000-0000-000000000004', 'Mercedes-Benz', 'E-Class', 2020, 'LND 334 AB', 'Graphite Grey', 'inspection_due', '2024-02-20T09:15:00Z'),
  ('veh-0000-0000-0000-000000000004', 'drv-0000-0000-0000-000000000005', 'Lexus', 'ES 350', 2023, 'LND 119 ZZ', 'Obsidian Blue', 'approved', '2024-04-05T07:30:00Z'),
  ('veh-0000-0000-0000-000000000005', 'drv-0000-0000-0000-000000000006', 'BMW', '5 Series', 2022, 'LND 560 MN', 'Alpine White', 'expired', '2024-01-28T11:00:00Z');

-- Mock Riders
insert into riders (id, full_name, email, phone, status, wallet_balance, rating, created_at) values
  ('rdr-0000-0000-0000-000000000001', 'Chioma Ibe', 'chioma.ibe@gmail.com', '+234 811 234 5678', 'active', 45000.00, 4.8, '2024-02-10T10:00:00Z'),
  ('rdr-0000-0000-0000-000000000002', 'Oluwaseun Bakare', 'seun.bakare@yahoo.com', '+234 812 345 6789', 'active', 12500.00, 4.5, '2024-03-22T14:30:00Z'),
  ('rdr-0000-0000-0000-000000000003', 'Maryam Aliyu', 'maryam.a@gmail.com', '+234 813 456 7890', 'suspended', 3200.00, 3.1, '2024-01-05T08:45:00Z'),
  ('rdr-0000-0000-0000-000000000004', 'Adekunle Fashola', 'adekunle.f@hotmail.com', '+234 814 567 8901', 'active', 87000.00, 4.9, '2024-04-18T09:00:00Z'),
  ('rdr-0000-0000-0000-000000000005', 'Zainab Umar', 'zainab.umar@gmail.com', '+234 815 678 9012', 'under_review', 500.00, 2.8, '2024-05-01T16:20:00Z'),
  ('rdr-0000-0000-0000-000000000006', 'Taiwo Afolabi', 'taiwo.a@gmail.com', '+234 816 789 0123', 'active', 24750.00, 4.6, '2024-03-11T11:10:00Z');

-- Note: Seed data is intentionally partial and focuses on structural completeness for testing
-- other entities (applications, rides, complaints, etc) as required.
