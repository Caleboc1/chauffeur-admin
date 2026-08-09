# AGENTS.md — Chauffeur Admin Dashboard

> This file provides context, constraints, and behavioural instructions for any AI agent working on this codebase inside Google Antigravity. Read this file fully before planning or executing any task.

---

## 1. Project Overview

You are building the **Chauffeur Admin Dashboard** — an internal, role-gated web application used by the Chauffeur operations team to manage every aspect of a premium ride-hailing platform.

This is not a customer-facing product. It is a back-office control panel used daily by:
- Operations Admins managing driver onboarding and compliance
- Finance Admins overseeing earnings, commissions, and refunds
- Support Agents resolving rider and driver complaints
- Inspection Officers recording physical vehicle and identity checks
- Super Admins with unrestricted access to all modules

The platform must feel professional, dense with information, and optimised for operational efficiency — not marketing aesthetics.

---

## 2. Source of Truth

The full Product Requirement Document (PRD) is the single source of truth for all features, data models, workflows, and UI requirements.

**PRD file:** `Chauffeur_Admin_PRD.docx` (located in the project root)

Before implementing any feature, module, or component, consult the PRD. If there is any ambiguity between the PRD and a prompt instruction, **the PRD takes precedence**. Flag the conflict to the user before proceeding.

---

## 3. Tech Stack

The stack is confirmed. Do not deviate from it, suggest alternatives, or introduce additional libraries without explicit user approval.

### Frontend
| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (plain — no utility frameworks unless instructed) |
| Scripting | JavaScript (ES6+) |
| UI Framework | React |

- Use React functional components and hooks throughout
- Do not install component libraries (e.g. MUI, Ant Design, Chakra) unless the user explicitly approves
- Co-locate component styles where practical; use CSS modules or plain CSS files — not inline style objects unless unavoidable
- All forms must be controlled components in React state — no uncontrolled inputs

### Backend
| Layer | Technology |
|---|---|
| Database & Auth | Supabase (Postgres + Supabase Auth + Row Level Security) |
| API / SSR Layer | Next.js **or** React (confirm with user before scaffolding) |

> ⚠️ Next.js vs plain React has **not yet been finalised**. Before creating any routing structure, API routes, or server-side logic, ask the user which to use. Do not assume one or the other.

### Supabase-Specific Rules
- Use **Row Level Security (RLS)** on every table — no table should be publicly readable or writable without a policy
- Use Supabase Auth for all admin authentication — do not build a custom auth system
- All admin roles must be stored and enforced server-side (Supabase `user_metadata` or a separate `admins` table), never trust the client for role claims
- Use Supabase **Realtime** for the live activity feed and live ride map where applicable
- Use Supabase **Storage** for all document uploads (driver licences, insurance docs, vehicle photos, selfies)
- Never expose the Supabase `service_role` key on the client — it must only be used in server-side contexts (Next.js API routes or server components)

---

## 4. Role-Based Access Control (RBAC)

Every module in the dashboard is gated by user role. The five roles and their permissions are defined in **Section 11 of the PRD**. Enforce these at every level:

| Role | Key Scope |
|---|---|
| Super Admin | Unrestricted — all modules including system settings and audit logs |
| Operations Admin | Driver applications, inspections, rides, vehicles — no financials |
| Finance Admin | Earnings, commissions, payouts, accounting, refunds — no profiles |
| Support Agent | Complaints and support tickets — read-only profile access |
| Inspection Officer | Record and view inspection results only |

When building any UI component or API endpoint, always ask: *which roles should see or interact with this?* Never render admin-only actions to lower-privilege roles.

---

## 5. Core Modules

Build and scope work against these 17 modules as defined in the PRD. Do not combine, rename, or reorder them without user instruction.

1. Dashboard (KPI cards + real-time activity feed)
2. Driver Management (application review, approval workflow, directory)
3. Rider Management (profiles, wallet, behaviour monitoring, safety)
4. Ride Monitoring (live map, trip history, SOS alerts)
5. Vehicle Management (directory, compliance, re-inspection)
6. Earnings & Commission Management
7. Complaints & Dispute Resolution
8. Accounting Module (reports, exports)
9. Notification Center (push, SMS, email)
10. User Roles & Permissions (admin account management)
11. Settings (payment gateways, SMS gateways, language, regions)
12. Web Settings / CMS (public-facing content management)
13. Audit Logs (immutable, append-only)
14. Driver Approval Workflow (end-to-end onboarding pipeline)
15. Data Model Reference (9 core entities)
16. Sidebar Navigation Structure
17. Role Permissions Matrix

---

## 6. Critical Workflows — Handle With Care

The following workflows have strict business logic. Do not simplify or shortcut them:

