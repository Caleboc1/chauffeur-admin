-- ============================================================
-- Migration: 20260508090000_optimize_admins_rls.sql
-- Description: Optimizes admins RLS to avoid recursive policy checks.
-- ============================================================

-- Create a function to check admin role without recursion
-- Using security definer to bypass RLS for the check itself
create or replace function public.get_admin_role(user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_role text;
begin
  select role into admin_role
  from public.admins
  where auth_user_id = user_id;
  
  return admin_role;
end;
$$;

-- Drop the old recursive policy
drop policy if exists "super_admin can manage all admins" on admins;

-- Create a new non-recursive policy for super_admin
create policy "super_admin can manage all admins"
  on admins for all
  to authenticated
  using (
    public.get_admin_role(auth.uid()) = 'super_admin'
  );

-- Update the "read own profile" policy for consistency (optional but good)
drop policy if exists "admins can read own profile" on admins;
create policy "admins can read own profile"
  on admins for select
  to authenticated
  using (auth.uid() = auth_user_id);
