# SKILL: db-migration-runner

> Teaches the agent how to write, number, and apply Supabase database migrations for the Chauffeur Admin Dashboard. Read this skill in full before creating or modifying any SQL file or running any database command.

---

## When This Skill Applies

Use this skill whenever the task involves:
- Creating a new table in the Supabase database
- Altering an existing table (adding columns, changing constraints, renaming)
- Creating or modifying a database function or trigger
- Writing or updating Row Level Security (RLS) policies
- Creating indexes for query performance
- Seeding development data

Do **not** use this skill for:
- Writing React components or hooks (use component-builder)
- Writing API routes (use api-route-scaffolder)
- Application-level queries in Supabase client code

---

## Step 0 — Pre-Flight Checks

Before writing any SQL, answer all of the following:

1. **Is this a new table or an alteration?** New tables get a `CREATE TABLE` migration. Alterations get an `ALTER TABLE` migration. Never rewrite a previously applied migration file — always create a new one.
2. **Does the canonical schema in `AGENTS.md` Section 8 define this table?** If yes, implement it **exactly** — same columns, same types, same constraints, same defaults. If the task requires a deviation, **flag the conflict to the user before proceeding**. The PRD takes precedence.
3. **What is the next migration timestamp?** Check `supabase/migrations/` and use the next sequential timestamp (see Step 1).
4. **Does this migration need RLS?** Every table must have RLS enabled. No exceptions.
5. **Does this migration need indexes?** Any column used in `.eq()`, `.order()`, `.select()` filters, or join conditions should be indexed.
6. **Does this migration depend on a shared function?** If it uses `update_updated_at()`, list the migration that defines it as a dependency.

---

## Step 1 — Migration File Naming

As specified in `architecture.md`, use **timestamp-prefixed** filenames:

```
supabase/migrations/YYYYMMDDHHMMSS_description_of_change.sql
```

| Part | Rule |
|---|---|
| `YYYYMMDDHHMMSS` | 14-digit timestamp — use the current date/time or a sequential increment from the last migration |
| `_` | Single underscore separator |
| `description` | Snake_case — short but specific |

**Examples:**
```
20260501000001_create_admins.sql
20260501000002_create_drivers.sql
20260501000003_create_driver_applications.sql
20260501000004_create_driver_documents.sql
20260501000005_create_vehicles.sql
20260501000006_create_inspections.sql
20260501000007_create_riders.sql
20260501000008_create_wallet_transactions.sql
20260501000009_create_rides.sql
20260501000010_create_complaints.sql
20260501000011_create_audit_logs.sql
20260501000012_create_global_settings.sql
```

**Never:**
- Rename or edit a migration file that has already been applied
- Use bare sequence numbers (`001_`, `002_`) — always use timestamp format
- Use vague names like `20260502000001_update.sql` or `_fix.sql`

---

## Step 2 — Migration File Structure

Every migration file follows this exact 5-section structure. Omit sections that don't apply, but keep the order.

```sql
-- ============================================================
-- Migration: YYYYMMDDHHMMSS_description.sql
-- Description: One sentence explaining what and why.
-- Depends on:  List prior migrations this depends on, or "none"
-- ============================================================


-- ── Section 1: Table / schema change ────────────────────────

create table if not exists table_name (
  -- columns exactly as defined in AGENTS.md Section 8
);


-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_table_column
  on table_name(column_name);


-- ── Section 3: Enable RLS ────────────────────────────────────

alter table table_name enable row level security;


-- ── Section 4: RLS Policies ──────────────────────────────────

create policy "description"
  on table_name
  for [select|insert|update|delete]
  to authenticated
  using ( ... )
  [with check ( ... )];


-- ── Section 5: Functions / Triggers (if needed) ─────────────

-- Only include if this migration requires a function or trigger
```

---

## Step 3 — Core Migration Index

There are **12 core tables** defined in `AGENTS.md` Section 8. The canonical column definitions, types, constraints, and RLS requirements are all specified there. **Always read the relevant schema from `AGENTS.md` before writing a migration — do not work from memory.**