### Driver Approval Workflow (PRD Section 15)
1. Application submitted → document review → correction request (if needed) → inspection scheduling → physical verification → inspection outcome → final decision → audit log entry
- Rejection **requires** a mandatory reason selected from a predefined list
- All decisions must be recorded in the Audit Log with the acting admin's identity and timestamp

### Inspection Scheduling (PRD Section 3.1)
- Must capture: date, time, location, assigned inspector, and notes for the driver
- A notification must be sent to the driver upon scheduling

### Wallet Adjustments (PRD Section 4.3)
- Adding or deducting rider credits requires a mandatory written reason
- Every adjustment must be logged in the audit trail

### Manual Commission Deductions (PRD Section 7.4)
- Requires an amount and a written reason
- Must be logged in the Audit Trail

---

## 7. Audit Log Rules

The Audit Log (PRD Section 14) is **immutable**. It must:
- Record every admin action that modifies platform data
- Capture: actor ID, role, action description, entity type, entity ID, timestamp, and IP address
- Never expose a delete or edit endpoint for audit records — not even for Super Admin
- Be append-only at the database level wherever possible

---

## 8. Data Models & Database Schema

The following schemas define all core entities. These are the canonical definitions — implement them exactly in Supabase. Column types, constraints, foreign keys, and RLS requirements are all specified below.

> All tables use `uuid` primary keys generated by `gen_random_uuid()`. All timestamps are `timestamptz` defaulting to `now()`. Enable RLS on every table.

---

### `admins`
Stores all internal admin users. Linked to Supabase Auth via `auth_user_id`.

```sql
create table admins (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid unique references auth.users(id) on delete cascade,
  name            text not null,
  email           text unique not null,
  role            text not null check (role in (
                    'super_admin',
                    'ops_admin',
                    'finance_admin',
                    'support_agent',
                    'inspection_officer'
                  )),
  status          text not null default 'active' check (status in ('active', 'suspended')),
  created_at      timestamptz not null default now()
);
```

**RLS:** Admins can read their own row. Super Admin can read and write all rows.

---

### `drivers`
Core driver account record. One row per driver.

```sql
create table drivers (
  id                    uuid primary key default gen_random_uuid(),
  auth_user_id          uuid unique references auth.users(id) on delete set null,
  full_name             text not null,
  email                 text unique not null,
  phone                 text not null,
  date_of_birth         date,
  residential_address   text,
  government_id_number  text,
  selfie_url            text,
  face_match_score      numeric(5,2),
  face_match_status     text check (face_match_status in ('pass', 'needs_review', 'fail')),
  status                text not null default 'offline' check (status in (
                          'active', 'offline', 'suspended', 'under_review'
                        )),
  verification_status   text not null default 'pending' check (verification_status in (
                          'pending', 'approved', 'rejected'
                        )),
  rating                numeric(3,2) default 0.00,
  commission_rate       numeric(5,2),  -- null = use global default
  created_at            timestamptz not null default now()
);
```

**RLS:** Ops Admin and Super Admin can read/write. Finance Admin read-only on commission_rate. Support Agent read-only.

---

### `driver_applications`
Tracks the onboarding state machine for each driver.

