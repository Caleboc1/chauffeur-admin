-- ============================================================
-- Migration: 20260505230008_create_wallet_transactions.sql
-- Description: Rider wallet activity. Immutable once inserted.
-- Depends on:  20260505230007_create_riders.sql, 20260505230001_create_admins.sql
-- ============================================================

-- ── Section 1: Table ─────────────────────────────────────────

create table if not exists wallet_transactions (
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

-- ── Section 2: Indexes ───────────────────────────────────────

create index if not exists idx_wallet_tx_rider_id   on wallet_transactions(rider_id);
create index if not exists idx_wallet_tx_type       on wallet_transactions(type);
create index if not exists idx_wallet_tx_created_at on wallet_transactions(created_at);

-- ── Section 3: Enable RLS ────────────────────────────────────

alter table wallet_transactions enable row level security;

-- ── Section 4: RLS Policies ──────────────────────────────────

-- Finance Admin and Super Admin can insert manual adjustments
create policy "finance_super_insert_wallet_tx"
  on wallet_transactions for insert
  to authenticated
  with check (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'finance_admin')
    )
  );

-- All staff can read
create policy "staff_read_wallet_tx"
  on wallet_transactions for select
  to authenticated
  using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.role in ('super_admin', 'ops_admin', 'support_agent', 'finance_admin')
    )
  );

-- ⚠️ NO update or delete policies defined (Immutable)