| Migration File | Table | Depends On | Key RLS Notes |
|---|---|---|---|
| `..._create_admins.sql` | `admins` | none | Own-row read; super_admin full read/write |
| `..._create_drivers.sql` | `drivers` | admins | ops+super read/write; finance read-only; support read-only; inspection read-only |
| `..._create_driver_applications.sql` | `driver_applications` | admins, drivers | ops+super read/write; defines shared `update_updated_at()` function |
| `..._create_driver_documents.sql` | `driver_documents` | admins, drivers | Drivers insert own; ops+super update status |
| `..._create_vehicles.sql` | `vehicles` | drivers | ops+super read/write |
| `..._create_inspections.sql` | `inspections` | admins, drivers, vehicles | inspection_officer update result fields (column restriction enforced at API layer); ops+super full read/write |
| `..._create_riders.sql` | `riders` | none | support+ read; ops+super update status; finance update wallet_balance (column restriction at API layer) |
| `..._create_wallet_transactions.sql` | `wallet_transactions` | admins, riders | finance+super insert; **NO update or delete policies — immutable** |
| `..._create_rides.sql` | `rides` | drivers, riders | ops+super read; support read-only |
| `..._create_complaints.sql` | `complaints` | admins, rides | support+ read/update state; uses `update_updated_at()` — depends on driver_applications migration |
| `..._create_audit_logs.sql` | `audit_logs` | admins | Any authenticated insert; super_admin select only; **NO update or delete — ever** |
| `..._create_global_settings.sql` | `global_settings` | admins | super_admin only; includes seed data |

### RLS and Column-Level Restrictions

Postgres RLS operates at the **row level**, not the column level. When `AGENTS.md` says a role can only update specific columns (e.g., "Finance Admin can update `wallet_balance`" or "Inspection Officers can update result fields"), enforce this as follows:

1. **RLS policy** — grants row-level access to the role for `UPDATE`
2. **API Route** — validates that the request body only contains the permitted columns before executing the update
3. **Comment in migration** — document which columns the role is permitted to modify

```sql
-- Finance admin can update riders (column restriction: wallet_balance only — enforced in API)
create policy "finance_admin can update riders"
  on riders for update
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
        and admins.role = 'finance_admin'
    )
  );
```

---

## Step 4 — Complete Example Migration

Below is a fully worked example for the `audit_logs` table, demonstrating the template applied to a real migration. This follows `AGENTS.md` Section 8 exactly, including the RLS policies specified there.

```sql
-- ============================================================
-- Migration: 20260501000011_create_audit_logs.sql
-- Description: Immutable audit trail of every admin action.
--              No update or delete policies — ever.
-- Depends on:  20260501000001_create_admins.sql
-- ============================================================


-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists audit_logs (
  id           uuid        primary key default gen_random_uuid(),
  actor_id     uuid        references admins(id) on delete set null,
  actor_role   text        not null,
  action       text        not null,
  entity_type  text        not null,
  entity_id    uuid,
  metadata     jsonb,
  ip_address   inet,
  created_at   timestamptz not null default now()
);


-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_audit_logs_actor_id    on audit_logs(actor_id);
create index if not exists idx_audit_logs_entity_type on audit_logs(entity_type);
create index if not exists idx_audit_logs_entity_id   on audit_logs(entity_id);
create index if not exists idx_audit_logs_created_at  on audit_logs(created_at);


-- ── Section 3: Enable RLS ────────────────────────────────────

alter table audit_logs enable row level security;


-- ── Section 4: RLS Policies ──────────────────────────────────

-- INSERT: any authenticated admin can write audit log entries
create policy "admins can insert audit logs"
  on audit_logs for insert
  to authenticated
  with check (true);

-- SELECT: super admin only
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

-- ⚠️ NO update or delete policies are defined.
-- Omitting them means no role — not even super_admin — can modify or delete audit records.
-- This is intentional and must never be changed.
```

---

## Step 5 — The `update_updated_at()` Shared Function

Any table with an `updated_at` column must have a trigger that auto-updates it. The function is defined once in the `driver_applications` migration (the first table that needs it) and reused by later migrations.

```sql
-- Defined in create_driver_applications migration
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Applied to any table with updated_at
create trigger tablename_updated_at
  before update on table_name
  for each row execute function update_updated_at();
```

Tables that need this trigger: `driver_applications`, `complaints`, `global_settings`.

Any migration that uses `update_updated_at()` must list the `create_driver_applications` migration in its `Depends on` header.

---

## Step 6 — Known Schema Issues to Flag

When implementing the canonical schemas, watch for these known issues:

### `vehicles.compliance_status` Default vs. Constraint Conflict

The canonical schema in `AGENTS.md` specifies:
```sql
compliance_status text not null default 'pending' check (compliance_status in (
  'approved', 'inspection_due', 'suspended', 'expired'
))
```

The default value `'pending'` is **not included** in the check constraint, which will cause a Postgres error on any insert that relies on the default. When writing this migration:

1. Add `'pending'` to the check constraint to make it functional
2. Add a comment documenting the deviation
3. Flag this to the user for PRD clarification

```sql
-- ⚠️ DEVIATION: Added 'pending' to check constraint. The canonical schema
-- sets default 'pending' but does not include it in the allowed values.
-- Without this fix, default inserts will fail. Flagged for PRD clarification.
compliance_status text not null default 'pending' check (compliance_status in (
  'pending', 'approved', 'inspection_due', 'suspended', 'expired'
))
```