```sql
create table driver_applications (
  id              uuid primary key default gen_random_uuid(),
  driver_id       uuid not null references drivers(id) on delete cascade,
  state           text not null default 'new' check (state in (
                    'new',
                    'under_review',
                    'inspection_scheduled',
                    'approved',
                    'rejected'
                  )),
  rejection_reason text,  -- required when state = 'rejected'
  reviewed_by     uuid references admins(id) on delete set null,
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

**RLS:** Ops Admin and Super Admin can read/write. All state transitions must be validated — a row may not skip states arbitrarily.

---

### `driver_documents`
Stores metadata and storage URLs for all uploaded driver documents.

```sql
create table driver_documents (
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
```

**RLS:** Drivers can insert their own documents. Ops Admin and Super Admin can update status.

---

### `vehicles`
One vehicle per driver (extendable to many-to-one later).

```sql
create table vehicles (
  id                  uuid primary key default gen_random_uuid(),
  driver_id           uuid not null references drivers(id) on delete cascade,
  make                text not null,
  model               text not null,
  year                integer not null,
  colour              text,
  plate_number        text unique not null,
  compliance_status   text not null default 'pending' check (compliance_status in (
                        'approved',
                        'inspection_due',
                        'suspended',
                        'expired'
                      )),
  created_at          timestamptz not null default now()
);
```

**RLS:** Ops Admin and Super Admin can read/write.

---

### `inspections`
Records of scheduled and completed physical inspections.

```sql
create table inspections (
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
```

**RLS:** Inspection Officers can update result fields. Ops Admin and Super Admin can read/write all fields.

---

### `riders`
Passenger account records.

```sql
create table riders (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid unique references auth.users(id) on delete set null,
  full_name       text not null,
  email           text unique not null,
  phone           text not null,
  status          text not null default 'active' check (status in (
                    'active', 'suspended', 'banned', 'under_review'
                  )),
  wallet_balance  numeric(12,2) not null default 0.00,
  rating          numeric(3,2) default 5.00,
  created_at      timestamptz not null default now(),
  last_active_at  timestamptz
);
```

**RLS:** Support Agent and above can read. Ops Admin and Super Admin can update status. Finance Admin can update wallet_balance.

---

### `wallet_transactions`
All rider wallet activity — immutable once inserted.

```sql
create table wallet_transactions (
  id              uuid primary key default gen_random_uuid(),
  rider_id        uuid not null references riders(id) on delete cascade,
  type            text not null check (type in (
                    'top_up',
                    'ride_payment',
                    'refund',
                    'manual_adjustment'
                  )),
  amount          numeric(12,2) not null,  -- positive = credit, negative = debit
  reason          text,  -- required when type = 'manual_adjustment'
  performed_by    uuid references admins(id) on delete set null,  -- null for system/automated
  created_at      timestamptz not null default now()
);
```

**RLS:** No updates or deletes permitted on any row. Finance Admin and Super Admin can insert manual_adjustment rows.

---

### `rides`
Individual trip records.

```sql
create table rides (
  id              uuid primary key default gen_random_uuid(),
  rider_id        uuid not null references riders(id) on delete set null,
  driver_id       uuid references drivers(id) on delete set null,
  trip_status     text not null default 'requested' check (trip_status in (
                    'requested',
                    'accepted',
                    'in_progress',
                    'completed',
                    'cancelled'
                  )),
  service_tier    text not null check (service_tier in ('standard', 'executive', 'premium')),
  pickup_address  text,
  dropoff_address text,
  fare            numeric(12,2),
  distance_km     numeric(8,2),
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);
```

**RLS:** Ops Admin and Super Admin can read all. Support Agent read-only for complaint context.

---

### `complaints`
All dispute and support tickets.

```sql
create table complaints (
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
```

**RLS:** Support Agent and above can read and update state. Only Super Admin can delete (soft-delete preferred).

---

### `audit_logs`
Immutable record of every admin action. No updates or deletes — ever.

```sql
create table audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references admins(id) on delete set null,
  actor_role    text not null,
  action        text not null,
  entity_type   text not null,
  entity_id     uuid,
  metadata      jsonb,  -- optional extra context (e.g. before/after values)
  ip_address    inet,
  created_at    timestamptz not null default now()
);
```

**RLS policy (critical):**
```sql
-- Allow inserts from authenticated admins only
create policy "admins can insert audit logs"
  on audit_logs for insert
  to authenticated
  with check (true);

-- Allow reads for super_admin only
create policy "super_admin can read audit logs"
  on audit_logs for select
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role = 'super_admin'
    )
  );

-- NO update or delete policies — omitting them enforces immutability
```

---

### `global_settings`
Platform-wide configuration values. Single row or key-value store.

```sql
create table global_settings (
  key           text primary key,
  value         text,
  description   text,
  updated_by    uuid references admins(id) on delete set null,
  updated_at    timestamptz not null default now()
);
```

Example keys: `global_commission_rate`, `support_email`, `app_name`, `default_language`.

**RLS:** Super Admin only can read/write.

---

## 9. UI & UX Principles

- **Density over decoration.** This is an operational tool. Information should be surfaced clearly, not buried behind animations or whitespace.
- **Status-driven interfaces.** Almost every entity has a status (driver, application, vehicle, complaint, ride). Status should always be visually distinct — use colour-coded badges.
- **Confirmation on destructive actions.** Any action that suspends, removes, bans, or permanently modifies a record must show a confirmation step with a mandatory reason field.
- **Filterable tables everywhere.** Every list view (drivers, riders, rides, complaints, transactions) must support search, filter by status, and sort.
- **Pagination.** No infinite scroll on data tables. Use paginated views with configurable page sizes.
- **Empty states.** Every list and queue must have a meaningful empty state message, not a blank screen.

---

## 10. Agent Behavioural Rules

- **Read the PRD before planning.** Before generating an implementation plan for any module, reference the relevant PRD section.
- **Confirm Next.js vs React before scaffolding.** The routing and SSR strategy is still undecided — ask the user before creating any page structure or API routes.
- **No placeholder data in production paths.** Seed data and mock data are acceptable in development only. Never hardcode fake users, drivers, or rides into application logic.
- **Incremental delivery.** Build and verify one module at a time. Do not scaffold the entire application at once unless explicitly asked.
- **Flag conflicts.** If a user instruction contradicts the PRD, flag it clearly before proceeding. Do not silently override the PRD.
- **Audit log every change.** Any feature that modifies a data record must include an audit log write in the same transaction or operation.
- **Ask before deleting.** Never delete files, database records, or configuration without explicit user confirmation.
- **Never expose `service_role` key client-side.** Supabase service role credentials must only appear in server-side code.
- **RLS is not optional.** Every Supabase table must have Row Level Security enabled with explicit policies. Never disable RLS to "fix" a permission issue — write the correct policy instead.
- **No library additions without approval.** The stack is HTML, CSS, JavaScript, and React on the frontend, and Supabase on the backend. Do not install additional npm packages without asking the user first.

---

## 11. Sidebar Navigation Reference

The sidebar is the primary navigation structure. Implement it in this exact order. Indented items are **sub-navigation children** — they live inside their parent section, not as top-level sidebar items.

| Icon | Section | Parent | Notes |
|---|---|---|---|
| 🏠 | Dashboard | — | Default landing screen |
| 👤 | Drivers | — | Directory + profile management |
| ↳ 📋 | Applications | Drivers | Onboarding queue with status tabs |
| ↳ 🔍 | Inspections | Drivers | Schedule and record inspections |
| 🚗 | Rides | — | Live map + trip history + SOS |
| 💬 | Complaints | — | Segmented by type |
| 💰 | Earnings | — | Per-driver and platform-wide |
| 📊 | Accounting | — | Reports + exports |
| 🚘 | Vehicles | — | Directory + compliance |
| 👥 | Riders | — | Profiles + wallet + safety |
| 🔔 | Notifications | — | Broadcast center |
| ⚙️ | Settings | — | Gateways, regions, language, roles |
| ↳ 🌐 | Web Settings | Settings | CMS for all public-facing pages |
| 📁 | Audit Logs | — | Immutable, read-only |

**Nesting rules for implementation:**
- When **Drivers** is expanded in the sidebar, Applications and Inspections appear as indented child links beneath it
- When **Settings** is expanded, Web Settings appears as an indented child link beneath it
- All other items are top-level with no children
- The active parent should remain visually highlighted when a child route is active

---

## 12. Implementation Status

Current build status of the 17 modules as of May 2026:

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 1 | Dashboard | ✅ Complete | KPI cards, revenue chart, recent rides, activity feed |
| 2 | Driver Management | ✅ Complete | Directory + detail page with tabs |
| 3 | Rider Management | ✅ Complete | Directory + detail with wallet adjustments |
| 4 | Ride Monitoring | ✅ Complete | Live queue + trip history tabs |
| 5 | Vehicle Management | ✅ Complete | Directory with compliance status |
| 6 | Earnings & Commission | ✅ Complete | Transaction ledger + manual adjustment modal |
| 7 | Complaints & Dispute | ✅ Complete | Filterable list |
| 8 | Accounting | ✅ Complete | Date-range report generation |
| 9 | Notification Center | ❌ Not implemented | Route registered as placeholder `<div>` only |
| 10 | User Roles & Permissions | ✅ Complete | Admin list, invite flow, role change, suspend/reactivate, RBAC matrix |
| 11 | Settings | ✅ Partial | Page exists; gateway/region/lang/roles panels pending |
| 12 | Web Settings / CMS | ❌ Not implemented | No page or route exists |
| 13 | Audit Logs | ✅ Complete | Immutable read-only trail |
| 14 | Driver Approval Workflow | ✅ Complete | Full state machine: new → under_review → inspection_scheduled → approved/rejected |
| 15 | Data Model Reference | ✅ Complete | 12 migration files matching PRD schema |
| 16 | Sidebar Navigation | ✅ Complete | RBAC-gated, expandable sections |
| 17 | Role Permissions Matrix | ✅ Complete | Implemented in `src/lib/rbac.js` |

### Detailed gaps

**Notification Center (Module 9)**
- No UI, no page component
- Needs: broadcast UI (push/SMS/email), notification history view, template management

**User Roles & Permissions (Module 10)**
- ✅ Complete — Admin list with inline role change, suspend/reactivate, invite modal, RBAC matrix view in Settings

**Web Settings / CMS (Module 12)**
- No page or route
- Needs: content editor for public pages (about, support, FAQs, etc.), media manager

**Settings (Module 11)**
- Page scaffold exists but actual panels (payment gateways, SMS gateways, language, regions) are not built out

---

## 13. Out of Scope

The following are explicitly out of scope for this dashboard build unless the user adds them later:

- The rider-facing mobile app
- The driver-facing mobile app
- The public-facing Chauffeur website (the CMS controls its content, but building the site itself is separate)
- Any third-party integrations not explicitly approved by the user