---

## Step 7 — Running Migrations

### Using Supabase CLI (preferred)

```bash
# Apply all pending migrations
supabase db push

# Apply migrations against a linked remote project
supabase db push --linked

# Check migration status
supabase migration list

# Create a new empty migration file
supabase migration new description_of_change
```

### Manual application (Supabase SQL Editor)

If the CLI is unavailable, paste the migration SQL directly into the Supabase Dashboard SQL Editor. Always run migrations **in timestamp order** — never skip a migration.

---

## Step 8 — Writing New Migrations (Post-Setup)

When adding a new column, table, or policy after the initial 12 migrations:

1. Find the highest-numbered file in `supabase/migrations/`
2. Create a new file with the next sequential timestamp
3. Write **only the delta** — do not rewrite the original table definition
4. Test the migration in a development environment first

**Example — adding a column:**
```sql
-- ============================================================
-- Migration: 20260502000001_add_drivers_total_trips.sql
-- Description: Adds trip counter to drivers table for dashboard KPIs.
-- Depends on:  20260501000002_create_drivers.sql
-- ============================================================

alter table drivers
  add column if not exists total_trips integer not null default 0;

create index if not exists idx_drivers_total_trips on drivers(total_trips);
```

**Example — adding an RLS policy:**
```sql
-- ============================================================
-- Migration: 20260502000002_add_finance_reads_drivers.sql
-- Description: Grants finance_admin read access to driver commission_rate.
-- Depends on:  20260501000002_create_drivers.sql
-- ============================================================

-- Column restriction: finance_admin should only read commission_rate — enforced at API layer
create policy "finance_admin can read drivers"
  on drivers for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
        and admins.role = 'finance_admin'
    )
  );
```

**Example — seeding configuration data (idempotent):**
```sql
-- Use ON CONFLICT DO NOTHING so the migration is safe to re-run
insert into global_settings (key, value, description)
values
  ('global_commission_rate', '15',        'Platform-wide commission percentage'),
  ('app_name',               'Chauffeur', 'Platform display name'),
  ('support_email',          '',          'Admin support email address'),
  ('default_language',       'en',        'Default interface language code')
on conflict (key) do nothing;
```

### Reverting a Migration

As specified in `architecture.md`, migrations are **forward-only** — there are no rollback files. If a migration needs to be undone:

1. Write a **new** migration that reverses the change (e.g., `alter table drop column`, `drop policy`)
2. Give it the next sequential timestamp
3. Never delete or edit the original migration file — it may already be applied in other environments

---

## Step 9 — Checklist Before Applying Any Migration

### Naming & Structure
- [ ] Filename follows `YYYYMMDDHHMMSS_description.sql` timestamp format
- [ ] File header comment includes migration name, description, and dependencies
- [ ] `create table if not exists` used — not bare `create table`
- [ ] All indexes use `create index if not exists`

### Schema Fidelity
- [ ] Column names, types, constraints, and defaults match `AGENTS.md` Section 8 exactly
- [ ] Any deviation from the canonical schema is flagged to the user with a comment
- [ ] No columns added or removed without explicit approval
- [ ] No constraint changes (check values, foreign key actions) without explicit approval

### Security
- [ ] `alter table [name] enable row level security` present for every table
- [ ] At least one RLS policy defined per table
- [ ] `audit_logs` has NO update or delete policies
- [ ] `wallet_transactions` has NO update or delete policies
- [ ] Column-level restrictions documented in comments and enforced at API layer
- [ ] No hardcoded UUIDs, admin emails, or secrets in migration SQL

### Triggers
- [ ] `update_updated_at()` trigger applied to every table with an `updated_at` column
- [ ] Dependency on the migration that defines `update_updated_at()` is listed in the header

### Process
- [ ] Migration tested against a development database before production
- [ ] Migrations applied in timestamp order — no skipped files

---

## Step 10 — What Never to Do

- **Never edit a migration file that has already been applied** — always write a new forward migration
- **Never disable RLS** to work around a permission issue — write the correct policy
- **Never add an UPDATE or DELETE policy to `audit_logs` or `wallet_transactions`** — these are immutable by design
- **Never drop a column** without confirming no application code references it
- **Never run raw SQL directly in production** without saving it as a versioned migration file first
- **Never use `select *`** in migration functions or views — list columns explicitly
- **Never duplicate the canonical schema** — always read from `AGENTS.md` Section 8 at implementation time to avoid drift

---

*Skill version: 2.0 — Chauffeur Admin Dashboard · db-migration-runner*
